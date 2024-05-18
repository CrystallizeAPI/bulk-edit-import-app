import { Links, Meta, MetaFunction, Outlet, Scripts, ScrollRestoration } from '@remix-run/react';
import '~/ui/styles/app.css';

export const meta: MetaFunction = () => [
    {
        charset: 'utf-8',
        title: 'Bulk Edit Import App | Crystallize ',
        viewport: 'width=device-width,initial-scale=1',
    },
];

export function Layout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
            <head>
                <meta charSet="utf-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <Meta />
                <Links />
            </head>
            <body>
                {children}
                <ScrollRestoration />
                <Scripts />
            </body>
        </html>
    );
}

export default function App() {
    return <Outlet />;
}
