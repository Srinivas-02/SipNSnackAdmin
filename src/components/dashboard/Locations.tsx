import { FaPlus, FaTrash, FaTimes, FaPhone, FaMapMarkerAlt, FaBuilding, FaUserShield, FaEdit } from 'react-icons/fa';
import useLocationStore,{Location} from '../../store/location'
import useAccountStore from '../../store/account'
import { useState, useEffect } from 'react';
import api from '../../common/api'
import Select from 'react-select';
import toast from 'react-hot-toast';
import { State, City } from 'country-state-city';

function isApiError(err: unknown): err is { response: { data: { message: string } } } {
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
        'message' in data &&
        typeof (data as { message?: unknown }).message === 'string'
      ) {
        return true;
      }
    }
  }
  return false;
}

const Locations = () => {
  const [cpassword, setcpassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const locations = useLocationStore((state) => state.locations) || [];
  const franchiseAdmins = useLocationStore((state) => state.franchiseAdmins) || [];
  const loading = useLocationStore((state) => state.loading);
  const fetchFranchiseAdmins = useLocationStore((state) => state.fetchFranchiseAdmins);
  const addFranchiseAdmin = useLocationStore((state) => state.addFranchiseAdmin);
  const user = useAccountStore((state) => state.user)
  const setLocations = useLocationStore((state) => state.setLocations);
  const [showModal, setShowModal] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<Location | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState<{
    name: string;
    city: string;
    state: string;
    address: string;
    phone: string | number | null;
    password: string;
  }>({
    name: '',
    city: '',
    state: '',
    address: '',
    phone: null,
    password: '',
  });

  const [adminFormData, setAdminFormData] = useState<{
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    location_ids: number[];
  }>({
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    location_ids: [],
  });

  // Add this new type for the select options
  type LocationOption = {
    value: number;
    label: string;
  };

  // Convert locations to select options
  const locationOptions: LocationOption[] = locations.map(location => ({
    value: location.id,
    label: `${location.name} (${location.city}, ${location.state})`
  }));

  // Add this function to handle react-select changes
  const handleLocationSelectChange = (selectedOptions: readonly LocationOption[] | null) => {
    setAdminFormData(prev => ({
      ...prev,
      location_ids: selectedOptions ? selectedOptions.map(option => option.value) : []
    }));
  };

  // Add new state for Indian states and cities
  const [indianStates, setIndianStates] = useState<Array<{ value: string; label: string }>>([]);
  const [indianCities, setIndianCities] = useState<Array<{ value: string; label: string }>>([]);
  const [selectedState, setSelectedState] = useState<string | null>(null);

  // Initialize Indian states
  useEffect(() => {
    const states = State.getStatesOfCountry('IN').map(state => ({
      value: state.isoCode,
      label: state.name
    }));
    setIndianStates(states);
  }, []);

  // Update cities when state changes
  useEffect(() => {
    if (selectedState) {
      const cities = City.getCitiesOfState('IN', selectedState).map(city => ({
        value: city.name,
        label: city.name
      }));
      setIndianCities(cities);
    } else {
      setIndianCities([]);
    }
  }, [selectedState]);

  useEffect(() => {
    // Fetch franchise admins when component mounts
    fetchFranchiseAdmins().catch(console.error);
  }, [fetchFranchiseAdmins]);

  useEffect(() => {
    if (!showModal) {
      setFormData({ name: '', city: '', state: '', address: '', phone: null , password: '' });
      setcpassword('')
      setError('')
      setCurrentLocation(null);
    }
  }, [showModal]);

  useEffect(() => {
    if (!showAdminModal) {
      setAdminFormData({
        email: '',
        password: '',
        first_name: '',
        last_name: '',
        location_ids: [],
      });
      setcpassword('')
      setError('')
    }
  }, [showAdminModal]);

  const handleAddLocation = () => {
    setCurrentLocation(null);
    setFormData({ name: '', city: '', state: '', address: '', phone: null , password: ''});
    setError('')
    setcpassword('')
    setShowModal(true);
  };

  const handleAddAdmin = () => {
    setError('')
    setcpassword('')
    setShowAdminModal(true);
  };

  const handleEditLocation = (location: Location) => {
    setCurrentLocation(location);
    setFormData({
      name: location.name,
      city: location.city,
      state: location.state,
      address: location.address,
      phone: location.phone as number, // Cast to number since we know it's a number in the form
      password: '', // Password is not pre-filled for security reasons
    });
    setShowModal(true);
  };

  const handleDeleteLocation = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this location?')) {
      try {
        await api.delete(`/locations/?id=${id}`);
        setLocations(locations.filter(location => location.id !== id));
        toast.success('Location deleted successfully');
      } catch (err: unknown) {
        console.error('Failed to delete location', err);
        if (isApiError(err)) {
          toast.error(`Error: ${err.response.data.message}`);
        } else {
          toast.error('Failed to delete location. Please try again later.');
        }
      }
    }
  };
  

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === 'phone') {
      // Only allow numeric input for phone
      const numericValue = value.replace(/\D/g, '');
      setFormData({ ...formData, [name]: numericValue ? Number(numericValue) : null });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleAdminFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setAdminFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (formData.password !== cpassword) {
      setError('Passwords do not match');
      return;
    }

    // Ensure phone is not null before submitting
    if (formData.phone === null) {
      setError('Phone number is required');
      return;
    }

    try {
      const submitData = {
        ...formData,
        phone: formData.phone, // This will be either string or number, but not null
      };

      if (currentLocation) {
        // Update existing location
        const response = await api.patch('/locations/', {
          ...submitData,
          id: currentLocation.id // Include id in the request body instead of URL
        });
        if (response && response.data) {
          setLocations(locations.map(loc => 
            loc.id === currentLocation.id 
              ? { ...loc, ...submitData }
              : loc
          ));
          setShowModal(false);
          setFormData({ name: '', city: '', state: '', address: '', phone: null, password: '' });
          setcpassword('');
          setCurrentLocation(null);
        }
      } else {
        // Create new location
        const response = await api.post('/locations/', submitData);
        if (response && response.data) {
          setLocations([...locations, { id: response.data.id, ...submitData }] as Location[]);
          setShowModal(false);
          setFormData({ name: '', city: '', state: '', address: '', phone: null, password: '' });
          setcpassword('');
        }
      }
    } catch (err: unknown) {
      if (isApiError(err)) {
        setError(err.response.data.message);
      } else {
        setError(currentLocation ? 'Failed to update location' : 'Failed to add location');
      }
      console.log(err);
    }
  };

  const handleAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (adminFormData.password !== cpassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (adminFormData.location_ids.length === 0) {
      setError('Please select at least one location');
      return;
    }
    
    try {
      await addFranchiseAdmin(adminFormData);
      setShowAdminModal(false);
      setAdminFormData({
        email: '',
        password: '',
        first_name: '',
        last_name: '',
        location_ids: [],
      });
      setcpassword('');
    } catch (err: unknown) {
      if (isApiError(err)) {
        setError(err.response.data.message);
      } else {
        setError('Failed to add franchise admin');
      }
      console.log(err);
    }
  };

  const filteredLocations = locations.filter(
    location =>
      location.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      location.address.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
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
          {user?.is_super_admin && <button
            onClick={handleAddLocation}
            className="flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
          >
            <FaPlus size={14} />
            <span>Add New Location</span>
          </button>}
          
          {user?.is_super_admin && <button
            onClick={handleAddAdmin}
            className="flex items-center justify-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors shadow-sm"
          >
            <FaUserShield size={14} />
            <span>Add Franchise Admin</span>
          </button>}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">City</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">State</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Address</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
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
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-500">
                        <FaPhone className="mr-2 text-gray-400" size={14} />
                        {location.phone}
                      </div>
                    </td>
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
                        <button 
                          onClick={() => handleEditLocation(location)}
                          className="text-blue-600 hover:text-blue-800"
                          aria-label="Edit location"
                        >
                          <FaEdit size={18} />
                        </button>
                        <button 
                          onClick={() => handleDeleteLocation(location.id)}
                          className="text-red-600 hover:text-red-800"
                          aria-label="Delete location"
                        >
                          <FaTrash size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-sm text-gray-500 text-center">
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleFormChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter password"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    name="confirm_password"
                    value={cpassword}
                    onChange={(e) => { setcpassword(e.target.value); if (error) setError(null); }}
                    onBlur={() => {
                      if (formData.password !== cpassword) {
                        setError('Passwords do not match');
                      } else {
                        setError(null);
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Confirm Password"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <div className="flex items-center">
                  <div className="relative w-full">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaPhone className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone === null ? '' : formData.phone}
                      onChange={handleFormChange}
                      className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Phone number"
                      pattern="[0-9]*"
                      inputMode="numeric"
                      required
                    />
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    State
                  </label>
                  <Select
                    options={indianStates}
                    value={indianStates.find(state => state.label === formData.state)}
                    onChange={(selected) => {
                      setSelectedState(selected?.value || null);
                      setFormData(prev => ({
                        ...prev,
                        state: selected?.label || '',
                        city: '' // Reset city when state changes
                      }));
                    }}
                    className="basic-select"
                    classNamePrefix="select"
                    placeholder="Select state..."
                    isClearable
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    City
                  </label>
                  <Select
                    options={indianCities}
                    value={indianCities.find(city => city.label === formData.city)}
                    onChange={(selected) => {
                      setFormData(prev => ({
                        ...prev,
                        city: selected?.label || ''
                      }));
                    }}
                    className="basic-select"
                    classNamePrefix="select"
                    placeholder="Select city..."
                    isClearable
                    isDisabled={!selectedState}
                  />
                </div>
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
                  className={`px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500${formData.password !== cpassword ? ' opacity-50 cursor-not-allowed' : ''}`}
                  disabled={formData.password !== cpassword}
                >
                  {currentLocation ? 'Update' : 'Add'} Location
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Franchise Admin Modal */}
      {showAdminModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg max-h-90vh overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-gray-900">
                Add Franchise Admin
              </h3>
              <button 
                onClick={() => setShowAdminModal(false)}
                className="text-gray-400 hover:text-gray-600"
                aria-label="Close modal"
              >
                <FaTimes size={20} />
              </button>
            </div>
            <form onSubmit={handleAdminSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    First Name
                  </label>
                  <input
                    type="text"
                    name="first_name"
                    value={adminFormData.first_name}
                    onChange={handleAdminFormChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter first name"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name
                  </label>
                  <input
                    type="text"
                    name="last_name"
                    value={adminFormData.last_name}
                    onChange={handleAdminFormChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter last name"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={adminFormData.email}
                  onChange={handleAdminFormChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Email address"
                  required
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={adminFormData.password}
                    onChange={handleAdminFormChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter password"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    name="confirm_password"
                    value={cpassword}
                    onChange={(e) => { setcpassword(e.target.value); if (error) setError(null); }}
                    onBlur={() => {
                      if (adminFormData.password !== cpassword) {
                        setError('Passwords do not match');
                      } else {
                        setError(null);
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Confirm Password"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Assign Locations
                </label>
                <Select
                  isMulti
                  name="location_ids"
                  options={locationOptions}
                  className="basic-multi-select"
                  classNamePrefix="select"
                  value={locationOptions.filter(option => 
                    adminFormData.location_ids.includes(option.value)
                  )}
                  onChange={handleLocationSelectChange}
                  placeholder="Select locations..."
                  isSearchable={true}
                  styles={{
                    control: (base) => ({
                      ...base,
                      minHeight: '42px',
                      borderColor: '#D1D5DB',
                      '&:hover': {
                        borderColor: '#9CA3AF'
                      }
                    }),
                    multiValue: (base) => ({
                      ...base,
                      backgroundColor: '#EFF6FF',
                      borderRadius: '0.375rem'
                    }),
                    multiValueLabel: (base) => ({
                      ...base,
                      color: '#1D4ED8',
                      padding: '2px 6px'
                    }),
                    multiValueRemove: (base) => ({
                      ...base,
                      color: '#1D4ED8',
                      ':hover': {
                        backgroundColor: '#DBEAFE',
                        color: '#1E40AF'
                      }
                    })
                  }}
                />
                <p className="mt-1 text-sm text-gray-500">Search and select multiple locations</p>
              </div>
              
              {error && (
                <div className="text-red-600 text-sm mb-2">{error}</div>
              )}
              
              <div className="pt-4 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowAdminModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500${adminFormData.password !== cpassword || loading ? ' opacity-50 cursor-not-allowed' : ''}`}
                  disabled={adminFormData.password !== cpassword || loading}
                >
                  {loading ? 'Adding...' : 'Add Franchise Admin'}
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