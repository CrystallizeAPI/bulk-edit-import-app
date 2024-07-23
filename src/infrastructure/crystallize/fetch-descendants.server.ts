import { Component } from '~/domain/contracts/components';
import { CatalogBrowser } from './create-catalog-browser.server';
import { normalizeForGraphQL } from '~/domain/core/sanitize';

type Deps = {
    browser: CatalogBrowser;
};

export type InnerNode = {
    id: string;
    name: string;
    shapeIdentifier: string;
    topics: { id: string }[];
    components: Component[];
};

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
                        const main = componentId.split('/')[0];
                        const alias = normalizeForGraphQL(`__component__` + main);
                        memo[alias] = {
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

            const reducedNode = Object.keys(node).reduce(
                (memo: InnerNode, key) => {
                    if (key.startsWith('__component__')) {
                        memo.components.push(node[key as keyof InnerNode] as unknown as Component);
                    }
                    return memo;
                },
                {
                    id: node.id,
                    name: node.name,
                    shapeIdentifier: node.shapeIdentifier,
                    topics: node.topics || [],
                    components: [],
                },
            );
            list.push(reducedNode);
        }
    }
    return list;
};
