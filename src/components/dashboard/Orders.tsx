import { useState, useEffect } from 'react';
import { FaSearch, FaEye, FaDownload } from 'react-icons/fa';

// Mock data
const initialLocations = [
  { id: '1', name: 'Downtown Café' },
  { id: '2', name: 'Beach Corner' },
  { id: '3', name: 'Central Mall' },
  { id: '4', name: 'Park Kiosk' },
  { id: '5', name: 'University Campus' },
];

const initialOrders = [
  { 
    id: '1001', 
    locationId: '1',
    customerName: 'John Smith', 
    date: '2025-04-05T09:23:45', 
    status: 'Completed', 
    total: 15.99,
    items: [
      { name: 'Classic Cappuccino', quantity: 2, price: 4.50 },
      { name: 'Blueberry Muffin', quantity: 1, price: 3.25 },
      { name: 'Bottled Water', quantity: 1, price: 2.99 },
    ],
    paymentMethod: 'Credit Card'
  },
  { 
    id: '1002', 
    locationId: '2',
    customerName: 'Sarah Johnson', 
    date: '2025-04-05T10:45:12', 
    status: 'Completed', 
    total: 5.49,
    items: [
      { name: 'Iced Latte', quantity: 1, price: 5.00 },
    ],
    paymentMethod: 'Cash'
  },
  { 
    id: '1003', 
    locationId: '3',
    customerName: 'Michael Brown', 
    date: '2025-04-05T12:18:30', 
    status: 'In Progress', 
    total: 27.35,
    items: [
      { name: 'Avocado Toast', quantity: 2, price: 7.95 },
      { name: 'Cold Brew', quantity: 1, price: 4.75 },
      { name: 'Fruit Salad', quantity: 1, price: 5.95 },
    ],
    paymentMethod: 'Mobile Payment'
  },
  { 
    id: '1004', 
    locationId: '4',
    customerName: 'Emily Davis', 
    date: '2025-04-04T15:33:22', 
    status: 'Completed', 
    total: 8.99,
    items: [
      { name: 'Hot Chocolate', quantity: 1, price: 4.50 },
      { name: 'Chocolate Chip Cookie', quantity: 2, price: 2.25 },
    ],
    paymentMethod: 'Credit Card'
  },
  { 
    id: '1005', 
    locationId: '5',
    customerName: 'David Wilson', 
    date: '2025-04-04T16:42:15', 
    status: 'Cancelled', 
    total: 18.75,
    items: [
      { name: 'Fresh Fruit Cup', quantity: 1, price: 4.99 },
      { name: 'Chicken Wrap', quantity: 1, price: 8.99 },
      { name: 'Smoothie', quantity: 1, price: 5.50 },
    ],
    paymentMethod: 'Credit Card'
  },
  { 
    id: '1006', 
    locationId: '1',
    customerName: 'Jessica Miller', 
    date: '2025-04-04T08:15:45', 
    status: 'Completed', 
    total: 12.25,
    items: [
      { name: 'Latte', quantity: 1, price: 4.75 },
      { name: 'Breakfast Sandwich', quantity: 1, price: 7.50 },
    ],
    paymentMethod: 'Mobile Payment'
  },
  { 
    id: '1007', 
    locationId: '3',
    customerName: 'Robert Taylor', 
    date: '2025-04-03T14:20:10', 
    status: 'Completed', 
    total: 22.95,
    items: [
      { name: 'Turkey Club Sandwich', quantity: 1, price: 10.95 },
      { name: 'Iced Tea', quantity: 1, price: 3.50 },
      { name: 'Caesar Salad', quantity: 1, price: 8.50 },
    ],
    paymentMethod: 'Credit Card'
  },
  { 
    id: '1008', 
    locationId: '2',
    customerName: 'Amanda Martinez', 
    date: '2025-04-03T11:05:32', 
    status: 'Completed', 
    total: 16.75,
    items: [
      { name: 'Mocha Frappe', quantity: 2, price: 5.75 },
      { name: 'Bagel with Cream Cheese', quantity: 1, price: 4.25 },
    ],
    paymentMethod: 'Cash'
  },
  { 
    id: '1009', 
    locationId: '5',
    customerName: 'Christopher Lee', 
    date: '2025-04-02T17:48:23', 
    status: 'Completed', 
    total: 32.50,
    items: [
      { name: 'Family Meal Package', quantity: 1, price: 32.50 },
    ],
    paymentMethod: 'Credit Card'
  },
  { 
    id: '1010', 
    locationId: '4',
    customerName: 'Lisa Rodriguez', 
    date: '2025-04-02T13:12:45', 
    status: 'Completed', 
    total: 9.25,
    items: [
      { name: 'Vanilla Latte', quantity: 1, price: 4.75 },
      { name: 'Croissant', quantity: 1, price: 3.50 },
      { name: 'Banana', quantity: 1, price: 1.00 },
    ],
    paymentMethod: 'Mobile Payment'
  },
];

interface Location {
  id: string;
  name: string;
}

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  locationId: string;
  customerName: string;
  date: string;
  status: 'Completed' | 'In Progress' | 'Cancelled';
  total: number;
  items: OrderItem[];
  paymentMethod: string;
}

