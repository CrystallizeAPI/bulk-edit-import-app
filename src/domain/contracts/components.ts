type BaseComponent = {
    componentId: string;
};

export type Component =
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
          type: 'numerical';
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
