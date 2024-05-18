import { useState } from 'react';
import { BooleanView } from './shape-component-type/boolean';
import { NumericalView } from './shape-component-type/numerical';
import { RichTextView } from './shape-component-type/rich-text';
import { SingleLineView } from './shape-component-type/single-line';
import { Component } from '~/domain/contracts/components';

type ShapeComponentRendererProps = {
    component: Component;
    itemId: string;
};
export const ShapeComponentRenderer = ({ component, itemId }: ShapeComponentRendererProps) => {
    const getConfig = (component: Component) => {
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
        if (component.type === 'numerical') {
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
        return null;
    };
    const config = getConfig(component);
    const [value, setValue] = useState(config?.editableValue);
    const [hasBeenEdited, setHasBeenEdited] = useState(false);

    if (!config) {
        return null;
    }

    return (
        <div className="editable block group">
            {hasBeenEdited && <input type="hidden" value={value} name={`item[${itemId}][${component.componentId}]`} />}
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
