import { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaTimes, FaImage, FaFolderPlus } from 'react-icons/fa';
import useLocationStore from '../../store/location';
import useMenuStore, { Category } from '../../store/menu';
import api from '../../common/api'
import toast from 'react-hot-toast';

const MenuItems = () => {
  // Get locations from store
  const locations = useLocationStore((state) => state.locations);
  // Get categoriesByLocation from store
  const categoriesByLocation = useMenuStore((state) => state.categoriesByLocation);

  // Flatten all menu items from all categories in all locations
  const menuItems = Object.values(categoriesByLocation)
    .flat()
    .flatMap((cat) => cat.menu_items.map((item) => ({
      ...item,
      category: cat.name,
      location_id: cat.location_id,
    })));

  // Gather all categories for the selected location
  const getCategoriesForLocation = (locationId: string | number | undefined) => {
    if (!locationId || locationId === 'all') return [];
    return categoriesByLocation[Number(locationId)] || [];
  };

  const [selectedLocation, setSelectedLocation] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showCategoryEditModal, setShowCategoryEditModal] = useState(false);
  const [currentItem, setCurrentItem] = useState<{
    id: number;
    name: string;
    price: number;
    category: string;
    location_id: number;
    image?: string | null;
    description?: string;
  } | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState<{
    name: string;
    price: number;
    category_id?: number;
    image?: string | null;
    location_id?: number;
    description?: string;
  }>({
    name: '',
    price: 0,
    category_id: undefined,
    image: '',
    location_id: undefined,
    description: '',
  });
  const [categoryForm, setCategoryForm] = useState<{
    name: string;
    location_id?: number;
    display_order: number;
  }>({
    name: '',
    location_id: undefined,
    display_order: 0,
  });
  const { fetchCategories, fetchMenuItems } = useMenuStore();

  // Add useEffect to fetch categories and menu items when component mounts
  useEffect(() => {
    const fetchData = async () => {
      await fetchCategories();
      await fetchMenuItems();
    };
    fetchData();
  }, [fetchCategories, fetchMenuItems]);

  // Handle location change: reset category if location changes
  const handleLocationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedLocation(e.target.value);
    setSelectedCategory(null);
    setFormData((prev) => ({ ...prev, location_id: e.target.value !== 'all' ? Number(e.target.value) : undefined, category_id: undefined }));
  };

  // Handle category change
  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const categoryName = e.target.value;
    const categories = getCategoriesForLocation(selectedLocation);
    const category = categories.find(cat => cat.name === categoryName) || null;
    setSelectedCategory(category);
  };

  const handleAddMenuItem = () => {
    setCurrentItem(null);
    setFormData({
      name: '',
      price: 0,
      category_id: undefined,
      image: '',
      location_id: selectedLocation !== 'all' ? Number(selectedLocation) : undefined,
      description: '',
    });
    setShowModal(true);
  };

  const handleEditMenuItem = (item: {
    id: number;
    name: string;
    price: number;
    category: string;
    location_id: number;
    image?: string | null;
    description?: string;
    category_id?: number;
  }) => {
    // Find category_id if not present
    let categoryId = item.category_id;
    if (!categoryId) {
      const cats = getCategoriesForLocation(item.location_id);
      const found = cats.find((cat) => cat.name === item.category);
      categoryId = found ? found.id : undefined;
    }
    setCurrentItem(item);
    setFormData({
      name: item.name,
      price: item.price,
      category_id: categoryId,
      image: item.image ?? '',
      location_id: item.location_id,
      description: item.description ?? '',
    });
    setShowModal(true);
  };

  const handleDeleteMenuItem = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this menu item?')) {
      try {
        await api.delete(`/menu/menu-items/`, {
          data: { id }
        });
        useMenuStore.getState().deleteMenuItem(id);
        toast.success('Menu item deleted successfully');
      } catch (err: unknown) {
        let errorMessage = 'Error deleting menu item';
        if (err && typeof err === 'object' && 'response' in err) {
          const errorResponse = err as { response?: { data?: { message?: string } } };
          if (errorResponse.response?.data?.message) {
            errorMessage = errorResponse.response.data.message;
          }
        }
        toast.error(errorMessage);
        console.error('Error deleting menu item:', err);
      }
    }
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    let updatedValue: string | number | undefined = value;
    if (name === 'price') updatedValue = parseFloat(value);
    if (name === 'location_id' || name === 'category_id') updatedValue = value ? Number(value) : undefined;
    setFormData({ ...formData, [name]: updatedValue });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let response;
      if (currentItem) {
        // Update existing menu item using PATCH
        response = await api.patch('/menu/menu-items/', {
          id: currentItem.id,
          ...formData
        });
      } else {
        // Create new menu item
        response = await api.post('/menu/menu-items/', {
          ...formData
        });
      }

      if (response.status === 200 || response.status === 201) {
        // Find the category name using category_id and location_id
        let categoryName = '';
        if (formData.location_id && formData.category_id) {
          const cats = getCategoriesForLocation(formData.location_id);
          const found = cats.find((cat) => cat.id === formData.category_id);
          if (found) categoryName = found.name;
        }

        // Construct the full menu item object
        if (formData.location_id !== undefined) {
          const menuItem = {
            id: currentItem ? currentItem.id : response.data.id,
            name: response.data.name || formData.name,  // Fallback to form data if response doesn't include it
            price: formData.price,
            category: categoryName,
            location_id: Number(formData.location_id),
            image: formData.image ?? '',
            description: formData.description ?? '',
          };

          if (currentItem) {
            useMenuStore.getState().updateMenuItem(menuItem);
            toast.success('Menu item updated successfully');
          } else {
            useMenuStore.getState().addMenuItem(menuItem);
            toast.success('Menu item added successfully');
          }
        }

        setShowModal(false);
        // Reset form and current item
        setFormData({
          name: '',
          price: 0,
          category_id: undefined,
          image: '',
          location_id: selectedLocation !== 'all' ? Number(selectedLocation) : undefined,
          description: '',
        });
        setCurrentItem(null);
      }
    } catch (err: unknown) {
      let errorMessage = currentItem ? 'Error updating menu item' : 'Error adding menu item';
      if (err && typeof err === 'object' && 'response' in err) {
        const errorResponse = err as { response?: { data?: { message?: string } } };
        if (errorResponse.response?.data?.message) {
          errorMessage = errorResponse.response.data.message;
        }
      }
      toast.error(errorMessage);
      console.error(currentItem ? 'Error updating menu item:' : 'Error adding menu item:', err);
    }
  };

  // Category modal handlers
  const handleCategoryFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    let updatedValue: string | number | undefined = value;
    if (name === 'location_id') updatedValue = value ? Number(value) : undefined;
    if (name === 'display_order') updatedValue = value ? Number(value) : 0;
    setCategoryForm({ ...categoryForm, [name]: updatedValue });
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!categoryForm.name || !categoryForm.location_id) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const response = await api.post('/menu/categories/', categoryForm);

      if (response.status === 201) {
        // Add the new category to the store
        const newCategory = {
          ...response.data,
          menu_items: []
        };
        useMenuStore.getState().addCategory(newCategory);

        // Reset form and close modal
        setCategoryForm({
          name: '',
          location_id: undefined,
          display_order: 0,
        });
        setShowCategoryModal(false);
        
        // Refresh categories to ensure we have the latest data
        await fetchCategories();
        
        toast.success('Category created successfully');
      }
    } catch (err: unknown) {
      let errorMessage = 'Error creating category';
      if (err && typeof err === 'object' && 'response' in err) {
        const errorResponse = err as { response?: { data?: { message?: string } } };
        if (errorResponse.response?.data?.message) {
          errorMessage = errorResponse.response.data.message;
        }
      }
      toast.error(errorMessage);
      console.error('Error creating category:', err);
    }
  };

  const handleEditCategory = (category: Category) => {
    setSelectedCategory(category);
    // Set the form with all the category's current values
    setCategoryForm({
      name: category.name,
      location_id: category.location_id,
      display_order: category.display_order || 0,
    });
    setShowCategoryEditModal(true);
  };

  const handleDeleteCategory = async (categoryId: number) => {
    if (!window.confirm('Are you sure you want to delete this category? All menu items in this category will also be deleted.')) {
      return;
    }

    try {
      // Send the delete request with the id as a query parameter
      await api.delete('/menu/categories/', {
        params: { id: categoryId }
      });
      
      // Only update the store if the delete was successful
      useMenuStore.getState().deleteCategory(categoryId);
      toast.success('Category deleted successfully');
    } catch (err: unknown) {
      let errorMessage = 'Error deleting category';
      if (err && typeof err === 'object' && 'response' in err) {
        const errorResponse = err as { response?: { data?: { message?: string } } };
        if (errorResponse.response?.data?.message) {
          errorMessage = errorResponse.response.data.message;
        }
      }
      toast.error(errorMessage);
      console.error('Error deleting category:', err);
    }
  };

  const handleUpdateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedCategory || !categoryForm.name || !categoryForm.location_id) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const updateData = {
        id: selectedCategory.id,
        name: categoryForm.name,
        location_id: categoryForm.location_id,
        display_order: categoryForm.display_order || 0
      };

      const response = await api.patch('/menu/categories/', updateData);

      if (response.status === 200) {
        // Update category in store with all the existing data plus the updates
        const updatedCategory = {
          ...selectedCategory,
          name: categoryForm.name,
          location_id: categoryForm.location_id,
          display_order: categoryForm.display_order,
          menu_items: selectedCategory.menu_items || [], // Preserve menu items
        };
        useMenuStore.getState().updateCategory(updatedCategory);

        // Reset form and close modal
        setCategoryForm({
          name: '',
          location_id: undefined,
          display_order: 0,
        });
        setShowCategoryEditModal(false);
        setSelectedCategory(null);
        
        // Refresh categories to ensure we have the latest data
        fetchCategories();
        
        toast.success('Category updated successfully');
      }
    } catch (err: unknown) {
      let errorMessage = 'Error updating category';
      if (err && typeof err === 'object' && 'response' in err) {
        const errorResponse = err as { response?: { data?: { message?: string } } };
        if (errorResponse.response?.data?.message) {
          errorMessage = errorResponse.response.data.message;
        }
      }
      toast.error(errorMessage);
      console.error('Error updating category:', err);
    }
  };

  // Filter menu items by location and category
  const filteredMenuItems = menuItems.filter(
    (item) =>
      (selectedLocation === 'all' || String(item.location_id) === selectedLocation) &&
      (selectedCategory === null || (item.category && item.category === selectedCategory.name)) &&
      ((item.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        ((item.category || '').toLowerCase().includes(searchTerm.toLowerCase())))
  );

  // Get categories for filter dropdown
  const categoryOptions = getCategoriesForLocation(selectedLocation);

  // Add this section to render categories list
  const renderCategories = () => {
    const categories = selectedLocation === 'all' 
      ? Object.values(categoriesByLocation).flat() 
      : categoriesByLocation[Number(selectedLocation)] || [];

    return (
      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-4">Categories</h3>
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {categories.map((category) => (
              <li key={category.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50">
                <div>
                  <h4 className="text-lg font-medium text-gray-900">{category.name}</h4>
                  <p className="text-sm text-gray-500">
                    {locations.find(l => l.id === category.location_id)?.name}
                  </p>
                  <p className="text-sm text-gray-500">
                    {category.menu_items.length} items
                  </p>
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={() => handleEditCategory(category)}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    <FaEdit size={18} />
                  </button>
                  <button
                    onClick={() => handleDeleteCategory(category.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    <FaTrash size={18} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div className="flex flex-col md:flex-row gap-4">
          <select
            value={selectedLocation}
            onChange={handleLocationChange}
            className="px-4 py-2 border border-gray-300 rounded-md"
          >
            <option value="all">All Locations</option>
            {locations.map((location) => (
              <option key={String(location.id)} value={String(location.id)}>{location.name}</option>
            ))}
          </select>

          <select
            value={selectedCategory?.name}
            onChange={handleCategoryChange}
            className="px-4 py-2 border border-gray-300 rounded-md"
            disabled={selectedLocation === 'all'}
          >
            <option value="">All Categories</option>
            {categoryOptions.map((cat) => (
              <option key={cat.name} value={cat.name}>{cat.name}</option>
            ))}
          </select>

          <input
            type="text"
            placeholder="Search menu items..."
            className="px-4 py-2 border border-gray-300 rounded-md w-full md:w-64"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowCategoryModal(true)}
            className="flex items-center justify-center gap-2 bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition-colors"
          >
            <FaFolderPlus size={14} />
            <span>Add Category</span>
          </button>
          <button
            onClick={handleAddMenuItem}
            className="flex items-center justify-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors"
          >
            <FaPlus size={14} />
            <span>Add Menu Item</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMenuItems.length > 0 ? (
          filteredMenuItems.map((item) => (
            <div key={item.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="h-40 bg-gray-200 relative">
                {item.image ? (
                  <img 
                    src={item.image} 
                    alt={item.name} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <FaImage size={48} className="text-gray-400" />
                  </div>
                )}
              </div>
              <div className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold">{item.name}</h3>
                    <p className="text-sm text-gray-500 mt-1">{locations.find(l => l.id === item.location_id)?.name}</p>
                  </div>
                  <p className="text-lg font-bold">Rs {item.price.toFixed(2)}</p>
                </div>
                <div className="flex justify-between items-center mt-4">
                  <span className="px-2 py-1 bg-gray-100 text-xs rounded">{item.category}</span>
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => handleEditMenuItem(item)}
                      className="text-blue-500 hover:text-blue-700"
                    >
                      <FaEdit size={18} />
                    </button>
                    <button 
                      onClick={() => handleDeleteMenuItem(item.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <FaTrash size={18} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-8 bg-white rounded-lg">
            <p className="text-gray-500">No menu items found</p>
          </div>
        )}
      </div>

      {/* Add the categories list */}
      {renderCategories()}

      {/* Add/Edit Menu Item Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold">
                {currentItem ? 'Edit Menu Item' : 'Add New Menu Item'}
              </h3>
              <button 
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <FaTimes size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleFormChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleFormChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    rows={3}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Price (Rs)
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleFormChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <select
                    name="category_id"
                    value={formData.category_id !== undefined && formData.category_id !== null ? String(formData.category_id) : ''}
                    onChange={handleFormChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                    disabled={!formData.location_id}
                  >
                    <option value="">Select a category</option>
                    {getCategoriesForLocation(formData.location_id).map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Image URL
                  </label>
                  <input
                    type="text"
                    name="image"
                    value={formData.image ?? ''}
                    onChange={handleFormChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Location
                  </label>
                  <select
                    name="location_id"
                    value={formData.location_id !== undefined && formData.location_id !== null ? String(formData.location_id) : ''}
                    onChange={handleFormChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                  >
                    <option value="">Select a location</option>
                    {locations.map((location) => (
                      <option key={String(location.id)} value={String(location.id)}>{location.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="mt-8 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                >
                  {currentItem ? 'Update' : 'Add'} Menu Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Category Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold">Add New Category</h3>
              <button
                onClick={() => setShowCategoryModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <FaTimes size={20} />
              </button>
            </div>
            <form onSubmit={handleAddCategory}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={categoryForm.name}
                    onChange={handleCategoryFormChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Location
                  </label>
                  <select
                    name="location_id"
                    value={categoryForm.location_id !== undefined && categoryForm.location_id !== null ? String(categoryForm.location_id) : ''}
                    onChange={handleCategoryFormChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                  >
                    <option value="">Select a location</option>
                    {locations.map((location) => (
                      <option key={String(location.id)} value={String(location.id)}>{location.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="mt-8 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowCategoryModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
                >
                  Add Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Category Modal */}
      {showCategoryEditModal && selectedCategory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold">Edit Category</h3>
              <button
                onClick={() => {
                  setShowCategoryEditModal(false);
                  setSelectedCategory(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <FaTimes size={20} />
              </button>
            </div>
            <form onSubmit={handleUpdateCategory}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={categoryForm.name}
                    onChange={handleCategoryFormChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Location
                  </label>
                  <select
                    name="location_id"
                    value={categoryForm.location_id !== undefined ? String(categoryForm.location_id) : ''}
                    onChange={handleCategoryFormChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                  >
                    <option value="">Select a location</option>
                    {locations.map((location) => (
                      <option key={String(location.id)} value={String(location.id)}>
                        {location.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Display Order
                  </label>
                  <input
                    type="number"
                    name="display_order"
                    value={categoryForm.display_order}
                    onChange={handleCategoryFormChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    min="0"
                  />
                </div>
              </div>
              <div className="mt-8 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowCategoryEditModal(false);
                    setSelectedCategory(null);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                >
                  Update Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MenuItems; 