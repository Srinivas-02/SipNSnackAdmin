import { useState } from 'react';
import { FaPlus, FaEdit, FaTrash, FaTimes, FaImage, FaFolderPlus } from 'react-icons/fa';
import useLocationStore from '../../store/location';
import useMenuStore from '../../store/menu';
import useAccountStore from '../../store/account';
import api from '../../common/api';

const MenuItems = () => {
  const { user } = useAccountStore();
  const locations = useLocationStore((state) => state.locations) || [];
  const categoriesByLocation = useMenuStore((state) => state.categoriesByLocation);
  const [error, setError] = useState<string | null>(null);

  // Flatten all menu items
  const menuItems = Object.values(categoriesByLocation)
    .flat()
    .flatMap((cat) => cat.menu_items.map((item) => ({
      ...item,
      category: cat.name,
      location_id: cat.location_id,
    })));

  const getCategoriesForLocation = (locationId: string | number | undefined) => {
    if (!locationId || locationId === 'all') return [];
    return categoriesByLocation[Number(locationId)] || [];
  };

  const [selectedLocation, setSelectedLocation] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showModal, setShowModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [currentItem, setCurrentItem] = useState<{
    id: number;
    name: string;
    price: number;
    category: string;
    location_id: number;
    image?: string | null;
    description?: string;
    category_id?: number;
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
  }>({
    name: '',
    location_id: undefined,
  });
  const [showDeleteCategoryDropdown, setShowDeleteCategoryDropdown] = useState(false);

  const handleLocationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedLocation(e.target.value);
    setSelectedCategory('all');
    setFormData((prev) => ({ ...prev, location_id: e.target.value !== 'all' ? Number(e.target.value) : undefined, category_id: undefined }));
    setError(null);
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCategory(e.target.value);
    setError(null);
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
    setError(null);
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
    setError(null);
    setShowModal(true);
  };

  const handleDeleteMenuItem = async (id: number, locationId: number, categoryName: string) => {
    if (!user?.is_super_admin && !user?.is_franchise_admin) {
      setError('Only super admins and franchise admins can delete menu items');
      return;
    }

    // Check if franchise admin has access to this location
    if (user?.is_franchise_admin && !locations.some(loc => loc.id === locationId)) {
      setError('You can only delete menu items from your assigned locations');
      return;
    }

    if (window.confirm('Are you sure you want to delete this menu item?')) {
      try {
        const result = await useMenuStore.getState().deleteMenuItem(id, locationId, categoryName);
        if (result.success) {
          setError(null);
          alert('Menu item deleted successfully');
        } else {
          setError(result.error || 'Failed to delete menu item');
        }
      } catch (err: any) {
        console.error('Error in handleDeleteMenuItem:', err);
        setError(err.response?.data?.message || err.message || 'An error occurred');
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
    setError(null);
    if (!formData.name || !formData.price || !formData.category_id || !formData.location_id) {
      setError('Please fill in all required fields');
      return;
    }
    try {
      if (currentItem) {
        const updateData = {
          id: currentItem.id,
          name: formData.name,
          price: Number(formData.price),
          category_id: formData.category_id,
          location_id: formData.location_id,
          image: formData.image || '',
          description: formData.description || ''
        };
        const result = await useMenuStore.getState().updateMenuItem(currentItem.id, updateData);
        if (result.success) {
          alert('Menu item updated successfully');
          setShowModal(false);
          setFormData({
            name: '',
            price: 0,
            category_id: undefined,
            image: '',
            location_id: selectedLocation !== 'all' ? Number(selectedLocation) : undefined,
            description: '',
          });
        } else {
          setError(result.error || 'Failed to update menu item');
        }
      } else {
        const result = await useMenuStore.getState().addMenuItem(formData);
        if (result.success) {
          alert('Menu item added successfully');
          setShowModal(false);
          setFormData({
            name: '',
            price: 0,
            category_id: undefined,
            image: '',
            location_id: selectedLocation !== 'all' ? Number(selectedLocation) : undefined,
            description: '',
          });
        } else {
          setError(result.error || 'Failed to add menu item');
        }
      }
    } catch (err: any) {
      console.error('Error in handleSubmit:', err);
      setError(err.response?.data?.message || err.message || 'An error occurred');
    }
  };

  const handleCategoryFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    let updatedValue: string | number | undefined = value;
    if (name === 'location_id') updatedValue = value ? Number(value) : undefined;
    setCategoryForm({ ...categoryForm, [name]: updatedValue });
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryForm.name || !categoryForm.location_id) {
      setError('Please fill in all required fields');
      return;
    }
    try {
      const response = await api.post('/menu/categories/', {
        name: categoryForm.name,
        location_id: categoryForm.location_id
      });
      if (response.status === 201) {
        useMenuStore.getState().addCategory(response.data);
        setCategoryForm({ name: '', location_id: undefined });
        setShowCategoryModal(false);
        setError(null);
        alert('Category created successfully');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Error creating category');
      console.error('Error creating category:', err);
    }
  };

  // First, add this helper function to check if a user can delete a category
  const canDeleteCategory = (locationId: number) => {
    if (user?.is_super_admin) return true;
    if (user?.is_franchise_admin) {
      return locations.some(loc => loc.id === locationId);
    }
    return false;
  };

  // Update the handleDeleteCategory function
  const handleDeleteCategory = async (categoryId: number, locationId: number, categoryName: string) => {
    // Check if user has permission to delete categories
    if (!user?.is_super_admin && !user?.is_franchise_admin) {
      setError('Only super admins and franchise admins can delete categories');
      return;
    }

    // Check if franchise admin has access to this location
    if (user?.is_franchise_admin && !locations.some(loc => loc.id === locationId)) {
      setError('You can only delete categories from your assigned locations');
      return;
    }

    if (window.confirm(`Are you sure you want to delete the category "${categoryName}"? All menu items in this category will also be deleted.`)) {
      try {
        const result = await useMenuStore.getState().deleteCategory(categoryId, locationId);
        if (result.success) {
          setError(null);
          if (selectedCategory === categoryName) {
            setSelectedCategory('all');
          }
          setShowDeleteCategoryDropdown(false);
          alert('Category deleted successfully');
        } else {
          setError(result.error || 'Failed to delete category');
        }
      } catch (err: any) {
        setError(err.response?.data?.message || err.message || 'Error deleting category');
      }
    }
  };

  const filteredMenuItems = menuItems.filter(
    (item) =>
      (selectedLocation === 'all' || String(item.location_id) === selectedLocation) &&
      (selectedCategory === 'all' || item.category === selectedCategory) &&
      ((item.name || '').toLowerCase().includes((searchTerm || '').toLowerCase()) ||
        ((item.category || '').toLowerCase().includes((searchTerm || '').toLowerCase())))
  );

  const categoryOptions = getCategoriesForLocation(selectedLocation);

  // Check if user can edit a menu item
  const canEditMenuItem = (item: { location_id: number }) => {
    if (user?.is_super_admin) return true;
    if (user?.is_franchise_admin) {
      return locations.some(loc => loc.id === item.location_id);
    }
    return false;
  };

  // Check if user can add menu items or categories
  const canAddItems = user?.is_super_admin || user?.is_franchise_admin;

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
            value={selectedCategory}
            onChange={handleCategoryChange}
            className="px-4 py-2 border border-gray-300 rounded-md"
            disabled={selectedLocation === 'all'}
          >
            <option value="all">All Categories</option>
            {categoryOptions.map((cat) => (
              <option key={cat.id} value={cat.name}>{cat.name}</option>
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
        <div className="flex flex-col gap-2">
          {canAddItems ? (
            <div className="flex gap-2">
              <button
                onClick={() => setShowCategoryModal(true)}
                className="flex items-center justify-center gap-2 bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition-colors"
              >
                <FaFolderPlus size={14} />
                <span>Add Category</span>
              </button>
              <div className="relative">
                <button
                  onClick={() => setShowDeleteCategoryDropdown(!showDeleteCategoryDropdown)}
                  className="flex items-center justify-center gap-2 bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition-colors"
                >
                  <FaTrash size={14} />
                  <span>Delete Category</span>
                </button>
                {showDeleteCategoryDropdown && selectedLocation !== 'all' && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                    <div className="py-1">
                      {categoryOptions.length > 0 ? (
                        categoryOptions.map((cat) => {
                          const canDelete = canDeleteCategory(cat.location_id);
                          return (
                            <button
                              key={cat.id}
                              onClick={() => {
                                if (canDelete) {
                                  handleDeleteCategory(cat.id, cat.location_id, cat.name);
                                }
                                setShowDeleteCategoryDropdown(false);
                              }}
                              className={`w-full text-left px-4 py-2 text-sm ${
                                canDelete 
                                  ? 'text-gray-700 hover:bg-gray-100' 
                                  : 'text-gray-400 cursor-not-allowed'
                              }`}
                              disabled={!canDelete}
                              title={!canDelete ? "You don't have permission to delete this category" : ""}
                            >
                              {cat.name}
                              {!canDelete && (
                                <span className="ml-2 text-xs text-gray-400">(No permission)</span>
                              )}
                            </button>
                          );
                        })
                      ) : (
                        <div className="px-4 py-2 text-sm text-gray-500">
                          No categories available
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
              <button
                onClick={handleAddMenuItem}
                className="flex items-center justify-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors"
              >
                <FaPlus size={14} />
                <span>Add Menu Item</span>
              </button>
            </div>
          ) : (
            <p className="text-sm text-gray-600">
              Only super admins and franchise admins can add menu items or categories.
            </p>
          )}
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-100 text-red-700 rounded-lg">
          {error}
        </div>
      )}

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
                    {canEditMenuItem(item) ? (
                      <button 
                        onClick={() => handleEditMenuItem(item)}
                        className="text-blue-500 hover:text-blue-700"
                      >
                        <FaEdit size={18} />
                      </button>
                    ) : (
                      <span
                        className="text-gray-400 cursor-not-allowed"
                        title="Only super admins or assigned franchise admins can edit this menu item"
                      >
                        <FaEdit size={18} />
                      </span>
                    )}
                    {user?.is_super_admin || (user?.is_franchise_admin && locations.some(loc => loc.id === item.location_id)) ? (
                      <button 
                        onClick={() => handleDeleteMenuItem(item.id, item.location_id, item.category)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <FaTrash size={18} />
                      </button>
                    ) : (
                      <span
                        className="text-gray-400 cursor-not-allowed"
                        title="Only super admins or assigned franchise admins can delete this menu item"
                      >
                        <FaTrash size={18} />
                      </span>
                    )}
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
                    value={formData.category_id !== undefined ? String(formData.category_id) : ''}
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
                    value={formData.location_id !== undefined ? String(formData.location_id) : ''}
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
              {error && (
                <div className="mt-4 text-red-600 text-sm">{error}</div>
              )}
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
                    value={categoryForm.location_id !== undefined ? String(categoryForm.location_id) : ''}
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
              {error && (
                <div className="mt-4 text-red-600 text-sm">{error}</div>
              )}
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
    </div>
  );
};

export default MenuItems;