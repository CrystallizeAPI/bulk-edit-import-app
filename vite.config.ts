import { vitePlugin as remix } from '@remix-run/dev';
import { installGlobals } from '@remix-run/node';
import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

installGlobals();

export default defineConfig({
    server: {
        port: 3080,
    },
    plugins: [
        remix({
            appDirectory: 'src',
        }),
        tsconfigPaths(),
        {
            name: 'crystallize-certification',
            handleHotUpdate() {
                //@ts-expect-error -- this is a global variable
                global.__services = null;
            },
        },
    ],
});
