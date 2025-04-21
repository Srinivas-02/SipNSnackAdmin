import { CountrySelect, StateSelect, CitySelect, PhonecodeSelect } from 'react-country-state-city';
import 'react-country-state-city/dist/react-country-state-city.css';
import { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaTimes, FaPhone, FaMapMarkerAlt, FaBuilding } from 'react-icons/fa';
import useLocationStore from '../../store/location'

interface Location {
  id: number,
    name: string,
    city: string,
    state: string,
    address: string,
    phone: number
}

const Locations = () => {
  const locations = useLocationStore((state) => state.locations)
  const [showModal, setShowModal] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<Location | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Country-state-city selection states
  const [countryCode, setCountryCode] = useState<string>('');
  const [countryName, setCountryName] = useState<string>('');
  const [stateCode, setStateCode] = useState<string>('');
  const [stateName, setStateName] = useState<string>('');
  const [cityCode, setCityCode] = useState<string>('');
  const [cityName, setCityName] = useState<string>('');
  const [phoneCode, setPhoneCode] = useState<string>('');
  
  const [formData, setFormData] = useState<Omit<Location, 'id'>>({
    name: '',
    countryCode: '',
    stateCode: '',
    cityCode: '',
    address: '',
    phone: '',
    status: 'Active',
  });

  // Reset form states when modal is closed
  useEffect(() => {
    if (!showModal) {
      resetFormStates();
    }
  }, [showModal]);

  const resetFormStates = () => {
    setCountryCode('');
    setCountryName('');
    setStateCode('');
    setStateName('');
    setCityCode('');
    setCityName('');
    setPhoneCode('');
  };

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
      countryCode: '',
      stateCode: '',
      cityCode: '',
      address: '',
      phone: '',
      status: 'Active',
    });
    resetFormStates();
    setShowModal(true);
  };

  const handleEditLocation = (location: Location) => {
    setCurrentLocation(location);
    setFormData({
      name: location.name,
      countryCode: location.countryCode,
      stateCode: location.stateCode,
      cityCode: location.cityCode,
      address: location.address,
      phone: location.phone,
      status: location.status,
    });
    
    // Set the location data for dropdowns
    setCountryCode(location.countryCode);
    setStateCode(location.stateCode);
    setCityCode(location.cityCode);
    
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

  const handleCountryChange = (selectedCountry: any) => {
    setCountryCode(selectedCountry.code);
    setCountryName(selectedCountry.name);
    // Reset state and city when country changes
    setStateCode('');
    setStateName('');
    setCityCode('');
    setCityName('');
    
    setFormData({
      ...formData,
      countryCode: selectedCountry.code,
      stateCode: '',
      cityCode: '',
    });
  };

  const handleStateChange = (selectedState: any) => {
    setStateCode(selectedState.code);
    setStateName(selectedState.name);
    // Reset city when state changes
    setCityCode('');
    setCityName('');
    
    setFormData({
      ...formData,
      stateCode: selectedState.code,
      cityCode: '',
    });
  };

  const handleCityChange = (selectedCity: any) => {
    setCityCode(selectedCity.code);
    setCityName(selectedCity.name);
    
    setFormData({
      ...formData,
      cityCode: selectedCity.code,
    });
  };

  const handlePhoneCodeChange = (selectedPhoneCode: any) => {
    setPhoneCode(selectedPhoneCode.code);
    
    // Update phone number with country code if it doesn't already have one
    const currentPhone = formData.phone.trim();
    const newPhone = currentPhone.startsWith('+') 
      ? currentPhone 
      : `+${selectedPhoneCode.code} ${currentPhone}`;
    
    setFormData({
      ...formData,
      phone: newPhone,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Combine address components
    const combinedAddress = formData.address;
    
    const finalFormData = {
      ...formData,
      address: combinedAddress,
    };
    
    if (currentLocation) {
      // Edit existing location
      // In a real app, would call API to update
      setLocations(
        locations.map(location => 
          location.id === currentLocation.id 
            ? { ...location, ...finalFormData } 
            : location
        )
      );
    } else {
      // Add new location
      const newLocation: Location = {
        id: Date.now().toString(), // In a real app, the ID would come from the backend
        ...finalFormData,
      };
      // In a real app, would call API to create
      setLocations([...locations, newLocation]);
    }
    
    setShowModal(false);
  };

  const getFormattedAddress = (location: Location) => {
    return location.address;
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
        <button
          onClick={handleAddLocation}
          className="flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
        >
          <FaPlus size={14} />
          <span>Add New Location</span>
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Admins</th>
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
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{getFormattedAddress(location)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-500">
                        <FaPhone className="mr-2 text-gray-400" size={14} />
                        {location.phone}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        location.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {location.status}
                      </span>
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
                  <td colSpan={5} className="px-6 py-8 text-sm text-gray-500 text-center">
                    No locations found matching your search
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
                  Location Name*
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
                    Country*
                  </label>
                  <CountrySelect
                    onChange={handleCountryChange}
                    placeHolder="Select Country"
                    containerClassName="w-full rounded-lg"
                    inputClassName="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    defaultValue={countryCode}
                    showFlag={true}
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    State/Province
                  </label>
                  <StateSelect
                    countryCode={countryCode}
                    onChange={handleStateChange}
                    placeHolder="Select State"
                    containerClassName="w-full rounded-lg"
                    inputClassName="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    defaultValue={stateCode}
                    disabled={!countryCode}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    City
                  </label>
                  <CitySelect
                    countryCode={countryCode}
                    stateCode={stateCode}
                    onChange={handleCityChange}
                    placeHolder="Select City"
                    containerClassName="w-full rounded-lg"
                    inputClassName="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    defaultValue={cityCode}
                    disabled={!stateCode}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Code
                  </label>
                  <PhonecodeSelect
                    onChange={handlePhoneCodeChange}
                    placeHolder="Select Phone Code"
                    containerClassName="w-full rounded-lg"
                    inputClassName="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    showFlag={true}
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Street Address*
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
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number*
                </label>
                <div className="flex items-center">
                  <div className="relative w-full">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaPhone className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      name="phone"
                      value={formData.phone}
                      onChange={handleFormChange}
                      className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Phone number with country code"
                      required
                    />
                  </div>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleFormChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
              
              <div className="pt-4 flex justify-end space-x-3 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
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