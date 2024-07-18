import { Component } from '~/domain/contracts/components';
import { CatalogBrowser } from './create-catalog-browser.server';

type Deps = {
    browser: CatalogBrowser;
};

type InnerNode = {
    shapeIdentifier: string;
    topics: { id: string }[];
} & Record<string, Component>;

export const fetchDescendants = async (
    folderIds: string[],
    language: string,
    componentIds: string[][],
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
                        const main = componentId[0];
                        memo[main] = {
                            __aliasFor: 'component',
                            __args: {
                                id: main,
                            },
                            __all_on: ['Component'],
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
