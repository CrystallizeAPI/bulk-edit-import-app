import { EventEmitter } from 'events';
import { runImport } from './run-import.server';
import { NonStructuaralComponent } from '../contracts/components';
import { Operation } from '@crystallize/schema';
import { CrystallizeAPI } from '~/infrastructure/crystallize/create-crystallize-api.server';

type Deps = {
    emitter: EventEmitter;
    api: CrystallizeAPI;
};
export const saveItems = async (
    todos: Record<string, Record<string, NonStructuaralComponent>>,
    language: string,
    doPublish: boolean,
    { emitter, api }: Deps,
) => {
    const items = Object.keys(todos).map((itemId) => {
        const components = todos[itemId];
        return {
            id: itemId,
            components,
        };
    });
    // DO NOT AWAIT HERE, THAT'S THE WHOLE POINT
    const importId = 'import-' + Date.now() + Math.random().toString(36).substring(7);
    const operations: Operation[] = [];

    for (const item of items) {
        for (const componentId in item.components) {
            const comp = item.components[componentId];
            operations.push({
                concern: 'item',
                action: 'updateComponent',
                language,
                itemId: item.id,
                component: {
                    componentId,
                    [comp.type]: comp.content,
                },
            });
        }
        if (doPublish) {
            operations.push({
                concern: 'item',
                action: 'publish',
                itemId: item.id,
                language,
            });
        }
    }
    runImport(importId, operations, { emitter, apiClient: api.apiClient });
    return {
        importId,
        operationCount: operations.length,
    };
};
