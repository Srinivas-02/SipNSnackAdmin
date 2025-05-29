import { create } from 'zustand';
import api from '../common/api';

interface Location {
  id: number;
  name: string;
  city: string;
  state: string;
}

interface FranchiseAdmin {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  locations: Location[];
}

interface FranchiseAdminCreate {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  location_ids?: number[];
}

interface FranchiseAdminStore {
  franchiseAdmins: FranchiseAdmin[];
  loading: boolean;
  error: string | null;
  fetchFranchiseAdmins: () => Promise<void>;
  addFranchiseAdmin: (data: FranchiseAdminCreate) => Promise<FranchiseAdmin>;
  updateFranchiseAdmin: (id: number, data: any) => Promise<FranchiseAdmin>;
  deleteFranchiseAdmin: (id: number) => Promise<void>;
  assignLocations: (adminId: number, locationIds: number[]) => Promise<void>;
}

const useFranchiseAdminStore = create<FranchiseAdminStore>((set) => ({
  franchiseAdmins: [],
  loading: false,
  error: null,

  fetchFranchiseAdmins: async () => {
    try {
      set({ loading: true, error: null });
      const response = await api.get('/accounts/franchise-admin/');
      const admins = response.data.map((admin: any) => ({
        id: admin.id,
        email: admin.email,
        first_name: admin.first_name,
        last_name: admin.last_name,
        locations: admin.locations || []
      }));
      set({ franchiseAdmins: admins, loading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch franchise admins',
        loading: false 
      });
      throw error;
    }
  },

  addFranchiseAdmin: async (data: FranchiseAdminCreate) => {
    try {
      set({ loading: true, error: null });
      const response = await api.post('/accounts/franchise-admin/', {
        email: data.email,
        password: data.password,
        first_name: data.first_name,
        last_name: data.last_name,
        location_ids: data.location_ids || []
      });
      
      // Create a properly formatted admin object from the response
      const newAdmin = {
        id: response.data.id,
        email: response.data.email,
        first_name: response.data.first_name,
        last_name: response.data.last_name,
        locations: response.data.locations || []
      };

      set(state => ({
        franchiseAdmins: [...state.franchiseAdmins, newAdmin],
        loading: false
      }));
      return newAdmin;
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to add franchise admin',
        loading: false 
      });
      throw error;
    }
  },

  updateFranchiseAdmin: async (id, data) => {
    if (!window.confirm('Are you sure you want to update this franchise admin?')) {
      return;
    }
    try {
      set({ loading: true, error: null });
      const response = await api.patch('/accounts/franchise-admin/', {
        id: id,
        ...data
      });
      const updatedAdmin = response.data;
      set(state => ({
        franchiseAdmins: state.franchiseAdmins.map(admin => 
          admin.id === id ? updatedAdmin : admin
        ),
        loading: false
      }));
      return updatedAdmin;
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to update franchise admin',
        loading: false 
      });
      throw error;
    }
  },

  deleteFranchiseAdmin: async (id) => {
    if (!window.confirm('Are you sure you want to delete this franchise admin?')) {
      return;
    }
    try {
      set({ loading: true, error: null });
      await api.delete(`/accounts/franchise-admin/?id=${id}`);
      set(state => ({
        franchiseAdmins: state.franchiseAdmins.filter(admin => admin.id !== id),
        loading: false
      }));
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to delete franchise admin',
        loading: false 
      });
      throw error;
    }
  },

  assignLocations: async (adminId, locationIds) => {
    try {
      set({ loading: true, error: null });
      const response = await api.patch('/accounts/franchise-admin/', {
        id: adminId,
        location_ids: locationIds
      });
      const updatedAdmin = response.data;
      set(state => ({
        franchiseAdmins: state.franchiseAdmins.map(admin => 
          admin.id === adminId ? updatedAdmin : admin
        ),
        loading: false
      }));
      alert('Locations assigned successfully!');
      return updatedAdmin;
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to assign locations',
        loading: false 
      });
      throw error;
    }
  }
}));

export default useFranchiseAdminStore; 