import { Row } from 'read-excel-file/node';
import { CrystallizeAPI } from '~/infrastructure/crystallize/create-crystallize-api.server';
import { mapComponentInput } from './fetch-items-and-components.server';

type Deps = {
    api: CrystallizeAPI;
};

export const convertTableToItemsForImport = async (rows: Row[], { api }: Deps) => {
    const header = rows.shift();
    if (!header) {
        throw new Error('No header found');
    }
    const ids = rows.map((cells) => ({ id: `${cells[0]}`, language: `${cells[2]}` }));
    const components = header.slice(4).map((cell) => cell.toString());
    const nodes = await api.fetchByIds(ids, components);
    const items = await mapComponentInput(nodes, { components }, { api });
    const findRow = (id: string) => rows.find((cells) => `${cells[0]}` === id);
    const changes: Record<string, Record<string, boolean>> = {};
    const newItems = items.map((item) => {
        const cells = findRow(item.id);
        if (!cells) {
            return item;
        }

        return {
            ...item,
            components: item.components.map((component) => {
                const index = components.indexOf(component.componentId);
                if (index === -1) {
                    return component;
                }
                const cell = cells[index + 4];
                if (!cell) {
                    return component;
                }
                if (component.type === 'singleLine' && component.content.text !== cell.toString()) {
                    changes[item.id] = {
                        ...changes[item.id],
                        [component.componentId]: true,
                    };
                    return {
                        ...component,
                        content: {
                            ...component.content,
                            text: cell.toString(),
                        },
                    };
                }
                if (component.type === 'richText' && component.content.plainText.join('\n') !== cell.toString()) {
                    changes[item.id] = {
                        ...changes[item.id],
                        [component.componentId]: true,
                    };
                    return {
                        ...component,
                        content: {
                            ...component.content,
                            plainText: cell.toString().split('\n'),
                        },
                    };
                }
                if (component.type === 'boolean' && component.content.value !== cell) {
                    changes[item.id] = {
                        ...changes[item.id],
                        [component.componentId]: true,
                    };
                    return {
                        ...component,
                        content: {
                            ...component.content,
                            value: cell,
                        },
                    };
                }
                if (component.type === 'numeric' && component.content.number !== Number(cell)) {
                    changes[item.id] = {
                        ...changes[item.id],
                        [component.componentId]: true,
                    };
                    return {
                        ...component,
                        content: {
                            ...component.content,
                            number: Number(cell),
                        },
                    };
                }
                return component;
            }),
        };
    });
    return {
        values: {
            components,
            // we can probably do better here in the future to handle multiple languages and multiple shapes
            language: items[0].language,
            shape: items[0].shapeIdentifier,
        },
        results: {
            changes,
            items: newItems,
        },
    };
};
