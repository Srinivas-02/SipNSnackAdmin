import { useState, useEffect } from 'react';
import { FaStar, FaReply, FaTimes, FaSearch, FaFilter } from 'react-icons/fa';

// Mock data
const initialLocations = [
  { id: '1', name: 'Downtown Café' },
  { id: '2', name: 'Beach Corner' },
  { id: '3', name: 'Central Mall' },
  { id: '4', name: 'Park Kiosk' },
  { id: '5', name: 'University Campus' },
];

const initialFeedback = [
  { 
    id: '1', 
    customerId: '101',
    customerName: 'John Smith',
    locationId: '1',
    rating: 5,
    comment: 'Excellent service and friendly staff. The coffee was perfect and the pastries were fresh!',
    date: '2025-04-05T09:30:00',
    status: 'Unresponded',
    response: '',
    responseDate: null
  },
  { 
    id: '2', 
    customerId: '102',
    customerName: 'Sarah Johnson',
    locationId: '2',
    rating: 3,
    comment: 'The coffee was good but the service was a bit slow during peak hours.',
    date: '2025-04-04T14:15:00',
    status: 'Responded',
    response: 'Thank you for your feedback. We\'re working on improving our service during busy times. We hope to serve you better next time!',
    responseDate: '2025-04-04T16:30:00'
  },
  { 
    id: '3', 
    customerId: '103',
    customerName: 'Michael Brown',
    locationId: '3',
    rating: 4,
    comment: 'Good selection of food and drinks. The atmosphere is nice but it can get noisy sometimes.',
    date: '2025-04-03T12:45:00',
    status: 'Unresponded',
    response: '',
    responseDate: null
  },
  { 
    id: '4', 
    customerId: '104',
    customerName: 'Emily Davis',
    locationId: '4',
    rating: 2,
    comment: 'My order was incorrect and it took a while to get it fixed. Disappointing experience.',
    date: '2025-04-02T11:20:00',
    status: 'Responded',
    response: 'We sincerely apologize for the inconvenience. We\'ve addressed this with our team and would like to offer you a complimentary drink on your next visit. Please contact our manager.',
    responseDate: '2025-04-02T14:10:00'
  },
  { 
    id: '5', 
    customerId: '105',
    customerName: 'David Wilson',
    locationId: '5',
    rating: 5,
    comment: 'The new seasonal menu is fantastic! Loved the pumpkin spice options.',
    date: '2025-04-01T15:55:00',
    status: 'Unresponded',
    response: '',
    responseDate: null
  },
  { 
    id: '6', 
    customerId: '106',
    customerName: 'Jessica Miller',
    locationId: '1',
    rating: 4,
    comment: 'Great place to work remotely. WiFi is reliable and the staff is accommodating.',
    date: '2025-03-31T10:05:00',
    status: 'Responded',
    response: 'Thank you for your kind words! We\'re glad you enjoy our space for remote work. We\'ve recently upgraded our WiFi to provide an even better experience.',
    responseDate: '2025-03-31T15:25:00'
  },
  { 
    id: '7', 
    customerId: '107',
    customerName: 'Robert Taylor',
    locationId: '2',
    rating: 3,
    comment: 'The food was good but slightly overpriced for the portion size.',
    date: '2025-03-30T13:40:00',
    status: 'Unresponded',
    response: '',
    responseDate: null
  },
  { 
    id: '8', 
    customerId: '108',
    customerName: 'Amanda Martinez',
    locationId: '3',
    rating: 5,
    comment: 'The customer service here is outstanding! They remembered my regular order and even my name.',
    date: '2025-03-29T09:15:00',
    status: 'Responded',
    response: 'We\'re thrilled to hear about your positive experience! Our team works hard to create a personal connection with our customers. We look forward to serving you again soon!',
    responseDate: '2025-03-29T11:30:00'
  },
];

interface Location {
  id: string;
  name: string;
}

interface Feedback {
  id: string;
  customerId: string;
  customerName: string;
  locationId: string;
  rating: number;
  comment: string;
  date: string;
  status: 'Responded' | 'Unresponded';
  response: string;
  responseDate: string | null;
}

