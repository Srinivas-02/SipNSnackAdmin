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

// Interceptor to handle token refresh
api.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        const originalRequest = error.config;
        // @ts-expect-error: Adding custom property to track retry attempts
        if (error.response?.status === 401 && !originalRequest._retry) {
            // @ts-expect-error: Adding custom property to track retry attempts
            originalRequest._retry = true;
            
            try {
                const refreshToken = localStorage.getItem('refresh_token');
                if (!refreshToken) {
                    // No refresh token available, redirect to login
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
                // @ts-expect-error: originalRequest.headers exists
                originalRequest.headers.Authorization = `Bearer ${access}`;
                
                // Retry the original request
                if (originalRequest) {
                    return api.request(originalRequest);
                }
                return Promise.reject(error);
            } catch (refreshError) {
                // If refresh fails, redirect to login
                localStorage.removeItem('access_token');
                localStorage.removeItem('refresh_token');
                window.location.href = '/';
                return Promise.reject(refreshError);
            }
        }
        
        return Promise.reject(error);
    }
);

export default api;