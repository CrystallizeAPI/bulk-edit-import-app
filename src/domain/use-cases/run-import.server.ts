import { EventEmitter } from 'events';
// eslint-disable-next-line @typescript-eslint/no-unused-vars -- WIP
import { Operation, Operations, OperationsSchema } from '@crystallize/schema';

type Deps = {
    emitter: EventEmitter;
};

export const runImport = async (
    importId: string,
    items: {
        id: string;
        components: Record<string, string>;
    }[],
    { emitter }: Deps,
) => {
    const operations: Operation[] = [];
    // eslint-disable-next-line @typescript-eslint/no-unused-vars -- WIP
    for (const item of items) {
        operations.push({
            concern: 'item',
            action: 'updateComponent',
            language: 'en',
            component: {
                componentId: 'title',
                singleLine: {
                    text: 'Hello world',
                },
            },
        });
        await new Promise((resolve) => setTimeout(resolve, 3000));
    }

    emitter.emit(importId, {
        event: 'started',
        message: `Import ${importId} has started.`,
    });
    // eslint-disable-next-line @typescript-eslint/no-unused-vars -- WIP
    const massOperations = OperationsSchema.parse({
        version: '0.0.1',
        operations,
    });

    // emitter.emit(importId, {
    //     event: 'item-updated',
    //     message: `Item ${item.id} updated.`,
    // });

    emitter.emit(importId, {
        event: 'ended',
        message: `Import ${importId} has ended.`,
    });
};
