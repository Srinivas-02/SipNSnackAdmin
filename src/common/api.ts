import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';

// Create axios instance
const api: AxiosInstance = axios.create({
    baseURL: 'http://localhost:8000/',
    headers: {
        'Content-Type': 'application/json'
    },
    timeout: 10000
});

// Interceptor to add auth token to requests
api.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const accessToken = localStorage.getItem('access_token');
        if (accessToken) {
            config.headers.Authorization = `Bearer ${accessToken}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

let isRefreshing = false;
let failedQueue: Array<{
    resolve: (value?: unknown) => void;
    reject: (error?: unknown) => void;
}> = [];

const processQueue = (error: unknown | null = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve();
        }
    });
    failedQueue = [];
};

// Interceptor to handle token refresh
api.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        const originalRequest = error.config;
        
        if (!originalRequest) {
            return Promise.reject(error);
        }

        // @ts-expect-error: Adding custom property to track retry attempts
        if (error.response?.status === 401 && !originalRequest._retry) {
            // @ts-expect-error: Adding custom property to track retry attempts
            originalRequest._retry = true;

            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                }).then(() => {
                    return api(originalRequest);
                }).catch((err) => {
                    return Promise.reject(err);
                });
            }

            isRefreshing = true;
            
            try {
                const refreshToken = localStorage.getItem('refresh_token');
                if (!refreshToken) {
                    processQueue(error);
                    localStorage.clear();
                    window.location.href = '/';
                    return Promise.reject(error);
                }
                
                // Attempt to refresh the token
                const response = await axios.post(
                    'http://localhost:8000/accounts/token/refresh/',
                    { refresh: refreshToken },
                    { headers: { 'Content-Type': 'application/json' } }
                );
                
                const { access } = response.data;
                
                // Save the new access token
                localStorage.setItem('access_token', access);
                
                // Update authorization header
                api.defaults.headers.common['Authorization'] = `Bearer ${access}`;
                originalRequest.headers.Authorization = `Bearer ${access}`;
                
                processQueue(null);
                isRefreshing = false;
                
                // Retry the original request with the new token
                return api(originalRequest);
            } catch (refreshError) {
                // If refresh fails, clear everything and redirect
                processQueue(refreshError);
                isRefreshing = false;
                localStorage.clear();
                window.location.href = '/';
                return Promise.reject(refreshError);
            }
        }
        
        return Promise.reject(error);
    }
);

export default api;