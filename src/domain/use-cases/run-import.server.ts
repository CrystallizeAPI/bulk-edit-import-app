import { EventEmitter } from 'events';
import { Operation, OperationsSchema } from '@crystallize/schema';
import { exhash } from '../core/sanitize';
import {
    ClientInterface,
    createMassCallClient,
    CrystallizePromise,
    MassCallClientBatch,
} from '@crystallize/js-api-client';
import { updateComponent } from '~/infrastructure/crystallize/update-component.server';
import { publishItem } from '~/infrastructure/crystallize/publish-item.server';

type Deps = {
    emitter: EventEmitter;
    apiClient: ClientInterface;
};

export const runImport = async (importId: string, operations: Operation[], { emitter, apiClient }: Deps) => {
    // wait 5 before to start diffusing the events
    await new Promise((resolve) => setTimeout(resolve, 5000));

    const massOperations = OperationsSchema.parse({
        version: '0.0.1',
        operations,
    });

    const operationHashes = new Set();
    const { pubUnpubOperations, otherOperations } = massOperations.operations.reduce(
        (
            memo: {
                pubUnpubOperations: Operation[];
                otherOperations: Operation[];
            },
            operation,
        ) => {
            const hash = exhash(JSON.stringify(operation));
            if (operationHashes.has(hash)) {
                return memo;
            }
            operationHashes.add(hash);
            if (operation.action === 'publish' || operation.action === 'unpublish') {
                memo.pubUnpubOperations.push(operation);
            } else {
                memo.otherOperations.push(operation);
            }
            return memo;
        },
        { pubUnpubOperations: [], otherOperations: [] },
    );

    emitter.emit(importId, {
        event: 'started',
        message: `Import ${importId} has started.`,
    });

    const massClient = createMassCallClient(apiClient, {
        initialSpawn: 10,
        maxSpawn: 20,
        onBatchDone: async (batch: MassCallClientBatch): Promise<void> => {
            emitter.emit(importId, { event: `progression`, message: `Batch from ${batch.from} to ${batch.to} Done!` });
        },
        onFailure: async (batch: MassCallClientBatch, exception: unknown): Promise<boolean> => {
            emitter.emit(importId, {
                event: `error`,
                exception,
                message: `Exception in Batch from ${batch.from} to ${batch.to}.`,
            });
            return true;
        },
        afterRequest: async (
            batch: MassCallClientBatch,
            promise: CrystallizePromise<unknown>,
            results: unknown,
        ): Promise<void> => {
            emitter.emit(importId, {
                event: `success`,
                results,
                batch,
                promise: promise.query,
                variables: promise.variables,
            });
        },
    });
    otherOperations.forEach((operation) => {
        if (operation.action !== 'updateComponent') {
            emitter.emit(importId, { event: `error`, operation });
            return;
        }
        updateComponent(operation.itemId, operation.language, operation.component, { apiClient: massClient.enqueue });
    });
    do {
        massClient.hasFailed() ? await massClient.retry() : await massClient.execute();
    } while (massClient.hasFailed());

    emitter.emit(importId, { event: `progression`, message: 'All components have been updated!' });
    massClient.reset();
    pubUnpubOperations.forEach((operation) => {
        if (operation.action !== 'publish') {
            emitter.emit(importId, { event: `error`, operation });
            return;
        }
        publishItem(operation.itemId, operation.language, !!operation.includeDescendants, {
            apiClient: massClient.enqueue,
        });
    });
    do {
        massClient.hasFailed() ? await massClient.retry() : await massClient.execute();
    } while (massClient.hasFailed());

    emitter.emit(importId, {
        event: 'ended',
        message: `Import ${importId} has ended.`,
    });
};
