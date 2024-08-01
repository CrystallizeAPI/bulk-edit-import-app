import { describe, it, expect, beforeEach, vi, Mocked, Mock } from 'vitest';
import { convertTableToItemsForImport } from '../src/domain/use-cases/convert-table-to-items-for-import.server';
import { CrystallizeAPI } from '~/infrastructure/crystallize/create-crystallize-api.server';
import { mapComponentInput } from '~/domain/use-cases/fetch-items-and-components.server';
import { Row } from 'read-excel-file/node';
import { InnerNode } from '~/domain/contracts/item-list';

vi.mock('~/infrastructure/crystallize/create-crystallize-api.server');
vi.mock('~/domain/use-cases/fetch-items-and-components.server');

describe('convertTableToItemsForImport', () => {
    let api: Mocked<CrystallizeAPI>;

    beforeEach(() => {
        api = {
            fetchByIds: vi.fn(),
        } as unknown as Mocked<CrystallizeAPI>;
    });

    it('should throw an error when no header is found', async () => {
        const rows: Row[] = [];
        await expect(convertTableToItemsForImport(rows, { api })).rejects.toThrow('No header found');
    });

    it('should convert table rows to items for import', async () => {
        const rows: Row[] = [
            ['id', 'name', 'language', 'type', 'component1', 'component2'],
            ['1', 'Item 1', 'en', 'type1', 'value1', 'value2'],
            ['2', 'Item 2', 'en', 'type1', 'value3', 'value4'],
        ];

        const components = ['component1', 'component2'];
        const nodes: InnerNode[] = [
            {
                id: '1',
                name: 'Item 1',
                language: 'en',
                shapeIdentifier: 'shape',
                topics: [],
                components: [
                    { componentId: 'component1', type: 'singleLine', content: { text: 'oldValue1' } },
                    { componentId: 'component2', type: 'singleLine', content: { text: 'oldValue2' } },
                ],
            },
            {
                id: '2',
                name: 'Item 2',
                language: 'en',
                shapeIdentifier: 'shape',
                topics: [],
                components: [
                    { componentId: 'component1', type: 'singleLine', content: { text: 'oldValue3' } },
                    { componentId: 'component2', type: 'singleLine', content: { text: 'oldValue4' } },
                ],
            },
        ];

        api.fetchByIds.mockResolvedValue(nodes);
        (mapComponentInput as Mock).mockResolvedValue(nodes);

        const result = await convertTableToItemsForImport(rows, { api });

        expect(result.values.components).toEqual(components);
        expect(result.values.language).toBe('en');
        expect(result.results.items).toHaveLength(2);
        expect(result.results.changes).toEqual({
            '1': ['component1', 'component2'],
            '2': ['component1', 'component2'],
        });
    });
});
