import ReactSelect, { defaultTheme } from 'react-select';

export const Select = (props: React.ComponentProps<typeof ReactSelect>) => {
    return (
        <ReactSelect
            {...props}
            theme={{
                ...defaultTheme,
                spacing: { ...defaultTheme.spacing, menuGutter: 6 },
                colors: {
                    ...defaultTheme.colors,
                    primary: '#a9aeb7',
                    primary75: '#393a40',
                    primary50: '#e4e5e9',
                    primary25: '#f5f5f6',
                    danger: '#eb1782',
                    dangerLight: 'rgba(235, 23, 130, 0.1)',
                },
            }}
        />
    );
};
