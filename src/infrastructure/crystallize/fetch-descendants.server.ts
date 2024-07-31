import { CatalogBrowser } from './create-catalog-browser.server';
import { InnerNode } from '~/domain/contracts/item-list';
import { innerQuery, reducedNode } from './fetch-by-ids.server';

type Deps = {
    browser: CatalogBrowser;
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
            nodeQuery: innerQuery(componentIds),
        })) {
            if (node.type === 'folder') {
                browsedFolders.push(node.id);
            }
            list.push(reducedNode(node));
        }
    }
    return list;
};
