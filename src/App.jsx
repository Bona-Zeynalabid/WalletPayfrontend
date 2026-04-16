import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

import Login from './components/auth/Login';
import Dashboard from './components/Dashboard';
import Transactions from './components/Transaction';
import Send from './components/Send';
import Receive from './components/Receive';
import Cards from './components/Cards';
import Notifications from './components/Notifications';
import ApiKeys from './components/ApiKeys';
import PaymentPage from './components/PaymentPage';

import { FiKey } from 'react-icons/fi';
import {
  FiHome,
  FiList,
  FiSend,
  FiDownload,
  FiCreditCard,
  FiBell,
  FiSun,
  FiMoon,
  FiMenu,
  FiLogOut,
  FiUser
} from 'react-icons/fi';

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

function AppRoutes() {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-black">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/pay/:sessionId" element={<PaymentPage />} />
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

function AppLayout() {
  const { user, logout, unreadCount } = useAuth();
  const location = useLocation();
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : false;
  });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', JSON.stringify(isDarkMode));
  }, [isDarkMode]);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: FiHome, path: '/' },
    { id: 'transactions', label: 'Transactions', icon: FiList, path: '/transactions' },
    { id: 'send', label: 'Send', icon: FiSend, path: '/send' },
    { id: 'receive', label: 'Receive', icon: FiDownload, path: '/receive' },
    { id: 'cards', label: 'Cards', icon: FiCreditCard, path: '/cards' },
    { 
      id: 'notifications', 
      label: 'Notifications', 
      icon: FiBell, 
      path: '/notifications',
      badge: unreadCount 
    },
    { id: 'api', label: 'API Keys', icon: FiKey, path: '/my-api-keys' },
  ];

  const getActiveNavItem = () => {
    const currentPath = location.pathname;
    return navItems.find(item => 
      currentPath === item.path || 
      (item.path === '/' && currentPath === '/')
    ) || navItems[0];
  };

  const activeNavItem = getActiveNavItem();
  const ActiveIcon = activeNavItem.icon;

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className={`flex h-screen overflow-hidden ${isDarkMode ? 'dark' : ''}`}>
      <div className="flex h-full w-full bg-white dark:bg-black text-gray-900 dark:text-white">
        {/* Mobile Overlay */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Left Sidebar */}
        <div className={`
          fixed lg:static inset-y-0 left-0 z-50
          w-64 bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 
          transform transition-transform duration-300 lg:transform-none
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          flex flex-col
        `}>
          {/* Logo */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-800">
            <Link to="/" className="text-2xl font-bold bg-gradient-to-r from-green-500 to-green-700 dark:from-green-400 dark:to-green-600 bg-clip-text text-transparent hover:opacity-80 transition-opacity">
              WalletPay
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 py-6 overflow-y-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.id}
                  to={item.path}
                  onClick={() => setIsSidebarOpen(false)}
                  className={`
                    w-full flex items-center space-x-3 px-6 py-3 transition-all duration-200
                    ${location.pathname === item.path || (item.path === '/' && location.pathname === '/')
                      ? 'bg-green-100 dark:bg-green-600/20 border-l-4 border-green-500 text-green-700 dark:text-green-400' 
                      : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white border-l-4 border-transparent'
                    }
                  `}
                >
                  <div className="relative">
                    <Icon className="text-xl" />
                    {item.badge > 0 && (
                      <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-xs font-bold min-w-[18px] h-[18px] flex items-center justify-center rounded-full px-1">
                        {item.badge > 99 ? '99+' : item.badge}
                      </span>
                    )}
                  </div>
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Theme Toggle and Logout */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-800 space-y-2">
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
            >
              {isDarkMode ? <FiSun className="text-lg" /> : <FiMoon className="text-lg" />}
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {isDarkMode ? 'Light Mode' : 'Dark Mode'}
              </span>
            </button>
            
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-800/50 text-red-700 dark:text-red-400 rounded-lg transition-colors duration-200"
            >
              <FiLogOut className="text-lg" />
              <span className="text-sm font-medium">Logout</span>
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden w-full">
          {/* Top Header */}
          <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {/* Mobile Menu Button */}
                <button
                  onClick={() => setIsSidebarOpen(true)}
                  className="lg:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <FiMenu className="w-6 h-6" />
                </button>
                
                <div className="flex items-center space-x-2">
                  <ActiveIcon className="text-2xl text-green-500" />
                  <h2 className="text-xl lg:text-2xl font-semibold text-gray-900 dark:text-white">
                    {activeNavItem.label}
                  </h2>
                  {activeNavItem.id === 'notifications' && unreadCount > 0 && (
                    <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full ml-2">
                      {unreadCount} unread
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-3 lg:space-x-4">
                {/* Mobile Theme Toggle */}
                <button
                  onClick={() => setIsDarkMode(!isDarkMode)}
                  className="lg:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                >
                  {isDarkMode ? <FiSun className="text-xl" /> : <FiMoon className="text-xl" />}
                </button>

                {/* Mobile Notifications */}
                <Link
                  to="/notifications"
                  className="lg:hidden relative p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <FiBell className="text-xl" />
                  {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold min-w-[16px] h-[16px] flex items-center justify-center rounded-full px-1">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </Link>

                <div className="hidden sm:block text-right">
                  <p className="text-xs lg:text-sm text-gray-500 dark:text-gray-400">Welcome back</p>
                  <p className="text-sm lg:text-base text-gray-900 dark:text-white font-medium">
                    {user?.name || 'User'}
                  </p>
                </div>
                
                <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-full bg-gradient-to-r from-green-500 to-green-700 dark:from-green-400 dark:to-green-600 flex items-center justify-center">
                  {user?.avatar ? (
                    <img src={user.avatar} alt={user.name} className="w-full h-full rounded-full object-cover" />
                  ) : (
                    <FiUser className="text-white text-sm lg:text-base" />
                  )}
                </div>
              </div>
            </div>
          </header>

          {/* Dynamic Content */}
          <main className="flex-1 overflow-y-auto p-4 lg:p-8 bg-gray-50 dark:bg-black">
            <div className="max-w-7xl mx-auto">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/transactions" element={<Transactions />} />
                <Route path="/send" element={<Send />} />
                <Route path="/receive" element={<Receive />} />
                <Route path="/cards" element={<Cards />} />
                <Route path="/notifications" element={<Notifications />} />
                <Route path="/my-api-keys" element={<ApiKeys />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

export default App;