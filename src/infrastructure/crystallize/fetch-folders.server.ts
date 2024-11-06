import { ClientInterface, createNavigationFetcher } from '@crystallize/js-api-client';

type Deps = {
    apiClient: ClientInterface;
};

type Node = {
    id: string;
    name: string;
    path: string;
    children: Node[];
};
export const fetchFolders = async (language: string, { apiClient }: Deps): Promise<Node[]> => {
    const fetcher = createNavigationFetcher(apiClient);
    const response = await fetcher.byFolders('/', language, 3);
    return response.tree.children.flatMap((folder: { children?: any[] }) => {
        if (!folder.children) {
            return [];
        }
        return [...folder.children, ...folder.children.flatMap((subfolder: { children?: any[] }) => {
            if (!subfolder.children) {
                return [];
            }
            return subfolder.children
        })];
    });
};
