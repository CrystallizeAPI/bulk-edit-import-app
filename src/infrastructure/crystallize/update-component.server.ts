import { MassClientInterface } from '@crystallize/js-api-client';
import { ComponentInput } from '@crystallize/schema';

type Deps = {
    apiClient: MassClientInterface['enqueue'];
};

export const updateComponent = async (
    itemId: string,
    language: string,
    input: ComponentInput,
    { apiClient }: Deps,
): Promise<void> => {
    apiClient.nextPimApi(
        `#graphql
        mutation UPDATE_COMPONENT($itemId:ID!, $language: String!, $input: ComponentInput!) {
            updateComponent(itemId:$itemId, language:$language, component: $input) {
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
            input,
        },
    );
};
