import type { Config } from 'tailwindcss';

export default {
    darkMode: ['class'],
    content: ['./src/**/*.{ts,tsx}'],
    theme: {
        extend: {
            colors: {
                purple: '#332C51',
                'purple-light': '#D8D5E2',
                gold: '#FFBF00',
                text: {
                    green: '#3B5863',
                },
                button: {
                    primary: '#CDF7F6',
                },
            },
        },
    },
    plugins: [require('@tailwindcss/forms'), require('@tailwindcss/typography')],
} satisfies Config;
