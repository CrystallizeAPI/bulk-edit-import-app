import { executeForm } from '~/domain/core/wrap-form-error-exception';
import { CrystallizeAPI } from '../crystallize/create-crystallize-api.server';
import { EventEmitter } from 'events';
import { fetchItemsAndComponents } from '~/domain/use-cases/fetch-items-and-components.server';
import { FetchItemsInputSchema } from '~/domain/contracts/input/fetch-items-input';
import { z } from 'zod';
import { saveItems } from '~/domain/use-cases/save-items.server';

type Deps = {
    api: CrystallizeAPI;
    emitter: EventEmitter;
};
export const indexPageAction = async (formData: FormData, { api, emitter }: Deps) => {
    const action = formData.get('_action');

    if (action === 'fetchItems') {
        const values = {
            language: formData.get('language') || undefined,
            shape: formData.get('shape') || undefined,
            folders: formData.getAll('folders').filter(Boolean),
            topics: formData.getAll('topics').filter(Boolean),
            components: formData
                .getAll('components')
                .filter(Boolean)
                .map((c) => `${c}`.split('|<>|')),
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

    if (action === 'saveItems') {
        const values: Record<string, Record<string, string>> = {};
        for (const [key, value] of formData.entries()) {
            const match = key.match(/item\[(.*?)\]\[(.*?)\]/);
            if (match) {
                const id = match[1];
                const dynamicKey = match[2];

                if (!values[id]) {
                    values[id] = {};
                }
                values[id][dynamicKey] = value.toString();
            }
        }
        const results = await executeForm(
            async (values) => {
                return await saveItems(values, { emitter });
            },
            values,
            z.record(z.record(z.string())),
        );
        return results;
    }
    return { success: false, errors: { global: 'Unknow action.' }, values: {}, results: undefined };
};
