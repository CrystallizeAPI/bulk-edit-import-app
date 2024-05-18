type BooleanViewProps = {
    value: boolean;
};

export const BooleanView = ({ value }: BooleanViewProps) => {
    return <div className="BooleanView">{value === true ? 'TRUE' : 'FALSE'} </div>;
};
