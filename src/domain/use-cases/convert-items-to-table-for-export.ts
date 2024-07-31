import { SheetData } from 'write-excel-file';
import { Item } from '../contracts/item-list';

// this file is used on client

export const convertItemsToTableForExport = (headers: string[], items: Item[]): SheetData => {
    const itemCells =
        items?.map((item) => {
            const cells = item.components.map((component) => {
                const content = component.content;
                if (component.type === 'singleLine' && 'text' in content) {
                    return {
                        type: String,
                        value: content.text,
                    };
                }
                if (component.type === 'richText' && 'plainText' in content) {
                    return {
                        type: String,
                        value: content.plainText.join('\n'),
                    };
                }
                if (component.type === 'boolean' && 'value' in content) {
                    return {
                        type: Boolean,
                        value: content.value,
                    };
                }
                if (component.type === 'numeric' && 'number' in content) {
                    return {
                        type: Number,
                        value: content.number,
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
                    value: item.name,
                },
                ...cells,
            ];
        }) ?? [];

    return [
        [
            {
                type: String,
                value: 'ID',
            },
            {
                type: String,
                value: 'Name',
            },
            ...headers.map((head) => {
                return {
                    type: String,
                    value: head,
                };
            }),
        ],
        ...itemCells,
    ];
};
