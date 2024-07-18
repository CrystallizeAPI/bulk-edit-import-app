import { useState } from 'react';
import { BooleanView } from './shape-component-type/boolean';
import { NumericalView } from './shape-component-type/numerical';
import { RichTextView } from './shape-component-type/rich-text';
import { SingleLineView } from './shape-component-type/single-line';
import { Component } from '~/domain/contracts/components';
import { nestedComponentSeparator } from '~/domain/contracts/allowed-component-types';

type ShapeComponentRendererProps = {
    nestedPath?: string[];
    component: Component;
    itemId: string;
};
export const ShapeComponentRenderer = ({ component, itemId, nestedPath }: ShapeComponentRendererProps) => {
    const getConfig = (component?: Component, wNestedPath?: string[]) => {
        if (!component) {
            return null;
        }

        if (component.type === 'richText') {
            return {
                component: <RichTextView json={component.content.json} />,
                editableValue: component.content.plainText.join(''),
            };
        }
        if (component.type === 'singleLine') {
            return {
                component: <SingleLineView text={component.content.text} />,
                editableValue: component.content.text,
            };
        }
        if (component.type === 'numeric') {
            return {
                component: <NumericalView number={component.content.number} />,
                editableValue: component.content.number,
            };
        }
        if (component.type === 'boolean') {
            return {
                component: <BooleanView value={component.content.value} />,
                editableValue: component.content.value ? 1 : 0,
            };
        }

        if (component.type === 'contentChunk') {
            // we only manage the first chunk
            const chunk = component.content.chunks[0];
            // now we need to find the first component in the chunk that match the nested Path
            if (!wNestedPath || wNestedPath.length === 0) {
                return null;
            }
            const subComponent = chunk.find((c) => c.componentId === wNestedPath[0]);
            return getConfig(subComponent, wNestedPath.slice(0, 1));
        }

        if (component.type === 'piece') {
            if (!wNestedPath || wNestedPath.length === 0) {
                return null;
            }
            const subComponent = component.content.components.find((c) => c.componentId === wNestedPath[0]);
            return getConfig(subComponent, wNestedPath.slice(0, 1));
        }

        if (component.type === 'componentChoice') {
            if (!wNestedPath || wNestedPath.length === 0 || !component.content?.selectedComponent) {
                return null;
            }
            if (component.content.selectedComponent.componentId === wNestedPath[0]) {
                return getConfig(component.content.selectedComponent, wNestedPath.slice(0, 1));
            }
        }
        return null;
    };
    const config = getConfig(component, nestedPath);
    const [value, setValue] = useState(config?.editableValue);
    const [hasBeenEdited, setHasBeenEdited] = useState(false);

    if (!config) {
        return null;
    }

    const fullPath = [component.componentId, ...(nestedPath || [])].join(nestedComponentSeparator);
    return (
        <div className="editable block group">
            {hasBeenEdited && <input type="hidden" value={value} name={`item[${itemId}][${fullPath}]`} />}
            <div className="group-hover:hidden">{hasBeenEdited ? value : config.component}</div>
            <div className="hidden group-hover:block">
                <textarea
                    defaultValue={value}
                    rows={5}
                    cols={120}
                    onChange={(e) => {
                        setValue(e.target.value);
                        setHasBeenEdited(true);
                    }}
                />
            </div>
        </div>
    );
};
