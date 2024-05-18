import { ContentTransformer } from '@crystallize/reactjs-components';

type RichTextViewProps = {
    //eslint-disable-next-line -- This is a JSON object
    json: any[];
};

export const RichTextView = ({ json }: RichTextViewProps) => {
    return (
        <div className="RichTextView">
            <ContentTransformer json={json} />
        </div>
    );
};
