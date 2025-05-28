import {create} from 'zustand'
import {persist, createJSONStorage} from 'zustand/middleware'
import api from '../common/api'

export interface User {
    id: number,
    email: string,
    first_name: string,
    last_name: string,
    is_super_admin: boolean,
    is_franchise_admin: boolean,
    is_staff_member: boolean,
    assigned_locations?: { id: number, name: string }[],
    login_time: Date
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

const useAccountStore = create<AccountState>()(
    persist(
        (set) => ({
            isAuthenticated: false,
            refresh_token: null,
            access_token: null,
            user: null,
            
            setDetails: (response: AuthResponse) => {
                // Update API header
                api.defaults.headers.common['Authorization'] = `Bearer ${response.access}`;
                
                // Create a new user object with login_time
                const userWithLoginTime = {
                    ...response.user,
                    login_time: new Date() // Set the actual login time
                };
                
                // Update store state
                set({
                    isAuthenticated: true,
                    refresh_token: response.refresh,
                    access_token: response.access,
                    user: userWithLoginTime
                });
            },
            
            logout: () => {
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
                const state = useAccountStore.getState();
                if (state.access_token) {
                    api.defaults.headers.common['Authorization'] = `Bearer ${state.access_token}`;
                }
                if (state.user?.login_time) {
                    // Convert string back to Date
                    set({
                        user: {
                            ...state.user,
                            login_time: new Date(state.user.login_time)
                        }
                    });
                }
            }
        }),
        {
            name: 'account-storage', // unique name for the localStorage key
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({
                isAuthenticated: state.isAuthenticated,
                refresh_token: state.refresh_token,
                access_token: state.access_token,
                user: state.user ? {
                    ...state.user,
                    login_time: state.user.login_time.toISOString() // Convert Date to string for storage
                } : null
            })
        }
    )
)

// Set authorization header on app initialization if token exists
const initializeAuth = () => {
    const state = useAccountStore.getState();
    if (state.access_token) {
        api.defaults.headers.common['Authorization'] = `Bearer ${state.access_token}`;
    }
};

// Call this once when the app starts
initializeAuth();

export default useAccountStore  