const Orders = () => {
  const [locations, setLocations] = useState<Location[]>(initialLocations);
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [selectedLocation, setSelectedLocation] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [dateRange, setDateRange] = useState<{start: string, end: string}>({
    start: '',
    end: ''
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [showOrderDetails, setShowOrderDetails] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 10;

  // In a real app, would fetch from API
  useEffect(() => {
    // const fetchOrders = async () => {
    //   try {
    //     const locationsResponse = await fetch('/api/locations');
    //     const locationsData = await locationsResponse.json();
    //     setLocations(locationsData);
    //
    //     const ordersResponse = await fetch('/api/orders');
    //     const ordersData = await ordersResponse.json();
    //     setOrders(ordersData);
    //   } catch (error) {
    //     console.error('Error fetching orders:', error);
    //   }
    // };
    // fetchOrders();
  }, []);

  // Filter orders based on selected filters
  const filteredOrders = orders.filter(order => {
    // Filter by location
    if (selectedLocation !== 'all' && order.locationId !== selectedLocation) {
      return false;
    }
    
    // Filter by status
    if (selectedStatus !== 'all' && order.status !== selectedStatus) {
      return false;
    }
    
    // Filter by date range
    if (dateRange.start && new Date(order.date) < new Date(dateRange.start)) {
      return false;
    }
    
    if (dateRange.end && new Date(order.date) > new Date(`${dateRange.end}T23:59:59`)) {
      return false;
    }
    
    // Filter by search term (order ID or customer name)
    if (searchTerm && 
        !order.id.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !order.customerName.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    
    return true;
  });

  // Pagination
  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder);
  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  const resetFilters = () => {
    setSelectedLocation('all');
    setSelectedStatus('all');
    setDateRange({ start: '', end: '' });
    setSearchTerm('');
    setCurrentPage(1);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleViewDetails = (orderId: string) => {
    setShowOrderDetails(orderId);
  };

  const handleExportCSV = () => {
    // In a real app, this would generate a CSV file for download
    alert('Export functionality would be implemented here');
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-lg font-semibold mb-4">Filter Orders</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="all">All Locations</option>
              {locations.map((location) => (
                <option key={location.id} value={location.id}>{location.name}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="all">All Statuses</option>
              <option value="Completed">Completed</option>
              <option value="In Progress">In Progress</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
        </div>
        
        <div className="mt-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="relative w-full md:w-auto">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search by order ID or customer..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full md:w-80"
            />
          </div>
          
          <div className="flex gap-2 w-full md:w-auto">
            <button
              onClick={resetFilters}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 w-full md:w-auto"
            >
              Reset Filters
            </button>
            <button
              onClick={handleExportCSV}
              className="flex items-center justify-center gap-2 bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 w-full md:w-auto"
            >
              <FaDownload size={14} />
              <span>Export CSV</span>
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentOrders.length > 0 ? (
                currentOrders.map((order) => (
                  <tr key={order.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#{order.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(order.date)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.customerName}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {locations.find(loc => loc.id === order.locationId)?.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">${order.total.toFixed(2)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${order.status === 'Completed' ? 'bg-green-100 text-green-800' : 
                          order.status === 'In Progress' ? 'bg-blue-100 text-blue-800' : 
                          'bg-red-100 text-red-800'}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <button 
                        onClick={() => handleViewDetails(order.id)}
                        className="text-blue-500 hover:text-blue-700 flex items-center gap-1"
                      >
                        <FaEye size={16} />
                        <span>View</span>
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-sm text-gray-500 text-center">
                    No orders found matching your filters
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        {filteredOrders.length > ordersPerPage && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200">
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing <span className="font-medium">{indexOfFirstOrder + 1}</span> to{' '}
                  <span className="font-medium">
                    {Math.min(indexOfLastOrder, filteredOrders.length)}
                  </span>{' '}
                  of <span className="font-medium">{filteredOrders.length}</span> results
                </p>
              </div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                    currentPage === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  Previous
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
                  <button
                    key={number}
                    onClick={() => handlePageChange(number)}
                    className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                      currentPage === number
                        ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                        : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    {number}
                  </button>
                ))}
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                    currentPage === totalPages ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  Next
                </button>
              </nav>
            </div>
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      {showOrderDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Order Details</h2>
              <button
                onClick={() => setShowOrderDetails(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <FaTimes size={20} />
              </button>
            </div>
            
            {(() => {
              const order = orders.find(o => o.id === showOrderDetails);
              if (!order) return <p>Order not found</p>;
              
              return (
                <div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div>
                      <p className="text-sm text-gray-500">Order ID</p>
                      <p className="font-medium">#{order.id}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Date & Time</p>
                      <p className="font-medium">{formatDate(order.date)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Customer</p>
                      <p className="font-medium">{order.customerName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Location</p>
                      <p className="font-medium">{locations.find(loc => loc.id === order.locationId)?.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Status</p>
                      <p className="font-medium">{order.status}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Payment Method</p>
                      <p className="font-medium">{order.paymentMethod}</p>
                    </div>
                  </div>
                  
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-2">Order Items</h3>
                    <div className="border rounded-md overflow-hidden">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subtotal</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {order.items.map((item, idx) => (
                            <tr key={idx}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.name}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.quantity}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${item.price.toFixed(2)}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                ${(item.quantity * item.price).toFixed(2)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                  
                  <div className="flex justify-end">
                    <div className="w-64">
                      <div className="flex justify-between py-2">
                        <span>Subtotal:</span>
                        <span className="font-medium">${order.total.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between py-2 border-t border-b">
                        <span className="font-semibold">Total:</span>
                        <span className="font-bold">${order.total.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders; 