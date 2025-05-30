import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  FaHome, 
  FaStore, 
  FaUtensils, 
  FaHistory, 
  FaComments, 
  FaSignOutAlt,
  FaBars,
  FaTimes,
  FaUsers,
  FaCog,
  FaChartBar
} from 'react-icons/fa';
import useAccountStore from '../store/account';

type SidebarProps = {
  isMobile?: boolean;
}

type MenuItem = {
  name: string;
  path: string;
  icon: JSX.Element;
  roles: string[]; // Which roles can see this item: 'super', 'franchise', 'staff'
}

const Sidebar = ({ isMobile = false }: SidebarProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(!isMobile);
  
  // Get user from account store
  const { user, logout } = useAccountStore();
  
  // List of all available menu items with role access
  const allMenuItems: MenuItem[] = [
    { 
      name: 'Dashboard', 
      path: '/dashboard', 
      icon: <FaHome size={20} />,
      roles: ['super', 'franchise'] // Everyone can see the dashboard
    },
    { 
      name: 'Franchise Locations', 
      path: '/dashboard/locations', 
      icon: <FaStore size={20} />,
      roles: ['super', 'franchise'] // Only super admin can manage all franchise locations
    },
    { 
      name: 'My Location', 
      path: '/dashboard/my-location', 
      icon: <FaStore size={20} />,
      roles: ['franchise'] // Franchise admin can manage their location
    },
    { 
      name: 'Menu Items', 
      path: '/dashboard/menu-items', 
      icon: <FaUtensils size={20} />,
      roles: ['super', 'franchise'] // Both can see menu items
    },
    { 
      name: 'Orders', 
      path: '/dashboard/orders', 
      icon: <FaHistory size={20} />,
      roles: ['super', 'franchise'] // Everyone can see orders
    },
    { 
      name: 'Feedback', 
      path: '/dashboard/feedback', 
      icon: <FaComments size={20} />,
      roles: ['super', 'franchise'] // Both super and franchise admin can see feedback
    },
    { 
      name: 'Staff', 
      path: '/dashboard/users', 
      icon: <FaUsers size={20} />,
      roles: ['super', 'franchise'] // Only super admin can manage users
    },
    { 
      name: 'Analytics', 
      path: '/dashboard/analytics', 
      icon: <FaChartBar size={20} />,
      roles: ['super', 'franchise'] // Both super and franchise admin can see analytics
    },
    { 
      name: 'Settings', 
      path: '/dashboard/settings', 
      icon: <FaCog size={20} />,
      roles: ['super', 'franchise'] // Everyone can see settings
    },
  ];

  // Get the user's role
  const userRoles: string[] = [];
  if (user?.is_super_admin) userRoles.push('super');
  if (user?.is_franchise_admin) userRoles.push('franchise');  

  // Filter menu items based on user's role
  const visibleMenuItems = allMenuItems.filter(item => 
    item.roles.some(role => userRoles.includes(role))
  );

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const handleNavigate = (path: string) => {
    navigate(path);
    if (isMobile) setIsOpen(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <>
      {isMobile && (
        <button 
          onClick={toggleSidebar} 
          className="fixed top-4 left-4 z-50 bg-blue-500 text-white p-2 rounded-md"
        >
          {isOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
        </button>
      )}
      
      <div 
        className={`fixed left-0 top-0 h-screen bg-blue-600 text-white transition-all duration-300 ${
          isOpen ? 'w-64' : isMobile ? 'w-0' : 'w-20'
        } overflow-hidden`}
      >
        <div className="p-5">
          <h2 className={`text-xl font-bold mb-6 ${!isOpen && !isMobile ? 'hidden' : ''}`}>
            Sip N Snack Admin
          </h2>
          {!isOpen && !isMobile && <div className="flex justify-center mb-6"><FaBars size={24} /></div>}
        </div>

        <nav className="mt-8">
          <ul>
            {visibleMenuItems.map((item, index) => (
              <li key={index}>
                <button
                  onClick={() => handleNavigate(item.path)}
                  className={`flex items-center w-full py-3 px-5 hover:bg-blue-700 transition-colors ${
                    location.pathname === item.path ? 'bg-blue-700' : ''
                  }`}
                >
                  <div className="flex justify-center items-center w-8">{item.icon}</div>
                  {isOpen && <span className="ml-3">{item.name}</span>}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <div className="absolute bottom-5 w-full">
          {user && isOpen && (
            <div className="px-5 py-3 border-t border-blue-500 mb-3">
              <p className="text-sm opacity-80">Signed in as:</p>
              <p className="font-semibold">{user.first_name} {user.last_name}</p>
              <p className="text-xs opacity-70">{user.email}</p>
              <div className="mt-1 flex gap-1">
                {user.is_super_admin && (
                  <span className="text-xs bg-amber-500 text-blue-900 px-2 py-1 rounded-full">
                    Super Admin
                  </span>
                )}
                {user.is_franchise_admin && (
                  <span className="text-xs bg-green-400 text-blue-900 px-2 py-1 rounded-full">
                    Franchise Admin
                  </span>
                )}
              </div>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="flex items-center w-full py-3 px-5 hover:bg-blue-700 transition-colors"
          >
            <div className="flex justify-center items-center w-8">
              <FaSignOutAlt size={20} />
            </div>
            {isOpen && <span className="ml-3">Log Out</span>}
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar; 