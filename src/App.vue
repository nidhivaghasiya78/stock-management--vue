<template>
    <div class="d-flex flex-column min-vh-100">
        <header class="bg-primary text-white p-3">
            <div class="container d-flex justify-content-between align-items-center">
                <div class="h4 mb-0">Stock Management</div>

                <div class="d-flex align-items-center gap-3">
                    <template v-if="isAuthenticated">
                        <span class="me-3">Hello, {{ userName }}</span>
                        <button @click="logout" class="btn btn-light btn-sm">Logout</button>
                    </template>
                    <template v-else>
                        <router-link to="/login" class="btn btn-light btn-sm">Login</router-link>
                    </template>
                </div>
            </div>
        </header>

        <nav v-if="isAuthenticated" class="bg-light py-2">
            <div class="container d-flex gap-2">
                <router-link
                    to="/branches"
                    class="btn btn-outline-primary"
                    :class="{ active: $route.path === '/branches' }"
                >
                    Branches
                </router-link>
                <router-link
                    to="/stock-list"
                    class="btn btn-outline-primary"
                    :class="{ active: $route.path === '/stock-list' }"
                >
                    Stock List
                </router-link>

                <router-link
                    to="/bulk-stock"
                    class="btn btn-outline-primary"
                    :class="{ active: $route.path === '/bulk-stock' }"
                >
                    Bulk Stock
                </router-link>
            </div>
        </nav>

        <div class="toast-container position-fixed top-0 end-0 p-3" style="z-index: 1100;">
            <div
                v-for="(toast, index) in toasts"
                :key="index"
                class="toast align-items-center text-white border-0 show mb-2"
                :class="toast.type === 'success' ? 'bg-success' : 'bg-danger'"
                role="alert"
            >
                <div class="d-flex">
                    <div class="toast-body">
                        {{ toast.message }}
                    </div>
                    <button
                        type="button"
                        class="btn-close btn-close-white me-2 m-auto"
                        @click="removeToast(index)"
                    ></button>
                </div>
            </div>
        </div>

        <main class="flex-fill p-3 bg-light">
            <router-view />
        </main>

        <footer class="bg-primary text-white p-3 text-center mt-auto">
            &copy; 2025 Stock Management. All rights reserved.
        </footer>
    </div>
</template>

<script>
import { computed } from "vue";
import { useStore } from "vuex";
import { useRouter } from "vue-router";

export default {
    setup() {
        const store = useStore();
        const router = useRouter();

        const isAuthenticated = computed(() => store.getters.isAuthenticated);
        const userName = computed(() => store.getters.userName);
        const toasts = computed(() => store.state.toasts);

        const removeToast = (index) => {
            store.commit("removeToast", index);
        };

        const logout = async () => {
            try {
                await store.dispatch("logout");
                router.push("/login");
                store.commit("showToast", { message: "Logged out successfully!", type: "success" });
            } catch (e) {
                store.commit("showToast", { message: "Logout failed!", type: "error" });
            }
        };

        return {
            isAuthenticated,
            userName,
            logout,
            toasts,
            removeToast,
        };
    },
};
</script>
