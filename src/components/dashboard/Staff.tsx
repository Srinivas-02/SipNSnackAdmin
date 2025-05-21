import { useState, useEffect } from 'react';
import { FaEdit, FaTrash, FaUserPlus, FaCheck, FaTimes, FaFilter } from 'react-icons/fa';
import api from '../../common/api';
import { User } from '../../store/account';
import useLocationStore from '../../store/location';
import Select from 'react-select';
import toast from 'react-hot-toast';

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
  const [filterLocation, setFilterLocation] = useState<number | null>(null);
  const { locations, fetchLocations } = useLocationStore();
  
  const [formData, setFormData] = useState({
    email: '',
    first_name: '',
    last_name: '',
    password: '',
    is_staff_member: true,
    location_ids: [] as number[]
  });

  // Add this type for the select options
  type LocationOption = {
    value: number;
    label: string;
  };

  // Fetch all users and locations
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch locations if they're not already loaded
        if (locations.length === 0) {
          await fetchLocations();
        }
        
        await fetchStaff();
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load data. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);
  
  // Fetch staff with location filter
  const fetchStaff = async () => {
    try {
      const endpoint = filterLocation 
        ? `/accounts/staff/?location_id=${filterLocation}` 
        : '/accounts/staff/';
      
      const response = await api.get(endpoint);
      setUsers(response.data);
    } catch (err) {
      console.error('Error fetching staff:', err);
      setError('Failed to load staff members. Please try again.');
      throw err;
    }
  };

  // Apply location filter
  const handleFilterChange = async (locationId: number | null) => {
    setFilterLocation(locationId);
    setIsLoading(true);
    
    try {
      const endpoint = locationId 
        ? `/accounts/staff/?location_id=${locationId}` 
        : '/accounts/staff/';
      
      const response = await api.get(endpoint);
      setUsers(response.data);
    } catch (err) {
      console.error('Error filtering staff:', err);
      setError('Failed to filter staff members. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const { checked } = e.target;
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

  // Add this function to handle react-select changes
  const handleLocationSelectChange = (selectedOptions: readonly LocationOption[] | null) => {
    setFormData(prev => ({
      ...prev,
      location_ids: selectedOptions ? selectedOptions.map(option => option.value) : []
    }));
  };

  // Convert locations to select options
  const locationOptions: LocationOption[] = locations.map(location => ({
    value: location.id,
    label: `${location.name} (${location.city}, ${location.state})`
  }));

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.location_ids.length === 0) {
      toast.error('Please select at least one location');
      return;
    }
    
    try {
      setIsLoading(true);
      await api.post('/accounts/staff/', formData);
      
      // Refresh user list
      await fetchStaff();
      
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
      toast.success('Staff member added successfully');
    } catch (err) {
      console.error('Error adding staff member:', err);
      toast.error('Failed to add staff member. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditUser = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedUser?.id) return;
    
    if (formData.location_ids.length === 0) {
      toast.error('Please select at least one location');
      return;
    }
    
    try {
      setIsLoading(true);
      
      // Create a copy without the password if it's empty
      if (!formData.password) {
        const { password: _unused, ...rest } = formData; // eslint-disable-line @typescript-eslint/no-unused-vars
        await api.patch(`/accounts/staff/`, { id: selectedUser.id, ...rest });
      } else {
        await api.patch(`/accounts/staff/`, { id: selectedUser.id, ...formData });
      }
      
      // Refresh user list
      await fetchStaff();
      
      // Close modal
      setShowEditModal(false);
      setError(null);
      toast.success('Staff member updated successfully');
    } catch (err) {
      console.error('Error updating staff member:', err);
      toast.error('Failed to update staff member. Please try again.');
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
      await api.delete(`/accounts/staff/?id=${userId}`);
      
      // Refresh user list
      await fetchStaff();
      setError(null);
      toast.success('Staff member deleted successfully');
    } catch (err) {
      console.error('Error deleting staff member:', err);
      toast.error('Failed to delete staff member. Please try again.');
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
        <Select
          className="w-64"
          classNamePrefix="select"
          options={[
            { value: null, label: 'All locations' },
            ...locationOptions
          ]}
          value={locationOptions.find(opt => opt.value === filterLocation) || { value: null, label: 'All locations' }}
          onChange={(option) => handleFilterChange(option?.value === null ? null : option?.value || null)}
          styles={{
            control: (base) => ({
              ...base,
              minHeight: '38px',
              borderColor: '#D1D5DB',
              '&:hover': {
                borderColor: '#9CA3AF'
              }
            }),
            option: (base, state) => ({
              ...base,
              backgroundColor: state.isSelected ? '#2563EB' : state.isFocused ? '#DBEAFE' : 'white',
              color: state.isSelected ? 'white' : '#374151'
            })
          }}
        />
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
              users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {user.first_name} {user.last_name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{user.email}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {user.locations?.map(location => (
                        <span key={location.id} className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                          {location.name}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => openEditModal(user)}
                      className="text-blue-600 hover:text-blue-900 mr-4"
                    >
                      <FaEdit size={18} />
                    </button>
                    <button 
                      onClick={() => handleDeleteUser(user.id)}
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
                  <Select
                    isMulti
                    name="location_ids"
                    options={locationOptions}
                    value={locationOptions.filter(option => 
                      formData.location_ids.includes(option.value)
                    )}
                    onChange={handleLocationSelectChange}
                    className="basic-multi-select"
                    classNamePrefix="select"
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
                  <p className="text-xs text-gray-500 mt-1">
                    Search and select multiple locations
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
                  <Select
                    isMulti
                    name="location_ids"
                    options={locationOptions}
                    value={locationOptions.filter(option => 
                      formData.location_ids.includes(option.value)
                    )}
                    onChange={handleLocationSelectChange}
                    className="basic-multi-select"
                    classNamePrefix="select"
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
                  <p className="text-xs text-gray-500 mt-1">
                    Search and select multiple locations
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