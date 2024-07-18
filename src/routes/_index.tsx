import { ActionFunctionArgs, LoaderFunctionArgs, json } from '@remix-run/node';
import { Form, useActionData, useLoaderData, useNavigation } from '@remix-run/react';
import { useEffect, useState } from 'react';
import Select from 'react-select';
import { useEventSource } from 'remix-utils/sse/react';
import { nestedComponentSeparator } from '~/domain/contracts/allowed-component-types';
import { retrieveFilterListForFrontend } from '~/domain/use-cases/retrieve-filter-list-for-frontend.server';
import { indexPageAction } from '~/infrastructure/actions/index-page-action.server';
import { buildServices } from '~/infrastructure/core/services.server';
import { CrystallizeAPI } from '~/infrastructure/crystallize/create-crystallize-api.server';
import { ShapeComponentRenderer } from '~/ui/styles/components/shape-component-renderer';

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
    const importId =
        actionData && 'results' in actionData && 'importId' in actionData.results
            ? actionData.results.importId
            : undefined;
    const itemCount =
        actionData && 'results' in actionData && 'itemCount' in actionData.results
            ? actionData.results.itemCount
            : undefined;
    const data = useEventSource(`/api/import/stream/${importId}`, { event: 'log' });
    const [importState, setImportState] = useState<{
        started: boolean;
        ended: boolean;
        logs: { event: string; message: string }[];
    }>({ started: false, ended: false, logs: [] });

    const isImportRunning = importId && importState.ended === false;
    useEffect(() => {
        if (data) {
            const decoded = JSON.parse(data);
            if (decoded.event === 'started') {
                setImportState((prev) => ({ ...prev, started: true, ended: false, logs: [] }));
                return;
            }
            if (decoded.event === 'ended') {
                setImportState((prev) => ({ ...prev, started: false, ended: true, logs: [] }));
                return;
            }
            setImportState((prev) => ({ ...prev, started: false, ended: false, logs: [...prev.logs, decoded] }));
        }
    }, [data]);

    return (
        <div className="p-4">
            <h1 className="text-4xl">Batch Edit</h1>
            <FormFilters />
            <ItemListForm />
            {isImportRunning && (
                <div className="">
                    <h2 className="text-xl">
                        An Import has just started.... ({importState.logs.length} / {itemCount})
                    </h2>
                    <div className="flex flex-col-reverse">
                        <div className="flex flex-col gap-2">
                            {importState.logs.map((log, i) => {
                                return (
                                    <div key={i} className="flex items-start gap-4">
                                        <span className="text-xs">
                                            {i + 1} - {log.message}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}
            {importState.ended && <div className="">Done!</div>}
        </div>
    );
}

const ItemListForm = () => {
    const { filterList } = useLoaderData<typeof loader>();
    const actionData = useActionData<typeof action>();
    const items =
        actionData && 'results' in actionData && 'items' in actionData.results ? actionData.results.items : [];

    if (!actionData || !actionData.success) {
        return null;
    }
    const shape = 'shape' in actionData.values ? actionData.values.shape : undefined;

    const selectedComponents = ('components' in actionData.values ? actionData.values.components : []) as string[][];
    if (!shape) {
        return null;
    }

    const components = filterList.componentsMap[shape as keyof typeof filterList.componentsMap].filter((component) =>
        selectedComponents.map((c) => c.join(nestedComponentSeparator)).includes(component.value),
    );

    return (
        <div>
            <h2>Items</h2>
            <Form method="post">
                <table className="auto">
                    <thead>
                        <tr>
                            <th>Name</th>
                            {components.map((component) => (
                                <th key={component.value}>{component.label}</th>
                            ))}
                            <th>Remove</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map((item) => (
                            <tr key={item.id} id={item.id}>
                                <td>
                                    {item.name}
                                    <br />
                                    <small>{item.tree.path}</small>
                                </td>
                                {components.map((component) => {
                                    const componentIds = component.value.split(nestedComponentSeparator);
                                    const itemComponent = item[componentIds[0]];
                                    return (
                                        <td key={item.id + component.value}>
                                            <ShapeComponentRenderer
                                                nestedPath={componentIds.slice(1)}
                                                component={itemComponent}
                                                itemId={item.id}
                                            />
                                        </td>
                                    );
                                })}
                                <td className="text-center">
                                    <button type="button">x</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot>
                        <tr>
                            <td colSpan={components.length + 2} className="flex justify-center text-center">
                                <button type="submit" name="_action" value="saveItems">
                                    Save
                                </button>
                            </td>
                        </tr>
                    </tfoot>
                </table>
            </Form>
        </div>
    );
};

const FormFilters = () => {
    const { filterList } = useLoaderData<typeof loader>();
    const navigation = useNavigation();
    const [shapeIdentifier, setShapeIdentifier] = useState<string | undefined>(undefined);
    const actionData = useActionData<typeof action>();
    const errorFor = (field: string) => {
        if (!actionData || actionData.success === true || !actionData.errors) {
            return null;
        }
        const errors = Object.keys(actionData.errors).reduce((memo: string[], key) => {
            const main = key.split('.')[0];
            if (main === field) {
                memo.push(actionData.errors?.[key as keyof typeof actionData.errors]);
            }
            return memo;
        }, []);

        if (errors.length === 0) {
            return null;
        }
        if (errors.length === 1) {
            return <div className="text-red-500 text-sm">{errors[0]}</div>;
        }

        return (
            <ul>
                {errors.map((error, index) => (
                    <li key={index} className="text-red-500 text-sm">
                        {error}
                    </li>
                ))}
            </ul>
        );
    };
    return (
        <Form method="post">
            <div className="flex gap-2 justify-center ">
                <div className="grow">
                    <Select
                        name="language"
                        options={filterList.languages}
                        defaultValue={filterList.languages[0]}
                        isMulti={false}
                    />
                    {errorFor('language')}
                </div>
                <div className="grow">
                    <Select
                        className="grow"
                        name="shape"
                        isMulti={false}
                        options={filterList.shapes}
                        onChange={(selected: { value: string } | null) => {
                            setShapeIdentifier(selected?.value);
                        }}
                    />
                    {errorFor('shape')}
                </div>
                <div className="grow">
                    <Select className="grow" name="folders" isMulti={true} options={filterList.folders} />
                    {errorFor('folders')}
                </div>
                <div className="grow">
                    <Select className="grow" name="topics" isMulti={true} options={filterList.topics} />
                    {errorFor('topics')}
                </div>
                <div className="grow">
                    <Select
                        className="grow"
                        name="components"
                        isMulti={true}
                        isDisabled={!shapeIdentifier}
                        options={shapeIdentifier ? filterList.componentsMap[shapeIdentifier] : []}
                    />
                    {errorFor('components')}
                </div>
                <button type="submit" name="_action" value="fetchItems" disabled={navigation.state !== 'idle'}>
                    {navigation.state === 'submitting' ? 'Fetching items...' : 'Get Items'}
                </button>
            </div>
        </Form>
    );
};
