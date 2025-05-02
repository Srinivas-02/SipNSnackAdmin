import { useState, useEffect } from 'react';
import api from '../../common/api';
import useAccountStore from '../../store/account';

interface AnalyticsData {
  totalSales: number;
  totalOrders: number;
  averageOrderValue: number;
  topSellingItems: {
    id: number;
    name: string;
    quantity: number;
    revenue: number;
  }[];
  salesByDay: {
    date: string;
    sales: number;
  }[];
}

const Analytics = () => {
  const [timeRange, setTimeRange] = useState<'7days' | '30days' | '90days' | 'year'>('30days');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  
  const { user } = useAccountStore();
  const isSuperAdmin = user?.is_super_admin;
  
  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // The endpoint might differ based on user role
        const endpoint = isSuperAdmin 
          ? `/analytics/${timeRange}/` 
          : `/analytics/franchise/${timeRange}/`;
          
        const response = await api.get(endpoint);
        setAnalyticsData(response.data);
      } catch (err) {
        console.error('Error fetching analytics:', err);
        setError('Failed to load analytics data. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchAnalytics();
  }, [timeRange, isSuperAdmin]);

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        <p>{error}</p>
      </div>
    );
  }
  
  // Use placeholder data if analyticsData is null
  // In a real app, this would come from the API
  const data: AnalyticsData = analyticsData || {
    totalSales: 125000,
    totalOrders: 1250,
    averageOrderValue: 100,
    topSellingItems: [
      { id: 1, name: "Mocha Frappuccino", quantity: 450, revenue: 22500 },
      { id: 2, name: "Chicken Sandwich", quantity: 320, revenue: 19200 },
      { id: 3, name: "Vanilla Latte", quantity: 300, revenue: 15000 },
    ],
    salesByDay: [
      { date: "2023-10-01", sales: 4200 },
      { date: "2023-10-02", sales: 4500 },
      { date: "2023-10-03", sales: 3800 },
      { date: "2023-10-04", sales: 4100 },
      { date: "2023-10-05", sales: 4800 },
      { date: "2023-10-06", sales: 5200 },
      { date: "2023-10-07", sales: 6300 },
    ]
  };

  return (
    <div className="space-y-6">
      {/* Time range selector */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setTimeRange('7days')}
            className={`px-4 py-2 rounded-md ${
              timeRange === '7days' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
            }`}
          >
            Last 7 Days
          </button>
          <button
            onClick={() => setTimeRange('30days')}
            className={`px-4 py-2 rounded-md ${
              timeRange === '30days' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
            }`}
          >
            Last 30 Days
          </button>
          <button
            onClick={() => setTimeRange('90days')}
            className={`px-4 py-2 rounded-md ${
              timeRange === '90days' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
            }`}
          >
            Last 90 Days
          </button>
          <button
            onClick={() => setTimeRange('year')}
            className={`px-4 py-2 rounded-md ${
              timeRange === 'year' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
            }`}
          >
            This Year
          </button>
        </div>
      </div>
      
      {/* Key metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-1">Total Sales</h3>
          <p className="text-3xl font-bold text-gray-800">{formatCurrency(data.totalSales)}</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-1">Total Orders</h3>
          <p className="text-3xl font-bold text-gray-800">{data.totalOrders}</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-1">Average Order Value</h3>
          <p className="text-3xl font-bold text-gray-800">{formatCurrency(data.averageOrderValue)}</p>
        </div>
      </div>
      
      {/* Top selling items */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Top Selling Items</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quantity Sold
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Revenue
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.topSellingItems.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {item.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                    {item.quantity}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                    {formatCurrency(item.revenue)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Sales by day chart - placeholder */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Sales Trend</h3>
        <div className="h-64 flex items-center justify-center bg-gray-50 rounded">
          <p className="text-gray-500">
            [Sales Chart Visualization]
            <br />
            (Sales visualization would typically render here using a charting library like Chart.js or Recharts)
          </p>
        </div>
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sales
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.salesByDay.slice().reverse().map((day, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {new Date(day.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                    {formatCurrency(day.sales)}
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

export default Analytics; 