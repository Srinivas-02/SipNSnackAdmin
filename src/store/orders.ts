import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import api from '../common/api'

export interface OrderItem {
  id: number;
  order_id: number;
  menu_item_id: number;
  menu_item__name?: string;
  quantity: number;
  price: number;
  notes?: string;
}

export interface Order {
  id: number;
  order_number: string;
  order_date: string;
  total_amount: number;
  customer_name?: string;
  location_name: string;
}

export interface OrderDetails extends Order {
  table_number?: string;
  location: {
    id: number;
    name: string;
  };
  items: OrderItem[];
  notes?: string;
  processed_by?: {
    id: number;
    name: string;
  };
}

interface OrdersState {
  orders: Order[];
  selectedOrder: OrderDetails | null;
  isLoading: boolean;
  error: string | null;
  
  // Filters
  locationFilter: string;
  dateFromFilter: string;
  dateToFilter: string;
  
  // Actions
  fetchOrders: (filters?: Record<string, string>) => Promise<void>;
  getOrderDetails: (orderId: number) => Promise<OrderDetails | null>;
  setFilters: (filters: {
    locationFilter?: string;
    dateFromFilter?: string;
    dateToFilter?: string;
  }) => void;
  resetFilters: () => void;
}

const useOrdersStore = create<OrdersState>()(
  persist(
    (set, get) => ({
      orders: [],
      selectedOrder: null,
      isLoading: false,
      error: null,
      
      // Filters
      locationFilter: "",
      dateFromFilter: "",
      dateToFilter: "",
      
      fetchOrders: async (filters = {}) => {
        try {
          set({ isLoading: true, error: null });
          
          // Build query params from store filters and any provided filters
          const queryParams = new URLSearchParams();
          
          const { locationFilter, dateFromFilter, dateToFilter } = get();
          
          if (locationFilter) queryParams.append('location_id', locationFilter);
          if (dateFromFilter) queryParams.append('date_from', dateFromFilter);
          if (dateToFilter) queryParams.append('date_to', dateToFilter);
          
          // Add any additional filters
          Object.entries(filters).forEach(([key, value]) => {
            if (value) queryParams.append(key, value);
          });
          
          const response = await api.get(`/orders/history/${queryParams.toString() ? `?${queryParams.toString()}` : ''}`);
          set({ orders: response.data, isLoading: false });
          return;
        } catch (error) {
          console.error('Failed to fetch orders:', error);
          set({ 
            error: 'Failed to load orders. Please try again.', 
            isLoading: false 
          });
        }
      },
      
      getOrderDetails: async (orderId: number) => {
        try {
          set({ isLoading: true, error: null });
          
          const response = await api.get(`/orders/history/?order_id=${orderId}`);
          const orderDetails = response.data as OrderDetails;
          
          set({ 
            selectedOrder: orderDetails, 
            isLoading: false 
          });
          
          return orderDetails;
        } catch (error) {
          console.error('Failed to fetch order details:', error);
          set({ 
            error: 'Failed to load order details. Please try again.', 
            isLoading: false 
          });
          return null;
        }
      },
      
      setFilters: (filters) => {
        set({
          ...(filters.locationFilter !== undefined && { locationFilter: filters.locationFilter }),
          ...(filters.dateFromFilter !== undefined && { dateFromFilter: filters.dateFromFilter }),
          ...(filters.dateToFilter !== undefined && { dateToFilter: filters.dateToFilter }),
        });
      },
      
      resetFilters: () => {
        set({
          locationFilter: "",
          dateFromFilter: "",
          dateToFilter: "",
        });
      },
    }),
    {
      name: 'sipnsnack-orders-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ 
        locationFilter: state.locationFilter,
        dateFromFilter: state.dateFromFilter,
        dateToFilter: state.dateToFilter,
      }),
    }
  )
);

export default useOrdersStore; 