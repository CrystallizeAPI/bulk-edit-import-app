type SingleLineViewProps = {
    text: string;
};

export const SingleLineView = ({ text }: SingleLineViewProps) => {
    return <div className="SingleLineView">{text}</div>;
};
