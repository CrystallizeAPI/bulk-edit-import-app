import { EventEmitter } from 'events';
import { runImport } from './run-import.server';

type Deps = {
    emitter: EventEmitter;
};
export const saveItems = async (todos: Record<string, Record<string, string>>, { emitter }: Deps) => {
    const items = Object.keys(todos).map((itemId) => {
        const components = todos[itemId];
        return {
            id: itemId,
            components,
        };
    });
    // build the new JSON Structure
    // @todo:

    // DO NOT AWAIT HERE, THAT'S THE WHOLE POINT
    const importId = 'import-' + Date.now() + Math.random().toString(36).substring(7);
    runImport(importId, items, { emitter });
    return {
        importId,
        itemCount: items.length,
    };
};
