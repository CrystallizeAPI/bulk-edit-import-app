import { CrystallizeAPI } from '~/infrastructure/crystallize/create-crystallize-api.server';
import { FetchItemsInput } from '../contracts/input/fetch-items-input';
import { Component, NonStructuaralComponent } from '../contracts/components';
import {
    ComponentChoiceComponentConfig,
    ContentChunkComponentConfig,
    PieceComponentConfig,
    Shape,
} from '@crystallize/schema';
import { InnerNode } from '~/infrastructure/crystallize/fetch-descendants.server';

type Deps = {
    api: CrystallizeAPI;
};

const getComponent = (component?: Component, wNestedPath?: string[]) => {
    if (!component) {
        return null;
    }

    if (['richText', 'singleLine', 'numeric', 'boolean'].includes(component.type)) {
        return component;
    }

    if (component.type === 'contentChunk') {
        // we only manage the first chunk
        const chunk = component.content.chunks[0];
        // now we need to find the first component in the chunk that match the nested Path
        if (!wNestedPath || wNestedPath.length === 0) {
            return null;
        }
        const subComponent = chunk.find((c) => c.componentId === wNestedPath[0]);
        return getComponent(subComponent, wNestedPath.slice(1));
    }

    if (component.type === 'piece') {
        if (!wNestedPath || wNestedPath.length === 0) {
            return null;
        }
        const subComponent = component.content.components.find((c) => c.componentId === wNestedPath[0]);
        return getComponent(subComponent, wNestedPath.slice(1));
    }

    if (component.type === 'componentChoice') {
        if (!wNestedPath || wNestedPath.length === 0 || !component.content?.selectedComponent) {
            return null;
        }
        if (component.content.selectedComponent.componentId === wNestedPath[0]) {
            return getComponent(component.content.selectedComponent, wNestedPath.slice(1));
        }
    }
    return null;
};

type ShapeComponent = Required<Shape>['components'][0];

const getEmptyFromShape = (
    components: ShapeComponent[],
    wNestedPath: string[],
): Omit<NonStructuaralComponent, 'componentId'> | null => {
    const component = (components || []).find((c) => c.id === wNestedPath[0]);
    if (!component) {
        return null;
    }
    if (component.type === 'richText') {
        return {
            type: 'richText',
            content: {
                json: [],
                html: [],
                plainText: [],
            },
        };
    }
    if (component.type === 'singleLine') {
        return {
            type: 'singleLine',
            content: {
                text: '',
            },
        };
    }
    if (component.type === 'numeric') {
        return {
            type: 'numeric',
            content: {
                number: 0,
            },
        };
    }
    if (component.type === 'boolean') {
        return {
            type: 'boolean',
            content: {
                value: false,
            },
        };
    }

    if (component.type === 'contentChunk') {
        return getEmptyFromShape((component.config as ContentChunkComponentConfig).components, wNestedPath.slice(1));
    }

    if (component.type === 'piece') {
        return getEmptyFromShape((component.config as PieceComponentConfig).components, wNestedPath.slice(1));
    }
    if (component.type === 'componentChoice') {
        // we are going to take the first choice by default
        return getEmptyFromShape((component.config as ComponentChoiceComponentConfig).choices, wNestedPath.slice(1));
    }

    return null;
};
/**
 * PIM Search does not have the filter capabilities to fetch items and components in a single request.
 * So we are going to fetch the children as a tree and then filter manually on topics and shapes...
 */

type WithComponentPathNonStructuaralComponent = Omit<NonStructuaralComponent, 'componentId'> & {
    componentPath: string[];
};
export type Item = Omit<InnerNode, 'components'> & {
    components: WithComponentPathNonStructuaralComponent[];
};

export const fetchItemsAndComponents = async (input: FetchItemsInput, { api }: Deps): Promise<Item[]> => {
    const items = await api.fetchDescendants(input.folders, input.language, input.components);
    const filteredItems = items.filter((item) => {
        if (item.shapeIdentifier !== input.shape) {
            return false;
        }
        if (input.topics.length > 0) {
            const topicIds = item.topics.map((topic) => topic.id);
            if (!input.topics.some((topic) => topicIds.includes(topic))) {
                return false;
            }
        }
        return true;
    });

    const shapeMappings: Record<string, Shape> = {};
    const shapes = await api.fetchShapes();

    return filteredItems.map((item) => {
        if (!shapeMappings[item.shapeIdentifier]) {
            const shape = shapes.find((shape) => shape.identifier === item.shapeIdentifier);
            if (!shape) {
                throw new Error(`Shape ${item.shapeIdentifier} not found`);
            }
            shapeMappings[item.shapeIdentifier] = shape;
        }
        return {
            ...item,
            components: input.components.map((componentPath) => {
                const main = componentPath[0];
                const component = item.components.find((c) => c?.componentId === main);
                const comp = getComponent(component, componentPath.slice(1)) as Omit<
                    NonStructuaralComponent,
                    'componentId'
                > | null;
                if (comp === null) {
                    const s = shapeMappings[item.shapeIdentifier];
                    const comp = getEmptyFromShape(s.components ?? [], componentPath);
                    if (!comp) {
                        throw new Error(
                            `Impossible to get an empty value for Shape ${item.shapeIdentifier} with ${componentPath}`,
                        );
                    }
                    return {
                        componentPath,
                        content: comp.content,
                        type: comp.type,
                    };
                }
                return {
                    componentPath,
                    content: comp.content,
                    type: comp.type,
                };
            }),
        };
    });
};
