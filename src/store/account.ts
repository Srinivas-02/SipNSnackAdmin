import {create} from 'zustand'
import api from '../common/api'

export interface User {
    id: number,
    email: string,
    first_name: string,
    last_name: string,
    is_super_admin: boolean,
    is_franchise_admin: boolean,
    is_staff_member: boolean
}

interface AuthResponse {
    refresh: string,
    access: string,
    user: User
}

interface AccountState {
    isAuthenticated: boolean,
    refresh_token: string | null,
    access_token: string | null,
    user: User | null,
    setDetails: (response: AuthResponse) => void,
    logout: () => void,
    initializeFromStorage: () => void,
}

const useAccountStore = create<AccountState>()((set) => ({
    isAuthenticated: false,
    refresh_token: null,
    access_token: null,
    user: null,
    
    setDetails: (response: AuthResponse) => {
        // Set tokens in localStorage for persistence
        localStorage.setItem('access_token', response.access);
        localStorage.setItem('refresh_token', response.refresh);
        
        // Store user data in localStorage
        localStorage.setItem('user', JSON.stringify(response.user));
        
        // Update API header
        api.defaults.headers.common['Authorization'] = `Bearer ${response.access}`;
        
        // Update store state
        set({
            isAuthenticated: true,
            refresh_token: response.refresh,
            access_token: response.access,
            user: response.user
        });
    },
    
    logout: () => {
        // Clear localStorage
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        
        // Clear authorization header
        delete api.defaults.headers.common['Authorization'];
        
        // Reset store state
        set({
            isAuthenticated: false,
            refresh_token: null,
            access_token: null,
            user: null
        });
    },
    
    initializeFromStorage: () => {
        // Try to restore session from localStorage
        const access_token = localStorage.getItem('access_token');
        const refresh_token = localStorage.getItem('refresh_token');
        const userString = localStorage.getItem('user');
        
        if (access_token && refresh_token && userString) {
            try {
                const user = JSON.parse(userString) as User;
                
                // Set authorization header
                api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
                
                // Update store state
                set({
                    isAuthenticated: true,
                    access_token,
                    refresh_token,
                    user
                });
            } catch (error) {
                // If parsing fails, clear storage
                localStorage.removeItem('access_token');
                localStorage.removeItem('refresh_token');
                localStorage.removeItem('user');
            }
        }
    }
}))

export default useAccountStore