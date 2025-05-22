import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import api from '../common/api'

interface Category {
    id: number,
    name: string,
    location_id: number,
    display_order: number,
    menu_items: MenuItem[]
}

interface MenuItem {
    id: number,
    name: string,
    price: number,
    category: string,
    location_id: number,
    image?: string | null
}

type CategoriesByLocation = Record<number, Category[]>;

interface CategoryApiResponse {
    categories: Omit<Category, 'menu_items'>[]
}
interface MenuitemApiResponse {
    menu_items: MenuItem[]
}

// New type: categories grouped by location_id
interface MenuState {
    categoriesByLocation: CategoriesByLocation;
    setCategories: (response: CategoryApiResponse) => void;
    setMenuItems: (response: MenuitemApiResponse) => void;
    addCategory: (category: Omit<Category, 'menu_items'>) => void;
    addMenuItem: (formData: {
        name: string;
        price: number;
        category_id?: number;
        image?: string | null;
        location_id?: number;
        description?: string;
    }) => Promise<{ success: boolean; data?: any; error?: string }>;
    updateMenuItem: (id: number, formData: {
        name: string;
        price: number;
        category_id?: number;
        image?: string | null;
        location_id?: number;
        description?: string;
    }) => Promise<{ success: boolean; data?: any; error?: string }>;
    deleteMenuItem: (id: number, locationId: number, categoryName: string) => Promise<{ success: boolean; error?: string }>;
    deleteCategory: (id: number, locationId: number) => Promise<{ success: boolean; error?: string }>;
}

