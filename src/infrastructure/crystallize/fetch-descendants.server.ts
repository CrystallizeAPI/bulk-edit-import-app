import { Component } from '~/domain/contracts/components';
import { CatalogBrowser } from './create-catalog-browser.server';

type Deps = {
    browser: CatalogBrowser;
};

type InnerNode = {
    shapeIdentifier: string;
    topics: { id: string }[];
} & Record<string, Component>;

const allowedComponentTypes = [
    {
        __typeName: 'SingleLineComponentContent',
        text: true,
    },
    {
        __typeName: 'RichTextComponentContent',
        json: true,
        plainText: true,
        html: true,
    },
    {
        __typeName: 'BooleanComponentContent',
        value: true,
    },
    {
        __typeName: 'NumericComponentContent',
        number: true,
    },
];

export const fetchDescendants = async (
    folderIds: string[],
    language: string,
    componentIds: string[],
    { browser }: Deps,
) => {
    const list = [];
    const browsedFolders: string[] = [];
    for (const folderId of folderIds) {
        if (browsedFolders.includes(folderId)) {
            continue;
        }
        for await (const node of browser.browse<InnerNode>({
            language,
            parentId: folderIds[0],
            nodeQuery: {
                shapeIdentifier: true,
                topics: {
                    id: true,
                },
                ...(componentIds.length > 0 &&
                    componentIds.reduce((memo: Record<string, unknown>, componentId) => {
                        // const parts = componentId.split('.');
                        //@todo: manage nested components here
                        memo[componentId] = {
                            __aliasFor: 'component',
                            __args: {
                                id: componentId,
                            },
                            componentId: true,
                            type: true,
                            content: {
                                __on: [
                                    ...allowedComponentTypes,
                                    {
                                        __typeName: 'ContentChunkComponentContent',
                                        chunks: {
                                            componentId: true,
                                            content: {
                                                __on: allowedComponentTypes,
                                            },
                                        },
                                    },
                                    {
                                        __typeName: 'ComponentChoiceComponentContent',
                                        selectedComponent: {
                                            componentId: true,
                                            content: {
                                                __on: allowedComponentTypes,
                                            },
                                        },
                                    },
                                ],
                            },
                        };
                        return memo;
                    }, {})),
            },
        })) {
            if (node.type === 'folder') {
                browsedFolders.push(node.id);
            }
            list.push(node);
        }
    }
    return list;
};
