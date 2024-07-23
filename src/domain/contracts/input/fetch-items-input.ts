import { z } from 'zod';

export const FetchItemsInputSchema = z.object({
    language: z.string().min(1),
    shape: z.string().min(1),
    folders: z.array(z.string().min(1)).min(1),
    topics: z.array(z.string().min(1)),
    components: z.array(z.string().min(1)).min(1),
});
export type FetchItemsInput = z.infer<typeof FetchItemsInputSchema>;
