import { Component } from '~/domain/contracts/components';
import { normalizeForGraphQL } from '~/domain/core/sanitize';
import { InnerNode } from '~/domain/contracts/item-list';
import { jsonToGraphQLQuery } from 'json-to-graphql-query';
import { ClientInterface, createMassCallClient } from '@crystallize/js-api-client';
import { fragments } from './create-catalog-browser.server';

type Deps = {
    apiClient: ClientInterface;
};

export const innerQuery = (componentIds: string[]) => {
    return {
        id: true,
        name: true,
        language: true,
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
    };
};

export const reducedNode = (node: Omit<InnerNode, 'components'> & Record<string, unknown>) => {
    return Object.keys(node).reduce(
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
            language: node.language,
            topics: node.topics || [],
            components: [],
        },
    );
};

export const fetchByIds = async (
    ids: {
        id: string;
        language: string;
    }[],
    componentIds: string[],
    { apiClient }: Deps,
) => {
    const massClient = createMassCallClient(apiClient, {
        initialSpawn: 4,
        maxSpawn: 10,
    });

    const list: InnerNode[] = [];

    ids.forEach((id) => {
        const query = {
            item: {
                __args: id,
                __on: {
                    __typeName: 'Item',
                    ...innerQuery(componentIds),
                },
            },
        };
        const gQuery = jsonToGraphQLQuery({ query });
        massClient.enqueue.nextPimApi(gQuery + '\n' + fragments);
    });

    do {
        const results = massClient.hasFailed() ? await massClient.retry() : await massClient.execute();
        Object.entries<{ item: Omit<InnerNode, 'components'> & Record<string, unknown> }>(results).forEach(
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            ([_, node]) => {
                list.push(reducedNode(node.item));
            },
        );
    } while (massClient.hasFailed());

    return list;
};
