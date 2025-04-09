import { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaTimes } from 'react-icons/fa';

// Mock data
const initialLocations = [
  { id: '1', name: 'Downtown Café', address: '123 Main St, Downtown', phone: '555-1234', status: 'Active' },
  { id: '2', name: 'Beach Corner', address: '456 Ocean Ave, Beachside', phone: '555-5678', status: 'Active' },
  { id: '3', name: 'Central Mall', address: '789 Mall Road, Central District', phone: '555-9012', status: 'Active' },
  { id: '4', name: 'Park Kiosk', address: '321 Park Lane, Green Park', phone: '555-3456', status: 'Inactive' },
  { id: '5', name: 'University Campus', address: '654 University Blvd, College Area', phone: '555-7890', status: 'Active' },
];

interface Location {
  id: string;
  name: string;
  address: string;
  phone: string;
  status: 'Active' | 'Inactive';
}

const Locations = () => {
  const [locations, setLocations] = useState<Location[]>(initialLocations);
  const [showModal, setShowModal] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<Location | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState<Omit<Location, 'id'>>({
    name: '',
    address: '',
    phone: '',
    status: 'Active',
  });

  // In a real app, would fetch from API
  useEffect(() => {
    // const fetchLocations = async () => {
    //   try {
    //     const response = await fetch('/api/locations');
    //     const data = await response.json();
    //     setLocations(data);
    //   } catch (error) {
    //     console.error('Error fetching locations:', error);
    //   }
    // };
    // fetchLocations();
  }, []);

  const handleAddLocation = () => {
    setCurrentLocation(null);
    setFormData({
      name: '',
      address: '',
      phone: '',
      status: 'Active',
    });
    setShowModal(true);
  };

  const handleEditLocation = (location: Location) => {
    setCurrentLocation(location);
    setFormData({
      name: location.name,
      address: location.address,
      phone: location.phone,
      status: location.status,
    });
    setShowModal(true);
  };

  const handleDeleteLocation = (id: string) => {
    if (window.confirm('Are you sure you want to delete this location?')) {
      // In a real app, would call API to delete
      setLocations(locations.filter(location => location.id !== id));
    }
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (currentLocation) {
      // Edit existing location
      // In a real app, would call API to update
      setLocations(
        locations.map(location => 
          location.id === currentLocation.id 
            ? { ...location, ...formData } 
            : location
        )
      );
    } else {
      // Add new location
      const newLocation: Location = {
        id: Date.now().toString(), // In a real app, the ID would come from the backend
        ...formData,
      };
      // In a real app, would call API to create
      setLocations([...locations, newLocation]);
    }
    
    setShowModal(false);
  };

  const filteredLocations = locations.filter(
    location => 
      location.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      location.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Search locations..."
            className="px-4 py-2 border border-gray-300 rounded-md w-full md:w-80"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button
          onClick={handleAddLocation}
          className="flex items-center justify-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors"
        >
          <FaPlus size={14} />
          <span>Add New Location</span>
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Address</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredLocations.length > 0 ? (
                filteredLocations.map((location) => (
                  <tr key={location.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{location.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{location.address}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{location.phone}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        location.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {location.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => handleEditLocation(location)}
                          className="text-blue-500 hover:text-blue-700"
                        >
                          <FaEdit size={18} />
                        </button>
                        <button 
                          onClick={() => handleDeleteLocation(location.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <FaTrash size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-sm text-gray-500 text-center">
                    No locations found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Location Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 w-full max-w-md">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold">
                {currentLocation ? 'Edit Location' : 'Add New Location'}
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
                    Location Name
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
                    Address
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleFormChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleFormChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleFormChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
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
                  {currentLocation ? 'Update' : 'Add'} Location
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Locations; 