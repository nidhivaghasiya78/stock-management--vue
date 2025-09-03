import { createRouter, createWebHistory } from 'vue-router';
import store from '../store';

import LoginPage from '../components/LoginPage.vue';
import RegisterPage from '../components/RegisterPage.vue';
import StockList from '../components/StockList.vue';
import BulkStockEntry from '../components/BulkStockEntry.vue';
import BranchManager from '../components/BranchManager.vue';

const routes = [
    { path: '/', redirect: '/login' },

    { path: '/login', name: 'Login', component: LoginPage },
    { path: '/register', name: 'Register', component: RegisterPage },

    {
        path: '/stock-list',
        name: 'StockList',
        component: StockList,
        meta: { requiresAuth: true },
    },
    {
        path: '/bulk-stock',
        name: 'BulkStockEntry',
        component: BulkStockEntry,
        meta: { requiresAuth: true },
    },
    {
        path: '/branches',
        name: 'BranchManager',
        component: BranchManager,
        meta: { requiresAuth: true },
    },
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

// Auth Guard
router.beforeEach((to, from, next) => {
    if (to.meta.requiresAuth && !store.getters.isAuthenticated) {
        next('/login');
    } else {
        next();
    }
});

export default router;
