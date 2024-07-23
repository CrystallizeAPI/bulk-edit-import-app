import { cloneElement, type ReactNode, type LabelHTMLAttributes } from 'react';

type ToolbarInputProps = LabelHTMLAttributes<HTMLLabelElement> & {
    input: JSX.Element;
    label?: ReactNode;
    labelFloating?: ReactNode;
    icon?: JSX.Element;
};

const labelClassNames = 'truncate text-xs font-medium h-3.5 transition';

export function ToolbarInput({ input, label, icon, labelFloating, ...delegated }: ToolbarInputProps) {
    const clonedInput = cloneElement(input, {
        'data-testid': 'toolbar-input',
        className:
            'font-display w-full truncate border-none bg-transparent p-0 text-base font-bold text-gray-700-200 focus:outline-none placeholder:text-inactive-text',
    });

    return (
        <label
            {...delegated}
            className="group flex flex-1 items-center space-x-2 bg-elevate px-4 py-3 text-gray-300-600 rounded-bl focus-within:bg-purple-50-900 focus-within:text-gray-700-200"
        >
            <div className="shrink-0">{icon}</div>
            <div className="relative flex-1">
                {label && <div className={labelClassNames}>{label}</div>}
                {clonedInput}
                {labelFloating && (
                    <div className="absolute bottom-[-13px] left-0 text-inactive-text opacity-0 group-hover:opacity-100">
                        {labelFloating}
                    </div>
                )}
            </div>
        </label>
    );
}
