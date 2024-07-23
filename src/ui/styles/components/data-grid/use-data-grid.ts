import { useCallback, useMemo, useState, useEffect, useRef } from 'react';
import { Item, GridCell, TextCell, GridSelection, BooleanCell, NumberCell } from '@glideapps/glide-data-grid';
import { Item as ListItem } from '~/domain/use-cases/fetch-items-and-components.server';

import { ActionData, LoaderData } from '../../types';

import { theme } from './theme';
import { useColumns } from './use-columns';
import { getItemsComponents } from './get-items-components';

type UseDataGridProps = {
    actionData: ActionData;
    loaderData: LoaderData;
};

export const useDataGrid = ({ actionData, loaderData }: UseDataGridProps) => {
    const { items, components } = getItemsComponents({ actionData, loaderData });
    const itemsRef = useRef<ListItem[] | undefined>(undefined);
    const [changedColumns, setChangedColumns] = useState<Map<string, Set<number>>>(new Map());
    const [gridSelection, setGridSelection] = useState<GridSelection>();
    const { columns, getCellContent, onColumnResize } = useColumns({ items: itemsRef.current, components });

    useEffect(() => {
        if (items) {
            itemsRef.current = structuredClone(items);
            setChangedColumns(new Map());
        }
    }, [items]);

    const onCellEdited = useCallback(
        ([col, row]: Item, val: GridCell) => {
            const column = columns[col];
            const itemId = itemsRef.current?.[row].id;
            const componentId = column.id;
            const component = itemsRef.current?.[row].components.find((c) => c.componentId === componentId);

            if (!component || !itemId) {
                return;
            }

            const content = component.content;

            if (component.type === 'singleLine' && 'text' in content) {
                content.text = (val as TextCell).data;
            } else if (component.type === 'richText' && 'plainText' in content) {
                content.plainText = [(val as TextCell).data];
            } else if (component.type === 'boolean' && 'value' in content) {
                content.value = !!(val as BooleanCell).data;
            } else if (component.type === 'numeric' && 'number' in content) {
                content.number = (val as NumberCell).data as number;
            }

            // Check if value is different than initial
            const initialComponent = items?.[row].components.find((c) => c.componentId === componentId);

            if (JSON.stringify(component) !== JSON.stringify(initialComponent)) {
                setChangedColumns((prev) => new Map(prev.set(itemId, (prev.get(itemId) ?? new Set()).add(col))));
            } else {
                setChangedColumns((prev) => {
                    const nextCols = prev.get(itemId);
                    if (!nextCols) {
                        return prev;
                    }
                    nextCols.delete(col);
                    return new Map(prev.set(itemId, nextCols));
                });
            }
        },
        [columns, items],
    );

    const highlightRegions = useMemo(
        () =>
            [...changedColumns.keys()].flatMap((itemId) =>
                [...(changedColumns.get(itemId)?.values() ?? [])].map((col) => {
                    const row = (itemsRef.current ?? []).findIndex((item) => item.id === itemId);
                    return { color: '#ffde9933', range: { x: col, y: row, width: 1, height: 1 } };
                }),
            ),
        [changedColumns],
    );

    // @ts-expect-error rows items is available but TS allows only access in class
    const selectedRowsItem = gridSelection?.rows.items;

    const onRemoveSelected = useCallback(() => {
        const removedIds = selectedRowsItem.flatMap(([startIndex, endIndex]: [number, number]) =>
            Array(endIndex - startIndex)
                .fill(0)
                .map((_, index) => itemsRef.current?.[startIndex + index].id),
        ) as string[];

        itemsRef.current = itemsRef.current?.filter((item) => !removedIds.includes(item.id));

        setChangedColumns((prev) => {
            const copy = new Map(prev);
            removedIds.forEach((itemId) => copy.delete(itemId));
            return copy;
        });

        setGridSelection(undefined);
    }, [selectedRowsItem]);

    const getChangedComponents = useCallback(() => {
        const formData = new FormData();

        changedColumns.forEach((columnsSet, itemId) => {
            columnsSet.forEach((col) => {
                const componentId = columns[col].id;
                const component = itemsRef.current
                    ?.find((item) => item.id === itemId)
                    ?.components.find((component) => component.componentId === componentId);

                if (component) {
                    formData.append(`item[${itemId}][${componentId}]`, JSON.stringify(component));
                }
            });
        });

        return formData;
    }, [changedColumns, columns]);

    return {
        theme,
        columns,
        getCellContent,
        onCellEdited,
        onColumnResize,
        highlightRegions,
        gridSelection,
        setGridSelection,
        onRemoveSelected,
        getChangedComponents,
        itemsLength: itemsRef.current?.length,
        isRemoveDisabled: !selectedRowsItem?.length,
    };
};
