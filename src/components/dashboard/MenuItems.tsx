import { useState } from 'react';
import { FaPlus, FaEdit, FaTrash, FaTimes, FaImage, FaFolderPlus } from 'react-icons/fa';
import useLocationStore from '../../store/location';
import useMenuStore from '../../store/menu';

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
  } | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState<{
    name: string;
    price: number;
    category: string;
    image?: string | null;
    location_id?: number;
    description?: string;
  }>({
    name: '',
    price: 0,
    category: '',
    image: '',
    location_id: undefined,
    description: '',
  });
  const [categoryForm, setCategoryForm] = useState<{
    name: string;
    location_id?: number;
    // display_order: number;
  }>({
    name: '',
    location_id: undefined,
    // display_order: 2,
  });

  // Handle location change: reset category if location changes
  const handleLocationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedLocation(e.target.value);
    setSelectedCategory('all');
    setFormData((prev) => ({ ...prev, location_id: e.target.value !== 'all' ? Number(e.target.value) : undefined, category: '' }));
  };

  // Handle category change
  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCategory(e.target.value);
  };

  const handleAddMenuItem = () => {
    setCurrentItem(null);
    setFormData({
      name: '',
      price: 0,
      category: '',
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
  }) => {
    setCurrentItem(item);
    setFormData({
      name: item.name,
      price: item.price,
      category: item.category,
      image: item.image ?? '',
      location_id: item.location_id,
      description: item.description ?? '',
    });
    setShowModal(true);
  };

  // Linter: id is defined but never used (API integration needed)
  const handleDeleteMenuItem = (id: number) => {
    if (window.confirm('Are you sure you want to delete this menu item?')) {
      // In a real app, would call API to delete
    }
  };

  // Linter: Unexpected any. Specify a different type.
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    let updatedValue: string | number | undefined = value;
    if (name === 'price') updatedValue = parseFloat(value);
    if (name === 'location_id') updatedValue = value ? Number(value) : undefined;
    setFormData({ ...formData, [name]: updatedValue });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // API integration for add/edit menu item goes here
    setShowModal(false);
  };

  // Category modal handlers
  const handleCategoryFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    let updatedValue: string | number | undefined = value;
    if (name === 'location_id') updatedValue = value ? Number(value) : undefined;
    setCategoryForm({ ...categoryForm, [name]: updatedValue });
  };

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    // API integration for add category goes here
    setShowCategoryModal(false);
  };

  // Filter menu items by location and category
  const filteredMenuItems = menuItems.filter(
    (item) =>
      (selectedLocation === 'all' || String(item.location_id) === selectedLocation) &&
      (selectedCategory === 'all' || item.category === selectedCategory) &&
      (item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.category || '').toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Get categories for filter dropdown
  const categoryOptions = getCategoriesForLocation(selectedLocation);

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
            disabled={selectedLocation === 'all'}
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
                    name="category"
                    value={formData.category}
                    onChange={handleFormChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                    disabled={!formData.location_id}
                  >
                    <option value="">Select a category</option>
                    {getCategoriesForLocation(formData.location_id).map((cat) => (
                      <option key={cat.id} value={cat.name}>{cat.name}</option>
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
                {/*
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
                    min="1"
                  />
                </div>
                */}
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
    </div>
  );
};

export default MenuItems; 