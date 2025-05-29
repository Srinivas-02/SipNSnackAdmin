import { FaPlus, FaTrash, FaTimes, FaUserShield, FaEdit, FaMapMarkerAlt, FaLocationArrow } from 'react-icons/fa';
import { useState, useEffect } from 'react';
import useFranchiseAdminStore from '../../store/franchiseAdmin';
import { useLocationStore } from '../../store/location';
import useAccountStore from '../../store/account';
import api from '../../common/api';

interface Location {
  id: number;
  name: string;
  city: string;
  state: string;
}

interface User {
  id: number;
  email: string;
  is_super_admin: boolean;
  is_franchise_admin: boolean;
  locations?: Location[];
  assigned_locations?: Location[];
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

const FranchiseAdmins = () => {
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const {
    franchiseAdmins,
    loading,
    fetchFranchiseAdmins,
    addFranchiseAdmin,
    updateFranchiseAdmin,
    deleteFranchiseAdmin,
    assignLocations
  } = useFranchiseAdminStore();

  const { locations, fetchLocations } = useLocationStore();
  const { user } = useAccountStore();

  // Filter available locations based on user's access
  const availableLocations = user?.is_super_admin 
    ? locations 
    : locations.filter(location => 
        user?.assigned_locations?.some(userLoc => userLoc.id === location.id)
      );

  const [formData, setFormData] = useState<{
    id?: number;
    email: string;
    password: string;
    first_name: string;
    last_name: string;
  }>({
    email: '',
    password: '',
    first_name: '',
    last_name: '',
  });

  const [assignFormData, setAssignFormData] = useState<{
    admin_id: number;
    location_ids: number[];
  }>({
    admin_id: 0,
    location_ids: [],
  });

  const [cpassword, setcpassword] = useState('');

  useEffect(() => {
    const initializeData = async () => {
      try {
        await Promise.all([
          fetchFranchiseAdmins(),
          fetchLocations()
        ]);

        // If user is a franchise admin, fetch their assigned locations
        if (user?.is_franchise_admin && (!user.assigned_locations || user.assigned_locations.length === 0)) {
          try {
            const response = await api.get(`/accounts/franchise-admin/?id=${user.id}`);
            if (response.data && response.data.locations) {
              // Update user's assigned locations
              user.assigned_locations = response.data.locations;
            }
          } catch (err) {
            console.error('Error fetching franchise admin data:', err);
            setError('Failed to fetch your assigned locations');
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch data');
      }
    };
    initializeData();
  }, [fetchFranchiseAdmins, fetchLocations, user]);

  const handleAddAdmin = () => {
    if (!user?.is_super_admin && !user?.is_franchise_admin) {
      setError('Not authorized to create franchise admins');
      return;
    }
    setSelectedAdmin(null);
    setFormData({
      email: '',
      password: '',
      first_name: '',
      last_name: '',
    });
    setcpassword('');
    setError('');
    setShowModal(true);
  };

  const handleEditAdmin = (admin: any) => {
    if (!user?.is_super_admin && !user?.is_franchise_admin) {
      setError('Not authorized to edit franchise admins');
      return;
    }
    setSelectedAdmin(admin);
    setFormData({
      id: admin.id,
      email: admin.email,
      first_name: admin.first_name,
      last_name: admin.last_name,
      password: '',
    });
    setcpassword('');
    setError('');
    setShowModal(true);
  };

  const handleAssignLocations = (admin: any) => {
    if (!user?.is_super_admin && !user?.is_franchise_admin) {
      setError('Not authorized to assign locations');
      return;
    }
    setSelectedAdmin(admin);
    setAssignFormData({
      admin_id: admin.id,
      location_ids: admin.locations.map((loc: Location) => loc.id),
    });
    setShowAssignModal(true);
  };

  const handleDeleteAdmin = async (id: number) => {
    if (!user?.is_super_admin && !user?.is_franchise_admin) {
      setError('Not authorized to delete franchise admins');
      return;
    }

    if (window.confirm('Are you sure you want to delete this franchise admin?')) {
      try {
        await deleteFranchiseAdmin(id);
        setError(null);
      } catch (err) {
        if (isApiError(err)) {
          setError(err.response.data.error || err.response.data.message || 'Failed to delete franchise admin');
        } else {
          setError(err instanceof Error ? err.message : 'Failed to delete franchise admin');
        }
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (formData.password && formData.password !== cpassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      if (selectedAdmin) {
        if (!user?.is_super_admin && !user?.is_franchise_admin) {
          setError('Not authorized to edit franchise admins');
          return;
        }
        await updateFranchiseAdmin(selectedAdmin.id, formData);
      } else {
        if (user?.is_franchise_admin || user?.is_super_admin) {
          // Create franchise admin without any initial location assignment
          await addFranchiseAdmin({
            ...formData,
            location_ids: [] // Start with no locations assigned
          });
          // Refresh the franchise admin list after creating a new admin
          await fetchFranchiseAdmins();
        } else {
          setError('Not authorized to create franchise admins');
          return;
        }
      }
      setShowModal(false);
    } catch (err) {
      if (isApiError(err)) {
        setError(err.response.data.error || err.response.data.message || 'Failed to save franchise admin');
      } else {
        setError(err instanceof Error ? err.message : 'Failed to save franchise admin');
      }
    }
  };

  const handleAssignSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!(user?.is_franchise_admin || user?.is_super_admin)) {
      setError('Not authorized to assign locations');
      return;
    }

    try {
      // For franchise admins, only allow assigning their own locations
      const locationIds = user?.is_super_admin 
        ? assignFormData.location_ids 
        : assignFormData.location_ids.filter(id => 
            availableLocations.some(loc => loc.id === id)
          );

      await assignLocations(selectedAdmin.id, locationIds);
      setShowAssignModal(false);
    } catch (err) {
      if (isApiError(err)) {
        setError(err.response.data.error || err.response.data.message || 'Failed to assign locations');
      } else {
        setError(err instanceof Error ? err.message : 'Failed to assign locations');
      }
    }
  };

  const filteredAdmins = franchiseAdmins.filter(
    admin =>
      (admin.first_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (admin.last_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (admin.email?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Manage Franchise Admins</h1>
        <p className="mt-2 text-sm text-gray-600">Add, edit, or remove franchise administrators from your account.</p>
      </div>

      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FaUserShield className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search franchise admins..."
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full md:w-80 focus:ring-blue-500 focus:border-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button
          onClick={handleAddAdmin}
          className="flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
        >
          <FaPlus size={14} />
          <span>Add New Franchise Admin</span>
        </button>
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned Locations</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAdmins.length > 0 ? (
                filteredAdmins.map((admin) => (
                  <tr key={admin.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center bg-blue-100 rounded-full">
                          <FaUserShield className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {admin.first_name} {admin.last_name}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{admin.email}</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col space-y-1">
                        {admin.locations?.map((location) => (
                          <div key={location.id} className="flex items-center space-x-1 text-sm text-gray-500">
                            <FaMapMarkerAlt className="text-green-500" size={12} />
                            <span>{location.name}</span>
                          </div>
                        )) || []}
                        {(!admin.locations || admin.locations.length === 0) && (
                          <span className="text-gray-400 italic text-sm">No locations assigned</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditAdmin(admin)}
                          className="text-indigo-600 hover:text-indigo-900"
                          title="Edit Franchise Admin"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => handleDeleteAdmin(admin.id)}
                          className="text-red-600 hover:text-red-900"
                          title="Delete Franchise Admin"
                        >
                          <FaTrash />
                        </button>
                        <button
                          onClick={() => handleAssignLocations(admin)}
                          className="text-green-600 hover:text-green-900 flex items-center gap-1"
                          title="Assign Locations"
                        >
                          <FaLocationArrow />
                          <span className="text-xs">Assign</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-sm text-gray-500 text-center">
                    {loading ? 'Loading franchise admins...' : 'No franchise admins found matching your search'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Franchise Admin Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-gray-900">
                {selectedAdmin ? 'Edit Franchise Admin' : 'Add Franchise Admin'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <FaTimes size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                <input
                  type="text"
                  value={formData.first_name}
                  onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                <input
                  type="text"
                  value={formData.last_name}
                  onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                <input
                  type="password"
                  value={cpassword}
                  onChange={(e) => setcpassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              {error && (
                <div className="text-red-600 text-sm mb-2">{error}</div>
              )}

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`px-4 py-2 bg-blue-600 text-white rounded-md ${
                    loading ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                  disabled={loading}
                >
                  {loading ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assign Locations Modal */}
      {showAssignModal && selectedAdmin && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg max-h-90vh overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Assign Locations</h3>
              <button
                onClick={() => setShowAssignModal(false)}
                className="text-gray-400 hover:text-gray-600"
                aria-label="Close modal"
              >
                <FaTimes size={20} />
              </button>
            </div>
            <form onSubmit={handleAssignSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Select Locations</label>
                <select
                  multiple
                  value={assignFormData.location_ids.map(id => id.toString())}
                  onChange={(e) => {
                    const options = e.target.options;
                    const selectedValues: number[] = [];
                    for (let i = 0; i < options.length; i++) {
                      if (options[i].selected) {
                        selectedValues.push(Number(options[i].value));
                      }
                    }
                    setAssignFormData({ ...assignFormData, location_ids: selectedValues });
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  size={Math.min(5, availableLocations.length)}
                >
                  {availableLocations.map(location => (
                    <option key={location.id} value={location.id}>
                      {location.name} ({location.city}, {location.state})
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-sm text-gray-500">Hold Ctrl/Cmd to select multiple locations</p>
              </div>
              {error && (
                <div className="text-red-600 text-sm mb-2">{error}</div>
              )}
              <div className="pt-4 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowAssignModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500${
                    loading ? ' opacity-50 cursor-not-allowed' : ''
                  }`}
                  disabled={loading}
                >
                  {loading ? 'Saving...' : 'Assign Locations'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FranchiseAdmins; 