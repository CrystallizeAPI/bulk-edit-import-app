import { z } from 'zod';

const BaseComponentSchema = z.object({
    componentId: z.string(),
});
type BaseComponent = z.infer<typeof BaseComponentSchema>;

export const NonStructuaralComponentSchema = BaseComponentSchema.and(
    z.union([
        z.object({
            type: z.literal('richText'),
            content: z.object({
                json: z.array(z.any()),
                html: z.array(z.string()),
                plainText: z.array(z.string()),
            }),
        }),
        z.object({
            type: z.literal('singleLine'),
            content: z.object({
                text: z.string(),
            }),
        }),
        z.object({
            type: z.literal('numeric'),
            content: z.object({
                number: z.number(),
            }),
        }),
        z.object({
            type: z.literal('boolean'),
            content: z.object({
                value: z.boolean(),
            }),
        }),
    ]),
);
export type NonStructuaralComponent = z.infer<typeof NonStructuaralComponentSchema>;

export type StructuralComponent =
    | ({
          type: 'contentChunk';
          content: {
              chunks: Component[][];
          };
      } & BaseComponent)
    | ({
          type: 'piece';
          content: {
              components: Component[];
          };
      } & BaseComponent)
    | ({
          type: 'componentChoice';
          content: {
              selectedComponent: Component;
          };
      } & BaseComponent);

export type Component = NonStructuaralComponent | StructuralComponent;
