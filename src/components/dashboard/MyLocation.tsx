import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../../common/api';
import useAccountStore from '../../store/account';
import useLocationStore from '../../store/location';

interface LocationData {
  id: number;
  name: string;
  address: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  phone: string;
  email: string;
  status: 'active' | 'inactive' | 'pending';
  operating_hours: {
    day: string;
    open_time: string;
    close_time: string;
    is_closed: boolean;
  }[];
}

function isApiError(err: unknown): err is { 
  response: { 
    status: number;
    statusText: string;
    data: { 
      message: string;
      error?: string;
    } 
  };
  config?: {
    url?: string;
    method?: string;
    headers?: Record<string, string>;
  }
} {
  if (
    typeof err === 'object' &&
    err !== null &&
    'response' in err
  ) {
    const response = (err as { response?: unknown }).response;
    if (
      typeof response === 'object' &&
      response !== null &&
      'data' in response &&
      'status' in response &&
      'statusText' in response
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

const MyLocation = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [locationData, setLocationData] = useState<LocationData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<LocationData & { password: string; confirm_password: string }>>({});
  const [cpassword, setCpassword] = useState('');

  // Get user information and store functions
  const { user } = useAccountStore();
  const { locations, setLocations } = useLocationStore();

  const accessibleLocations = user?.is_super_admin 
    ? locations 
    : locations.filter(loc => user?.assigned_locations?.some(al => al.id === loc.id));

  useEffect(() => {
    const fetchMyLocation = async () => {
      if (!user?.id) {
        console.log('No user ID found:', user);
        setError('User not authenticated. Please log in.');
        setIsLoading(false);
        return;
      }
      
      try {
        setIsLoading(true);
        setError(null);
        
        // For franchise admin, use their assigned locations directly
        if (user.is_franchise_admin && user.assigned_locations && user.assigned_locations.length > 0) {
          const locationId = user.assigned_locations[0].id;
          console.log('Fetching location details for ID:', locationId);
          
          // Updated endpoint format
          const locationResponse = await api.get(`/locations/?id=${locationId}`);
          console.log('Location response:', locationResponse);
          
          if (!locationResponse.data) {
            throw new Error('Invalid response format from location endpoint');
          }

          setLocationData(locationResponse.data);
          setFormData(locationResponse.data);
        } else {
          // For super admin or if no assigned locations
          setError('No location assigned to your account. Please contact super admin to assign a location.');
        }
      } catch (err) {
        console.error('Error in fetchMyLocation:', err);
        if (isApiError(err)) {
          const errorMessage = err.response?.data?.message || err.response?.data?.error || 'Failed to load location data';
          setError(errorMessage);
        } else {
          setError('An unexpected error occurred. Please try again later.');
        }
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchMyLocation();
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!locationData?.id) return;
    
    if (formData.password !== cpassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      setIsLoading(true);
      // Update the location data with correct endpoint
      await api.patch(`/locations/?id=${locationData.id}`, formData);
      
      // Refresh location data with correct endpoint
      const response = await api.get(`/locations/?id=${locationData.id}`);
      setLocationData(response.data);
      setFormData(response.data);
      
      // Update the store to reflect changes
      setLocations(
        locations.map(loc =>
          loc.id === locationData.id ? { ...loc, ...response.data } : loc
        )
      );
      
      setIsEditing(false);
      setCpassword('');
      setError(null);
      
      alert('Location updated successfully');
    } catch (err) {
      if (isApiError(err)) {
        setError(err.response.data.message || err.response.data.error || 'Failed to update location');
      } else {
        setError('Failed to update location. Please try again.');
      }
      console.error('Error updating location:', err);
    } finally {
      setIsLoading(false);
    }
  };
  
  if (isLoading && !locationData) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        <p>{error}</p>
      </div>
    );
  }
  
  if (!locationData) {
    return (
      <div className="bg-amber-100 border border-amber-400 text-amber-80-700 px-4 py-3 rounded">
        <p>No location assigned to your account. Please contact super admin to assign a location.</p>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800">
          {locationData.name}
        </h2>
        <div>
          <span 
            className={`px-3 py-1 rounded-full text-sm ${
              locationData.status === 'active' 
                ? 'bg-green-100 text-green-800' 
                : locationData.status === 'inactive' 
                  ? 'bg-red-100 text-red-800' 
                  : 'bg-amber-100 text-amber-800'
            }`}
          >
            {locationData.status.charAt(0).toUpperCase() + locationData.status.slice(1)}
          </span>
        </div>
      </div>
      
      {isEditing ? (
        <motion.form 
          onSubmit={handleSubmit}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Location Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name || ''}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email || ''}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone || ''}
              onChange={handleInputChange}
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
              value={formData.address || ''}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              City
            </label>
            <input
              type="text"
              name="city"
              value={formData.city || ''}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              State/Province
            </label>
            <input
              type="text"
              name="state"
              value={formData.state || ''}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Postal Code
            </label>
            <input
              type="text"
              name="postal_code"
              value={formData.postal_code || ''}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Country
            </label>
            <input
              type="text"
              name="country"
              value={formData.country || ''}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
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
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
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
              onChange={(e) => {
                setCpassword(e.target.value);
                if (error) setError(null);
              }}
              onBlur={() => {
                if (formData.password !== cpassword) {
                  setError('Passwords do not match');
                } else if (error === 'Passwords do not match') {
                  setError(null);
                }
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          
          {error && (
            <div className="col-span-1 md:col-span-2 text-red-600 text-sm mb-2">{error}</div>
          )}
          
          <div className="col-span-1 md:col-span-2 flex justify-end mt-4 space-x-3">
            <button
              type="button"
              onClick={() => {
                setIsEditing(false);
                setCpassword('');
                setError(null);
                setFormData(locationData);
              }}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md"
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`px-4 py-2 bg-blue-600 text-white rounded-md ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={isLoading}
            >
              {isLoading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </motion.form>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Contact Information</h3>
              <p className="text-gray-700 mb-2">
                <span className="font-medium">Email:</span> {locationData.email}
              </p>
              <p className="text-gray-700">
                <span className="font-medium">Phone:</span> {locationData.phone}
              </p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Address</h3>
              <p className="text-gray-700">
                {locationData.address}<br />
                {locationData.city}, {locationData.state} {locationData.postal_code}<br />
                {locationData.country}
              </p>
            </div>
          </div>
          
          <div className="mb-8">
            <h3 className="text-sm font-medium text-gray-500 mb-3">Operating Hours</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {locationData.operating_hours?.map((hours, index) => (
                <div key={index} className="bg-gray-50 rounded p-3">
                  <p className="font-medium text-gray-700">{hours.day}</p>
                  {hours.is_closed ? (
                    <p className="text-gray-500">Closed</p>
                  ) : (
                    <p className="text-gray-700">{hours.open_time} - {hours.close_time}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
          
          <div className="flex justify-end">
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md"
            >
              Edit Location
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default MyLocation;