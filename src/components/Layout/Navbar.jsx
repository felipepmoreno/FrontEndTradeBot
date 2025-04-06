import React, { useState, useEffect } from 'react';
import { AppBar, Toolbar, Typography, Button, IconButton, Badge, Menu, MenuItem } from '@mui/material';
import { NotificationsOutlined, AccountCircleOutlined } from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import { getMockData, getTestnetServerTime } from '../../utils/api';

const Navbar = () => {
  const [accountMenu, setAccountMenu] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [notificationMenu, setNotificationMenu] = useState(null);
  const [pingStatus, setPingStatus] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Mock notifications
    const mockNotifications = [
      { id: 1, message: 'Strategy BTC-1 executed a buy order', read: false },
      { id: 2, message: 'Daily report is ready', read: false }
    ];
    setNotifications(mockNotifications);
    
    // Check API connection to display status
    const checkConnection = async () => {
      try {
        const result = await getTestnetServerTime();
        setPingStatus(result.success ? 'connected' : 'error');
      } catch (error) {
        setPingStatus('error');
      }
    };
    
    checkConnection();
  }, []);
  
  const handleAccountMenuOpen = (event) => {
    setAccountMenu(event.currentTarget);
  };
  
  const handleAccountMenuClose = () => {
    setAccountMenu(null);
  };
  
  const handleNotificationMenuOpen = (event) => {
    setNotificationMenu(event.currentTarget);
  };
  
  const handleNotificationMenuClose = () => {
    setNotificationMenu(null);
  };
  
  return (
    <AppBar position="static" color="primary">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          TradingBot
        </Typography>
        
        <Button color="inherit" component={Link} to="/dashboard">Dashboard</Button>
        <Button color="inherit" component={Link} to="/strategies">Strategies</Button>
        
        <IconButton color="inherit" onClick={handleNotificationMenuOpen}>
          <Badge badgeContent={notifications.filter(n => !n.read).length} color="error">
            <NotificationsOutlined />
          </Badge>
        </IconButton>
        
        <IconButton color="inherit" onClick={handleAccountMenuOpen}>
          <AccountCircleOutlined />
        </IconButton>
        
        <Menu
          anchorEl={notificationMenu}
          open={Boolean(notificationMenu)}
          onClose={handleNotificationMenuClose}
        >
          {notifications.length > 0 ? (
            notifications.map((notification) => (
              <MenuItem key={notification.id} onClick={handleNotificationMenuClose}>
                {notification.message}
              </MenuItem>
            ))
          ) : (
            <MenuItem onClick={handleNotificationMenuClose}>No notifications</MenuItem>
          )}
        </Menu>
        
        <Menu
          anchorEl={accountMenu}
          open={Boolean(accountMenu)}
          onClose={handleAccountMenuClose}
        >
          <MenuItem onClick={handleAccountMenuClose}>Profile</MenuItem>
          <MenuItem onClick={handleAccountMenuClose}>Settings</MenuItem>
          <MenuItem onClick={handleAccountMenuClose}>Logout</MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;