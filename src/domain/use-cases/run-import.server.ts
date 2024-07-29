import { EventEmitter } from 'events';
import { Operation, OperationsSchema } from '@crystallize/schema';
import { exhash } from '../core/sanitize';
import { CrystallizeAPI } from '~/infrastructure/crystallize/create-crystallize-api.server';

type Deps = {
    emitter: EventEmitter;
    api: CrystallizeAPI;
};

export const runImport = async (importId: string, operations: Operation[], { emitter, api }: Deps) => {
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

    await Promise.all(
        otherOperations.map(async (operation) => {
            if (operation.action !== 'updateComponent') {
                emitter.emit(importId, { event: `error`, operation });
                return;
            }
            try {
                await api.updateComponent(operation.itemId, operation.language, operation.component);
                emitter.emit(importId, { event: `${operation.concern}-${operation.action}`, operation });
            } catch (error) {
                console.error('Error updating component operation', operation, error);
                emitter.emit(importId, { event: `error`, operation });
            }
        }),
    );

    await Promise.all(
        pubUnpubOperations.map(async (operation) => {
            if (operation.action !== 'publish') {
                emitter.emit(importId, { event: `error`, operation });
                return;
            }
            try {
                await api.publishItem(operation.itemId, operation.language, !!operation.includeDescendants);
                emitter.emit(importId, { event: `${operation.concern}-${operation.action}`, operation });
            } catch (error) {
                console.error('Error publishing item operation', operation, error);
                emitter.emit(importId, { event: `error`, operation });
            }
        }),
    );

    emitter.emit(importId, {
        event: 'ended',
        message: `Import ${importId} has ended.`,
    });
};
