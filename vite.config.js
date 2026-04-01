import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(() => {
    return {
        server: {
            host: true,
            port: 5173,
            watch: {
                usePolling: true,
            },
        },
        build: {
            outDir: 'build',
        },
        plugins: [react()],
    };
});