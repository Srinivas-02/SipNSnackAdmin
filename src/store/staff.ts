import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../common/api';
import { User } from '../store/account';

// Update StaffMember to extend User
interface StaffMember extends User {
  locations?: { id: number; name: string }[];
}

interface StaffState {
  staffByLocation: { [key: number]: StaffMember[] };
  setStaff: (staff: StaffMember[]) => void;
  addStaffMember: (staff: StaffMember) => void;
  updateStaffMember: (staff: StaffMember) => void;
  deleteStaffMember: (id: number) => void;
  fetchStaffByLocation: (locationId?: number) => Promise<StaffMember[]>;
}

const useStaffStore = create<StaffState>()(
  persist(
    (set, get) => ({
      staffByLocation: {},

      setStaff: (staff: StaffMember[]) => {
        const grouped: { [key: number]: StaffMember[] } = {};
        
        staff.forEach((member) => {
          member.locations?.forEach((location) => {
            if (!grouped[location.id]) {
              grouped[location.id] = [];
            }
            // Check if staff member already exists in this location
            if (!grouped[location.id].some(s => s.id === member.id)) {
              grouped[location.id].push(member);
            }
          });
        });

        set({ staffByLocation: grouped });
      },

      addStaffMember: async (staffData: Omit<StaffMember, 'id'>) => {
        try {
          const response = await api.post('/accounts/staff/', staffData);
          const newStaff = response.data;
          
          set((state) => {
            const newStaffByLocation = { ...state.staffByLocation };
            
            newStaff.locations?.forEach((location: { id: number; name: string }) => {
              if (!newStaffByLocation[location.id]) {
                newStaffByLocation[location.id] = [];
              }
              if (!newStaffByLocation[location.id].some(s => s.id === newStaff.id)) {
                newStaffByLocation[location.id].push(newStaff);
              }
            });

            return { staffByLocation: newStaffByLocation };
          });

          return newStaff;
        } catch (error) {
          console.error('Failed to add staff member:', error);
          throw error;
        }
      },

      updateStaffMember: async (staffData: StaffMember) => {
        try {
          const response = await api.patch('/accounts/staff/', staffData);
          const updatedStaff = response.data;
          
          set((state) => {
            const newStaffByLocation = { ...state.staffByLocation };
            
            // Remove staff member from all locations first
            Object.keys(newStaffByLocation).forEach((locationId) => {
              newStaffByLocation[Number(locationId)] = newStaffByLocation[Number(locationId)]
                .filter((member) => member.id !== staffData.id);
            });

            // Add staff member to their new locations
            updatedStaff.locations?.forEach((location: { id: number; name: string }) => {
              if (!newStaffByLocation[location.id]) {
                newStaffByLocation[location.id] = [];
              }
              if (!newStaffByLocation[location.id].some(s => s.id === updatedStaff.id)) {
                newStaffByLocation[location.id].push(updatedStaff);
              }
            });

            return { staffByLocation: newStaffByLocation };
          });

          return updatedStaff;
        } catch (error) {
          console.error('Failed to update staff member:', error);
          throw error;
        }
      },

      deleteStaffMember: async (id: number) => {
        try {
          await api.delete(`/accounts/staff/?id=${id}`);
          
          set((state) => {
            const newStaffByLocation = { ...state.staffByLocation };
            
            Object.keys(newStaffByLocation).forEach((locationId) => {
              newStaffByLocation[Number(locationId)] = newStaffByLocation[Number(locationId)]
                .filter((member) => member.id !== id);
            });

            return { staffByLocation: newStaffByLocation };
          });
        } catch (error) {
          console.error('Failed to delete staff member:', error);
          throw error;
        }
      },

      fetchStaffByLocation: async (locationId?: number) => {
        try {
          const endpoint = locationId 
            ? `/accounts/staff/?location_id=${locationId}`
            : '/accounts/staff/';
          
          const response = await api.get(endpoint);
          const staff = response.data;
          
          // Update the store with the fetched staff
          get().setStaff(staff);
          
          return staff;
        } catch (error) {
          console.error('Failed to fetch staff:', error);
          throw error;
        }
      },
    }),
    {
      name: 'staff-storage',
      partialize: (state) => ({
        staffByLocation: state.staffByLocation
      })
    }
  )
);

export default useStaffStore; 