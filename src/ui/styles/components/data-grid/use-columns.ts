import { useCallback, useMemo, useState } from 'react';
import { GridColumn, Item, GridCell, GridCellKind } from '@glideapps/glide-data-grid';
import { nestedComponentSeparator } from '~/domain/contracts/allowed-component-types';
import { SelectOption } from '~/domain/contracts/select-option';
import { Item as ListItem } from '~/domain/use-cases/fetch-items-and-components.server';

type UseColumnsProps = {
    components: SelectOption[];
    items?: ListItem[];
};

export const useColumns = ({ items, components }: UseColumnsProps) => {
    const [colsWidthMap, setColsWidthMap] = useState<Map<string, number>>(new Map());

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
            ...(components ?? []).map(({ value, label }) => ({
                title: `${label[0].toUpperCase()}${label.slice(1)}`,
                id: value,
                width: 240,
            })),
        ].map((column) => {
            const width = colsWidthMap.get(column.id);
            return { ...column, ...(typeof width === 'number' && { width }) };
        });
    }, [components, colsWidthMap]);

    const getCellContent = useCallback(
        ([col, row]: Item): GridCell => {
            const item = items?.[row];
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

            const componentPath = columnId.split(nestedComponentSeparator);
            const component = item.components.find(
                (c) => JSON.stringify(c.componentPath) === JSON.stringify(componentPath),
            );

            if (!component) {
                return {
                    kind: GridCellKind.Text,
                    data: '',
                    displayData: '',
                    allowOverlay: true,
                };
            }

            if (component.type === 'singleLine') {
                const data = 'text' in component.content ? component.content.text : '';
                return {
                    kind: GridCellKind.Text,
                    data,
                    displayData: data,
                    allowOverlay: true,
                };
            }

            if (component.type === 'numeric') {
                const data = 'number' in component.content ? component.content.number : undefined;
                return {
                    kind: GridCellKind.Number,
                    data,
                    displayData: data?.toString() ?? '',
                    allowOverlay: true,
                };
            }

            if (component.type === 'richText') {
                const text = 'plainText' in component.content ? `${component.content.plainText}` : '';
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
                const isChecked = 'value' in component.content ? component.content.value : false;
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
        [columns, items],
    );

    return { columns, getCellContent, onColumnResize };
};
