import { MassClientInterface } from '@crystallize/js-api-client';

type Deps = {
    apiClient: MassClientInterface['enqueue'];
};

export const publishItem = async (
    itemId: string,
    language: string,
    includeDescendants: boolean,
    { apiClient }: Deps,
): Promise<void> => {
    apiClient.nextPimApi(
        `#graphql
        mutation PUBLISH_ITEM($itemId:ID!, $language: String!, $includeDescendants: Boolean!) {
            publishItem(id:$itemId, language:$language, includeDescendants: $includeDescendants) {
                ... on PublishInfo {
                    id
                    versionId
                }
                ... on BasicError {
                    message
                }
            }
        } 
    `,
        {
            itemId,
            language,
            includeDescendants,
        },
    );
};