const Feedback = () => {
  const [locations, setLocations] = useState<Location[]>(initialLocations);
  const [feedbackList, setFeedbackList] = useState<Feedback[]>(initialFeedback);
  const [selectedLocation, setSelectedLocation] = useState<string>('all');
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showResponseModal, setShowResponseModal] = useState(false);
  const [currentFeedback, setCurrentFeedback] = useState<Feedback | null>(null);
  const [responseText, setResponseText] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // In a real app, would fetch from API
  useEffect(() => {
    // const fetchFeedback = async () => {
    //   try {
    //     const locationsResponse = await fetch('/api/locations');
    //     const locationsData = await locationsResponse.json();
    //     setLocations(locationsData);
    //
    //     const feedbackResponse = await fetch('/api/feedback');
    //     const feedbackData = await feedbackResponse.json();
    //     setFeedbackList(feedbackData);
    //   } catch (error) {
    //     console.error('Error fetching feedback:', error);
    //   }
    // };
    // fetchFeedback();
  }, []);

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

  const handleReplyClick = (feedback: Feedback) => {
    setCurrentFeedback(feedback);
    setResponseText(feedback.response || '');
    setShowResponseModal(true);
  };

  const handleSubmitResponse = () => {
    if (!currentFeedback) return;
    
    // In a real app, would call API to update
    const updatedFeedbackList = feedbackList.map(feedback => 
      feedback.id === currentFeedback.id
        ? {
            ...feedback,
            response: responseText,
            status: 'Responded' as const,
            responseDate: new Date().toISOString()
          }
        : feedback
    );
    
    setFeedbackList(updatedFeedbackList);
    setShowResponseModal(false);
    setCurrentFeedback(null);
    setResponseText('');
  };

  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  const resetFilters = () => {
    setSelectedLocation('all');
    setSelectedRating(null);
    setSelectedStatus('all');
    setSearchTerm('');
  };

  // Filter feedback based on selected filters
  const filteredFeedback = feedbackList.filter(feedback => {
    // Filter by location
    if (selectedLocation !== 'all' && feedback.locationId !== selectedLocation) {
      return false;
    }
    
    // Filter by rating
    if (selectedRating !== null && feedback.rating !== selectedRating) {
      return false;
    }
    
    // Filter by status
    if (selectedStatus !== 'all' && feedback.status !== selectedStatus) {
      return false;
    }
    
    // Filter by search term (customer name or comment)
    if (searchTerm && 
        !feedback.customerName.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !feedback.comment.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="bg-white p-4 rounded-lg shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="relative w-full md:w-auto">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FaSearch className="text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search feedback..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full md:w-80"
          />
        </div>
        
        <div className="flex items-center gap-2 w-full md:w-auto">
          <button
            onClick={toggleFilters}
            className="flex items-center justify-center gap-2 border border-gray-300 px-4 py-2 rounded-md hover:bg-gray-50"
          >
            <FaFilter size={14} />
            <span>Filters</span>
          </button>
          
          <button
            onClick={resetFilters}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Reset
          </button>
        </div>
      </div>
      
      {showFilters && (
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
              <select
                value={selectedRating === null ? 'all' : selectedRating}
                onChange={(e) => setSelectedRating(e.target.value === 'all' ? null : Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="all">All Ratings</option>
                {[5, 4, 3, 2, 1].map((rating) => (
                  <option key={rating} value={rating}>{rating} Stars</option>
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
                <option value="all">All Status</option>
                <option value="Responded">Responded</option>
                <option value="Unresponded">Unresponded</option>
              </select>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {filteredFeedback.length > 0 ? (
          filteredFeedback.map((feedback) => (
            <div key={feedback.id} className="bg-white p-4 rounded-lg shadow-sm">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{feedback.customerName}</h3>
                    <span className="text-sm text-gray-500">at {locations.find(loc => loc.id === feedback.locationId)?.name}</span>
                  </div>
                  <div className="flex items-center mt-1">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <FaStar 
                        key={index} 
                        className={index < feedback.rating ? 'text-yellow-400' : 'text-gray-300'} 
                        size={18}
                      />
                    ))}
                    <span className="ml-2 text-sm text-gray-500">{formatDate(feedback.date)}</span>
                  </div>
                </div>
                
                <span className={`px-2 py-1 text-xs rounded-full ${
                  feedback.status === 'Responded' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                }`}>
                  {feedback.status}
                </span>
              </div>
              
              <p className="mt-3 text-gray-700">{feedback.comment}</p>
              
              {feedback.status === 'Responded' && (
                <div className="mt-4 pl-4 border-l-2 border-gray-200">
                  <p className="text-sm font-medium">Response:</p>
                  <p className="mt-1 text-sm text-gray-600">{feedback.response}</p>
                  <p className="mt-1 text-xs text-gray-500">
                    {feedback.responseDate && formatDate(feedback.responseDate)}
                  </p>
                </div>
              )}
              
              <div className="mt-4 flex justify-end">
                <button
                  onClick={() => handleReplyClick(feedback)}
                  className="flex items-center gap-1 text-blue-500 hover:text-blue-700"
                >
                  <FaReply size={14} />
                  <span>{feedback.status === 'Responded' ? 'Edit Response' : 'Respond'}</span>
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white p-8 rounded-lg shadow-sm text-center">
            <p className="text-gray-500">No feedback found matching your filters</p>
          </div>
        )}
      </div>

      {/* Response Modal */}
      {showResponseModal && currentFeedback && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Respond to Feedback</h3>
              <button
                onClick={() => setShowResponseModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <FaTimes size={20} />
              </button>
            </div>
            
            <div className="mb-4 p-4 bg-gray-50 rounded-md">
              <div className="flex items-center gap-2 mb-2">
                <h4 className="font-medium">{currentFeedback.customerName}</h4>
                <div className="flex">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <FaStar 
                      key={index} 
                      className={index < currentFeedback.rating ? 'text-yellow-400' : 'text-gray-300'} 
                      size={16}
                    />
                  ))}
                </div>
              </div>
              <p className="text-gray-700">{currentFeedback.comment}</p>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Response
              </label>
              <textarea
                value={responseText}
                onChange={(e) => setResponseText(e.target.value)}
                rows={5}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="Write your response here..."
              />
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowResponseModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitResponse}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                disabled={!responseText.trim()}
              >
                {currentFeedback.status === 'Responded' ? 'Update Response' : 'Send Response'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Feedback; 