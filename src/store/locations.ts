import { create } from 'zustand';
import api from '../common/api';

export interface Location {
  id: number;
  name: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  phone: string;
  is_active: boolean;
}

interface LocationState {
  locations: Location[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchLocations: () => Promise<void>;
  getLocationById: (id: number) => Location | undefined;
}

const useLocationStore = create<LocationState>()((set, get) => ({
  locations: [],
  isLoading: false,
  error: null,
  
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
  
  getLocationById: (id: number) => {
    return get().locations.find(location => location.id === id);
  },
}));

export default useLocationStore; 