import { useEffect, useState } from 'react';
import { ActionFunctionArgs, LoaderFunctionArgs, json } from '@remix-run/node';
import { Form, useActionData, useLoaderData, useSubmit } from '@remix-run/react';
import { retrieveFilterListForFrontend } from '~/domain/use-cases/retrieve-filter-list-for-frontend.server';
import { indexPageAction } from '~/infrastructure/actions/index-page-action.server';
import { buildServices } from '~/infrastructure/core/services.server';
import { CrystallizeAPI } from '~/infrastructure/crystallize/create-crystallize-api.server';
import { DataGrid } from '~/ui/styles/components/data-grid/data-grid';
import { Filters } from '~/ui/styles/components/filters';
import { GridToolbar } from '~/ui/styles/components/grid-toolbar/grid-toolbar';
import { NotificationPanel } from '~/ui/styles/components/notification-panel';
import { useImportStatus } from '~/ui/styles/hooks/use-import-status';
import writeXlsxFile from 'write-excel-file';

export const loader = async ({ request }: LoaderFunctionArgs) => {
    const api = await CrystallizeAPI(request);
    const filterList = await retrieveFilterListForFrontend({ api });
    return json({ filterList });
};

export const action = async ({ request }: ActionFunctionArgs) => {
    const { emitter } = await buildServices();
    const formData = await request.formData();
    const api = await CrystallizeAPI(request);
    const results = await indexPageAction(formData, { api, emitter });
    return json(results);
};

export default function Index() {
    const actionData = useActionData<typeof action>();
    const loaderData = useLoaderData<typeof loader>();
    const [rerenderKey, setRerenderKey] = useState(0); // reset selected filters
    const [shapeIdentifier, setShapeIdentifier] = useState<string | undefined>(undefined);

    const { hasEnded } = useImportStatus(actionData);
    const submit = useSubmit();

    const onSubmit = (formData: FormData, action: 'saveItems' | 'savePublishItems') => {
        formData.append('_action', action);
        submit(formData, { method: 'post', encType: 'multipart/form-data' });
    };

    useEffect(() => {
        if (hasEnded) {
            setRerenderKey((prev) => prev + 1);
            setShapeIdentifier(undefined);
        }
    }, [hasEnded]);

    return (
        <Form method="post" className="flex flex-col h-screen overflow-hidden bg-[#f5f5f6] px-8">
            <DataGrid actionData={actionData} loaderData={loaderData}>
                {({ isRemoveDisabled, onRemoveSelected, hasChanges, getChangedComponents, items }) => {
                    return (
                        <>
                            <GridToolbar
                                isRemoveDisabled={isRemoveDisabled}
                                hasChanges={hasChanges}
                                onRemove={onRemoveSelected}
                                onSave={() => onSubmit(getChangedComponents(), 'saveItems')}
                                onSavePublish={() => onSubmit(getChangedComponents(), 'savePublishItems')}
                                onExport={async () => {
                                    //@todo: @Plopix extract that code somewhere to keep that Index clear
                                    const headers: string[] = (
                                        actionData && actionData.values && 'components' in actionData.values
                                            ? actionData.values.components || []
                                            : []
                                    ) as string[];
                                    const itemCells =
                                        items?.map((item) => {
                                            const cells = item.components.map((component) => {
                                                let value = '';
                                                const content = component.content;
                                                if (component.type === 'singleLine' && 'text' in content) {
                                                    value = content.text;
                                                } else if (component.type === 'richText' && 'plainText' in content) {
                                                    value = content.plainText.join('\n');
                                                } else if (component.type === 'boolean' && 'value' in content) {
                                                    value = content.value ? '1' : '0';
                                                } else if (component.type === 'numeric' && 'number' in content) {
                                                    value = content.number.toString();
                                                }
                                                return {
                                                    type: String,
                                                    value,
                                                };
                                            });
                                            return [
                                                {
                                                    type: String,
                                                    value: item.name,
                                                },
                                                ...cells,
                                            ];
                                        }) ?? [];

                                    await writeXlsxFile(
                                        [
                                            [
                                                {
                                                    type: String,
                                                    value: 'Name',
                                                },
                                                ...headers.map((head) => {
                                                    return {
                                                        type: String,
                                                        value: head,
                                                    };
                                                }),
                                            ],
                                            ...itemCells,
                                        ],
                                        {
                                            fileName: 'file.xlsx',
                                        },
                                    );
                                }}
                            />
                            <Filters
                                key={rerenderKey}
                                shapeIdentifier={shapeIdentifier}
                                onShapeChange={setShapeIdentifier}
                                actionData={actionData}
                                loaderData={loaderData}
                            />
                            <NotificationPanel
                                hasShape={!!shapeIdentifier}
                                actionData={actionData}
                                loaderData={loaderData}
                            />
                        </>
                    );
                }}
            </DataGrid>
        </Form>
    );
}
