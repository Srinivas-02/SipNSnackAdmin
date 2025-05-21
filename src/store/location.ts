import {create} from 'zustand'
import {persist, createJSONStorage} from 'zustand/middleware'
import api from '../common/api'

export type Location = {
    id: number,
    name: string,
    city: string,
    state: string,
    address: string,
    phone: string | number,
    password?: string
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

interface FranchiseAdminCreate {
    email: string,
    password: string,
    first_name: string,
    last_name: string,
    location_ids: number[]
}

interface LocationState {
    locations: Location[],
    franchiseAdmins: FranchiseAdmin[],
    loading: boolean,
    isLoading: boolean,
    error: string | null,
    
    // Actions
    setLocations: (response: Location[]) => void,
    fetchLocations: () => Promise<void>,
    fetchFranchiseAdmins: () => Promise<void>,
    addFranchiseAdmin: (adminData: FranchiseAdminCreate) => Promise<FranchiseAdmin | null>,
    getLocationById: (id: number) => Location | undefined,
}

const useLocationStore = create<LocationState>()(
    persist(
        (set, get) => ({
            locations: [],
            franchiseAdmins: [],
            loading: false,
            isLoading: false,
            error: null,
            
            setLocations: (response: Location[]) => {
                set({
                    locations: response
                })
            },
            
            fetchLocations: async () => {
                try {
                    set({ isLoading: true, error: null });
                    
                    const response = await api.get('/locations/');
                    set({ locations: response.data, isLoading: false });
                } catch (error) {
                    console.error('Failed to fetch locations:', error);
                    set({ 
                        error: 'Failed to load locations. Please try again.', 
                        isLoading: false 
                    });
                }
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
            },
            
            getLocationById: (id: number) => {
                return get().locations.find(location => location.id === id);
            },
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