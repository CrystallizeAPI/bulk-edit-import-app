import { ClientInterface } from '@crystallize/js-api-client';

type Deps = {
    apiClient: ClientInterface;
};
export const fetchLanguages = async ({ apiClient }: Deps): Promise<Record<string, string>> => {
    if (!apiClient.config.tenantId) {
        throw new Error('tenantId not set on the ClientInterface.');
    }
    const data = await apiClient.pimApi(
        `#graphql
        query GET_LANGUAGES ($tenantId: ID!) {
            tenant {
                get(id:$tenantId) {
                    availableLanguages {
                        code
                        name
                    }
                }
            }
        }`,
        {
            tenantId: apiClient.config.tenantId,
        },
    );
    return data.tenant.get.availableLanguages.reduce(
        (memo: Record<string, string>, lang: { code: string; name: string }) => {
            memo[lang.code] = lang.name;
            return memo;
        },
        {},
    );
};
