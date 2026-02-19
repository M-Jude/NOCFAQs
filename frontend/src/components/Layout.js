/**
 * Layout Component
 * 
 * Main application layout with navigation sidebar, header, and content area.
 * Provides role-based menu items and responsive design.
 * 
 * @module components/Layout
 * @requires react
 * @requires react-router-dom
 * @requires @mui/material
 * @requires @mui/icons-material
 * @requires context/AuthContext
 */

// ============================================================================
// IMPORTS
// ============================================================================

import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';

// Material UI components
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Box, 
  Drawer, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  useMediaQuery,
  useTheme
} from '@mui/material';

// Material UI icons
import { 
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  QuestionAnswer as QuestionIcon,
  People as PeopleIcon,
  Logout as LogoutIcon,
  Assessment as AssessmentIcon
} from '@mui/icons-material';

// Authentication context
import { useAuth } from '../context/AuthContext';

// ============================================================================
// CONSTANTS
// ============================================================================

// Sidebar drawer width
const DRAWER_WIDTH = 240;

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * Main Layout Component
 * 
 * Provides the application shell with:
 * - Responsive sidebar navigation
 * - Top app bar with user menu
 * - Role-based menu items
 * 
 * @returns {JSX.Element}
 */
const Layout = () => {
  // Get authentication context
  const { user, logout } = useAuth();
  
  // Navigation hooks
  const navigate = useNavigate();
  const location = useLocation();
  
  // Theme for responsive design
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  // UI state
  const [mobileOpen, setMobileOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(true);
  const [anchorEl, setAnchorEl] = useState(null);

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  /**
   * Toggle sidebar visibility (desktop)
   */
  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };

  /**
   * Toggle mobile sidebar
   */
  const handleMobileDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  /**
   * Open user menu
   */
  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  /**
   * Close user menu
   */
  const handleClose = () => {
    setAnchorEl(null);
  };

  /**
   * Handle logout action
   */
  const handleLogout = async () => {
    handleClose();
    await logout();
    navigate('/login');
  };

  // ============================================================================
  // MENU CONFIGURATION
  // ============================================================================

  /**
   * Get menu items based on user role
   * @returns {Array} Array of menu item objects
   */
  const getMenuItems = () => {
    const items = [
      { 
        text: 'Dashboard', 
        icon: <DashboardIcon />, 
        path: '/', 
        roles: ['noc_engineer', 'admin', 'hr'] 
      },
      { 
        text: 'FAQs', 
        icon: <QuestionIcon />, 
        path: '/questions', 
        roles: ['noc_engineer', 'admin'] 
      },
    ];

    // Add admin-only menu items
    if (user?.role === 'admin') {
      items.push({ 
        text: 'Session Reports', 
        icon: <AssessmentIcon />, 
        path: '/hr-dashboard', 
        roles: ['admin'] 
      });
      items.push({ 
        text: 'Manage Questions', 
        icon: <QuestionIcon />, 
        path: '/manage-questions', 
        roles: ['admin'] 
      });
      items.push({ 
        text: 'Manage Users', 
        icon: <PeopleIcon />, 
        path: '/manage-users', 
        roles: ['admin'] 
      });
    }

    // Filter items based on user role
    return items.filter(item => item.roles.includes(user?.role));
  };

  /**
   * Get display label for user role
   * @param {string} role - User role
   * @returns {string} Human-readable role label
   */
  const getRoleLabel = (role) => {
    switch (role) {
      case 'admin': return 'Administrator';
      case 'hr': return 'HR Manager';
      case 'noc_engineer': return 'NOC Engineer';
      default: return role;
    }
  };

  const menuItems = getMenuItems();

  // ============================================================================
  // DRAWER CONTENT
  // ============================================================================

  /**
   * Sidebar navigation drawer content
   */
  const drawerContent = (
    <div>
      <List>
        {menuItems.map((item) => (
          <ListItem 
            button 
            key={item.text} 
            onClick={() => {
              navigate(item.path);
              if (isMobile) handleMobileDrawerToggle();
            }}
            selected={location.pathname === item.path}
            sx={{
              '&.Mui-selected': {
                backgroundColor: 'action.selected',
              }
            }}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
      </List>
    </div>
  );

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <Box sx={{ display: 'flex' }}>
      {/* Top App Bar */}
      <AppBar
        position="fixed"
        sx={{
          width: '100%',
          zIndex: (theme) => theme.zIndex.drawer + 1,
        }}
      >
        <Toolbar>
          {/* Menu toggle button */}
          <IconButton
            color="inherit"
            edge="start"
            onClick={isMobile ? handleMobileDrawerToggle : handleDrawerToggle}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          
          {/* Application title */}
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            BCC NOC Knowledge Base
          </Typography>
          
          {/* User menu section */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {/* User info */}
            <Box sx={{ textAlign: 'right', display: { xs: 'none', md: 'block' } }}>
              <Typography variant="subtitle2">
                {user?.fullName}
              </Typography>
              <Typography variant="caption" color="inherit">
                {getRoleLabel(user?.role)}
              </Typography>
            </Box>
            
            {/* User avatar button */}
            <IconButton onClick={handleMenu} color="inherit">
              <Avatar sx={{ width: 32, height: 32, bgcolor: 'secondary.main' }}>
                {user?.fullName?.charAt(0)}
              </Avatar>
            </IconButton>
            
            {/* User dropdown menu */}
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleClose}
            >
              <MenuItem disabled>
                <Typography variant="body2">Signed in as</Typography>
              </MenuItem>
              <MenuItem disabled>
                <Typography variant="body2">{user?.email}</Typography>
              </MenuItem>
              <MenuItem onClick={handleLogout}>
                <ListItemIcon>
                  <LogoutIcon fontSize="small" />
                </ListItemIcon>
                Logout
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Sidebar Navigation */}
      <Box
        component="nav"
        sx={{ 
          width: { sm: drawerOpen ? DRAWER_WIDTH : 0 }, 
          flexShrink: { sm: 0 }, 
          transition: 'width 0.2s' 
        }}
      >
        {/* Mobile drawer */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleMobileDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: DRAWER_WIDTH 
            },
          }}
        >
          {drawerContent}
        </Drawer>
        
        {/* Desktop drawer */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerOpen ? DRAWER_WIDTH : 0,
              overflow: 'hidden',
              transition: 'width 0.2s',
              mt: '64px',
              height: 'calc(100% - 64px)',
            },
          }}
          open={drawerOpen}
        >
          {drawerContent}
        </Drawer>
      </Box>

      {/* Main Content Area */}
      <Box
        component="main"
        sx={{ 
          flexGrow: 1, 
          p: 3, 
          width: '100%',
        }}
      >
        {/* Spacer for fixed app bar */}
        <Toolbar />
        {/* Render child routes */}
        <Outlet />
      </Box>
    </Box>
  );
};

export default Layout;
