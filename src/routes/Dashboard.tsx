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
    const location = useLocation();
    const { user } = useAccountStore();
    
    // Check if user has permission for current route
    const checkPermission = (path: string): boolean => {
        if (!user) return false;
        
        // Routes only super admin can access
        const superAdminRoutes = ['/dashboard/users', '/dashboard/locations'];
        
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

    // Handle responsive layout
    useEffect(() => {
        const checkScreenSize = () => {
            setIsMobile(window.innerWidth < 768);
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

    return (
        <div className="flex w-full h-screen bg-gray-100">
            <Sidebar isMobile={isMobile} />
            
            <div className={`flex-1 transition-all ${isMobile ? 'ml-0' : 'ml-64'} p-6 overflow-auto`}>
                <header className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-800">
                        {getTitle()}
                    </h1>
                    {user && (
                        <div className="text-sm text-gray-500 mt-1">
                            Welcome, {user.first_name} {user.last_name}
                        </div>
                    )}
                </header>
                
                <div className="w-full h-full">
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
                        {/* Catch all other routes */}
                        <Route path="*" element={<Navigate to="/dashboard" replace />} />
                    </Routes>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;