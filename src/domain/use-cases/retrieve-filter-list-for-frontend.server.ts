import { CrystallizeAPI } from '~/infrastructure/crystallize/create-crystallize-api.server';
import { SelectOption } from '../contracts/select-option';
import { allowedComponentTypes } from '../contracts/allowed-component-types';
import { ShapeComponent } from '@crystallize/schema';

type Deps = {
    api: CrystallizeAPI;
};

export const retrieveFilterListForFrontend = async ({ api }: Deps) => {
    try {
        const [languages, folders, shapes, topics] = await Promise.all([
            api.fetchLanguages(),
            api.fetchFolders('en'),
            api.fetchShapes(),
            api.fetchTopics('en'),
        ]);

        const languageOptions: SelectOption[] = Object.keys(languages).map((lang) => ({
            value: lang,
            label: languages[lang],
        }));
        const shapeOptions = shapes.reduce(
            (
                memo: {
                    folder: SelectOption[];
                    document: SelectOption[];
                    product: SelectOption[];
                },
                shape,
            ) => {
                if (!shape.components || shape.components.length === 0) {
                    return memo;
                }
                memo[shape.type].push({ value: shape.identifier, label: shape.name });
                return memo;
            },
            {
                folder: [],
                document: [],
                product: [],
            },
        );

        const folderOptions = folders.map((folder) => ({ value: folder.id, label: folder.path }));
        const topicOptions = topics.map((topic) => ({ value: topic.id, label: topic.path }));

        const componentsMap = shapes.reduce((memo: Record<string, SelectOption[]>, shape) => {
            memo[shape.identifier] = reduceComponents(shape.components ?? []);
            return memo;
        }, {});
        return {
            languages: languageOptions,
            folders: folderOptions,
            shapes: [
                { label: 'Folder', options: shapeOptions.folder },
                { label: 'Document', options: shapeOptions.document },
                { label: 'Product', options: shapeOptions.product },
            ],
            topics: topicOptions,
            componentsMap,
        };
    } catch (error) {
        console.log(error);
        return {
            languages: [],
            folders: [],
            shapes: [],
            topics: [],
            componentsMap: {},
        };
    }
};

const applyPrefix = (value: string, separator: string, prefix?: string) => {
    if (!prefix) {
        return value;
    }
    return `${prefix}${separator}${value}`;
};
const reduceComponents = (
    components: ShapeComponent[],
    prefix?: {
        identifier: string;
        name: string;
    },
) => {
    const memo: SelectOption[] = [];
    const extendedAllowedComponentTypes = [...allowedComponentTypes, 'contentChunk', 'componentChoice']; //@todo: add Pieces
    components.forEach((component) => {
        if (!extendedAllowedComponentTypes.includes(component.type)) {
            return memo;
        }
        if (component.type === 'contentChunk') {
            // we don't manage repeatable chunk
            const config = component.config;
            if (config && 'repeatable' in config && config.repeatable === true) {
                return memo;
            }
            if (config && 'components' in config) {
                const chunkComponents = reduceComponents(config.components ?? [], {
                    identifier: component.id,
                    name: component.name,
                });
                memo.push(...chunkComponents);
            }
            return;
        }
        if (component.type === 'componentChoice') {
            const config = component.config;
            if (config && 'choices' in config) {
                const choicesComponents = reduceComponents(config.choices ?? [], {
                    identifier: component.id,
                    name: component.name,
                });
                memo.push(...choicesComponents);
            }
            return;
        }
        //@todo: add Pieces: needs to update schema lib and import/export
        // merging this: https://github.com/CrystallizeAPI/libraries/pull/235

        memo.push({
            value: `${applyPrefix(component.id, '.', prefix?.identifier)}`,
            label: `${applyPrefix(component.name, '.', prefix?.name)}`,
        });
    });
    return memo;
};
