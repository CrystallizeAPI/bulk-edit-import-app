import {
    GridColumn,
    Item,
    GridCell,
    GridCellKind,
    TextCell,
    GridSelection,
    BooleanCell,
} from '@glideapps/glide-data-grid';
import { useCallback, useMemo, useState, useEffect, useRef } from 'react';
import { Component } from '~/domain/contracts/components';

import { SelectOption } from '~/domain/contracts/select-option';
import { InnerNode } from '~/infrastructure/crystallize/fetch-descendants.server';

const theme = {
    baseFontStyle: '0.8125rem',
    headerFontStyle: '600 0.8125rem',
    editorFontSize: '0.8125rem',
    accentColor: '#FEA9FA',
    accentLight: '#FFF4FF',
    textDark: '#4C4F5A',
    textBubble: '#403953',
    bgBubble: '#EEECF2',
    bgCell: '#ffffff',
    bgHeader: '#F7F6F9',
    bgBubbleSelected: '#d8d5e288',
    borderBubble: '#d8d5e2',
    textHeader: '#626778',
    textHeaderSelected: '#921684',
    bgHeaderHasFocus: '#FFE7FF',
    borderColor: '#e4e5e9',
};

type UseDataGridProps = {
    items: InnerNode[];
    components: SelectOption[];
};

export const useDataGrid = ({ items, components }: UseDataGridProps) => {
    const itemsRef = useRef<InnerNode[]>([]);
    const [changedColumns, setChangedColumns] = useState<Map<string, Set<number>>>(new Map());
    const [colsWidthMap, setColsWidthMap] = useState<Map<string, number>>(new Map());
    const [gridSelection, setGridSelection] = useState<GridSelection>();

    useEffect(() => {
        itemsRef.current = structuredClone(items);
        setChangedColumns(new Map());
    }, [items]);

    const onColumnResize = useCallback((col: { id?: string }, newSize: number) => {
        const id = col.id;
        !!id && setColsWidthMap((prev) => new Map(prev.set(id, newSize)));
    }, []);

    const columns: GridColumn[] = useMemo(() => {
        return [
            {
                title: 'Name',
                id: 'name',
                width: 240,
            },
            ...components.map(({ value, label }) => ({
                title: `${label[0].toUpperCase()}${label.slice(1)}`,
                id: `component-${value}`,
                width: 240,
            })),
        ].map((column) => {
            const width = colsWidthMap.get(column.id);
            return { ...column, ...(typeof width === 'number' && { width }) };
        });
    }, [components, colsWidthMap]);

    const getCellContent = useCallback(
        ([col, row]: Item): GridCell => {
            const item = itemsRef.current?.[row];
            const column = columns[col];
            const columnId = column.id;

            if (!item || !columnId) {
                throw new Error();
            }

            if (columnId === 'name') {
                return {
                    kind: GridCellKind.Text,
                    data: item.name,
                    displayData: item.name,
                    allowOverlay: false,
                };
            }

            const componentId = columnId.split('component-')[1];
            const component = item[componentId] as Component | null;

            if (component?.type === 'singleLine') {
                const data = component.content.text ?? '';
                return {
                    kind: GridCellKind.Text,
                    data,
                    displayData: data,
                    allowOverlay: true,
                };
            }

            if (component?.type === 'richText') {
                const text = component.content.plainText;
                const data = (Array.isArray(text) ? text.join('/n') : text) ?? '';
                return {
                    kind: GridCellKind.Text,
                    data,
                    displayData: data,
                    allowOverlay: true,
                    allowWrapping: true,
                };
            }

            if (component?.type === 'boolean') {
                const isChecked = component.content.value;
                return {
                    kind: GridCellKind.Boolean,
                    data: isChecked,
                    allowOverlay: false,
                };
            }

            return {
                kind: GridCellKind.Text,
                data: '',
                displayData: '',
                allowOverlay: true,
            };
        },
        [columns],
    );

    const onCellEdited = useCallback(
        ([col, row]: Item, val: GridCell) => {
            const column = columns[col];
            const componentId = column.id?.split('component-')[1] ?? '';
            const component = itemsRef.current?.[row][componentId];
            const itemId = itemsRef.current?.[row].id;

            if (!component) {
                return;
            }

            if (component.type === 'singleLine') {
                component.content.text = (val as TextCell).data;
            } else if (component.type === 'richText') {
                component.content.plainText = [(val as TextCell).data];
            } else if (component.type === 'boolean') {
                component.content.value = !!(val as BooleanCell).data;
            }

            // Check if value is different than initial
            const initialComponent = items[row][componentId];
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
                    const row = itemsRef.current.findIndex((item) => item.id === itemId);
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
                .map((_, index) => itemsRef.current[startIndex + index].id),
        ) as string[];

        itemsRef.current = itemsRef.current.filter((item) => !removedIds.includes(item.id));

        setChangedColumns((prev) => {
            const copy = new Map(prev);
            removedIds.forEach((itemId) => copy.delete(itemId));
            return copy;
        });

        setGridSelection(undefined);
    }, [selectedRowsItem]);

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
        itemsLength: itemsRef.current.length,
        isRemoveDisabled: !selectedRowsItem?.length,
    };
};
