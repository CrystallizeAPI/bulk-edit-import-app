import { EventEmitter } from 'events';

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
    emitter.emit(importId, {
        event: 'started',
        message: `Import ${importId} has started.`,
    });

    //@todo: Implement the actual import logic here
    for (const item of items) {
        await new Promise((resolve) => setTimeout(resolve, 3000));
        emitter.emit(importId, {
            event: 'item-updated',
            message: `Item ${item.id} updated.`,
        });
    }
    emitter.emit(importId, {
        event: 'ended',
        message: `Import ${importId} has ended.`,
    });
};
