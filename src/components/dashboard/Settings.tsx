import { useState } from 'react';
import { FaSave, FaLock } from 'react-icons/fa';
import useAccountStore from '../../store/account';
import api from '../../common/api';

const Settings = () => {
  const { user, setDetails } = useAccountStore();
  
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'notifications'>('profile');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Profile form state
  const [profileForm, setProfileForm] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    email: user?.email || '',
  });
  
  // Password form state
  const [passwordForm, setPasswordForm] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });
  
  // Notification settings state
  const [notificationSettings, setNotificationSettings] = useState({
    email_order_updates: true,
    email_marketing: false,
    push_order_updates: true,
    push_promotions: true,
  });
  
  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileForm({
      ...profileForm,
      [name]: value
    });
  };
  
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordForm({
      ...passwordForm,
      [name]: value
    });
  };
  
  const handleNotificationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setNotificationSettings({
      ...notificationSettings,
      [name]: checked
    });
  };
  
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user?.id) return;
    
    // Clear previous messages
    setError(null);
    setSuccess(null);
    
    try {
      setIsLoading(true);
      
      const response = await api.put(`/accounts/users/${user.id}/`, {
        first_name: profileForm.first_name,
        last_name: profileForm.last_name,
        email: profileForm.email,
      });
      
      // Update the user in store
      if (response.data && response.data.user) {
        setDetails(response.data);
      }
      
      setSuccess('Profile updated successfully');
    } catch (err) {
      console.error('Error updating profile:', err);
      setError('Failed to update profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear previous messages
    setError(null);
    setSuccess(null);
    
    // Validate passwords match
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      setError('New password and confirmation do not match');
      return;
    }
    
    // Validate password strength (example simple validation)
    if (passwordForm.new_password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    
    try {
      setIsLoading(true);
      
      await api.post('/accounts/change-password/', {
        current_password: passwordForm.current_password,
        new_password: passwordForm.new_password,
      });
      
      // Reset form
      setPasswordForm({
        current_password: '',
        new_password: '',
        confirm_password: '',
      });
      
      setSuccess('Password updated successfully');
    } catch (err) {
      console.error('Error updating password:', err);
      setError('Failed to update password. Please check your current password.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleUpdateNotifications = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear previous messages
    setError(null);
    setSuccess(null);
    
    try {
      setIsLoading(true);
      
      await api.put('/accounts/notification-settings/', notificationSettings);
      
      setSuccess('Notification preferences updated');
    } catch (err) {
      console.error('Error updating notifications:', err);
      setError('Failed to update notification settings. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden">
      {/* Tabs */}
      <div className="flex border-b">
        <button
          className={`py-4 px-6 text-sm font-medium ${
            activeTab === 'profile'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('profile')}
        >
          Profile
        </button>
        <button
          className={`py-4 px-6 text-sm font-medium ${
            activeTab === 'security'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('security')}
        >
          Security
        </button>
        <button
          className={`py-4 px-6 text-sm font-medium ${
            activeTab === 'notifications'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('notifications')}
        >
          Notifications
        </button>
      </div>
      
      <div className="p-6">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            <p>{error}</p>
          </div>
        )}
        
        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
            <p>{success}</p>
          </div>
        )}
        
        {activeTab === 'profile' && (
          <form onSubmit={handleUpdateProfile}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  First Name
                </label>
                <input
                  type="text"
                  name="first_name"
                  value={profileForm.first_name}
                  onChange={handleProfileChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
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
                  value={profileForm.last_name}
                  onChange={handleProfileChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={profileForm.email}
                onChange={handleProfileChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              />
            </div>
            
            <div className="flex justify-end">
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md flex items-center gap-2"
                disabled={isLoading}
              >
                <FaSave />
                {isLoading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        )}
        
        {activeTab === 'security' && (
          <form onSubmit={handleUpdatePassword}>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Current Password
              </label>
              <input
                type="password"
                name="current_password"
                value={passwordForm.current_password}
                onChange={handlePasswordChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              />
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                New Password
              </label>
              <input
                type="password"
                name="new_password"
                value={passwordForm.new_password}
                onChange={handlePasswordChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
                minLength={8}
              />
              <p className="mt-1 text-xs text-gray-500">
                Password must be at least 8 characters long
              </p>
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confirm New Password
              </label>
              <input
                type="password"
                name="confirm_password"
                value={passwordForm.confirm_password}
                onChange={handlePasswordChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              />
            </div>
            
            <div className="flex justify-end">
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md flex items-center gap-2"
                disabled={isLoading}
              >
                <FaLock />
                {isLoading ? 'Updating...' : 'Update Password'}
              </button>
            </div>
          </form>
        )}
        
        {activeTab === 'notifications' && (
          <form onSubmit={handleUpdateNotifications}>
            <div className="space-y-4 mb-6">
              <h3 className="text-lg font-medium text-gray-800 mb-2">Email Notifications</h3>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="email_order_updates"
                  name="email_order_updates"
                  checked={notificationSettings.email_order_updates}
                  onChange={handleNotificationChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="email_order_updates" className="ml-2 text-sm text-gray-700">
                  Order status updates
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="email_marketing"
                  name="email_marketing"
                  checked={notificationSettings.email_marketing}
                  onChange={handleNotificationChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="email_marketing" className="ml-2 text-sm text-gray-700">
                  Marketing and promotional emails
                </label>
              </div>
              
              <h3 className="text-lg font-medium text-gray-800 mb-2 mt-6">Push Notifications</h3>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="push_order_updates"
                  name="push_order_updates"
                  checked={notificationSettings.push_order_updates}
                  onChange={handleNotificationChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="push_order_updates" className="ml-2 text-sm text-gray-700">
                  Order status updates
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="push_promotions"
                  name="push_promotions"
                  checked={notificationSettings.push_promotions}
                  onChange={handleNotificationChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="push_promotions" className="ml-2 text-sm text-gray-700">
                  Promotions and special offers
                </label>
              </div>
            </div>
            
            <div className="flex justify-end">
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md flex items-center gap-2"
                disabled={isLoading}
              >
                <FaSave />
                {isLoading ? 'Saving...' : 'Save Preferences'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default Settings; 