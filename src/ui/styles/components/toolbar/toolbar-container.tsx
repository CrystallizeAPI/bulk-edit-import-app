type ToolbarContainerProps<T extends React.ElementType> = Omit<React.ComponentPropsWithRef<T>, 'className'> & {
    wrapperAs?: T;
};

export function ToolbarContainer<T extends React.ElementType = React.ElementType>({
    wrapperAs,
    ...delegated
}: ToolbarContainerProps<T>) {
    const Wrapper = wrapperAs ?? 'div';

    return (
        <div className="sticky top-0 z-[100] grid shrink-0">
            <Wrapper
                {...delegated}
                className="relative flex flex-wrap items-center gap-x-2 rounded-b-md bg-white pr-4 shadow"
            />
        </div>
    );
}
