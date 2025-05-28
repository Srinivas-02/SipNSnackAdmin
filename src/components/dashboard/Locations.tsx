import { FaPlus, FaTrash, FaTimes, FaMapMarkerAlt, FaBuilding, FaUserShield, FaEdit } from 'react-icons/fa';
import useLocationStore from '../../store/location';
import useAccountStore from '../../store/account';
import { useState, useEffect } from 'react';

// Define Location type to match backend LocationModel
interface Location {
  id: number;
  name: string;
  address: string;
  city: string;
  state: string;
  phone: string | number;
  password?: string;
  status: 'active' | 'inactive' | 'pending';
}

function isApiError(err: unknown): err is { response: { data: { error?: string; message?: string } } } {
  if (
    typeof err === 'object' &&
    err !== null &&
    'response' in err
  ) {
    const response = (err as { response?: unknown }).response;
    if (
      typeof response === 'object' &&
      response !== null &&
      'data' in response
    ) {
      const data = (response as { data?: unknown }).data;
      if (
        typeof data === 'object' &&
        data !== null &&
        ('error' in data || 'message' in data)
      ) {
        return true;
      }
    }
  }
  return false;
}

const Locations = () => {
  const [cpassword, setcpassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const locations = useLocationStore((state) => state.locations) || [];
  const franchiseAdmins = useLocationStore((state) => state.franchiseAdmins) || [];
  const loading = useLocationStore((state) => state.loading);
  const fetchFranchiseAdmins = useLocationStore((state) => state.fetchFranchiseAdmins);
  const addLocation = useLocationStore((state) => state.addLocation);
  const updateLocation = useLocationStore((state) => state.updateLocation);
  const deleteLocation = useLocationStore((state) => state.deleteLocation);
  const { user } = useAccountStore();
  const [showModal, setShowModal] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<Location | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState<{
    id?: number;
    name: string;
    address: string;
    city: string;
    state: string;
    phone: string;
    password?: string;
    status: 'active' | 'inactive' | 'pending';
  }>({
    name: '',
    address: '',
    city: '',
    state: '',
    phone: '',
    password: '',
    status: 'active'
  });

  useEffect(() => {
    fetchFranchiseAdmins().catch((err) => {
      console.error('Failed to fetch franchise admins:', err);
      setError('Failed to load franchise admins');
    });
  }, [fetchFranchiseAdmins]);

  useEffect(() => {
    if (!showModal) {
      setFormData({
        name: '',
        address: '',
        city: '',
        state: '',
        phone: '',
        password: '',
        status: 'active'
      });
      setcpassword('');
      setError('');
      setCurrentLocation(null);
    }
  }, [showModal]);

  const handleAddLocation = () => {
    setCurrentLocation(null);
    setFormData({
      name: '',
      address: '',
      city: '',
      state: '',
      phone: '',
      password: '',
      status: 'active'
    });
    setError('');
    setcpassword('');
    setShowModal(true);
  };

  const handleEditLocation = (location: Location) => {
    setCurrentLocation(location);
    setFormData({
      id: location.id,
      name: location.name,
      address: location.address,
      city: location.city,
      state: location.state,
      phone: location.phone.toString(),
      password: '',
      status: location.status
    });
    setcpassword('');
    setError('');
    setShowModal(true);
  };

  const handleDeleteLocation = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this location?')) {
      try {
        await deleteLocation(id);
      } catch (err: unknown) {
        console.error('Failed to delete location:', err);
        if (isApiError(err)) {
          setError(err.response?.data?.error || err.response?.data?.message || 'Failed to delete location');
        } else {
          setError('Failed to delete location');
        }
      }
    }
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (formData.password && formData.password !== cpassword) {
      setError('Passwords do not match');
      return;
    }
    try {
      if (currentLocation) {
        const payload = { ...formData, id: currentLocation.id };
        await updateLocation(payload);
        setShowModal(false);
      } else {
        const newLocation = await addLocation(formData);
        if (newLocation) {
          setShowModal(false);
        }
      }
      setFormData({
        name: '',
        address: '',
        city: '',
        state: '',
        phone: '',
        password: '',
        status: 'active'
      });
      setcpassword('');
    } catch (err: unknown) {
      console.error('API error:', err);
      if (isApiError(err)) {
        setError(err.response.data.error || err.response.data.message || 'Failed to process request');
      } else {
        setError(currentLocation ? 'Failed to update location' : 'Failed to add location');
      }
    }
  };

  const filteredLocations = locations.filter(
    location =>
      (location.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (location.address?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  // Determine if user can edit a specific location
  const canEditLocation = (location: Location) => {
    if (user?.is_super_admin) return true;
    if (user?.is_franchise_admin) {
      // Check if the location is assigned to the franchise admin
      return franchiseAdmins.some(
        admin => admin.email === user.email && admin.locations.some(loc => loc.id === location.id)
      );
    }
    return false;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Manage Locations</h1>
        <p className="mt-2 text-sm text-gray-600">Add, edit, or remove business locations from your account.</p>
      </div>

      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FaMapMarkerAlt className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search locations..."
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full md:w-80 focus:ring-blue-500 focus:border-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-3">
          {user?.is_super_admin && (
            <button
              onClick={handleAddLocation}
              className="flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
            >
              <FaPlus size={14} />
              <span>Add New Location</span>
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">City</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">State</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Address</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Franchise Admins</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredLocations.length > 0 ? (
                filteredLocations.map((location) => (
                  <tr key={location.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center bg-blue-100 rounded-full">
                          <FaBuilding className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{location.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{location.city}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{location.state}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{location.address}</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col space-y-1 text-sm text-gray-500">
                        {franchiseAdmins
                          .filter(admin => admin.locations.some(loc => loc.id === location.id))
                          .map(admin => (
                            <div key={admin.id} className="flex items-center space-x-1">
                              <FaUserShield className="text-green-500" size={12} />
                              <span>{admin.first_name} {admin.last_name} ({admin.email})</span>
                            </div>
                          ))}
                        {!franchiseAdmins.some(admin => admin.locations.some(loc => loc.id === location.id)) && (
                          <span className="text-gray-400 italic">No admins assigned</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex space-x-3">
                        {canEditLocation(location) && (
                          <button
                            onClick={() => handleEditLocation(location)}
                            className="text-blue-600 hover:text-blue-800"
                            aria-label="Edit location"
                          >
                            <FaEdit size={18} />
                          </button>
                        )}
                        {user?.is_super_admin && (
                          <button
                            onClick={() => handleDeleteLocation(location.id)}
                            className="text-red-600 hover:text-red-800"
                            aria-label="Delete location"
                          >
                            <FaTrash size={18} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-sm text-gray-500 text-center">
                    {loading ? 'Loading locations...' : 'No locations found matching your search'}
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
          <div className="bg-white rounded-lg p-6 w-full max-w-lg max-h-90vh overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-gray-900">
                {currentLocation ? 'Edit Location' : 'Add New Location'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
                aria-label="Close modal"
              >
                <FaTimes size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleFormChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter location name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Street Address
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleFormChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Street, Building number, etc."
                  required
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleFormChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter city"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    State
                  </label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleFormChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter state"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone
                  </label>
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleFormChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter phone"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password || ''}
                    onChange={handleFormChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter password"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    name="confirm_password"
                    value={cpassword}
                    onChange={(e) => {
                      setcpassword(e.target.value);
                      if (error) setError(null);
                    }}
                    onBlur={() => {
                      if (formData.password && formData.password !== cpassword) {
                        setError('Passwords do not match');
                      } else {
                        setError(null);
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Confirm Password"
                  />
                </div>
              </div>
              {error && (
                <div className="text-red-600 text-sm mb-2">{error}</div>
              )}
              <div className="pt-4 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500${
                    Boolean(formData.password && formData.password !== cpassword) ? ' opacity-50 cursor-not-allowed' : ''
                  }`}
                  disabled={Boolean(formData.password && formData.password !== cpassword)}
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