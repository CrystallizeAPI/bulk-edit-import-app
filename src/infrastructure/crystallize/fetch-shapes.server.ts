import { ClientInterface } from '@crystallize/js-api-client';
import { Shape } from '@crystallize/schema';

type Deps = {
    apiClient: ClientInterface;
};

export const fetchShapes = async ({ apiClient }: Deps): Promise<Shape[]> => {
    if (!apiClient.config.tenantId) {
        throw new Error('tenantId not set on the ClientInterface.');
    }
    const query = `query {
        shapes(first: 100) {
            edges {
                node {
                    identifier
                    name
                    type
                    resolvedConfiguration
                }
            }
        }
    }`;
    return await apiClient.nextPimApi(query).then((res) =>
        res?.shapes?.edges.map(
            (edge: {
                node: {
                    identifier: string;
                    name: string;
                    type: string;
                    resolvedConfiguration: object;
                };
            }) => ({
                identifier: edge.node.identifier,
                name: edge.node.name,
                type: edge.node.type,
                ...edge.node.resolvedConfiguration,
            }),
        ),
    );
};
