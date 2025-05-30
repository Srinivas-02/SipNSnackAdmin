import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAccountStore from '../store/account';

const NoLocationAssigned = () => {
  const navigate = useNavigate();
  const { logout } = useAccountStore();

  useEffect(() => {
    // Log out the user after 5 seconds and redirect to login
    const timer = setTimeout(() => {
      logout();
      navigate('/', { replace: true });
    }, 5000);

    return () => clearTimeout(timer);
  }, [logout, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 to-orange-100">
      <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full mx-4">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">No Location Assigned</h2>
        <p className="text-gray-600 mb-6">
          You don't have any locations assigned to your account. Please contact the super admin to assign a location.
        </p>
        <div className="bg-amber-50 border-l-4 border-amber-400 p-4">
          <p className="text-amber-700">
            You will be automatically logged out in 5 seconds and redirected to the login page.
          </p>
        </div>
      </div>
    </div>
  );
};

export default NoLocationAssigned; 