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
export const fetchTopics = async (language: string, { apiClient }: Deps): Promise<Node[]> => {
    const fetcher = createNavigationFetcher(apiClient);
    const response = await fetcher.byTopics('/', language, 10);
    return response.tree;
};
