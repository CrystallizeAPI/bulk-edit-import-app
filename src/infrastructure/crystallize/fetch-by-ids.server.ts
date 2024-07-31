import { Component } from '~/domain/contracts/components';
import { normalizeForGraphQL } from '~/domain/core/sanitize';
import { InnerNode } from '~/domain/contracts/item-list';
import { jsonToGraphQLQuery } from 'json-to-graphql-query';
import { ClientInterface } from '@crystallize/js-api-client';
import { fragments } from './create-catalog-browser.server';

type Deps = {
    apiClient: ClientInterface;
};

export const innerQuery = (componentIds: string[]) => {
    return {
        id: true,
        name: true,
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
            topics: node.topics || [],
            components: [],
        },
    );
};

type JSONQuery = Parameters<typeof jsonToGraphQLQuery>[0];

export const fetchByIds = async (
    ids: {
        id: string;
        language: string;
    }[],
    componentIds: string[],
    { apiClient }: Deps,
) => {
    const list = [];
    const query = {
        ...ids.reduce((memo: JSONQuery, id) => {
            return {
                ...memo,
                [`item_${id.id}_${id.language}`]: {
                    __aliasFor: 'item',
                    __args: id,
                    __on: {
                        __typeName: 'Item',
                        ...innerQuery(componentIds),
                    },
                },
            };
        }, {}),
    };
    const gQuery = jsonToGraphQLQuery({ query });
    const data = await apiClient.nextPimApi(gQuery + '\n' + fragments);
    for (const id of ids) {
        const node = data[`item_${id.id}_${id.language}`];
        list.push(reducedNode(node));
    }
    return list;
};
