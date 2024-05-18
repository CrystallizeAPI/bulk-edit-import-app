type NumericalViewProps = {
    number: number;
};

export const NumericalView = ({ number }: NumericalViewProps) => {
    return <div className="NumericalView">{number}</div>;
};
