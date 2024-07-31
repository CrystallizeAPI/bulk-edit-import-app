import { executeForm } from '~/domain/core/wrap-form-error-exception';
import { CrystallizeAPI } from '../crystallize/create-crystallize-api.server';
import { EventEmitter } from 'events';
import { fetchItemsAndComponents } from '~/domain/use-cases/fetch-items-and-components.server';
import { FetchItemsInputSchema } from '~/domain/contracts/input/fetch-items-input';
import { z } from 'zod';
import { saveItems } from '~/domain/use-cases/save-items.server';
import { NonStructuaralComponent, NonStructuaralComponentSchema } from '~/domain/contracts/components';
import readXlsxFile from 'read-excel-file/node';
import { convertTableToItemsForImport } from '~/domain/use-cases/convert-table-to-items-for-import.server';

type Deps = {
    api: CrystallizeAPI;
    emitter: EventEmitter;
};
export const indexPageAction = async (formData: FormData, { api, emitter }: Deps) => {
    const action = formData.get('_action');
    const language = (formData.get('language') as string) || 'en';

    if (action === 'fetchItems') {
        const values = {
            language,
            shape: formData.get('shape') || undefined,
            folders: formData.getAll('folders').filter(Boolean),
            topics: formData.getAll('topics').filter(Boolean),
            components: formData.getAll('components').filter(Boolean),
        };
        return await executeForm(
            async (values) => {
                return {
                    items: await fetchItemsAndComponents(values, { api }),
                };
            },
            values,
            FetchItemsInputSchema,
        );
    }

    if (action === 'saveItems' || action === 'savePublishItems') {
        const values: Record<string, Record<string, NonStructuaralComponent>> = {};
        for (const [key, value] of formData.entries()) {
            const match = key.match(/item\[(.*?)\]\[(.*?)\]/);
            if (match) {
                const id = match[1];
                const dynamicKey = match[2];

                if (!values[id]) {
                    values[id] = {};
                }
                values[id][dynamicKey] = JSON.parse(value.toString());
            }
        }
        const results = await executeForm(
            async (values) => {
                return await saveItems(values, language, action === 'savePublishItems', { emitter, api });
            },
            values,
            z.record(z.record(NonStructuaralComponentSchema)),
        );
        return results;
    }

    if (action === 'setupItemsFromFile') {
        const file = formData.get('file') as File;
        if (!file) {
            return { success: false, errors: { global: 'No file selected.' }, values: {}, results: undefined };
        }
        const xlsx = await readXlsxFile(Buffer.from(new Uint8Array(await file.arrayBuffer())));
        // remap the table to a list of items
        const results = await convertTableToItemsForImport(xlsx, { api });
        return { success: true, ...results, errors: {} };
    }
    return { success: false, errors: { global: 'Unknown action.' }, values: {}, results: undefined };
};
