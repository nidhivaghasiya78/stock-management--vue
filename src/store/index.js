import { createStore } from 'vuex';
import axios from '../axios';

export default createStore({
    state: {
        token: localStorage.getItem('token') || null,
        user: JSON.parse(localStorage.getItem('user')) || null,
        toasts: [],
    },
    mutations: {
        setToken(state, token) {
            state.token = token;
            localStorage.setItem('token', token);
        },
        clearToken(state) {
            state.token = null;
            localStorage.removeItem('token');
        },
        setUser(state, user) {
            state.user = user;
            localStorage.setItem('user', JSON.stringify(user));
        },
        clearUser(state) {
            state.user = null;
            localStorage.removeItem('user');
        },
        showToast(state, { message, type = 'success' }) {
            state.toasts.push({ message, type });
            setTimeout(() => {
                state.toasts.shift();
            }, 5000);
        },
        removeToast(state, index) {
            state.toasts.splice(index, 1);
        },
    },
    actions: {
        async login({ commit }, credentials) {
            try {
                const response = await axios.post('/login', credentials);
                commit('setToken', response.data.token);
                commit('setUser', response.data.user);
                return response.data;
            } catch (error) {
                throw error.response?.data || error;
            }
        },
        async logout({ commit, state }) {
            try {
                await axios.post('/logout', {}, {
                    headers: { Authorization: `Bearer ${state.token}` }
                });
            } catch (error) {
                console.error('Logout failed:', error);
            } finally {
                commit('clearToken');
                commit('clearUser');
            }
        },
    },
    getters: {
        isAuthenticated: state => !!state.token,
        userName: state => state.user?.name || 'Guest',
    },
});
