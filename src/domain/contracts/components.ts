type BaseComponent = {
    componentId: string;
};

export type NonStructuaralComponent =
    | ({
          type: 'richText';
          content: {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any -- This is a JSON object
              json: any[];
              html: string[];
              plainText: string[];
          };
      } & BaseComponent)
    | ({
          type: 'singleLine';
          content: {
              text: string;
          };
      } & BaseComponent)
    | ({
          type: 'numeric';
          content: {
              number: number;
          };
      } & BaseComponent)
    | ({
          type: 'boolean';
          content: {
              value: boolean;
          };
      } & BaseComponent);

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
