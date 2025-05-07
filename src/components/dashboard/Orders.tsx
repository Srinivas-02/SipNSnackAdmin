import { useState, useEffect } from 'react';
import { FaFilter, FaEye, FaFileAlt } from 'react-icons/fa';
import { format } from 'date-fns';
import useOrdersStore from '../../store/orders';
import useLocationStore, { Location } from '../../store/locations';

const Orders = () => {
  const { 
    orders, 
    selectedOrder,
    isLoading, 
    error,
    locationFilter,
    dateFromFilter,
    dateToFilter,
    fetchOrders,
    getOrderDetails,
    setFilters,
    resetFilters
  } = useOrdersStore();
  
  const { locations, fetchLocations } = useLocationStore();
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  
  // Initial load
  useEffect(() => {
    fetchOrders();
    fetchLocations();
  }, [fetchOrders, fetchLocations]);
  
  const handleApplyFilters = () => {
    fetchOrders();
  };
  
  const handleResetFilters = () => {
    resetFilters();
    fetchOrders();
  };
  
  const handleViewDetails = async (orderId: number) => {
    const details = await getOrderDetails(orderId);
    if (details) {
      setShowDetailsModal(true);
    }
  };
  
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'PPP p'); // e.g., "Apr 29, 2021 12:30 PM"
    } catch {
      return dateString;
    }
  };
  
  // Loading state
  if (isLoading && orders.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden">
      {/* Filters section */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex flex-col gap-4 md:flex-row md:items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
            <select
              value={locationFilter}
              onChange={(e) => setFilters({ locationFilter: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Locations</option>
              {locations.map((location: Location) => (
                <option key={location.id} value={location.id.toString()}>
                  {location.name}
                </option>
              ))}
            </select>
          </div>
          
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
            <input
              type="date"
              value={dateFromFilter}
              onChange={(e) => setFilters({ dateFromFilter: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
            <input
              type="date"
              value={dateToFilter}
              onChange={(e) => setFilters({ dateToFilter: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={handleApplyFilters}
              className="px-4 py-2 bg-blue-600 text-white rounded-md flex items-center gap-2 hover:bg-blue-700"
            >
              <FaFilter />
              Filter
            </button>
            
            <button
              onClick={handleResetFilters}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
            >
              Reset
            </button>
          </div>
        </div>
      </div>
      
      {/* Error message */}
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4">
          <p>{error}</p>
        </div>
      )}
      
      {/* Orders table */}
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
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {orders.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                  No orders found
                </td>
              </tr>
            ) : (
              orders.map((order) => (
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
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleViewDetails(order.id)}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                      title="View Details"
                    >
                      <FaEye size={18} />
                    </button>
                    
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      {/* Order Details Modal */}
      {showDetailsModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start">
                <h2 className="text-xl font-bold text-gray-800">
                  Order Details: {selectedOrder.order_number}
                </h2>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  &times;
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <p className="text-sm text-gray-600">Date:</p>
                  <p className="font-medium">{formatDate(selectedOrder.order_date)}</p>
                </div>
                
                {selectedOrder.customer_name && (
                  <div>
                    <p className="text-sm text-gray-600">Customer:</p>
                    <p className="font-medium">{selectedOrder.customer_name}</p>
                  </div>
                )}
                
                {selectedOrder.table_number && (
                  <div>
                    <p className="text-sm text-gray-600">Table Number:</p>
                    <p className="font-medium">{selectedOrder.table_number}</p>
                  </div>
                )}
                
                <div>
                  <p className="text-sm text-gray-600">Location:</p>
                  <p className="font-medium">{selectedOrder.location.name}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-600">Total Amount:</p>
                  <p className="font-medium">Rs {selectedOrder.total_amount.toFixed(2)}</p>
                </div>
                
                {selectedOrder.processed_by && (
                  <div>
                    <p className="text-sm text-gray-600">Processed By:</p>
                    <p className="font-medium">{selectedOrder.processed_by.name}</p>
                  </div>
                )}
              </div>
              
              <div className="mt-6">
                <h3 className="font-semibold text-gray-800 mb-2">Order Items</h3>
                <div className="bg-gray-50 p-4 rounded-md">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Item
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Quantity
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Price
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Subtotal
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {selectedOrder.items.map((item) => (
                        <tr key={item.id}>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                            {item.menu_item__name || `Item #${item.menu_item_id}`}
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                            {item.quantity}
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                            Rs {item.price.toFixed(2)}
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                            Rs {(item.price * item.quantity).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              
              {selectedOrder.notes && (
                <div className="mt-4">
                  <h3 className="font-semibold text-gray-800 mb-2">Notes</h3>
                  <p className="text-gray-700 bg-gray-50 p-3 rounded-md">
                    {selectedOrder.notes}
                  </p>
                </div>
              )}
              
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                >
                  Close
                </button>
                <a
                  href={`/orders/generate-order-receipt/${selectedOrder.id}/`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2"
                >
                  <FaFileAlt />
                  View Receipt
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders; 