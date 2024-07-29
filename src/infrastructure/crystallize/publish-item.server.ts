import { ClientInterface } from '@crystallize/js-api-client';

type Deps = {
    apiClient: ClientInterface;
};

export const publishItem = async (
    itemId: string,
    language: string,
    includeDescendants: boolean,
    { apiClient }: Deps,
): Promise<void> => {
    await apiClient.nextPimApi(
        `#graphql
        mutation PUBLISH_ITEM($itemId:ID!, $language: String!, includeDescendants: Boolean!) {
            publishItem(id:$itemId, language:$language, includeDescendants: $includeDescendants) {
                ... on UpdatedComponent {
                updatedComponentPath
                    item {
                        id
                    }
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
