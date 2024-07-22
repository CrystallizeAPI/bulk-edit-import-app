import { DataEditor } from '@glideapps/glide-data-grid';
import { useDataGrid } from './use-data-grid';
import { SelectOption } from '~/domain/contracts/select-option';
import { Button } from '@crystallize/design-system';

import '@glideapps/glide-data-grid/dist/index.css';
import '@crystallize/design-system/styles.css';
import { Item } from '~/domain/use-cases/fetch-items-and-components.server';

type DataEditorProps = {
    items: Item[];
    components: SelectOption[];
};

const DataGrid = ({ items, components }: DataEditorProps) => {
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
        items,
        components,
    });

    return (
        <>
            <div className="flex justify-end mt-4 gap-2">
                <Button disabled={isRemoveDisabled} onClick={onRemoveSelected}>
                    Remove selected
                </Button>

                <Button
                    intent="action"
                    type="submit"
                    name="_action"
                    value="saveItems"
                    disabled={!highlightRegions?.length}
                >
                    Save changes
                </Button>
            </div>

            <div className="overflow-hidden rounded-xl border border-solid border-gray-100-800 bg-white shadow-sm my-4">
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
                />
            </div>
            <div id="portal" style={{ position: 'fixed', left: 0, top: 0, zIndex: 9999 }} />
        </>
    );
};

export default DataGrid;
