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
  FaTimes
} from 'react-icons/fa';

type SidebarProps = {
  isMobile?: boolean;
}

const Sidebar = ({ isMobile = false }: SidebarProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(!isMobile);

  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: <FaHome size={20} /> },
    { name: 'Locations', path: '/dashboard/locations', icon: <FaStore size={20} /> },
    { name: 'Menu Items', path: '/dashboard/menu-items', icon: <FaUtensils size={20} /> },
    { name: 'Order History', path: '/dashboard/orders', icon: <FaHistory size={20} /> },
    { name: 'Feedback', path: '/dashboard/feedback', icon: <FaComments size={20} /> },
  ];

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const handleNavigate = (path: string) => {
    navigate(path);
    if (isMobile) setIsOpen(false);
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
            {menuItems.map((item, index) => (
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
          <button
            onClick={() => navigate('/')}
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