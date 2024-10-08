import { Item as ListItem } from '~/domain/contracts/item-list';
import { ActionData, LoaderData } from '../types';

type GetItemsComponentsProps = {
    actionData: ActionData;
    loaderData: LoaderData;
};

export const getItemsComponents = ({ actionData, loaderData }: GetItemsComponentsProps) => {
    const { filterList } = loaderData;
    const items = (
        actionData && 'results' in actionData && 'items' in actionData.results ? actionData.results.items : undefined
    ) as ListItem[] | undefined;

    const shape = !!actionData && 'shape' in actionData.values ? actionData.values.shape : undefined;

    const selectedComponents = (!!actionData && 'components' in actionData.values && actionData.values.components) as
        | string[]
        | undefined;

    const components = filterList.componentsMap[shape as keyof typeof filterList.componentsMap]?.filter((component) =>
        selectedComponents?.includes(component.value),
    );

    const changes =
        actionData && 'results' in actionData && 'changes' in actionData.results
            ? actionData.results.changes
            : undefined;

    return { items, components, changes };
};
