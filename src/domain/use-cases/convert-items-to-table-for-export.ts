import { SheetData } from 'write-excel-file';
import { Item } from '../contracts/item-list';

// this file is used on client
export const convertItemsToTableForExport = (headers: string[], items: Item[]): SheetData => {
    const cellStyle = {
        wrap: true,
    };
    const itemCells =
        items?.map((item) => {
            const cells = item.components.map((component) => {
                const content = component.content;
                if (component.type === 'singleLine' && 'text' in content) {
                    return {
                        type: String,
                        value: content.text,
                        ...cellStyle,
                    };
                }
                if (component.type === 'richText' && 'plainText' in content) {
                    return {
                        type: String,
                        value: content.plainText.join('\n'),
                        ...cellStyle,
                    };
                }
                if (component.type === 'boolean' && 'value' in content) {
                    return {
                        type: Boolean,
                        value: content.value,
                        ...cellStyle,
                    };
                }
                if (component.type === 'numeric' && 'number' in content) {
                    return {
                        type: Number,
                        value: content.number,
                        ...cellStyle,
                    };
                }
            });
            return [
                {
                    type: String,
                    value: item.id,
                },
                {
                    type: String,
                    value: item.shapeIdentifier,
                },
                {
                    type: String,
                    value: item.language,
                },
                {
                    type: String,
                    value: item.name,
                },
                ...cells,
            ];
        }) ?? [];

    const headerStyles = {
        fontWeight: 'bold',
        fontSize: 12,
        align: 'center',
        alignVertical: 'center',
        bottomBorderStyle: 'thick',
        height: 30,
    };
    return [
        [
            {
                type: String,
                value: 'ID',
                ...headerStyles,
            },
            {
                type: String,
                value: 'Shape',
                ...headerStyles,
            },
            {
                type: String,
                value: 'Language',
                ...headerStyles,
            },
            {
                type: String,
                value: 'Name',
                ...headerStyles,
            },
            ...headers.map((head) => {
                return {
                    type: String,
                    value: head,
                    ...headerStyles,
                };
            }),
        ],
        ...itemCells,
    ];
};
