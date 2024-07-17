import { requirePimAwareApiClient } from '../core/auth.server';
import { fetchFolders } from '~/infrastructure/crystallize/fetch-folders.server';
import { fetchLanguages } from '~/infrastructure/crystallize/fetch-languages.server';
import { fetchShapes } from '~/infrastructure/crystallize/fetch-shapes.server';
import { fetchTopics } from '~/infrastructure/crystallize/fetch-topics.server';
import { createCatalogBrowser } from './create-catalog-browser.server';
import { fetchDescendants } from './fetch-descendants.server';

export const CrystallizeAPI = async (request: Request) => {
    const apiClient = await requirePimAwareApiClient(request);
    const catalogueBrowser = createCatalogBrowser(apiClient);
    return {
        apiClient,
        catalogueBrowser,
        fetchShapes: () => fetchShapes({ apiClient }),
        fetchFolders: (language: string) => fetchFolders(language, { apiClient }),
        fetchTopics: (language: string) => fetchTopics(language, { apiClient }),
        fetchLanguages: () => fetchLanguages({ apiClient }),
        fetchDescendants: async (folderIds: string[], language: string, components: string[][]) =>
            fetchDescendants(folderIds, language, components, { browser: catalogueBrowser }),
    };
};

export type CrystallizeAPI = Awaited<ReturnType<typeof CrystallizeAPI>>;
