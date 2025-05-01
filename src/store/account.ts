import {create} from 'zustand'
import api from '../common/api'

interface user {
    id: number,
    email: string,
    first_name: string,
    last_name: string,
    is_super_admin: boolean,
    is_franchise_admin: boolean,
    is_staff_member: boolean
}

interface ApiResponse {
    refresh : string,
    access: string,
    user: user
}

interface AccountState {
    refresh_token : string | null,
    access_token: string | null,
    user: user | null,
    setDetails: (response : ApiResponse) => void,
}

const useAccountStore = create<AccountState>()((set) => ({
    refresh_token: null,
    access_token: null,
    user: null,
    setDetails: (response : ApiResponse) =>{
        api.defaults.headers.common['Authorization'] = `Bearer ${response.access}`;
        set({
            refresh_token: response.refresh,
            access_token: response.access,
            user: response.user
        });
    }
}))

export default useAccountStore