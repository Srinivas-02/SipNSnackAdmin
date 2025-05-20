import {create} from 'zustand'
import {persist, createJSONStorage} from 'zustand/middleware'
import api from '../common/api'

export interface Location {
    id: number,
    name: string,
    city: string,
    state: string,
    address: string,
    phone: string | number,
    status: 'active' | 'inactive' | 'pending'
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
    addLocation: (locationData: Omit<Location, 'id'>) => Promise<Location | null>,
    updateLocation: (locationData: Location) => Promise<Location | null>,
    deleteLocation: (id: number) => Promise<void>,
    fetchLocationById: (id: number) => Promise<Location | undefined>,
}

export const useLocationStore = create<LocationState>()(
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
                    return response.data;
                } catch (error) {
                    console.error('Failed to fetch locations:', error);
                    set({ 
                        error: 'Failed to load locations. Please try again.', 
                        isLoading: false 
                    });
                    throw error;
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

            addLocation: async (locationData: Omit<Location, 'id'>) => {
                try {
                    set({ loading: true });
                    const response = await api.post('/locations/', locationData);
                    const newLocation = response.data;
                    
                    // Update the locations list with the complete location data
                    set(state => ({
                        locations: [...state.locations, { ...locationData, id: newLocation.id } as Location],
                        loading: false
                    }));
                    
                    return { ...locationData, id: newLocation.id } as Location;
                } catch (error) {
                    console.error('Failed to add location:', error);
                    set({ loading: false });
                    throw error;
                }
            },

            updateLocation: async (locationData: Location) => {
                try {
                    set({ loading: true });
                    const response = await api.patch(`/locations/?id=${locationData.id}`, locationData);
                    const updatedLocation = response.data;
                    
                    // Update the locations list with the complete location data
                    set(state => ({
                        locations: state.locations.map(loc => 
                            loc.id === locationData.id ? { ...loc, ...locationData } : loc
                        ),
                        loading: false
                    }));
                    
                    return updatedLocation;
                } catch (error) {
                    console.error('Failed to update location:', error);
                    set({ loading: false });
                    throw error;
                }
            },

            deleteLocation: async (id: number) => {
                try {
                    set({ loading: true });
                    await api.delete(`/locations/?id=${id}`);
                    
                    // Update the locations list
                    set(state => ({
                        locations: state.locations.filter(loc => loc.id !== id),
                        loading: false
                    }));
                } catch (error) {
                    console.error('Failed to delete location:', error);
                    set({ loading: false });
                    throw error;
                }
            },

            fetchLocationById: async (id: number) => {
                try {
                    const response = await api.get(`/locations/?id=${id}`);
                    return response.data;
                } catch (error) {
                    console.error('Error fetching location by ID:', error);
                    throw error;
                }
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