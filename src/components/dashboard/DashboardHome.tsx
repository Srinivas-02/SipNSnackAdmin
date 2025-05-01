import { useState, useEffect } from 'react';
import { FaStore, FaUtensils, FaShoppingCart, FaUsers } from 'react-icons/fa';

// Mock data - in a real app, this would come from an API
const mockData = {
  totalLocations: 12,
  totalMenuItems: 146,
  totalOrders: 2543,
  totalCustomers: 1830,
  recentOrders: [
    { id: '1001', location: 'Downtown Café', items: 3, total: 15.99, status: 'Completed', date: '2025-04-05' },
    { id: '1002', location: 'Beach Corner', items: 1, total: 5.49, status: 'Completed', date: '2025-04-05' },
    { id: '1003', location: 'Central Mall', items: 5, total: 27.35, status: 'In Progress', date: '2025-04-05' },
    { id: '1004', location: 'Park Kiosk', items: 2, total: 8.99, status: 'Completed', date: '2025-04-04' },
    { id: '1005', location: 'University Campus', items: 4, total: 18.75, status: 'Cancelled', date: '2025-04-04' },
  ],
  locationPerformance: [
    { name: 'Downtown Café', revenue: 3245.78, orders: 321 },
    { name: 'Beach Corner', revenue: 2187.45, orders: 186 },
    { name: 'Central Mall', revenue: 4532.21, orders: 428 },
    { name: 'Park Kiosk', revenue: 1783.55, orders: 201 },
    { name: 'University Campus', revenue: 3098.32, orders: 287 },
  ]
};

const DashboardHome = () => {
  const [dashboardData, setDashboardData] = useState(mockData);
  
  // In a real app, we would fetch data here
  useEffect(() => {
    // Example API call
    // const fetchData = async () => {
    //   try {
    //     const response = await fetch('/api/dashboard');
    //     const data = await response.json();
    //     setDashboardData(data);
    //   } catch (error) {
    //     console.error('Error fetching dashboard data:', error);
    //   }
    // };
    // fetchData();
  }, []);

  const StatCard = ({ title, value, icon, color }: { title: string, value: number, icon: JSX.Element, color: string }) => (
    <div className={`bg-white p-6 rounded-lg shadow-sm border-l-4 ${color}`}>
      <div className="flex justify-between items-center">
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <p className="text-2xl font-semibold mt-1">{value}</p>
        </div>
        <div className={`${color.replace('border-', 'text-')} bg-opacity-20 p-3 rounded-full`}>
          {icon}
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Locations" 
          value={dashboardData.totalLocations} 
          icon={<FaStore size={24} />} 
          color="border-blue-500" 
        />
        <StatCard 
          title="Total Menu Items" 
          value={dashboardData.totalMenuItems} 
          icon={<FaUtensils size={24} />} 
          color="border-green-500" 
        />
        <StatCard 
          title="Total Orders" 
          value={dashboardData.totalOrders} 
          icon={<FaShoppingCart size={24} />} 
          color="border-orange-500" 
        />
        <StatCard 
          title="Total Customers" 
          value={dashboardData.totalCustomers} 
          icon={<FaUsers size={24} />} 
          color="border-purple-500" 
        />
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-lg font-semibold mb-4">Recent Orders</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {dashboardData.recentOrders.map((order) => (
                <tr key={order.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#{order.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.location}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.items}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${order.total.toFixed(2)}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${order.status === 'Completed' ? 'bg-green-100 text-green-800' : 
                        order.status === 'In Progress' ? 'bg-blue-100 text-blue-800' : 
                        'bg-red-100 text-red-800'}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-lg font-semibold mb-4">Location Performance</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Orders</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avg. Order Value</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {dashboardData.locationPerformance.map((location, idx) => (
                <tr key={idx}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{location.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${location.revenue.toFixed(2)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{location.orders}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ${(location.revenue / location.orders).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DashboardHome; 