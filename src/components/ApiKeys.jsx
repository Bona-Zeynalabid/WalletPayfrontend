import React, { useState, useEffect } from 'react';
import { apiKeyService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  FiKey,
  FiPlus,
  FiCopy,
  FiCheck,
  FiAlertCircle,
  FiRefreshCw,
  FiLock,
  FiUnlock,
  FiTrash2,
  FiEye,
  FiEyeOff,
  FiBookOpen,
  FiExternalLink
} from 'react-icons/fi';

const ApiKeys = () => {
  const { user } = useAuth();
  const [apiKey, setApiKey] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [sessions, setSessions] = useState([]);
  const [notification, setNotification] = useState(null);
  const [copied, setCopied] = useState(false);
  
  const [formData, setFormData] = useState({
    merchantName: user?.name || '',
    businessInfo: '',
    callbackUrl: '',
    webhookUrl: ''
  });

  useEffect(() => {
    fetchApiKey();
  }, []);

  const fetchApiKey = async () => {
    try {
      setLoading(true);
      const data = await apiKeyService.getApiKey();
      setApiKey(data.apiKey || null);
      if (data.apiKey) {
        fetchSessions();
      }
    } catch (error) {
      console.error('Failed to fetch API key:', error);
      setApiKey(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchSessions = async () => {
    try {
      const data = await apiKeyService.getSessions();
      setSessions(data.sessions || []);
    } catch (error) {
      console.error('Failed to fetch sessions:', error);
    }
  };

  const handleCreateApiKey = async (e) => {
    e.preventDefault();
    
    if (!formData.merchantName || !formData.callbackUrl) {
      showNotification('error', 'Merchant name and callback URL are required');
      return;
    }
    
    try {
      const data = await apiKeyService.createApiKey(formData);
      setApiKey(data.apiKey);
      setShowCreateForm(false);
      setShowApiKey(true);
      showNotification('success', 'API key created successfully!');
      
      setTimeout(() => setShowApiKey(false), 30000);
    } catch (error) {
      showNotification('error', error.response?.data?.error || 'Failed to create API key');
    }
  };

  const handleToggleStatus = async () => {
    try {
      const newStatus = apiKey.status === 'active' ? 'inactive' : 'active';
      await apiKeyService.toggleApiKey(newStatus);
      await fetchApiKey();
      showNotification('success', `API key ${newStatus === 'active' ? 'activated' : 'deactivated'}`);
    } catch (error) {
      showNotification('error', 'Failed to update API key status');
    }
  };

  const handleDeleteApiKey = async () => {
    if (!confirm('Are you sure you want to delete this API key? All integrations will stop working.')) {
      return;
    }
    
    try {
      await apiKeyService.deleteApiKey();
      setApiKey(null);
      setSessions([]);
      showNotification('success', 'API key deleted successfully');
    } catch (error) {
      showNotification('error', 'Failed to delete API key');
    }
  };

  const handleCopyApiKey = () => {
    if (apiKey?.apiKey) {
      navigator.clipboard.writeText(apiKey.apiKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      showNotification('success', 'API key copied!');
    }
  };

  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'success': return 'text-green-500';
      case 'failed': return 'text-red-500';
      case 'pending': return 'text-yellow-500';
      case 'processing': return 'text-blue-500';
      default: return 'text-gray-500';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl lg:text-2xl font-semibold text-green-600 dark:text-green-400 flex items-center">
          <FiKey className="mr-2" />
          API Keys & Payments
        </h2>
        <button
          onClick={fetchApiKey}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
        >
          <FiRefreshCw />
        </button>
      </div>

      {notification && (
        <div className={`p-4 rounded-lg flex items-center gap-2 ${
          notification.type === 'success' 
            ? 'bg-green-100 dark:bg-green-900/30 border border-green-300 text-green-700 dark:text-green-400' 
            : 'bg-red-100 dark:bg-red-900/30 border border-red-300 text-red-700 dark:text-red-400'
        }`}>
          {notification.type === 'success' ? <FiCheck /> : <FiAlertCircle />}
          {notification.message}
        </div>
      )}

      {apiKey ? (
        <div className="space-y-6">
          {/* API Key Display */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-800">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Your API Key
              </h3>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                apiKey.status === 'active' 
                  ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
              }`}>
                {apiKey.status.toUpperCase()}
              </span>
            </div>
            
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Merchant Name</p>
                <p className="text-gray-900 dark:text-white font-medium">{apiKey.merchantName}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">API Key</p>
                <div className="flex items-center gap-2">
                  <code className="bg-gray-100 dark:bg-gray-800 px-4 py-2 rounded-lg font-mono text-sm flex-1">
                    {showApiKey ? apiKey.apiKey : '••••••••••••••••••••••••••••••••'}
                  </code>
                  <button
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                  >
                    {showApiKey ? <FiEyeOff /> : <FiEye />}
                  </button>
                  <button
                    onClick={handleCopyApiKey}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                  >
                    {copied ? <FiCheck className="text-green-500" /> : <FiCopy />}
                  </button>
                </div>
              </div>
              
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Callback URL</p>
                <p className="text-gray-900 dark:text-white text-sm break-all">{apiKey.callbackUrl}</p>
              </div>
              
              {apiKey.webhookUrl && (
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Webhook URL</p>
                  <p className="text-gray-900 dark:text-white text-sm break-all">{apiKey.webhookUrl}</p>
                </div>
              )}
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleToggleStatus}
                className={`flex-1 px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2 ${
                  apiKey.status === 'active' 
                    ? 'bg-yellow-500 hover:bg-yellow-600 text-white'
                    : 'bg-green-500 hover:bg-green-600 text-white'
                }`}
              >
                {apiKey.status === 'active' ? <FiLock /> : <FiUnlock />}
                {apiKey.status === 'active' ? 'Deactivate' : 'Activate'}
              </button>
              <button
                onClick={handleDeleteApiKey}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <FiTrash2 />
                Delete
              </button>
            </div>
          </div>
          
          {/* How to Use Anchor Tag */}
          <a
            href="https://walletpay-api-documentation.netlify.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-xl p-4 transition-all duration-200 flex items-center justify-center gap-3 shadow-lg"
          >
            <FiBookOpen className="text-xl" />
            <span className="font-medium">How to Use - API Documentation</span>
            <FiExternalLink className="text-lg" />
          </a>
          
          {/* Recent Payment Sessions */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-800">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Recent Payments
            </h3>
            
            {sessions.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                No payment sessions yet
              </p>
            ) : (
              <div className="space-y-2">
                {sessions.slice(0, 10).map(session => (
                  <div key={session.sessionId} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {session.description || 'Payment'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(session.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold text-gray-900 dark:text-white">
                        ETB{session.amount}
                      </p>
                      <p className={`text-xs font-medium ${getStatusColor(session.status)}`}>
                        {session.status.toUpperCase()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : showCreateForm ? (
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-800">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
            Create API Key
          </h3>
          
          <form onSubmit={handleCreateApiKey} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
                Merchant Name *
              </label>
              <input
                type="text"
                value={formData.merchantName}
                onChange={(e) => setFormData({ ...formData, merchantName: e.target.value })}
                className="w-full bg-gray-50 dark:bg-black border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-3"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
                Callback URL *
              </label>
              <input
                type="url"
                value={formData.callbackUrl}
                onChange={(e) => setFormData({ ...formData, callbackUrl: e.target.value })}
                placeholder="https://your-website.com/payment/callback"
                className="w-full bg-gray-50 dark:bg-black border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-3"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
                Webhook URL (Optional)
              </label>
              <input
                type="url"
                value={formData.webhookUrl}
                onChange={(e) => setFormData({ ...formData, webhookUrl: e.target.value })}
                placeholder="https://your-website.com/webhook"
                className="w-full bg-gray-50 dark:bg-black border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-3"
              />
            </div>
            
            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
                Business Info (Optional)
              </label>
              <textarea
                value={formData.businessInfo}
                onChange={(e) => setFormData({ ...formData, businessInfo: e.target.value })}
                rows="3"
                className="w-full bg-gray-50 dark:bg-black border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-3"
              />
            </div>
            
            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                className="flex-1 px-4 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
              >
                Create API Key
              </button>
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="px-4 py-3 bg-gray-300 dark:bg-gray-700 hover:bg-gray-400 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      ) : (
        <button
          onClick={() => setShowCreateForm(true)}
          className="w-full bg-white dark:bg-gray-900 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl p-8 hover:border-green-500 dark:hover:border-green-500 transition-all duration-200"
        >
          <div className="flex flex-col items-center space-y-3">
            <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <FiPlus className="text-3xl text-green-500" />
            </div>
            <span className="text-gray-600 dark:text-gray-400 font-medium">Create API Key</span>
            <span className="text-sm text-gray-500 dark:text-gray-500 text-center">
              Accept payments on your website with your own API key
            </span>
          </div>
        </button>
      )}
    </div>
  );
};

export default ApiKeys;