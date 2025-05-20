import { useState, useEffect } from 'react';
import { FaEdit, FaTrash, FaUserPlus, FaCheck, FaTimes, FaFilter } from 'react-icons/fa';
import api from '../../common/api';
import { User } from '../../store/account';
import useLocationStore from '../../store/location';
import useAccountStore from '../../store/account';
import useStaffStore from '../../store/staff';

interface UserWithLocation extends User {
  locations?: { id: number; name: string }[];
}

const Staff = () => {
  const [users, setUsers] = useState<UserWithLocation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserWithLocation | null>(null);
  const [filterLocation, setFilterLocation] = useState<string>('all');
  const { locations, fetchLocations } = useLocationStore();
  const { user } = useAccountStore();
  const { staffByLocation, fetchStaffByLocation, deleteStaffMember } = useStaffStore();
  
  const [formData, setFormData] = useState({
    email: '',
    first_name: '',
    last_name: '',
    password: '',
    is_staff_member: true,
    location_ids: [] as number[]
  });

  // Fetch all users and locations
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        await fetchLocations();

        if (user?.is_franchise_admin) {
          // If assigned_locations is not available, fetch franchise admin data
          if (!user.assigned_locations || user.assigned_locations.length === 0) {
            console.log('Fetching franchise admin data...');
            const franchiseResponse = await api.get(`/accounts/franchise-admin/?id=${user.id}`);
            if (franchiseResponse.data && franchiseResponse.data.locations) {
              // Update user's assigned locations
              user.assigned_locations = franchiseResponse.data.locations;
            }
          }

          // Fetch staff data
          const response = await api.get('/accounts/staff/');
          setUsers(response.data);
          setFilterLocation('all');
        } else if (user?.is_super_admin) {
          const response = await api.get('/accounts/staff/');
          setUsers(response.data);
          setFilterLocation('all');
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load data. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user, fetchLocations]);
  
  // Handle location filter change
  const handleFilterChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const locationId = e.target.value;
    setFilterLocation(locationId);
    setIsLoading(true);
    
    try {
      if (locationId === 'all') {
        // For "All locations", fetch all staff (backend will filter based on permissions)
        const response = await api.get('/accounts/staff/');
        setUsers(response.data);
      } else {
        // For specific location, fetch staff for that location
        const response = await api.get(`/accounts/staff/?location_id=${locationId}`);
        setUsers(response.data);
      }
    } catch (err) {
      console.error('Error filtering staff:', err);
      setError('Failed to filter staff members. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    // Handle multi-select for locations
    if (name === 'location_ids' && e.target instanceof HTMLSelectElement) {
      const options = e.target.options;
      const selectedValues: number[] = [];
      
      for (let i = 0; i < options.length; i++) {
        if (options[i].selected) {
          selectedValues.push(Number(options[i].value));
        }
      }
      
      setFormData({
        ...formData,
        location_ids: selectedValues
      });
    } else if (type === 'checkbox') {
      const { checked } = e.target as HTMLInputElement;
      setFormData({
        ...formData,
        [name]: checked
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.location_ids.length === 0) {
      setError('Please select at least one location');
      return;
    }
    
    try {
      setIsLoading(true);
      await api.post('/accounts/staff/', formData);
      
      // Refresh user list
      await fetchStaffByLocation();
      
      // Reset form and close modal
      setFormData({
        email: '',
        first_name: '',
        last_name: '',
        password: '',
        is_staff_member: true,
        location_ids: []
      });
      setShowAddModal(false);
      setError(null);
    } catch (err) {
      console.error('Error adding staff member:', err);
      setError('Failed to add staff member. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditUser = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedUser?.id) return;
    
    if (formData.location_ids.length === 0) {
      setError('Please select at least one location');
      return;
    }
    
    try {
      setIsLoading(true);
      
      // Create a copy without the password if it's empty
      if (!formData.password) {
        const { password: _, ...rest } = formData;
        await api.patch(`/accounts/staff/`, { id: selectedUser.id, ...rest });
      } else {
        await api.patch(`/accounts/staff/`, { id: selectedUser.id, ...formData });
      }
      
      // Refresh user list
      await fetchStaffByLocation();
      
      // Close modal
      setShowEditModal(false);
      setError(null);
    } catch (err) {
      console.error('Error updating staff member:', err);
      setError('Failed to update staff member. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteUser = async (userId: number) => {
    if (!confirm('Are you sure you want to delete this staff member?')) {
      return;
    }
    
    try {
      setIsLoading(true);
      await deleteStaffMember(userId);
      setUsers(users.filter(user => user.id !== userId));
      setError(null);
    } catch (err) {
      console.error('Error deleting staff member:', err);
      setError('Failed to delete staff member. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const openEditModal = (user: UserWithLocation) => {
    setSelectedUser(user);
    setFormData({
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      password: '',
      is_staff_member: true,
      location_ids: user.locations ? user.locations.map(loc => loc.id) : []
    });
    setShowEditModal(true);
    setError(null);
  };

  // Get available locations for the dropdown
  const getAvailableLocations = () => {
    // Debug logs
    console.log('Current user:', user);
    console.log('User type:', user?.is_super_admin ? 'Super Admin' : user?.is_franchise_admin ? 'Franchise Admin' : 'Unknown');
    console.log('Assigned locations:', user?.assigned_locations);

    if (user?.is_super_admin) {
      return locations || [];
    }
    if (user?.is_franchise_admin) {
      // For franchise admin, return their assigned locations from the user object
      if (!user.assigned_locations || user.assigned_locations.length === 0) {
        console.log('No assigned locations found for franchise admin');
        return [];
      }
      console.log('Returning franchise admin locations:', user.assigned_locations);
      return user.assigned_locations;
    }
    return [];
  };

  if (isLoading && users.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800">
          Staff Management
        </h2>
        {user?.is_super_admin && (
          <button
            onClick={() => {
              setFormData({
                email: '',
                first_name: '',
                last_name: '',
                password: '',
                is_staff_member: true,
                location_ids: []
              });
              setShowAddModal(true);
              setError(null);
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-md flex items-center gap-2"
          >
            <FaUserPlus />
            Add Staff Member
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          <p>{error}</p>
        </div>
      )}
      
      <div className="mb-4 flex items-center">
        <div className="flex items-center mr-4">
          <FaFilter className="text-gray-500 mr-2" />
          <span className="text-sm text-gray-600">Filter by location:</span>
        </div>
        <select
          className="border border-gray-300 rounded-md px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={filterLocation}
          onChange={handleFilterChange}
        >
          <option value="all">All locations</option>
          {getAvailableLocations().map((location) => (
            <option key={location.id} value={String(location.id)}>
              {location.name}
            </option>
          ))}
        </select>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Locations
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.length > 0 ? (
              users.map((staff) => (
                <tr key={staff.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {staff.first_name} {staff.last_name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{staff.email}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {staff.locations?.map(location => (
                        <span key={location.id} className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                          {location.name}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => openEditModal(staff)}
                      className="text-blue-600 hover:text-blue-900 mr-4"
                    >
                      <FaEdit size={18} />
                    </button>
                    <button 
                      onClick={() => handleDeleteUser(staff.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <FaTrash size={18} />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                  {isLoading ? 'Loading staff members...' : 'No staff members found'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Add Staff Member</h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-500">
                <FaTimes size={18} />
              </button>
            </div>
            
            <form onSubmit={handleAddUser}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input 
                    type="email" 
                    name="email"
                    value={formData.email} 
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                    <input 
                      type="text" 
                      name="first_name"
                      value={formData.first_name} 
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                    <input 
                      type="text" 
                      name="last_name"
                      value={formData.last_name} 
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                  <input 
                    type="password" 
                    name="password"
                    value={formData.password} 
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Locations <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="location_ids"
                    multiple
                    value={formData.location_ids.map(String)}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                    size={4}
                  >
                    {locations.map(location => (
                      <option key={location.id} value={location.id}>
                        {location.name}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    Hold Ctrl/Cmd to select multiple locations
                  </p>
                </div>
                
                <div className="pt-4 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 flex items-center gap-2"
                  >
                    <FaCheck size={14} />
                    <span>Save</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Edit User Modal */}
      {showEditModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Edit Staff Member</h3>
              <button onClick={() => setShowEditModal(false)} className="text-gray-500">
                <FaTimes size={18} />
              </button>
            </div>
            
            <form onSubmit={handleEditUser}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input 
                    type="email" 
                    name="email"
                    value={formData.email} 
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                    <input 
                      type="text" 
                      name="first_name"
                      value={formData.first_name} 
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                    <input 
                      type="text" 
                      name="last_name"
                      value={formData.last_name} 
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Password <span className="text-xs text-gray-500">(Leave blank to keep current password)</span>
                  </label>
                  <input 
                    type="password" 
                    name="password"
                    value={formData.password} 
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Locations <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="location_ids"
                    multiple
                    value={formData.location_ids.map(String)}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                    size={4}
                  >
                    {locations.map(location => (
                      <option key={location.id} value={location.id}>
                        {location.name}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    Hold Ctrl/Cmd to select multiple locations
                  </p>
                </div>
                
                <div className="pt-4 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 flex items-center gap-2"
                  >
                    <FaCheck size={14} />
                    <span>Update</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Staff; 