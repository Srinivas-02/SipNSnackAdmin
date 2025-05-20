import { useState, useEffect } from 'react';
import { FaStore, FaUtensils, FaShoppingCart, FaUsers, FaChartLine } from 'react-icons/fa';
import useOrdersStore, { Order } from '../../store/orders';
import useLocationStore, { Location } from '../../store/location';
import useAccountStore from '../../store/account';
import { format } from 'date-fns';

const DashboardHome = () => {
  const { orders, fetchOrders } = useOrdersStore();
  const { locations, fetchLocations } = useLocationStore();
  const { user } = useAccountStore();
  
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    activeLocations: 0,
    averageOrderValue: 0
  });

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
        activeLocations: locations.filter(loc => loc.status === 'active').length,
        averageOrderValue: orders.length > 0 ? revenue / orders.length : 0
      });
    }
  }, [orders, locations]);

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy • HH:mm');
    } catch (e) {
      return dateString;
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 text-blue-600">
              <FaShoppingCart size={24} />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500 uppercase">Total Orders</p>
              <h3 className="text-2xl font-bold text-gray-800">{stats.totalOrders}</h3>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 text-green-600">
              <FaChartLine size={24} />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500 uppercase">Total Revenue</p>
              <h3 className="text-2xl font-bold text-gray-800">Rs {stats.totalRevenue.toFixed(2)}</h3>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-orange-100 text-orange-600">
              <FaStore size={24} />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500 uppercase">Active Locations</p>
              <h3 className="text-2xl font-bold text-gray-800">{stats.activeLocations}</h3>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100 text-purple-600">
              <FaUtensils size={24} />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500 uppercase">Avg. Order Value</p>
              <h3 className="text-2xl font-bold text-gray-800">Rs {stats.averageOrderValue.toFixed(2)}</h3>
            </div>
          </div>
        </div>
      </div>
      
      {/* Recent Orders */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">Recent Orders</h2>
        </div>
        
        <div className="overflow-x-auto">
          {recentOrders.length === 0 ? (
            <div className="text-center py-6 text-gray-500">No recent orders found</div>
          ) : (
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
                      Rs {order.total_amount.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
      
      {/* Locations Overview (for Super Admin) */}
      {user && user.is_super_admin && locations.length > 0 && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800">Locations Overview</h2>
          </div>
          
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
                        location.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {location.status === 'active' ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardHome; 