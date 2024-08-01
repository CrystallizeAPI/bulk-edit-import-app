import { describe, it, expect, beforeEach, vi, Mocked } from 'vitest';
import { EventEmitter } from 'events';
import { CrystallizeAPI } from '~/infrastructure/crystallize/create-crystallize-api.server';
import { NonStructuaralComponent } from '~/domain/contracts/components';
import { saveItems } from '~/domain/use-cases/save-items.server';
import { runImport } from '~/domain/use-cases/run-import.server';

vi.mock('~/domain/use-cases/run-import.server');

describe('saveItems', () => {
    let emitter: EventEmitter;
    let api: Mocked<CrystallizeAPI>;

    beforeEach(() => {
        emitter = new EventEmitter();
        api = {
            apiClient: vi.fn(),
        } as unknown as Mocked<CrystallizeAPI>;
    });

    it('should save items without publishing', async () => {
        const todos: Record<string, Record<string, NonStructuaralComponent>> = {
            '1': {
                component1: { componentId: 'un', type: 'singleLine', content: { text: 'value1' } },
                component2: { componentId: 'deux', type: 'singleLine', content: { text: 'value2' } },
            },
        };
        const language = 'en';
        const doPublish = false;

        const result = await saveItems(todos, language, doPublish, { emitter, api });

        expect(result.importId).toMatch(/^import-/);
        expect(result.operationCount).toBe(2);

        expect(runImport).toHaveBeenCalledWith(
            expect.any(String),
            [
                {
                    concern: 'item',
                    action: 'updateComponent',
                    language,
                    itemId: '1',
                    component: {
                        componentId: 'component1',
                        singleLine: { text: 'value1' },
                    },
                },
                {
                    concern: 'item',
                    action: 'updateComponent',
                    language,
                    itemId: '1',
                    component: {
                        componentId: 'component2',
                        singleLine: { text: 'value2' },
                    },
                },
            ],
            { emitter, apiClient: api.apiClient },
        );
    });

    it('should save items with publishing', async () => {
        const todos: Record<string, Record<string, NonStructuaralComponent>> = {
            '1': {
                component1: { componentId: 'un', type: 'singleLine', content: { text: 'value1' } },
                component2: { componentId: 'deux', type: 'singleLine', content: { text: 'value2' } },
            },
        };
        const language = 'en';
        const doPublish = true;

        const result = await saveItems(todos, language, doPublish, { emitter, api });

        expect(result.importId).toMatch(/^import-/);
        expect(result.operationCount).toBe(3);

        expect(runImport).toHaveBeenCalledWith(
            expect.any(String),
            [
                {
                    concern: 'item',
                    action: 'updateComponent',
                    language,
                    itemId: '1',
                    component: {
                        componentId: 'component1',
                        singleLine: { text: 'value1' },
                    },
                },
                {
                    concern: 'item',
                    action: 'updateComponent',
                    language,
                    itemId: '1',
                    component: {
                        componentId: 'component2',
                        singleLine: { text: 'value2' },
                    },
                },
                {
                    concern: 'item',
                    action: 'publish',
                    itemId: '1',
                    language,
                },
            ],
            { emitter, apiClient: api.apiClient },
        );
    });
});
