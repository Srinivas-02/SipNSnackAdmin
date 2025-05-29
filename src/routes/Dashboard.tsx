import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import DashboardHome from '../components/dashboard/DashboardHome';
import Locations from '../components/dashboard/Locations';
import MyLocation from '../components/dashboard/MyLocation';
import MenuItems from '../components/dashboard/MenuItems';
import Orders from '../components/dashboard/Orders';
import Feedback from '../components/dashboard/Feedback';
import Staff from '../components/dashboard/Staff';
import Analytics from '../components/dashboard/Analytics';
import Settings from '../components/dashboard/Settings';
import useAccountStore from '../store/account';

const Dashboard = () => {
    const [isMobile, setIsMobile] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const location = useLocation();
    const { user } = useAccountStore();
    
    // Check if user has permission for current route
    const checkPermission = (path: string): boolean => {
        if (!user) return false;
        
        // Routes only super admin can access
        const superAdminRoutes = ['/dashboard/users'];
        
        // Routes only franchise admin can access
        const franchiseAdminRoutes = ['/dashboard/my-location'];
        
        // Check permissions based on path and role
        if (superAdminRoutes.includes(path) && !user.is_super_admin) {
            return false;
        }
        
        if (franchiseAdminRoutes.includes(path) && !user.is_franchise_admin) {
            return false;
        }
        
        return true;
    };

    // Enhanced responsive breakpoints
    useEffect(() => {
        const checkScreenSize = () => {
            const width = window.innerWidth;
            setIsMobile(width < 1024); // Mobile/tablet under 1024px
        };
        
        checkScreenSize();
        window.addEventListener('resize', checkScreenSize);
        
        return () => window.removeEventListener('resize', checkScreenSize);
    }, []);

    // Get the title based on current path
    const getTitle = (): string => {
        const pathMap: Record<string, string> = {
            '/dashboard': 'Dashboard Overview',
            '/dashboard/locations': 'Manage Franchise Locations',
            '/dashboard/my-location': 'My Location',
            '/dashboard/menu-items': 'Menu Items',
            '/dashboard/orders': 'Order History',
            '/dashboard/feedback': 'Customer Feedback',
            '/dashboard/users': 'Staff Management',
            '/dashboard/analytics': 'Analytics',
            '/dashboard/settings': 'System Settings'
        };
        
        return pathMap[location.pathname] || 'Dashboard';
    };

    // Get responsive margins based on screen size
    const getContentMargins = () => {
        if (isMobile) {
            return 'ml-0'; // No left margin on mobile/tablet
        } else {
            return 'ml-64'; // Full sidebar width on desktop
        }
    };

    // Get responsive padding
    const getContentPadding = () => {
        if (isMobile) {
            return 'px-4 py-4'; // Minimal padding on mobile/tablet
        } else {
            return 'px-8 py-8'; // Full padding on desktop
        }
    };

    return (
        <div className="flex w-full h-screen bg-gray-100">
            <Sidebar 
                isMobile={isMobile} 
                isMobileMenuOpen={isMobileMenuOpen}
                setIsMobileMenuOpen={setIsMobileMenuOpen}
            />
            
            {/* Main Content Area */}
            <div className={`
                flex-1 transition-all duration-300 overflow-auto
                ${getContentMargins()}
                ${getContentPadding()}
            `}>
                {/* Mobile/Tablet Top Bar with Logo and Title - Only for mobile */}
                {isMobile && (
                    <>
                        <div className="mb-6">
                            <div className="bg-white rounded-lg shadow-sm p-4">
                                <div className="flex items-center">
                                    {/* Logo - Clickable to open menu */}
                                    <button
                                        onClick={() => {
                                            console.log('Logo clicked!'); // Debug log
                                            setIsMobileMenuOpen(true);
                                        }}
                                        className="flex-shrink-0 mr-4 p-2 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200"
                                        aria-label="Open menu"
                                    >
                                        <img 
                                            src="/src/assets/Logo.png" 
                                            alt="Sip N Snack Logo" 
                                            className="h-8 w-8 object-contain"
                                        />
                                    </button>
                                    
                                    {/* Admin Panel Title and Welcome - Left aligned */}
                                    <div className="flex flex-col items-start">
                                        <h2 className="text-xl font-semibold text-gray-800">
                                            Sip N Snack Admin Panel
                                        </h2>
                                        {user && (
                                            <p className="text-sm text-gray-600">
                                                Welcome, {user.first_name}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        {/* Page Title */}
                        <div className="mb-6 text-left">
                            <h1 className="text-2xl font-bold text-gray-800">
                                {getTitle()}
                            </h1>
                        </div>
                    </>
                )}
                
                {/* Desktop Page Title - Simple title only */}
                {!isMobile && (
                    <div className="mb-6">
                        <h1 className="text-2xl font-bold text-gray-800">
                            {getTitle()}
                        </h1>
                    </div>
                )}
                
                {/* Routes Container */}
                <div className="w-full flex-1">
                    <Routes>
                        <Route path="/" element={<DashboardHome />} />
                        <Route 
                            path="/locations" 
                            element={
                                checkPermission('/dashboard/locations') 
                                    ? <Locations /> 
                                    : <Navigate to="/dashboard" replace />
                            } 
                        />
                        <Route 
                            path="/my-location" 
                            element={
                                checkPermission('/dashboard/my-location') 
                                    ? <MyLocation /> 
                                    : <Navigate to="/dashboard" replace />
                            } 
                        />
                        <Route path="/menu-items" element={<MenuItems />} />
                        <Route path="/orders" element={<Orders />} />
                        <Route path="/feedback" element={<Feedback />} />
                        <Route 
                            path="/users" 
                            element={
                                checkPermission('/dashboard/users') 
                                    ? <Staff /> 
                                    : <Navigate to="/dashboard" replace />
                            } 
                        />
                        <Route path="/analytics" element={<Analytics />} />
                        <Route path="/settings" element={<Settings />} />
                        <Route path="*" element={<Navigate to="/dashboard" replace />} />
                    </Routes>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
