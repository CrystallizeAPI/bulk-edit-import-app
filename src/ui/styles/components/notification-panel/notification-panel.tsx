import { Card } from '@crystallize/design-system';
import { useImportStatus } from '../../hooks/use-import-status';
import { ActionData, LoaderData } from '../../types';
import { getItemsComponents } from '../../utils/get-items-components';

type ImportRunningProps = {
    hasShape: boolean;
    actionData: ActionData;
    loaderData: LoaderData;
};

export const NotificationPanel = ({ hasShape, actionData, loaderData }: ImportRunningProps) => {
    const { isImportRunning, importingItemsCount, currentItemsCount, hasEnded } = useImportStatus(actionData);
    const { items } = getItemsComponents({ actionData, loaderData });
    const showSuccess = hasEnded && !hasShape;

    console.log(hasShape);

    const notifications: [boolean, { title: string; message?: string }][] = [
        [
            !!hasShape && items?.length === 0,
            {
                title: 'No items found with given criteria',
                message: 'Try to change the criteria or narrow down the selection',
            },
        ],
        [
            isImportRunning,
            {
                title: 'An import has just started...',
                message: `Import status (${currentItemsCount} / ${importingItemsCount})`,
            },
        ],
        [
            showSuccess,
            {
                title: 'Items saved to draft',
                message: 'Changes requires to be published before they are visible in any channel',
            },
        ],
        [showSuccess, { title: 'Items saved and published', message: 'Changes are now available to all channels' }],
        [
            false,
            {
                title: 'File could not be imported',
                message:
                    'Only files exported from the app can be imported. If headings or structural parts of the file has been altered it might not be importable',
            },
        ],
    ];

    const notification = notifications.find((notification) => notification[0])?.[1];

    if (!notification) {
        return null;
    }

    return (
        <Card variant="elevate">
            <h3 className="text-gray-600 font-medium text-lg">{notification.title}</h3>
            {!!notification.message && <p className="text-gray-600 text-sm">{notification.message}</p>}
        </Card>
    );
};
