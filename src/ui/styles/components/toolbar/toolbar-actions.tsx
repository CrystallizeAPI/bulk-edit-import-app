import { useState } from 'react';
import { Button, DropdownMenu } from '@crystallize/design-system';
import { Icon } from '../../icons';

export type Action = {
    key: string;
    name: React.ReactNode;
    onSelect: () => void;
    className?: string;
    disabled?: boolean;
};

type ToolbarActionsProps = {
    actions: Action[];
    alignContent?: 'start' | 'center' | 'end';
};

export function ToolbarActions({ actions, alignContent = 'start' }: ToolbarActionsProps) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <DropdownMenu.Root
            onOpenChange={setIsOpen}
            alignContent={alignContent}
            content={actions.map(({ key, name, onSelect, className, disabled }) => (
                <DropdownMenu.Item key={key} disabled={disabled} onSelect={onSelect} className={className}>
                    <div className="min-w-[114px]" data-testid={`toolbar-action-${key}`}>
                        {name}
                    </div>
                </DropdownMenu.Item>
            ))}
        >
            <Button variant={isOpen ? 'elevate' : 'default'} className={`!px-2 ${isOpen ? 'drop-shadow-active' : ''}`}>
                {isOpen ? <Icon.Cancel color="density" width={24} height={16} /> : <Icon.Dots width={24} height={24} />}
            </Button>
        </DropdownMenu.Root>
    );
}
