import { useEffect } from 'react';
import { ReactElement } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  FaHome, 
  FaStore, 
  FaUtensils, 
  FaHistory, 
  FaComments, 
  FaSignOutAlt,
  FaTimes,
  FaUsers,
  FaCog,
  FaChartBar
} from 'react-icons/fa';
import useAccountStore from '../store/account';

type SidebarProps = {
  isMobile?: boolean;
  isMobileMenuOpen?: boolean;
  setIsMobileMenuOpen?: React.Dispatch<React.SetStateAction<boolean>>;
}

type MenuItem = {
  name: string;
  path: string;
  icon: ReactElement;
  roles: string[];
}

const Sidebar = ({ 
  isMobile = false, 
  isMobileMenuOpen = false,
  setIsMobileMenuOpen
}: SidebarProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const { user, logout } = useAccountStore();
  
  // Close sidebar on route change for mobile
  useEffect(() => {
    if (isMobile && setIsMobileMenuOpen) {
      setIsMobileMenuOpen(false);
    }
  }, [location.pathname, isMobile, setIsMobileMenuOpen]);

  // Prevent body scroll when mobile sidebar is open
  useEffect(() => {
    if (isMobile && isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    // Cleanup on unmount
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobile, isMobileMenuOpen]);
  
  const allMenuItems: MenuItem[] = [
    { 
      name: 'Dashboard', 
      path: '/dashboard', 
      icon: <FaHome size={isMobile ? 16 : 20} />,
      roles: ['super', 'franchise']
    },
    { 
      name: 'Franchise Locations', 
      path: '/dashboard/locations', 
      icon: <FaStore size={isMobile ? 16 : 20} />,
      roles: ['super', 'franchise']
    },
    { 
      name: 'My Location', 
      path: '/dashboard/my-location', 
      icon: <FaStore size={isMobile ? 16 : 20} />,
      roles: ['franchise']
    },
    { 
      name: 'Menu Items', 
      path: '/dashboard/menu-items', 
      icon: <FaUtensils size={isMobile ? 16 : 20} />,
      roles: ['super', 'franchise']
    },
    { 
      name: 'Orders', 
      path: '/dashboard/orders', 
      icon: <FaHistory size={isMobile ? 16 : 20} />,
      roles: ['super', 'franchise']
    },
    { 
      name: 'Feedback', 
      path: '/dashboard/feedback', 
      icon: <FaComments size={isMobile ? 16 : 20} />,
      roles: ['super', 'franchise']
    },
    { 
      name: 'Staff', 
      path: '/dashboard/users', 
      icon: <FaUsers size={isMobile ? 16 : 20} />,
      roles: ['super', 'franchise']
    },
    { 
      name: 'Analytics', 
      path: '/dashboard/analytics', 
      icon: <FaChartBar size={isMobile ? 16 : 20} />,
      roles: ['super', 'franchise']
    },
    { 
      name: 'Settings', 
      path: '/dashboard/settings', 
      icon: <FaCog size={isMobile ? 16 : 20} />,
      roles: ['super', 'franchise']
    },
  ];

  const userRoles: string[] = [];
  if (user?.is_super_admin) userRoles.push('super');
  if (user?.is_franchise_admin) userRoles.push('franchise');  

  const visibleMenuItems = allMenuItems.filter(item => 
    item.roles.some(role => userRoles.includes(role))
  );

  const handleNavigate = (path: string) => {
    navigate(path);
    // Auto-close mobile sidebar
    if (isMobile && setIsMobileMenuOpen) {
      setIsMobileMenuOpen(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Mobile overlay backdrop
  const renderBackdrop = () => {
    if (!isMobile || !isMobileMenuOpen) return null;
    
    return (
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={() => setIsMobileMenuOpen && setIsMobileMenuOpen(false)}
      />
    );
  };

  // Don't render sidebar on desktop if not supposed to be visible
  if (!isMobile) {
    // Always show sidebar on desktop
    return (
      <div className="fixed left-0 top-0 h-screen bg-blue-600 text-white w-64 flex flex-col z-40">
        {/* Header */}
        <div className="p-5 border-b border-blue-500 flex-shrink-0">
          <div className="flex items-center">
            <div>
              <h2 className="text-xl font-bold text-white">
                Sip N Snack Admin Panel
              </h2>
              {user && (
                <p className="text-sm text-blue-200 mt-1">
                  Welcome, {user.first_name}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 overflow-y-auto">
          <ul className="space-y-1">
            {visibleMenuItems.map((item, index) => (
              <li key={index}>
                <button
                  onClick={() => handleNavigate(item.path)}
                  className={`
                    flex items-center w-full py-3 px-5 hover:bg-blue-700 transition-colors
                    ${location.pathname === item.path ? 'bg-blue-700 border-r-4 border-blue-300' : ''}
                  `}
                >
                  <div className="flex justify-center items-center w-8">
                    {item.icon}
                  </div>
                  <span className="ml-3 font-medium">{item.name}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* User info and logout */}
        <div className="border-t border-blue-500 flex-shrink-0">
          {user && (
            <div className="px-5 py-4">
              <p className="text-sm opacity-80 mb-1">Signed in as:</p>
              <p className="font-semibold text-blue-100">{user.first_name} {user.last_name}</p>
              <p className="text-xs opacity-70 mb-2">{user.email}</p>
              <div className="flex gap-1 flex-wrap">
                {user.is_super_admin && (
                  <span className="text-xs bg-amber-500 text-blue-900 px-2 py-1 rounded-full font-medium">
                    Super Admin
                  </span>
                )}
                {user.is_franchise_admin && (
                  <span className="text-xs bg-green-400 text-blue-900 px-2 py-1 rounded-full font-medium">
                    Franchise Admin
                  </span>
                )}
              </div>
            </div>
          )}
          
          <button
            onClick={handleLogout}
            className="flex items-center w-full py-4 px-5 hover:bg-red-600 transition-colors"
          >
            <div className="flex justify-center items-center w-8">
              <FaSignOutAlt size={20} />
            </div>
            <span className="ml-3 font-medium">Log Out</span>
          </button>
        </div>
      </div>
    );
  }

  // Mobile sidebar
  return (
    <>
      {/* Backdrop for mobile */}
      {renderBackdrop()}
      
      {/* Mobile Sidebar */}
      <div 
        className={`
          fixed left-0 top-0 h-screen bg-blue-600 text-white transition-all duration-300 ease-in-out z-50
          w-72
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
          flex flex-col
        `}
      >
        {/* Header with Close Button */}
        <div className="p-4 border-b border-blue-500 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white">
                Sip N Snack Admin Panel
              </h2>
              {user && (
                <p className="text-sm text-blue-200 mt-1">
                  Welcome, {user.first_name}
                </p>
              )}
            </div>
            
            {/* Close button */}
            <button 
              onClick={() => setIsMobileMenuOpen && setIsMobileMenuOpen(false)}
              className="p-2 rounded hover:bg-blue-700 transition-colors"
              aria-label="Close sidebar"
            >
              <FaTimes size={16} />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-3 overflow-y-auto">
          <ul className="space-y-1">
            {visibleMenuItems.map((item, index) => (
              <li key={index}>
                <button
                  onClick={() => handleNavigate(item.path)}
                  className={`
                    flex items-center w-full py-2.5 px-4 hover:bg-blue-700 transition-colors
                    ${location.pathname === item.path ? 'bg-blue-700 border-r-4 border-blue-300' : ''}
                  `}
                >
                  <div className="flex justify-center items-center w-6">
                    {item.icon}
                  </div>
                  <span className="ml-3 text-sm font-medium">{item.name}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* User info and logout */}
        <div className="border-t border-blue-500 flex-shrink-0">
          {user && (
            <div className="px-4 py-3">
              <p className="text-xs opacity-80 mb-1">Signed in as:</p>
              <p className="text-sm font-semibold text-blue-100">{user.first_name} {user.last_name}</p>
              <p className="text-xs opacity-70 mb-2">{user.email}</p>
              <div className="flex gap-1 flex-wrap">
                {user.is_super_admin && (
                  <span className="text-xs bg-amber-500 text-blue-900 px-2 py-1 rounded-full font-medium">
                    Super Admin
                  </span>
                )}
                {user.is_franchise_admin && (
                  <span className="text-xs bg-green-400 text-blue-900 px-2 py-1 rounded-full font-medium">
                    Franchise Admin
                  </span>
                )}
              </div>
            </div>
          )}
          
          <button
            onClick={handleLogout}
            className="flex items-center w-full py-3 px-4 hover:bg-red-600 transition-colors"
          >
            <div className="flex justify-center items-center w-6">
              <FaSignOutAlt size={16} />
            </div>
            <span className="ml-3 text-sm font-medium">Log Out</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;