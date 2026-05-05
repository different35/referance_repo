import { createRouter, createWebHistory } from 'vue-router';
const routes = [
    {
        path: '/',
        redirect: '/dashboard',
    },
    {
        path: '/login',
        name: 'login',
        component: () => import('../pages/Login.vue'),
        meta: { layout: 'auth', public: true },
    },
    {
        path: '/dashboard',
        name: 'dashboard',
        component: () => import('../pages/Dashboard.vue'),
        meta: { layout: 'app' },
    },
];
export const router = createRouter({
    history: createWebHistory(),
    routes,
});
// Auth guard Phase 1'de eklenecek; Phase 0'da hepsi public.
//# sourceMappingURL=index.js.map