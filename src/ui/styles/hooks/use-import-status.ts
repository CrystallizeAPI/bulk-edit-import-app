import { useEffect, useState } from 'react';
import { useEventSource } from 'remix-utils/sse/react';
import { ActionData } from '../types';

export const useImportStatus = (actionData: ActionData) => {
    const importId =
        actionData && 'results' in actionData && 'importId' in actionData.results
            ? actionData.results.importId
            : undefined;
    const importingItemsCount =
        actionData && 'results' in actionData && 'itemCount' in actionData.results
            ? actionData.results.itemCount
            : undefined;
    const data = useEventSource(`/api/import/stream/${importId}`, { event: 'log' });

    const [importState, setImportState] = useState<{
        started: boolean;
        ended: boolean;
        logs: { event: string; message: string }[];
    }>({ started: false, ended: false, logs: [] });

    const isImportRunning = importId ? importState.ended === false : false;

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

    return {
        isImportRunning,
        importingItemsCount,
        currentItemsCount: importState.logs.length,
        importId,
        hasEnded: importState.ended,
    };
};
