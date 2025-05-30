import { create } from 'zustand'
import api from '../common/api'

export interface Category {
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
    category_id?: number,
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

interface MenuState {
    categoriesByLocation: CategoriesByLocation;
    loading: boolean;
    error: string | null;
    setCategories: (response: CategoryApiResponse) => void;
    setMenuItems: (response: MenuitemApiResponse) => void;
    addCategory: (category: Omit<Category, 'menu_items'>) => void;
    addMenuItem: (item: MenuItem) => void;
    fetchCategories: () => Promise<void>;
    fetchMenuItems: () => Promise<void>;
    updateCategory: (category: Category) => void;
    deleteCategory: (categoryId: number) => void;
    updateMenuItem: (menuItem: MenuItem) => void;
    deleteMenuItem: (menuItemId: number) => void;
}

const useMenuStore = create<MenuState>()((set, get) => ({
    categoriesByLocation: {},
    loading: false,
    error: null,
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
        // First, clear existing menu items for all categories
        Object.values(categoriesByLocation).forEach(categories => {
            categories.forEach(category => {
                category.menu_items = [];
            });
        });
        // Then add the menu items to their respective categories
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
    addMenuItem: (item) => {
        set((state) => {
            const locId = item.location_id;
            const updated = { ...state.categoriesByLocation };
            const categoryArr = updated[locId];
            if (categoryArr) {
                const cat = categoryArr.find(c => c.name === item.category);
                if (cat) {
                    cat.menu_items = [...cat.menu_items, item];
                }
            }
            return { categoriesByLocation: updated };
        });
    },
    fetchCategories: async () => {
        try {
            set({ loading: true, error: null });
            const response = await api.get('/menu/categories/');
            const categories = response.data.categories;
            console.log("The value of the categories:", JSON.stringify(categories, null, 2));
            
            // Organize categories by location
            const categoriesByLocation: { [key: number]: Category[] } = {};
            categories.forEach((category: Category) => {
                if (!categoriesByLocation[category.location_id]) {
                    categoriesByLocation[category.location_id] = [];
                }
                categoriesByLocation[category.location_id].push({
                    ...category,
                    menu_items: []
                });
            });
            
            set({ categoriesByLocation, loading: false });
        } catch (error) {
            console.error('Failed to fetch categories:', error);
            set({ error: 'Failed to load categories', loading: false });
        }
    },
    fetchMenuItems: async () => {
        try {
            set({ loading: true, error: null });
            const response = await api.get('/menu/menu-items/');
            if (response.data && response.data.menu_items) {
                const menuItemsResponse: MenuitemApiResponse = {
                    menu_items: response.data.menu_items
                };
                get().setMenuItems(menuItemsResponse);
            }
            set({ loading: false });
        } catch (error) {
            console.error('Failed to fetch menu items:', error);
            set({ error: 'Failed to load menu items', loading: false });
        }
    },
    updateCategory: (updatedCategory: Category) => {
        set((state) => {
            const locationId = updatedCategory.location_id;
            const currentCategories = state.categoriesByLocation[locationId] || [];
            
            // Find the existing category to preserve its menu_items
            const existingCategory = currentCategories.find(cat => cat.id === updatedCategory.id);
            
            // Create the updated category with preserved menu_items
            const categoryWithMenuItems = {
                ...updatedCategory,
                menu_items: existingCategory ? existingCategory.menu_items : []
            };
            
            // Update the categories array for this location
            const updatedCategories = currentCategories.map(cat => 
                cat.id === updatedCategory.id ? categoryWithMenuItems : cat
            );
            
            // Return new state with updated categories
            return {
                categoriesByLocation: {
                    ...state.categoriesByLocation,
                    [locationId]: updatedCategories
                }
            };
        });
    },
    deleteCategory: (categoryId: number) => {
        set((state) => {
            const newCategoriesByLocation = { ...state.categoriesByLocation };
            
            // Safely filter out the category from each location's array
            Object.keys(newCategoriesByLocation).forEach((locationId) => {
                const locationCategories = newCategoriesByLocation[Number(locationId)];
                if (Array.isArray(locationCategories)) {
                    newCategoriesByLocation[Number(locationId)] = locationCategories.filter(cat => cat.id !== categoryId);
                }
            });
            
            return { categoriesByLocation: newCategoriesByLocation };
        });
    },
    updateMenuItem: (updatedItem: MenuItem) => {
        set((state) => {
            const locationId = updatedItem.location_id;
            const categories = state.categoriesByLocation[locationId] || [];
            
            // First, find and remove the item from its current category
            const updatedCategories = categories.map(category => ({
                ...category,
                menu_items: category.menu_items.filter(item => item.id !== updatedItem.id)
            }));

            // Then add the item to its new category
            const targetCategory = updatedCategories.find(cat => cat.name === updatedItem.category);
            if (targetCategory) {
                targetCategory.menu_items.push(updatedItem);
            }

            return {
                categoriesByLocation: {
                    ...state.categoriesByLocation,
                    [locationId]: updatedCategories
                }
            };
        });
    },
    deleteMenuItem: (menuItemId: number) => {
        set((state) => {
            const newCategoriesByLocation = { ...state.categoriesByLocation };
            
            // Remove the menu item from all categories
            Object.keys(newCategoriesByLocation).forEach((locationId) => {
                newCategoriesByLocation[Number(locationId)] = newCategoriesByLocation[Number(locationId)]
                    .map(category => ({
                        ...category,
                        menu_items: category.menu_items.filter(item => item.id !== menuItemId)
                    }));
            });
            
            return { categoriesByLocation: newCategoriesByLocation };
        });
    }
}));

export default useMenuStore