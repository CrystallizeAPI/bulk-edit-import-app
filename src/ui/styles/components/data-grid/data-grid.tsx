import { DataEditor } from '@glideapps/glide-data-grid';
import { useDataGrid } from './use-data-grid';
import { ActionData, LoaderData } from '../../types';

import '@glideapps/glide-data-grid/dist/index.css';
import '@crystallize/design-system/styles.css';

type ChildrenProps = {
    isRemoveDisabled: boolean;
    hasChanges: boolean;
    onRemoveSelected: () => void;
};

type DataEditorProps = {
    actionData: ActionData;
    loaderData: LoaderData;
    children: (props: ChildrenProps) => React.ReactNode;
};

export const DataGrid = ({ actionData, loaderData, children }: DataEditorProps) => {
    const {
        theme,
        onColumnResize,
        columns,
        getCellContent,
        onCellEdited,
        highlightRegions,
        gridSelection,
        setGridSelection,
        onRemoveSelected,
        isRemoveDisabled,
        itemsLength,
    } = useDataGrid({
        actionData,
        loaderData,
    });

    return (
        <>
            {children({ isRemoveDisabled, onRemoveSelected, hasChanges: !!highlightRegions?.length })}
            {typeof itemsLength === 'number' && (
                <div className="overflow-hidden rounded-xl border border-solid border-gray-100-800 bg-white shadow-sm mb-8">
                    <DataEditor
                        width="100%"
                        rows={itemsLength}
                        rowMarkers="both"
                        smoothScrollX
                        smoothScrollY
                        maxColumnAutoWidth={500}
                        maxColumnWidth={2000}
                        scaleToRem
                        getCellsForSelection
                        columns={columns}
                        onPaste
                        getCellContent={getCellContent}
                        theme={theme}
                        onColumnResize={onColumnResize}
                        onCellEdited={onCellEdited}
                        fillHandle
                        keybindings={{ downFill: true }}
                        highlightRegions={highlightRegions}
                        gridSelection={gridSelection}
                        onGridSelectionChange={setGridSelection}
                        freezeColumns={1}
                    />
                </div>
            )}

            <div id="portal" style={{ position: 'fixed', left: 0, top: 0, zIndex: 9999 }} />
        </>
    );
};

export default DataGrid;