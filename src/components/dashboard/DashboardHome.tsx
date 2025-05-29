import { useState, useEffect } from 'react';
import { FaStore, FaUtensils, FaShoppingCart, FaUsers, FaChartLine } from 'react-icons/fa';
import useOrdersStore from '../../store/orders';
import useLocationStore from '../../store/location';
import useAccountStore from '../../store/account';
import { format } from 'date-fns';

const DashboardHome = () => {
  const { orders, fetchOrders } = useOrdersStore();
  const { locations, fetchLocations } = useLocationStore();
  const { user } = useAccountStore();
  
  const [recentOrders, setRecentOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    activeLocations: 0,
    averageOrderValue: 0
  });

  // Handle responsive design
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Fetch dashboard data on component mount
  useEffect(() => {
    const loadDashboardData = async () => {
      setIsLoading(true);
      try {
        await Promise.all([
          fetchOrders(),
          fetchLocations()
        ]);
        setIsLoading(false);
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
        setIsLoading(false);
      }
    };

    loadDashboardData();
  }, [fetchOrders, fetchLocations]);

  // Calculate dashboard stats whenever orders or locations change
  useEffect(() => {
    if (orders.length > 0) {
      // Get recent orders (last 5)
      const recent = [...orders].sort((a, b) => 
        new Date(b.order_date).getTime() - new Date(a.order_date).getTime()
      ).slice(0, 5);
      
      setRecentOrders(recent);
      
      // Calculate total revenue
      const revenue = orders.reduce((sum, order) => sum + order.total_amount, 0);
      
      // Set stats
      setStats({
        totalOrders: orders.length,
        totalRevenue: revenue,
        activeLocations: locations.filter(loc => loc.is_active).length,
        averageOrderValue: orders.length > 0 ? revenue / orders.length : 0
      });
    }
  }, [orders, locations]);

  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), isMobile ? 'MMM dd' : 'MMM dd, yyyy • HH:mm');
    } catch (e) {
      return dateString;
    }
  };

  const formatCurrency = (amount) => {
    return isMobile ? `₹${amount.toFixed(0)}` : `Rs ${amount.toFixed(2)}`;
  };

  // Mobile Card Component for Stats
  const StatCard = ({ icon, label, value, colorClass }) => (
    <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
      <div className={`flex items-center ${isMobile ? 'flex-col text-center' : ''}`}>
        <div className={`p-2 sm:p-3 rounded-full ${colorClass} ${isMobile ? 'mb-3' : ''}`}>
          {icon}
        </div>
        <div className={`${isMobile ? '' : 'ml-4'}`}>
          <p className={`text-xs sm:text-sm text-gray-500 uppercase ${isMobile ? 'mb-1' : ''}`}>
            {label}
          </p>
          <h3 className={`${isMobile ? 'text-lg' : 'text-xl sm:text-2xl'} font-bold text-gray-800`}>
            {value}
          </h3>
        </div>
      </div>
    </div>
  );

  // Mobile Order Card Component
  const MobileOrderCard = ({ order }) => (
    <div className="bg-white border border-gray-200 rounded-lg p-4 mb-3">
      <div className="flex justify-between items-start mb-2">
        <div>
          <p className="font-semibold text-gray-900 text-sm">#{order.order_number}</p>
          <p className="text-xs text-gray-500">{formatDate(order.order_date)}</p>
        </div>
        <p className="font-bold text-green-600">{formatCurrency(order.total_amount)}</p>
      </div>
      <p className="text-sm text-gray-600 truncate">{order.location_name}</p>
    </div>
  );

  // Mobile Location Card Component
  const MobileLocationCard = ({ location }) => (
    <div className="bg-white border border-gray-200 rounded-lg p-4 mb-3">
      <div className="flex justify-between items-start mb-2">
        <div className="flex-1">
          <p className="font-semibold text-gray-900 text-sm">{location.name}</p>
          <p className="text-xs text-gray-500 mt-1">{location.city}</p>
        </div>
        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
          location.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {location.is_active ? 'Active' : 'Inactive'}
        </span>
      </div>
      <p className="text-sm text-gray-600 truncate">{location.address}</p>
    </div>
  );

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 p-3 sm:p-0">
      {/* Stats Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          icon={<FaShoppingCart size={isMobile ? 20 : 24} />}
          label="Total Orders"
          value={stats.totalOrders}
          colorClass="bg-blue-100 text-blue-600"
        />
        <StatCard
          icon={<FaChartLine size={isMobile ? 20 : 24} />}
          label="Total Revenue"
          value={formatCurrency(stats.totalRevenue)}
          colorClass="bg-green-100 text-green-600"
        />
        <StatCard
          icon={<FaStore size={isMobile ? 20 : 24} />}
          label="Active Locations"
          value={stats.activeLocations}
          colorClass="bg-orange-100 text-orange-600"
        />
        <StatCard
          icon={<FaUtensils size={isMobile ? 20 : 24} />}
          label="Avg. Order Value"
          value={formatCurrency(stats.averageOrderValue)}
          colorClass="bg-purple-100 text-purple-600"
        />
      </div>
      
      {/* Recent Orders */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
          <h2 className="text-base sm:text-lg font-semibold text-gray-800">Recent Orders</h2>
        </div>
        
        {recentOrders.length === 0 ? (
          <div className="text-center py-6 text-gray-500">No recent orders found</div>
        ) : (
          <>
            {/* Mobile View */}
            {isMobile ? (
              <div className="p-4">
                {recentOrders.map((order) => (
                  <MobileOrderCard key={order.id} order={order} />
                ))}
              </div>
            ) : (
              /* Desktop/Tablet Table View */
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Order #
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Location
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {recentOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {order.order_number}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(order.order_date)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {order.location_name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatCurrency(order.total_amount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>
      
      {/* Locations Overview (for Super Admin) */}
      {user && user.is_super_admin && locations.length > 0 && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
            <h2 className="text-base sm:text-lg font-semibold text-gray-800">Locations Overview</h2>
          </div>
          
          {/* Mobile View */}
          {isMobile ? (
            <div className="p-4">
              {locations.map((location) => (
                <MobileLocationCard key={location.id} location={location} />
              ))}
            </div>
          ) : (
            /* Desktop/Tablet Table View */
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Address
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      City
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {locations.map((location) => (
                    <tr key={location.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {location.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {location.address}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {location.city}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          location.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {location.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DashboardHome;