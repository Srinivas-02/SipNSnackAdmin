import { Routes, Route, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import DashboardHome from '../components/dashboard/DashboardHome';
import Locations from '../components/dashboard/Locations';
import MenuItems from '../components/dashboard/MenuItems';
import Orders from '../components/dashboard/Orders';
import Feedback from '../components/dashboard/Feedback';

const Dashboard = () => {
    const [isMobile, setIsMobile] = useState(false);
    const location = useLocation();

    useEffect(() => {
        const checkScreenSize = () => {
            setIsMobile(window.innerWidth < 768);
        };
        
        checkScreenSize();
        window.addEventListener('resize', checkScreenSize);
        
        return () => window.removeEventListener('resize', checkScreenSize);
    }, []);

    return (
        <div className="flex w-full h-screen bg-gray-100">
            <Sidebar isMobile={isMobile} />
            
            <div className={`flex-1 transition-all ${isMobile ? 'ml-0' : 'ml-64'} p-6 overflow-auto`}>
                <header className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-800">
                        {location.pathname === '/dashboard' ? 'Dashboard Overview' :
                         location.pathname === '/dashboard/locations' ? 'Manage Locations' :
                         location.pathname === '/dashboard/menu-items' ? 'Menu Items' :
                         location.pathname === '/dashboard/orders' ? 'Order History' :
                         location.pathname === '/dashboard/feedback' ? 'Customer Feedback' : ''}
                    </h1>
                </header>
                
                <div className="w-full h-full">
                    <Routes>
                        <Route path="/" element={<DashboardHome />} />
                        <Route path="/locations" element={<Locations />} />
                        <Route path="/menu-items" element={<MenuItems />} />
                        <Route path="/orders" element={<Orders />} />
                        <Route path="/feedback" element={<Feedback />} />
                    </Routes>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;