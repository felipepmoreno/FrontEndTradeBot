import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Menu as MenuIcon, 
  Notifications as BellIcon, 
  Close as XIcon 
} from '@mui/icons-material';
import { apiRequest, getMockData } from '../../utils/api';

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [botStatus, setBotStatus] = useState({ isRunning: false });
  const [isOffline, setIsOffline] = useState(false);

  // Fetch bot status and notifications
  useEffect(() => {
    const fetchBotStatus = async () => {
      try {
        const response = await apiRequest('/bot/status', 'GET', null, getMockData('/bot/status'));
        setBotStatus(response);
        
        if (response.isFallback) {
          setIsOffline(true);
        }
      } catch (error) {
        console.error('Error fetching bot status:', error);
        setBotStatus(getMockData('/bot/status'));
        setIsOffline(true);
      }
    };

    const fetchNotifications = async () => {
      try {
        const response = await apiRequest('/notifications', 'GET', null, getMockData('/notifications'));
        if (response.success) {
          setNotifications(response.notifications || []);
        }
      } catch (error) {
        console.error('Error fetching notifications:', error);
        setNotifications(getMockData('/notifications').notifications || []);
      }
    };

    fetchBotStatus();
    fetchNotifications();

    // Set up polling
    const statusInterval = setInterval(fetchBotStatus, 30000);
    const notificationsInterval = setInterval(fetchNotifications, 60000);

    return () => {
      clearInterval(statusInterval);
      clearInterval(notificationsInterval);
    };
  }, []);

  // Toggle bot status
  const handleToggleBot = async () => {
    try {
      const endpoint = botStatus.isRunning ? '/bot/stop' : '/bot/start';
      
      if (isOffline) {
        // In offline mode, just toggle the status locally
        setBotStatus({
          ...botStatus,
          isRunning: !botStatus.isRunning
        });
        return;
      }
      
      const response = await apiRequest(endpoint, 'POST');
      
      if (response.success) {
        setBotStatus({
          ...botStatus,
          isRunning: !botStatus.isRunning
        });
      } else {
        console.error(`Error ${botStatus.isRunning ? 'stopping' : 'starting'} bot:`, response.error);
      }
    } catch (error) {
      console.error(`Error ${botStatus.isRunning ? 'stopping' : 'starting'} bot:`, error);
      // Toggle anyway to provide UI feedback in offline mode
      setBotStatus({
        ...botStatus,
        isRunning: !botStatus.isRunning
      });
    }
  };

  // Toggle mobile menu
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  // Toggle notifications panel
  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
  };

  // Get unread notifications count
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <>
      {isOffline && (
        <div className="bg-yellow-100 text-yellow-800 text-center py-1 text-sm">
          Working in offline mode - Backend server not connected
        </div>
      )}
      
      <header className="bg-white shadow-sm z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center md:hidden">
                <button
                  type="button"
                  className="-ml-0.5 -mt-0.5 h-12 w-12 inline-flex items-center justify-center rounded-md text-gray-500 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
                  onClick={toggleMobileMenu}
                >
                  <span className="sr-only">Open sidebar</span>
                  <MenuIcon className="h-6 w-6" aria-hidden="true" />
                </button>
              </div>
              <div className="hidden md:ml-6 md:flex md:space-x-8">
                {/* Desktop navigation links if needed */}
              </div>
            </div>
            <div className="flex items-center">
              <button
                type="button"
                className={`px-4 py-2 rounded-md text-sm font-medium ${
                  botStatus.isRunning
                    ? 'bg-red-600 hover:bg-red-700 text-white'
                    : 'bg-green-600 hover:bg-green-700 text-white'
                }`}
                onClick={handleToggleBot}
              >
                {botStatus.isRunning ? 'Stop Bot' : 'Start Bot'}
              </button>
              
              <div className="ml-4 relative flex-shrink-0">
                <div>
                  <button
                    type="button"
                    className="bg-white rounded-full flex text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 relative"
                    onClick={toggleNotifications}
                  >
                    <span className="sr-only">View notifications</span>
                    <BellIcon className="h-6 w-6 text-gray-400" aria-hidden="true" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                        {unreadCount}
                      </span>
                    )}
                  </button>
                </div>
                
                {/* Notification dropdown */}
                {showNotifications && (
                  <div className="origin-top-right absolute right-0 mt-2 w-80 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                    <div className="px-4 py-2 border-b border-gray-200">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-medium text-gray-900">Notifications</h3>
                        <button
                          type="button"
                          className="text-xs text-indigo-600 hover:text-indigo-500"
                          onClick={() => setShowNotifications(false)}
                        >
                          Close
                        </button>
                      </div>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="px-4 py-6 text-center text-sm text-gray-500">
                          No notifications yet
                        </div>
                      ) : (
                        <div className="divide-y divide-gray-200">
                          {notifications.map(notification => (
                            <div 
                              key={notification.id} 
                              className={`px-4 py-3 ${!notification.read ? 'bg-indigo-50' : ''}`}
                            >
                              <div className="flex justify-between">
                                <p className="text-sm font-medium text-gray-900">
                                  {notification.title}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {new Date(notification.createdAt).toLocaleTimeString()}
                                </p>
                              </div>
                              <p className="text-sm text-gray-500 mt-1">
                                {notification.message}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="px-4 py-2 border-t border-gray-200">
                      <Link
                        to="/notifications"
                        className="text-xs text-indigo-600 hover:text-indigo-500"
                        onClick={() => setShowNotifications(false)}
                      >
                        View all notifications
                      </Link>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Profile dropdown */}
              <div className="ml-3 relative">
                <div>
                  <button
                    type="button"
                    className="bg-white rounded-full flex text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    <span className="sr-only">Open user menu</span>
                    <div className="h-8 w-8 rounded-full bg-indigo-600 flex items-center justify-center text-white">
                      U
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>
      
      {/* Mobile menu, show/hide based on menu state */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 flex z-40">
          {/* Background overlay */}
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={toggleMobileMenu}></div>
          
          {/* Menu panel */}
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-indigo-800">
            <div className="absolute top-0 right-0 -mr-12 pt-2">
              <button
                type="button"
                className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                onClick={toggleMobileMenu}
              >
                <span className="sr-only">Close sidebar</span>
                <XIcon className="h-6 w-6 text-white" aria-hidden="true" />
              </button>
            </div>
            
            <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
              <div className="flex-shrink-0 flex items-center px-4">
                <span className="text-white text-xl font-bold">CryptoTradeBot</span>
              </div>
              <nav className="mt-5 px-2 space-y-1">
                <Link
                  to="/dashboard"
                  className="text-white group flex items-center px-2 py-2 text-base font-medium rounded-md"
                  onClick={toggleMobileMenu}
                >
                  Dashboard
                </Link>
                <Link
                  to="/strategies"
                  className="text-indigo-100 hover:bg-indigo-700 group flex items-center px-2 py-2 text-base font-medium rounded-md"
                  onClick={toggleMobileMenu}
                >
                  Strategies
                </Link>
                <Link
                  to="/trades"
                  className="text-indigo-100 hover:bg-indigo-700 group flex items-center px-2 py-2 text-base font-medium rounded-md"
                  onClick={toggleMobileMenu}
                >
                  Trade History
                </Link>
                <Link
                  to="/backtesting"
                  className="text-indigo-100 hover:bg-indigo-700 group flex items-center px-2 py-2 text-base font-medium rounded-md"
                  onClick={toggleMobileMenu}
                >
                  Backtesting
                </Link>
                <Link
                  to="/settings"
                  className="text-indigo-100 hover:bg-indigo-700 group flex items-center px-2 py-2 text-base font-medium rounded-md"
                  onClick={toggleMobileMenu}
                >
                  Settings
                </Link>
              </nav>
            </div>
            
            <div className="flex-shrink-0 flex border-t border-indigo-700 p-4">
              <div className="flex items-center">
                <div>
                  <div className={`h-3 w-3 rounded-full ${botStatus.isRunning ? 'bg-green-500' : 'bg-red-500'} animate-pulse`}></div>
                </div>
                <div className="ml-3">
                  <p className="text-base font-medium text-white">
                    Bot Status: {botStatus.isRunning ? 'Running' : 'Stopped'}
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex-shrink-0 w-14">
            {/* Force sidebar to shrink to fit close icon */}
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;