import { ActionFunctionArgs, LoaderFunctionArgs, json } from '@remix-run/node';
import { Form, useActionData, useLoaderData } from '@remix-run/react';
import { retrieveFilterListForFrontend } from '~/domain/use-cases/retrieve-filter-list-for-frontend.server';
import { indexPageAction } from '~/infrastructure/actions/index-page-action.server';
import { buildServices } from '~/infrastructure/core/services.server';
import { CrystallizeAPI } from '~/infrastructure/crystallize/create-crystallize-api.server';
import { DataGrid } from '~/ui/styles/components/data-grid/data-grid';
import { Filters } from '~/ui/styles/components/filters';
import { ImportRunning } from '~/ui/styles/components/import-running';
import { Toolbar } from '~/ui/styles/components/toolbar';

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

    return (
        <Form method="post" className="flex flex-col h-screen overflow-hidden bg-[#f5f5f6] px-8">
            <DataGrid actionData={actionData} loaderData={loaderData}>
                {({ isRemoveDisabled, onRemoveSelected, hasChanges }) => {
                    const actions = [
                        {
                            key: 'remove-selected',
                            name: 'Remove selected',
                            className: 'danger',
                            disabled: isRemoveDisabled,
                            onSelect: onRemoveSelected,
                        },
                    ];

                    return (
                        <>
                            <Toolbar.Container>
                                <Toolbar.Input label="App" input={<input defaultValue="Batch edit" />} />
                                <Toolbar.Actions actions={actions} />
                                <Toolbar.Button disabled={!hasChanges} text="Save changes" />
                                <Toolbar.Button intent="action" disabled={!hasChanges} text="Save and publish" />
                            </Toolbar.Container>

                            <Filters actionData={actionData} loaderData={loaderData} />
                            <ImportRunning actionData={actionData} />
                        </>
                    );
                }}
            </DataGrid>
        </Form>
    );
}
