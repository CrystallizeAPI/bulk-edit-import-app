import { DataEditor } from '@glideapps/glide-data-grid';
import { useDataGrid } from './use-data-grid';
import { InnerNode } from '~/infrastructure/crystallize/fetch-descendants.server';
import { SelectOption } from '~/domain/contracts/select-option';

import '@glideapps/glide-data-grid/dist/index.css';

type DataEditorProps = {
    items: InnerNode[];
    components: SelectOption[];
};

const DataGrid = ({ items, components }: DataEditorProps) => {
    const { theme, onColumnResize, columns, getCellContent, onCellEdited, highlightRegions } = useDataGrid({
        items,
        components,
    });

    return (
        <>
            <div className="flex justify-end mt-4">
                <button type="submit" name="_action" value="saveItems">
                    Save
                </button>
            </div>

            <div className="overflow-hidden rounded-xl border border-solid border-gray-100-800 bg-white shadow-sm my-4">
                <DataEditor
                    width="100%"
                    rows={items.length}
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
                />
            </div>
            <div id="portal" style={{ position: 'fixed', left: 0, top: 0, zIndex: 9999 }} />
        </>
    );
};

export default DataGrid;
