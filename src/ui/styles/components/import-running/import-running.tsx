import { useEffect, useState } from 'react';
import { useEventSource } from 'remix-utils/sse/react';
import { ActionData } from '../../types';

type ImportRunningProps = {
    actionData?: ActionData;
};

export const ImportRunning = ({ actionData }: ImportRunningProps) => {
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
        <>
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
        </>
    );
};
