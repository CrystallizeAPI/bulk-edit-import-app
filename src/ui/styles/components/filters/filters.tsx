import { Select } from '../select';
import { Button } from '@crystallize/design-system';
import { useNavigation } from '@remix-run/react';
import { ActionData, LoaderData } from '../../types';
import { SelectOption } from '~/domain/contracts/select-option';

type FiltersFormProps = {
    actionData: ActionData;
    loaderData: LoaderData;
    shapeOption?: SelectOption;
    onShapeOptionChange: (shapeOption?: SelectOption) => void;
    languageOption?: SelectOption;
    onLanguageOptionChange: (languageOption: SelectOption) => void;
};

export const Filters = ({
    shapeOption,
    onShapeOptionChange,
    languageOption,
    onLanguageOptionChange,
    actionData,
    loaderData,
}: FiltersFormProps) => {
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
                    defaultValue={languageOption}
                    isMulti={false}
                    onChange={(selected) => onLanguageOptionChange(selected as SelectOption)}
                />
                {errorFor('language')}
            </div>
            <div className="grow">
                <Select
                    className="grow"
                    name="shape"
                    isMulti={false}
                    options={filterList.shapes}
                    onChange={(selected) => onShapeOptionChange(selected as SelectOption)}
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
                    isDisabled={!shapeOption}
                    options={shapeOption ? filterList.componentsMap[shapeOption.value] : []}
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