const useMenuStore = create<MenuState>()(
    persist(
        (set, get) => ({
            categoriesByLocation: {},
            setCategories: (response: CategoryApiResponse) => {
                const grouped: CategoriesByLocation = {};
                response.categories.forEach((cat: Omit<Category, 'menu_items'>) => {
                    const locId = cat.location_id;
                    if (!grouped[locId]) grouped[locId] = [];
                    grouped[locId].push({ ...cat, location_id: locId, menu_items: [] });
                });
                set({ categoriesByLocation: grouped });
            },
            setMenuItems: (menuItems: MenuitemApiResponse) => {
                const categoriesByLocation = { ...get().categoriesByLocation };
                menuItems.menu_items.forEach((item: MenuItem) => {
                    const locId = item.location_id;
                    const categoryArr = categoriesByLocation[locId];
                    if (categoryArr) {
                        const cat = categoryArr.find(c => c.name === item.category);
                        if (cat) cat.menu_items.push(item);
                    }
                });
                set({ categoriesByLocation });
            },
            addCategory: (category) => {
                set((state) => {
                    const locId = category.location_id;
                    const newCategory: Category = { ...category, menu_items: [] };
                    const updated = { ...state.categoriesByLocation };
                    if (!updated[locId]) updated[locId] = [];
                    updated[locId] = [...updated[locId], newCategory];
                    return { categoriesByLocation: updated };
                });
            },
            addMenuItem: async (formData) => {
                try {
                    // First, make the API call
                    const response = await api.post('/menu/menu-items/', formData);
                    
                    if (response.status === 201) {
                        // Get the response data
                        const newItemData = response.data;
                        
                        // Find the category name using category_id and location_id
                        const categoriesByLocation = get().categoriesByLocation;
                        let categoryName = '';
                        if (formData.location_id && formData.category_id) {
                            const categoryArr = categoriesByLocation[formData.location_id];
                            if (categoryArr) {
                                const found = categoryArr.find(cat => cat.id === formData.category_id);
                                if (found) categoryName = found.name;
                            }
                        }

                        // Create the new menu item object
                        const newMenuItem = {
                            id: newItemData.id,
                            name: newItemData.name,
                            price: formData.price,
                            category: categoryName,
                            location_id: Number(formData.location_id),
                            image: formData.image ?? '',
                            description: formData.description ?? '',
                        };

                        // Update the store
                        set((state) => {
                            const locId = newMenuItem.location_id;
                            const updated = { ...state.categoriesByLocation };
                            if (!updated[locId]) updated[locId] = [];
                            
                            const categoryArr = updated[locId];
                            const cat = categoryArr.find(c => c.name === categoryName);
                            
                            if (cat) {
                                cat.menu_items = [...cat.menu_items, newMenuItem];
                            }
                            
                            return { categoriesByLocation: updated };
                        });

                        return { success: true, data: newMenuItem };
                    }
                    return { success: false, error: 'Failed to create menu item' };
                } catch (error: any) {
                    console.error('Error adding menu item:', error);
                    return { 
                        success: false, 
                        error: error.response?.data?.message || error.message || 'Failed to add menu item' 
                    };
                }
            },
            updateMenuItem: async (id, formData) => {
                try {
                    // Construct the request payload
                    const requestData = {
                        id: id,
                        name: formData.name,
                        price: formData.price,
                        category_id: formData.category_id,
                        location_id: formData.location_id,
                        image: formData.image,
                        description: formData.description
                    };

                    // Log the request details for debugging
                    console.log('Updating menu item:', {
                        id,
                        requestData,
                        url: `/menu/menu-items/?id=${id}`
                    });

                    // Make the API call with the correct endpoint format
                    const response = await api.put(`/menu/menu-items/?id=${id}`, requestData);
                    
                    if (response.status === 200) {
                        // Get the response data
                        const updatedItemData = response.data;
                        
                        // Find the category name
                        const categoriesByLocation = get().categoriesByLocation;
                        let categoryName = '';
                        if (formData.location_id && formData.category_id) {
                            const categoryArr = categoriesByLocation[formData.location_id];
                            if (categoryArr) {
                                const found = categoryArr.find(cat => cat.id === formData.category_id);
                                if (found) categoryName = found.name;
                            }
                        }

                        // Create the updated menu item object
                        const updatedMenuItem = {
                            id: id,
                            name: updatedItemData.name,
                            price: formData.price,
                            category: categoryName,
                            location_id: Number(formData.location_id),
                            image: formData.image ?? '',
                            description: formData.description ?? '',
                        };

                        // Update the store
                        set((state) => {
                            const locId = updatedMenuItem.location_id;
                            const updated = { ...state.categoriesByLocation };
                            const categoryArr = updated[locId];
                            
                            if (categoryArr) {
                                const cat = categoryArr.find(c => c.name === categoryName);
                                if (cat) {
                                    cat.menu_items = cat.menu_items.map(item => 
                                        item.id === id ? updatedMenuItem : item
                                    );
                                }
                            }
                            
                            return { categoriesByLocation: updated };
                        });

                        return { success: true, data: updatedMenuItem };
                    }
                    return { success: false, error: 'Failed to update menu item' };
                } catch (error: any) {
                    console.error('Error updating menu item:', error);
                    // Log more details about the error
                    console.error('Error details:', {
                        status: error.response?.status,
                        data: error.response?.data,
                        url: error.config?.url
                    });
                    return { 
                        success: false, 
                        error: error.response?.data?.message || error.message || 'Failed to update menu item' 
                    };
                }
            },
            deleteMenuItem: async (id, locationId, categoryName) => {
                try {
                    // Log the request details for debugging
                    console.log('Deleting menu item:', {
                        id,
                        requestBody: { id }
                    });

                    // Make the API call with the correct endpoint and body format
                    const response = await api.delete(`/menu/menu-items/`, {
                        data: { id } // Send the id in the request body
                    });
                    
                    if (response.status === 200 || response.status === 204) {
                        // Update the store
                        set((state) => {
                            const updated = { ...state.categoriesByLocation };
                            const categoryArr = updated[locationId];
                            
                            if (categoryArr) {
                                const cat = categoryArr.find(c => c.name === categoryName);
                                if (cat) {
                                    cat.menu_items = cat.menu_items.filter(item => item.id !== id);
                                }
                            }
                            
                            return { categoriesByLocation: updated };
                        });

                        return { success: true };
                    }
                    return { success: false, error: 'Failed to delete menu item' };
                } catch (error: any) {
                    console.error('Error deleting menu item:', error);
                    // Log more details about the error
                    console.error('Error details:', {
                        status: error.response?.status,
                        data: error.response?.data,
                        url: error.config?.url
                    });
                    return { 
                        success: false, 
                        error: error.response?.data?.message || error.message || 'Failed to delete menu item' 
                    };
                }
            },
            deleteCategory: async (id, locationId) => {
                try {
                    const response = await api.delete(`/menu/categories/`, {
                        data: { id }
                    });
                    
                    if (response.status === 200 || response.status === 204) {
                        // Update the store
                        set((state) => {
                            const updated = { ...state.categoriesByLocation };
                            if (updated[locationId]) {
                                updated[locationId] = updated[locationId].filter(cat => cat.id !== id);
                            }
                            return { categoriesByLocation: updated };
                        });

                        return { success: true };
                    }
                    return { success: false, error: 'Failed to delete category' };
                } catch (error: any) {
                    console.error('Error deleting category:', error);
                    return { 
                        success: false, 
                        error: error.response?.data?.message || error.message || 'Failed to delete category' 
                    };
                }
            },
        }),
        {
            name: 'menu-storage',
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({
                categoriesByLocation: state.categoriesByLocation
            })
        }
    )
);

export default useMenuStore