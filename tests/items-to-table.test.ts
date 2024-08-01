import { expect, test, describe } from 'vitest';
import { convertItemsToTableForExport } from '~/domain/use-cases/convert-items-to-table-for-export';
import { Item } from '~/domain/contracts/item-list';

describe('convertItemsToTableForExport', () => {
    const styles = {
        fontWeight: 'bold',
        fontSize: 12,
        align: 'center',
        alignVertical: 'center',
        bottomBorderStyle: 'thick',
        height: 30,
    };

    const headers = ['Header1', 'Header2'];

    const items: Item[] = [
        {
            id: '1',
            shapeIdentifier: 'shape1',
            language: 'en',
            name: 'Item 1',
            topics: [],
            components: [
                {
                    componentId: '1',
                    type: 'singleLine',
                    content: { text: 'Single Line Text' },
                },
                {
                    componentId: '2',
                    type: 'richText',
                    content: {
                        plainText: ['Rich Text Line 1', 'Rich Text Line 2'],
                        json: [],
                        html: [],
                    },
                },
                {
                    componentId: '3',
                    type: 'boolean',
                    content: { value: true },
                },
                {
                    componentId: '4',
                    type: 'numeric',
                    content: { number: 123 },
                },
            ],
        },
        {
            id: '2',
            shapeIdentifier: 'shape2',
            language: 'fr',
            name: 'Item 2',
            topics: [],
            components: [
                {
                    componentId: '5',
                    type: 'singleLine',
                    content: { text: 'Another Single Line Text' },
                },
                {
                    componentId: '6',
                    type: 'boolean',
                    content: { value: false },
                },
            ],
        },
    ];

    test('should convert items to table format correctly', () => {
        const result = convertItemsToTableForExport(headers, items);

        expect(result).toEqual([
            [
                { type: String, value: 'ID', ...styles },
                { type: String, value: 'Shape', ...styles },
                { type: String, value: 'Language', ...styles },
                { type: String, value: 'Name', ...styles },
                { type: String, value: 'Header1', ...styles },
                { type: String, value: 'Header2', ...styles },
            ],
            [
                { type: String, value: '1' },
                { type: String, value: 'shape1' },
                { type: String, value: 'en' },
                { type: String, value: 'Item 1' },
                { type: String, value: 'Single Line Text', wrap: true },
                { type: String, value: 'Rich Text Line 1\nRich Text Line 2', wrap: true },
                { type: Boolean, value: true, wrap: true },
                { type: Number, value: 123, wrap: true },
            ],
            [
                { type: String, value: '2' },
                { type: String, value: 'shape2' },
                { type: String, value: 'fr' },
                { type: String, value: 'Item 2' },
                { type: String, value: 'Another Single Line Text', wrap: true },
                { type: Boolean, value: false, wrap: true },
            ],
        ]);
    });

    test('should handle empty items array', () => {
        const result = convertItemsToTableForExport(headers, []);
        expect(result).toEqual([
            [
                { type: String, value: 'ID', ...styles },
                { type: String, value: 'Shape', ...styles },
                { type: String, value: 'Language', ...styles },
                { type: String, value: 'Name', ...styles },
                { type: String, value: 'Header1', ...styles },
                { type: String, value: 'Header2', ...styles },
            ],
        ]);
    });

    test('should handle items with missing components', () => {
        const itemsWithMissingComponents: Item[] = [
            {
                id: '3',
                topics: [],
                shapeIdentifier: 'shape3',
                language: 'es',
                name: 'Item 3',
                components: [],
            },
        ];
        const result = convertItemsToTableForExport(headers, itemsWithMissingComponents);
        expect(result).toEqual([
            [
                { type: String, value: 'ID', ...styles },
                { type: String, value: 'Shape', ...styles },
                { type: String, value: 'Language', ...styles },
                { type: String, value: 'Name', ...styles },
                { type: String, value: 'Header1', ...styles },
                { type: String, value: 'Header2', ...styles },
            ],
            [
                { type: String, value: '3' },
                { type: String, value: 'shape3' },
                { type: String, value: 'es' },
                { type: String, value: 'Item 3' },
            ],
        ]);
    });
});
