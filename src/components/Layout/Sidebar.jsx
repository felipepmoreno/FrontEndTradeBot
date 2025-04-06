import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { 
  Home as HomeIcon, 
  Settings as CogIcon, 
  BarChart as ChartBarIcon, 
  AttachMoney as CurrencyDollarIcon,
  FlashOn as LightningBoltIcon
} from '@mui/icons-material';

const Sidebar = () => {
  return (
    <div className="bg-indigo-800 text-white w-64 flex-shrink-0 hidden md:block">
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="flex items-center justify-center h-16 border-b border-indigo-700">
          <Link to="/" className="text-xl font-bold">CryptoTradeBot</Link>
        </div>
        
        {/* Navigation */}
        <nav className="flex-1 px-2 py-4 space-y-1">
          <NavLink 
            to="/dashboard" 
            className={({ isActive }) => 
              `flex items-center px-4 py-2 text-sm font-medium rounded-md ${
                isActive 
                  ? 'bg-indigo-900 text-white' 
                  : 'text-indigo-100 hover:bg-indigo-700'
              }`
            }
          >
            <HomeIcon className="mr-3 h-6 w-6" />
            Dashboard
          </NavLink>
          
          <NavLink 
            to="/strategies" 
            className={({ isActive }) => 
              `flex items-center px-4 py-2 text-sm font-medium rounded-md ${
                isActive 
                  ? 'bg-indigo-900 text-white' 
                  : 'text-indigo-100 hover:bg-indigo-700'
              }`
            }
          >
            <LightningBoltIcon className="mr-3 h-6 w-6" />
            Strategies
          </NavLink>
          
          <NavLink 
            to="/trades" 
            className={({ isActive }) => 
              `flex items-center px-4 py-2 text-sm font-medium rounded-md ${
                isActive 
                  ? 'bg-indigo-900 text-white' 
                  : 'text-indigo-100 hover:bg-indigo-700'
              }`
            }
          >
            <CurrencyDollarIcon className="mr-3 h-6 w-6" />
            Trade History
          </NavLink>
          
          <NavLink 
            to="/backtesting" 
            className={({ isActive }) => 
              `flex items-center px-4 py-2 text-sm font-medium rounded-md ${
                isActive 
                  ? 'bg-indigo-900 text-white' 
                  : 'text-indigo-100 hover:bg-indigo-700'
              }`
            }
          >
            <ChartBarIcon className="mr-3 h-6 w-6" />
            Backtesting
          </NavLink>
          
          <NavLink 
            to="/settings" 
            className={({ isActive }) => 
              `flex items-center px-4 py-2 text-sm font-medium rounded-md ${
                isActive 
                  ? 'bg-indigo-900 text-white' 
                  : 'text-indigo-100 hover:bg-indigo-700'
              }`
            }
          >
            <CogIcon className="mr-3 h-6 w-6" />
            Settings
          </NavLink>
        </nav>
        
        {/* Bot Status */}
        <div className="px-4 py-4 border-t border-indigo-700">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-3 w-3 rounded-full bg-green-500 animate-pulse"></div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-white">Bot Status: Running</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;