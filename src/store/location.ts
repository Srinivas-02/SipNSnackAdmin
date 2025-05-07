import {create} from 'zustand'
import {persist, createJSONStorage} from 'zustand/middleware'
import api from '../common/api'

interface Location {
    id: number,
    name: string,
    city: string,
    state: string,
    address: string,
    phone: number
}

interface LocationBasic {
    id: number,
    name: string
}

interface FranchiseAdmin {
    id: number,
    email: string,
    first_name: string,
    last_name: string,
    locations: LocationBasic[]
}


interface LocationState {
    locations: Location[],
    franchiseAdmins: FranchiseAdmin[],
    loading: boolean,
    setLocations: (response: Location[]) => void,
    fetchFranchiseAdmins: () => Promise<void>,
    addFranchiseAdmin: (adminData: FranchiseAdminCreate) => Promise<FranchiseAdmin | null>,
}

interface FranchiseAdminCreate {
    email: string,
    password: string,
    first_name: string,
    last_name: string,
    location_ids: number[]
}

const useLocationStore = create<LocationState>()(
    persist(
        (set, get) => ({
            locations: [],
            franchiseAdmins: [],
            loading: false,
            
            setLocations: (response: Location[]) => {
                const locationdata = response
                set({
                    locations: locationdata
                })
            },
            
            fetchFranchiseAdmins: async () => {
                try {
                    set({ loading: true });
                    const response = await api.get('/accounts/franchise-admin/');
                    set({ 
                        franchiseAdmins: response.data,
                        loading: false
                    });
                    return response.data;
                } catch (error) {
                    console.error('Failed to fetch franchise admins:', error);
                    set({ loading: false });
                    throw error;
                }
            },
            
            addFranchiseAdmin: async (adminData: FranchiseAdminCreate) => {
                try {
                    set({ loading: true });
                    const response = await api.post('/accounts/franchise-admin/', adminData);
                    
                    // After successfully adding, fetch the updated list
                    await get().fetchFranchiseAdmins();
                    
                    set({ loading: false });
                    return response.data;
                } catch (error) {
                    console.error('Failed to add franchise admin:', error);
                    set({ loading: false });
                    throw error;
                }
            }
        }),
        {
            name: 'location-storage',
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({
                locations: state.locations
                // Not persisting franchiseAdmins or loading state
            })
        }
    )
)

export default useLocationStore