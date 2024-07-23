import { Toolbar } from '../toolbar/';

type GridToolbarProps = {
    isRemoveDisabled: boolean;
    hasChanges: boolean;
    onRemove: () => void;
    onSave: () => void;
    onSavePublish: () => void;
};

const removeAction = { key: 'remove-selected', name: 'Remove selected', className: 'danger' };

export const GridToolbar = ({ isRemoveDisabled, hasChanges, onSave, onSavePublish, onRemove }: GridToolbarProps) => {
    const actions = [
        { key: 'import', name: 'Import', onSelect: () => {} },
        { key: 'export', name: 'Export', disabled: hasChanges, onSelect: () => {} },
        { ...removeAction, disabled: isRemoveDisabled, onSelect: onRemove },
    ];

    return (
        <Toolbar.Container>
            <Toolbar.Input label="App" input={<input defaultValue="Batch edit" />} />
            <Toolbar.Actions actions={actions} />
            <Toolbar.Button disabled={!hasChanges} text="Save changes" onClick={onSave} />
            <Toolbar.Button intent="action" disabled={!hasChanges} text="Save and publish" onClick={onSavePublish} />
        </Toolbar.Container>
    );
};
