import { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaTimes, FaImage } from 'react-icons/fa';

// Mock data
const initialLocations = [
  { id: '1', name: 'Downtown Café' },
  { id: '2', name: 'Beach Corner' },
  { id: '3', name: 'Central Mall' },
  { id: '4', name: 'Park Kiosk' },
  { id: '5', name: 'University Campus' },
];

const initialMenuItems = [
  { 
    id: '1', 
    name: 'Classic Cappuccino', 
    description: 'Espresso with steamed milk and a deep layer of foam', 
    price: 4.50, 
    category: 'Coffee',
    image: 'https://images.unsplash.com/photo-1534778101976-62847782c213?q=80&w=150&auto=format&fit=crop',
    locationId: '1' 
  },
  { 
    id: '2', 
    name: 'Blueberry Muffin', 
    description: 'Moist muffin loaded with blueberries', 
    price: 3.25, 
    category: 'Bakery',
    image: 'https://images.unsplash.com/photo-1599583863916-e06c29087f51?q=80&w=150&auto=format&fit=crop',
    locationId: '1' 
  },
  { 
    id: '3', 
    name: 'Iced Latte', 
    description: 'Cold espresso with milk and ice', 
    price: 5.00, 
    category: 'Coffee',
    image: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?q=80&w=150&auto=format&fit=crop',
    locationId: '2' 
  },
  { 
    id: '4', 
    name: 'Avocado Toast', 
    description: 'Fresh avocado on toasted sourdough', 
    price: 7.95, 
    category: 'Food',
    image: 'https://images.unsplash.com/photo-1603046891653-54f45c6ac7e6?q=80&w=150&auto=format&fit=crop',
    locationId: '3' 
  },
  { 
    id: '5', 
    name: 'Fresh Fruit Cup', 
    description: 'Seasonal mixed fruits', 
    price: 4.99, 
    category: 'Food',
    image: 'https://images.unsplash.com/photo-1568158879083-c42860933ed7?q=80&w=150&auto=format&fit=crop',
    locationId: '5' 
  },
];

interface Location {
  id: string;
  name: string;
}

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  locationId: string;
}

const MenuItems = () => {
  const [locations, setLocations] = useState<Location[]>(initialLocations);
  const [menuItems, setMenuItems] = useState<MenuItem[]>(initialMenuItems);
  const [selectedLocation, setSelectedLocation] = useState<string>('all');
  const [showModal, setShowModal] = useState(false);
  const [currentItem, setCurrentItem] = useState<MenuItem | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState<Omit<MenuItem, 'id'>>({
    name: '',
    description: '',
    price: 0,
    category: '',
    image: '',
    locationId: '',
  });

  // In a real app, would fetch from API
  useEffect(() => {
    // const fetchData = async () => {
    //   try {
    //     const locationsResponse = await fetch('/api/locations');
    //     const locationsData = await locationsResponse.json();
    //     setLocations(locationsData);
    //
    //     const menuItemsResponse = await fetch('/api/menu-items');
    //     const menuItemsData = await menuItemsResponse.json();
    //     setMenuItems(menuItemsData);
    //   } catch (error) {
    //     console.error('Error fetching data:', error);
    //   }
    // };
    // fetchData();
  }, []);

  const handleAddMenuItem = () => {
    setCurrentItem(null);
    setFormData({
      name: '',
      description: '',
      price: 0,
      category: '',
      image: '',
      locationId: selectedLocation !== 'all' ? selectedLocation : '',
    });
    setShowModal(true);
  };

  const handleEditMenuItem = (item: MenuItem) => {
    setCurrentItem(item);
    setFormData({
      name: item.name,
      description: item.description,
      price: item.price,
      category: item.category,
      image: item.image,
      locationId: item.locationId,
    });
    setShowModal(true);
  };

  const handleDeleteMenuItem = (id: string) => {
    if (window.confirm('Are you sure you want to delete this menu item?')) {
      // In a real app, would call API to delete
      setMenuItems(menuItems.filter(item => item.id !== id));
    }
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const updatedValue = name === 'price' ? parseFloat(value) : value;
    setFormData({ ...formData, [name]: updatedValue });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (currentItem) {
      // Edit existing item
      // In a real app, would call API to update
      setMenuItems(
        menuItems.map(item => 
          item.id === currentItem.id 
            ? { ...item, ...formData } 
            : item
        )
      );
    } else {
      // Add new item
      const newItem: MenuItem = {
        id: Date.now().toString(),
        ...formData,
      };
      // In a real app, would call API to create
      setMenuItems([...menuItems, newItem]);
    }
    
    setShowModal(false);
  };

  const filteredMenuItems = menuItems.filter(
    item => 
      (selectedLocation === 'all' || item.locationId === selectedLocation) &&
      (item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
       item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
       item.category.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div className="flex flex-col md:flex-row gap-4">
          <select
            value={selectedLocation}
            onChange={(e) => setSelectedLocation(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md"
          >
            <option value="all">All Locations</option>
            {locations.map((location) => (
              <option key={location.id} value={location.id}>{location.name}</option>
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
        
        <button
          onClick={handleAddMenuItem}
          className="flex items-center justify-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors"
        >
          <FaPlus size={14} />
          <span>Add Menu Item</span>
        </button>
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
                    <p className="text-sm text-gray-500 mt-1">{locations.find(l => l.id === item.locationId)?.name}</p>
                  </div>
                  <p className="text-lg font-bold">${item.price.toFixed(2)}</p>
                </div>
                <p className="text-sm text-gray-600 mt-2">{item.description}</p>
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
                    Price ($)
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
                  <input
                    type="text"
                    name="category"
                    value={formData.category}
                    onChange={handleFormChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Image URL
                  </label>
                  <input
                    type="text"
                    name="image"
                    value={formData.image}
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
                    name="locationId"
                    value={formData.locationId}
                    onChange={handleFormChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                  >
                    <option value="">Select a location</option>
                    {locations.map((location) => (
                      <option key={location.id} value={location.id}>{location.name}</option>
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
    </div>
  );
};

export default MenuItems; 