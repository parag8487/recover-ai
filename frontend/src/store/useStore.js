import { create } from 'zustand'
import axios from 'axios'
import { io } from 'socket.io-client'

axios.defaults.baseURL = 'http://localhost:5005'

const useStore = create((set, get) => ({
    user: { id: 'demo-judge', name: 'Demo User (Judge)', role: 'Patient' },
    patientLogs: [],
    intelligence: null,
    alerts: [],
    socket: null,

    // Global interceptor for error handling
    setupInterceptors: (addAlert) => {
        axios.interceptors.response.use(
            response => response,
            error => {
                const message = error.response?.data?.message || 'A clinical system error occurred.';
                addAlert({
                    id: Date.now(),
                    type: 'error',
                    message,
                    timestamp: new Date()
                });
                return Promise.reject(error);
            }
        );
    },

    initSocket: (patientId) => {
        const socket = io('http://localhost:5005')
        socket.emit('join', patientId)
        set({ socket })
    },

    setUser: (user) => set({ user }),
    logout: () => {
        localStorage.removeItem('token')
        set({ user: null, patientLogs: [], intelligence: null, alerts: [] })
    },

    register: async (data) => {
        try {
            const res = await axios.post('/api/auth/register', data)
            const { token, user } = res.data;
            localStorage.setItem('token', token)
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
            set({ user })
            return true;
        } catch (err) {
            console.error('Registration failed', err)
            return false;
        }
    },

    login: async (data) => {
        try {
            const res = await axios.post('/api/auth/login', data)
            const { token, user } = res.data;
            localStorage.setItem('token', token)
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
            set({ user })
            return true;
        } catch (err) {
            console.error('Login failed', err)
            return false;
        }
    },

    loadSession: async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            // Keep demo user if no login exists
            return;
        }

        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        try {
            const res = await axios.get('/api/auth/me');
            set({ user: res.data.user });
        } catch (err) {
            console.error('Session recovery failed', err);
            localStorage.removeItem('token');
            delete axios.defaults.headers.common['Authorization'];
        }
    },

    addAlert: (alert) => set((state) => ({ alerts: [alert, ...state.alerts] }))
}))

export default useStore
