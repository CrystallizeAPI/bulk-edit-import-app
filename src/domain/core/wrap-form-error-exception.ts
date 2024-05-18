import type { Schema, ZodTypeDef } from 'zod';
import { z } from 'zod';

type Response<R, V> =
    | { success: true; results: R; values: V; errors?: never }
    | { success: false; errors: Record<string, string>; values: V; results?: never };

export const executeForm = async <R, V, I>(
    action: (values: V) => Promise<R>,
    values: I,
    schema: Schema<V, ZodTypeDef, I>,
): Promise<Response<R, I>> => {
    try {
        const safeValues = schema.parse(values);
        const results = await action(safeValues);
        return {
            success: true,
            values,
            results,
        };
        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Generic error handling
    } catch (exception: any) {
        if (exception instanceof z.ZodError || exception.errors) {
            const prefix = exception instanceof z.ZodError ? '' : 'global.';
            return {
                success: false,
                errors: exception.errors.reduce(
                    (memo: Record<string, string>, error: { path: string[]; message: string }) => {
                        return { ...memo, [prefix + error.path.join('.')]: error.message };
                    },
                    {},
                ),
                values,
            };
        }
        console.error(exception);
        return {
            success: false,
            errors: {
                'global.message': exception.message,
            },
            values,
        };
    }
};
