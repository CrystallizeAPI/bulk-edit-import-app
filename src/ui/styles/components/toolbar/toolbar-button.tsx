import { forwardRef } from 'react';
import { Button } from '@crystallize/design-system';

type ToolbarButtonProps = Omit<React.ComponentProps<typeof Button>, 'children'> & {
    text: string;
    leadingIcon?: JSX.Element;
    trailingIcon?: JSX.Element;
    isActive?: boolean;
};

export const ToolbarButton = forwardRef<HTMLButtonElement, ToolbarButtonProps>(
    ({ text, isActive, leadingIcon, trailingIcon, ...delegated }, ref) => {
        return (
            <Button
                ref={ref}
                {...delegated}
                variant={isActive ? 'elevate' : 'default'}
                prepend={leadingIcon}
                append={trailingIcon}
            >
                <div className="max-w-[200px] truncate">{text}</div>
            </Button>
        );
    },
);

ToolbarButton.displayName = 'ToolbarButton';
