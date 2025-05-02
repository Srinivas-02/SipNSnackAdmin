import { create } from 'zustand'

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
    addMenuItem: (item: MenuItem) => void;
}

const useMenuStore = create<MenuState>((set, get) => ({
    categoriesByLocation: {},
    setCategories: (response: CategoryApiResponse) => {
        const grouped: CategoriesByLocation = {};
        response.categories.forEach((cat: Omit<Category, 'menu_items'>) => {
            const locId = cat.location_id;
            if (!grouped[locId]) grouped[locId] = [];
            grouped[locId].push({ ...cat, location_id: locId, menu_items: [] });
        });
        set({ categoriesByLocation: grouped });
        console.log('\n\n\n grouped categories', grouped , '\n\n\n' )
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
        console.log('\n\n\n',categoriesByLocation,'\n\n\n')
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
    }
}));

export default useMenuStore