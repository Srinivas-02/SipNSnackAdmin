import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// Define types for our store state
interface UserData {
  id?: number
  email?: string
  first_name?: string
  last_name?: string
  is_super_admin?: boolean
  is_franchise_admin?: boolean
}

interface ApiResponse {
  data: {
    access: string
    refresh: string
    user: UserData
  }
}

interface AccountState {
  // User info
  user: UserData
  name: string
  
  // Authorization tokens
  accessToken: string | null
  refreshToken: string | null
  
  // User roles
  isSuperAdmin: boolean
  isFranchiseAdmin: boolean
  
  // Methods
  setDetails: (response: ApiResponse) => void
  logout: () => void
}

const useAccountStore = create<AccountState>()(
  persist(
    (set) => ({
      // Initial state
      user: {},
      name: '',
      accessToken: null,
      refreshToken: null,
      isSuperAdmin: false,
      isFranchiseAdmin: false,
      
      // Update state from API response
      setDetails: (response: ApiResponse) => {
        // Handle the nested structure of the Axios response
        const responseData = response.data;
        
        set({
          accessToken: responseData.access,
          refreshToken: responseData.refresh,
          user: responseData.user || {},
          name: `${responseData.user?.first_name || ''} ${responseData.user?.last_name || ''}`.trim(),
          isSuperAdmin: responseData.user?.is_super_admin || false,
          isFranchiseAdmin: responseData.user?.is_franchise_admin || false,
        });
      },
      
      // Clear all state data on logout
      logout: () => set({
        user: {},
        name: '',
        accessToken: null,
        refreshToken: null,
        isSuperAdmin: false,
        isFranchiseAdmin: false,
      }),
    }),
    {
      name: 'account-storage', // name for the localStorage key
      partialize: (state) => ({
        // Only persist these fields
        user: state.user,
        name: state.name,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isSuperAdmin: state.isSuperAdmin,
        isFranchiseAdmin: state.isFranchiseAdmin,
      }),
    }
  )
)

export default useAccountStore