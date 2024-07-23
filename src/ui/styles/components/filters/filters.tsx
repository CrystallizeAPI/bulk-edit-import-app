import { Select } from '../select';
import { Button } from '@crystallize/design-system';
import { useNavigation } from '@remix-run/react';
import { ActionData, LoaderData } from '../../types';

type FiltersFormProps = {
    shapeIdentifier?: string;
    onShapeChange: (shapeIdentifier?: string) => void;
    actionData: ActionData;
    loaderData: LoaderData;
};

export const Filters = ({ shapeIdentifier, onShapeChange, actionData, loaderData }: FiltersFormProps) => {
    const { filterList } = loaderData;
    const navigation = useNavigation();
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
        <div className="flex gap-2 justify-center my-4">
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
                    onChange={(selected) => onShapeChange((selected as { value: string } | null)?.value)}
                />
                {errorFor('shape')}
            </div>
            <div className="grow">
                <Select className="grow" name="folders" isMulti options={filterList.folders} />
                {errorFor('folders')}
            </div>
            <div className="grow">
                <Select className="grow" name="topics" isMulti options={filterList.topics} />
                {errorFor('topics')}
            </div>
            <div className="grow">
                <Select
                    className="grow"
                    name="components"
                    isMulti
                    isDisabled={!shapeIdentifier}
                    options={shapeIdentifier ? filterList.componentsMap[shapeIdentifier] : []}
                />
                {errorFor('components')}
            </div>
            <Button
                type="submit"
                name="_action"
                value="fetchItems"
                variant="elevate"
                disabled={navigation.state !== 'idle'}
                status={navigation.state === 'submitting' ? 'loading' : undefined}
            >
                Get items
            </Button>
        </div>
    );
};
