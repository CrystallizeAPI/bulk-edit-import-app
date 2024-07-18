import { ClientInterface } from '@crystallize/js-api-client';
import { jsonToGraphQLQuery } from 'json-to-graphql-query';

type ListArgs = {
    parentId: string;
    language: string;
    limit: number;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- we can't type this for this project it would be too much
    nodeQuery: any;
    shapeIdentifier?: string;
    offset?: string;
};
type BrowseArgs = Omit<ListArgs, 'limit' | 'offset'>;

type Node = {
    id: string;
    name: string;
    tree: {
        parentId: string;
        path: string;
    };
    type: string;
};
type NodeWith<T> = Node & T;
type Results<T> = {
    items: {
        pageInfo: {
            hasNextPage: boolean;
            endCursor: string;
        };
        edges: {
            node: NodeWith<T>;
        }[];
    };
};
export const createCatalogBrowser = (apiClient: ClientInterface) => {
    async function* list<T>({
        language,
        nodeQuery,
        limit,
        parentId,
        offset,
    }: ListArgs): AsyncIterableIterator<NodeWith<T>> {
        let query = {
            items: {
                __args: {
                    language,
                    filter: {
                        parentItemId: parentId,
                    },
                    first: limit,
                    ...(offset && { after: offset }),
                },
                __on: {
                    __typeName: 'ItemConnection',
                    pageInfo: {
                        hasNextPage: true,
                        endCursor: true,
                    },
                    edges: {
                        node: {
                            id: true,
                            name: true,
                            type: true,
                            ...nodeQuery,
                            tree: {
                                ...(nodeQuery.tree ?? {}),
                                parentId: true,
                                path: true,
                            },
                        },
                    },
                },
            },
        };

        let results: Results<T> | undefined;
        do {
            try {
                const builtQuery = jsonToGraphQLQuery({ query }) + '\n' + fragments;
                results = await apiClient.nextPimApi(builtQuery);
                if (!results) {
                    return;
                }
                const edges = results?.items?.edges ?? [];
                if (edges.length === 0) {
                    return;
                }
                for (const edge of edges) {
                    yield edge.node;
                }
                query = {
                    ...query,
                    items: {
                        ...query.items,
                        __args: {
                            ...query.items.__args,
                            after: results.items.pageInfo.endCursor,
                        },
                    },
                };
            } catch (exception) {
                console.error(exception);
            }
        } while (results && results.items.pageInfo.hasNextPage);
    }

    async function* browse<T>(
        { language, nodeQuery, parentId }: BrowseArgs,
        packetSize = 100,
    ): AsyncIterableIterator<NodeWith<T>> {
        for await (const node of list({ language, parentId, nodeQuery, limit: packetSize })) {
            if (node.type === 'folder') {
                yield node as NodeWith<T>;
                yield* browse<T>({ language, parentId: node.id, nodeQuery });
            } else {
                yield node as NodeWith<T>;
            }
        }
    }
    return {
        paginatedList: list,
        browse,
    };
};

export type CatalogBrowser = Awaited<ReturnType<typeof createCatalogBrowser>>;

const fragments = `#graphql

fragment Component on Component {
  ...BaseComponentDefinition
  content {
    ...BaseComponentContent

    ... on ComponentChoiceComponentContent {
      selectedComponent {
        ...BaseComponentDefinition
        content {
          ...BaseComponentContent
          ...LevelThreePieceContent
        }
      }
    }

    ... on ContentChunkComponentContent {
      chunks {
        ...BaseComponentDefinition
        content {
          ...BaseComponentContent
          ...LevelThreePieceContent
        }
      }
    }

    ... on ComponentMultipleChoiceComponentContent {
      selectedComponents {
        ...BaseComponentDefinition
        content {
          ...BaseComponentContent
          ...LevelThreePieceContent
        }
      }
    }

    ... on PieceComponentContent {
      components {
        ...BaseComponentDefinition
        content {
          ...BaseComponentContent
          ...LevelThreePieceContent

          ... on ComponentChoiceComponentContent {
            selectedComponent {
              ...BaseComponentDefinition
              content {
                ...BaseComponentContent
                ...LevelTwoPieceContent
              }
            }
          }

          ... on ContentChunkComponentContent {
            chunks {
              ...BaseComponentDefinition
              content {
                ...BaseComponentContent
                ...LevelTwoPieceContent
              }
            }
          }
        }
      }
    }
  }
}

fragment BaseComponentContent on ComponentContent {
  ...Boolean
  ...SingleLine
  ...RichTextComp
  ...ParagraphCollection
  ...ItemRelations
  ...GridRelations
  ...Location
  ...PropertiesTable
  ...DateTime
  ...Numeric
  ...Selection
}

fragment BaseComponentDefinition on Component {
  componentId
  type
}

fragment Boolean on BooleanComponentContent {
  value
}

fragment SingleLine on SingleLineComponentContent {
  text
}

fragment RichTextComp on RichTextComponentContent {
  json
  html
  plainText
}

fragment RichText on RichTextContent {
  json
  html
  plainText
}

fragment ParagraphCollection on ParagraphCollectionComponentContent {
  paragraphs {
    title {
      ...SingleLine
    }
    body {
      ...RichText
    }
  }
}

fragment PropertiesTable on PropertiesTableComponentContent {
  sections {
    ... on PropertiesTableComponentSection {
      title
      properties {
        key
        value
      }
    }
  }
}

fragment ItemRelations on ItemRelationsComponentContent {
  items {
    id
    name
  }
  productVariants {
    sku
    name
  }
}

fragment GridRelations on GridRelationsComponentContent {
  grids {
    id
    name
  }
}

fragment Location on LocationComponentContent {
  lat
  long
}

fragment DateTime on DatetimeComponentContent {
  datetime
}


fragment Numeric on NumericComponentContent {
  number
  unit
}

fragment Selection on SelectionComponentContent {
  options {
    key
    value
  }
}

fragment LevelOnePieceContent on PieceComponentContent {
  components {
    ...BaseComponentDefinition
    content {
      ...BaseComponentContent
    }
  }
}

fragment LevelTwoPieceContent on PieceComponentContent {
  components {
    ...BaseComponentDefinition
    content {
      ...BaseComponentContent
      ...LevelOnePieceContent

      ... on ComponentChoiceComponentContent {
        selectedComponent {
          ...BaseComponentDefinition
          content {
            ...BaseComponentContent
          }
        }
      }

      ... on ContentChunkComponentContent {
        chunks {
          ...BaseComponentDefinition
          content {
            ...BaseComponentContent
          }
        }
      }
    }
  }
}

fragment LevelThreePieceContent on PieceComponentContent {
  components {
    ...BaseComponentDefinition
    content {
      ...BaseComponentContent
      ...LevelTwoPieceContent

      ... on ComponentChoiceComponentContent {
        selectedComponent {
          ...BaseComponentDefinition
          content {
            ...BaseComponentContent
            ...LevelOnePieceContent
          }
        }
      }

      ... on ContentChunkComponentContent {
        chunks {
          ...BaseComponentDefinition
          content {
            ...BaseComponentContent
            ...LevelOnePieceContent
          }
        }
      }
    }
  }
}
`;
