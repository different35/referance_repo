import { defineConfig, loadEnv } from 'vite';
import vue from '@vitejs/plugin-vue';
import { VitePWA } from 'vite-plugin-pwa';
import { fileURLToPath, URL } from 'node:url';
export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), '');
    const apiUrl = env.VITE_API_URL ?? 'http://localhost:3000';
    return {
        plugins: [
            vue(),
            VitePWA({
                registerType: 'autoUpdate',
                injectRegister: 'auto',
                includeAssets: ['favicon.svg', 'apple-touch-icon.png'],
                manifest: {
                    name: 'Swarm Panel',
                    short_name: 'Swarm',
                    description: 'Swarm Yönetim Paneli — faaliyet, reklam ve müşteri ziyareti yönetimi',
                    theme_color: '#0f172a',
                    background_color: '#0f172a',
                    display: 'standalone',
                    orientation: 'any',
                    start_url: '/',
                    scope: '/',
                    icons: [
                        {
                            src: '/icons/icon-192.png',
                            sizes: '192x192',
                            type: 'image/png',
                            purpose: 'any',
                        },
                        {
                            src: '/icons/icon-512.png',
                            sizes: '512x512',
                            type: 'image/png',
                            purpose: 'any',
                        },
                        {
                            src: '/icons/icon-maskable-512.png',
                            sizes: '512x512',
                            type: 'image/png',
                            purpose: 'maskable',
                        },
                    ],
                },
                workbox: {
                    globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
                    navigateFallback: '/index.html',
                    navigateFallbackDenylist: [/^\/api/, /^\/trpc/],
                    runtimeCaching: [
                        {
                            urlPattern: /\/api\/auth\/.*$/,
                            handler: 'NetworkOnly',
                        },
                        {
                            urlPattern: /\/trpc\/.*$/,
                            handler: 'NetworkFirst',
                            options: {
                                cacheName: 'trpc-cache',
                                networkTimeoutSeconds: 5,
                                expiration: {
                                    maxEntries: 50,
                                    maxAgeSeconds: 60 * 5,
                                },
                            },
                        },
                    ],
                },
                devOptions: {
                    enabled: false,
                },
            }),
        ],
        resolve: {
            alias: {
                '@': fileURLToPath(new URL('./src', import.meta.url)),
            },
        },
        server: {
            port: Number(env.WEB_PORT ?? 5173),
            host: true,
            proxy: {
                '/api': { target: apiUrl, changeOrigin: true, secure: false },
                '/trpc': { target: apiUrl, changeOrigin: true, secure: false, ws: true },
            },
        },
        preview: {
            port: 4173,
            host: true,
        },
        build: {
            target: 'es2022',
            sourcemap: true,
        },
    };
});
//# sourceMappingURL=vite.config.js.map