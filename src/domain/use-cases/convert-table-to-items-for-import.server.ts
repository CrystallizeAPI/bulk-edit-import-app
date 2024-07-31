import { Row } from 'read-excel-file/node';
import { CrystallizeAPI } from '~/infrastructure/crystallize/create-crystallize-api.server';
import { mapComponentInput } from './fetch-items-and-components.server';
import { computeChanges } from './compute-changes.server';

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
    const itemsIds = items.map((item) => item.id);
    const results = {
        changes: computeChanges(
            items,
            rows.filter((cells) => itemsIds.includes(`${cells[0]}`)),
        ),
        items,
    };
    return {
        values: {
            components,
        },
        results,
    };
};
