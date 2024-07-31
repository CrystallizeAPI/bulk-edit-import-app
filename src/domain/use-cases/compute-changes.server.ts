import { Row } from 'read-excel-file/node';
import { Item } from '../contracts/item-list';
import { exhash } from '../core/sanitize';

export const computeChanges = (items: Item[], rows: Row[]) => {
    const findRow = (id: string) => rows.find((cells) => `${cells[0]}` === id);
    return items.reduce(async (memoPromise: Promise<Record<string, boolean>>, item) => {
        const memo = await memoPromise;
        const cells = findRow(item.id);
        if (!cells) {
            return memo;
        }
        const rowHash = await exhash(
            cells
                .slice(4)
                .map((cell) => cell.toString())
                .join('-'),
        );
        const itemHash = await exhash(
            item.components
                .map((component) => {
                    if (component.type === 'singleLine') {
                        return component.content.text;
                    }
                    if (component.type === 'richText') {
                        return component.content.plainText.join('\n');
                    }
                    if (component.type === 'boolean') {
                        return component.content.value;
                    }
                    if (component.type === 'numeric') {
                        return component.content.number;
                    }
                })
                .join('-'),
        );
        memo[item.id] = rowHash !== itemHash;
        return memo;
    }, Promise.resolve({}));
};
