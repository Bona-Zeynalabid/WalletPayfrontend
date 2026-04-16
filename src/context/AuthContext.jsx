import React, { createContext, useState, useContext, useEffect } from 'react';
import { authService, walletService, notificationService } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    checkAuth();
  }, []);

  // Fetch unread count when user is set
  useEffect(() => {
    if (user) {
      fetchUnreadCount();
      // Poll every 30 seconds
      const interval = setInterval(fetchUnreadCount, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const checkAuth = async () => {
    try {
      const userData = await authService.getCurrentUser();
      setUser(userData);
      
      const balanceData = await walletService.getBalance();
      setBalance(balanceData.balance || 0);
    } catch (err) {
      setUser(null);
      setBalance(0);
      setUnreadCount(0);
    } finally {
      setLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const data = await notificationService.getUnreadCount();
      setUnreadCount(data.unreadCount || 0);
    } catch (err) {
      console.error('Failed to fetch unread count:', err);
    }
  };

  const login = (userData) => {
    setUser(userData);
    return { success: true };
  };

  const emailLogin = async (email, password) => {
    try {
      setError(null);
      const response = await authService.login(email, password);
      
      if (response.success) {
        setUser(response.user);
        const balanceData = await walletService.getBalance();
        setBalance(balanceData.balance || 0);
        return { success: true, data: response };
      }
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Login failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const googleLogin = async (credential) => {
    try {
      setError(null);
      const response = await authService.googleAuth(credential);
      
      if (response.success) {
        setUser(response.user);
        
        try {
          const balanceData = await walletService.getBalance();
          setBalance(balanceData.balance || 0);
        } catch (balanceErr) {
          
        }
        
        return { success: true, data: response };
      }
    } catch (err) {
      console.error('Google login error:', err);
      const errorMessage = err.response?.data?.error || 'Google login failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setUser(null);
      setBalance(0);
      setUnreadCount(0);
    }
  };

  const refreshBalance = async () => {
    try {
      const balanceData = await walletService.getBalance();
      setBalance(balanceData.balance || 0);
    } catch (err) {
      console.error('Failed to refresh balance:', err);
    }
  };

  const value = {
    user,
    balance,
    loading,
    error,
    unreadCount,
    login: emailLogin,
    googleLogin,
    logout,
    refreshBalance,
    setBalance,
    fetchUnreadCount,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;