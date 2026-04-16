import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { cardService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  FiCreditCard, 
  FiPlus, 
  FiEye, 
  FiLock, 
  FiUnlock,
  FiTrash2,
  FiCopy,
  FiCheck,
  FiAlertCircle,
  FiLogIn,
  FiRefreshCw
} from 'react-icons/fi';
import VisaCard, { VisaCardPreview, formatCardNumber } from './VisaCard';

const Cards = () => {
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [card, setCard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showFullDetails, setShowFullDetails] = useState(false);
  const [fullCardDetails, setFullCardDetails] = useState(null);
  const [notification, setNotification] = useState(null);
  const [copied, setCopied] = useState(false);
  
  const [formData, setFormData] = useState({
    cardHolderName: user?.name || '',
    dailyLimit: 5000
  });

  useEffect(() => {
    if (!authLoading) {
      if (user || isAuthenticated) {
        fetchCard();
      } else {
        setLoading(false);
        navigate('/login');
      }
    }
  }, [user, authLoading, isAuthenticated]);

  const fetchCard = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await cardService.getMyCard();
      setCard(data.card);
    } catch (error) {
      if (error.response?.status === 401) {
        navigate('/login');
      } else if (error.response?.status === 404) {
        setCard(null);
      } else {
        setError(error.response?.data?.error || 'Failed to load card');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchFullDetails = async () => {
    try {
      const data = await cardService.getCardDetails();
      setFullCardDetails(data.card);
    } catch (error) {
      if (error.response?.status === 401) {
        navigate('/login');
      } else {
        showNotification('error', 'Failed to fetch card details');
      }
    }
  };

  const handleCreateCard = async (e) => {
    e.preventDefault();
    
    if (!formData.cardHolderName.trim()) {
      showNotification('error', 'Please enter card holder name');
      return;
    }
    
    try {
      const data = await cardService.createCard(formData.cardHolderName, formData.dailyLimit);
      
      setCard(data.card);
      setShowCreateForm(false);
      showNotification('success', 'Card created successfully!');
      
      setFullCardDetails({
        cardNumber: data.card.fullCardNumber,
        cvv: data.card.cvv,
        expiryMonth: data.card.expiryMonth,
        expiryYear: data.card.expiryYear
      });
      setShowFullDetails(true);
      
      setTimeout(() => {
        setShowFullDetails(false);
        setFullCardDetails(null);
      }, 30000);
    } catch (error) {
      if (error.response?.status === 401) {
        navigate('/login');
      } else {
        showNotification('error', error.response?.data?.error || 'Failed to create card');
      }
    }
  };

  const handleToggleStatus = async () => {
    try {
      await cardService.toggleCardStatus();
      await fetchCard();
      showNotification('success', `Card ${card.status === 'active' ? 'frozen' : 'activated'}`);
    } catch (error) {
      if (error.response?.status === 401) {
        navigate('/login');
      } else {
        showNotification('error', 'Failed to update card status');
      }
    }
  };

  const handleDeleteCard = async () => {
    if (!confirm('Are you sure you want to delete this card? This action cannot be undone.')) {
      return;
    }
    
    try {
      await cardService.deleteCard();
      setCard(null);
      showNotification('success', 'Card deleted successfully');
    } catch (error) {
      if (error.response?.status === 401) {
        navigate('/login');
      } else {
        showNotification('error', 'Failed to delete card');
      }
    }
  };

  const handleCopyCardNumber = () => {
    if (fullCardDetails?.cardNumber) {
      navigator.clipboard.writeText(fullCardDetails.cardNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      showNotification('success', 'Card number copied!');
    }
  };

  const handleCopyCVV = () => {
    if (fullCardDetails?.cvv) {
      navigator.clipboard.writeText(fullCardDetails.cvv);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      showNotification('success', 'CVV copied!');
    }
  };

  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  if (authLoading || loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
        <p className="text-gray-600 dark:text-gray-400">Loading...</p>
      </div>
    );
  }

  if (!user && !isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <FiAlertCircle className="text-5xl text-yellow-500" />
        <p className="text-gray-600 dark:text-gray-400">Please log in to view your cards</p>
        <button
          onClick={() => navigate('/login')}
          className="px-6 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg flex items-center gap-2"
        >
          <FiLogIn />
          Go to Login
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between">
        <h2 className="text-xl lg:text-2xl font-semibold text-green-600 dark:text-green-400 flex items-center">
          <FiCreditCard className="mr-2" />
          Your Cards
        </h2>
        <button
          onClick={fetchCard}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          title="Refresh"
        >
          <FiRefreshCw className="text-gray-500" />
        </button>
      </div>

      {notification && (
        <div className={`p-4 rounded-lg flex items-center gap-2 animate-slideIn ${
          notification.type === 'success' 
            ? 'bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-600 text-green-700 dark:text-green-400' 
            : 'bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-600 text-red-700 dark:text-red-400'
        }`}>
          {notification.type === 'success' ? <FiCheck /> : <FiAlertCircle />}
          {notification.message}
        </div>
      )}

      {error && !card && (
        <div className="flex flex-col items-center justify-center py-8 space-y-4">
          <FiAlertCircle className="text-5xl text-red-500" />
          <p className="text-gray-600 dark:text-gray-400 text-center">{error}</p>
          <button
            onClick={fetchCard}
            className="px-6 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg flex items-center gap-2"
          >
            <FiRefreshCw />
            Retry
          </button>
        </div>
      )}

      {showFullDetails && fullCardDetails && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-400 dark:border-yellow-600 rounded-xl p-5">
          <p className="text-yellow-800 dark:text-yellow-400 font-semibold mb-4 text-lg">🔐 Card Details - Save These Securely!</p>
          <div className="space-y-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Card Number</p>
              <div className="flex items-center gap-2">
                <code className="font-mono text-xl tracking-wider flex-1">
                  {formatCardNumber(fullCardDetails.cardNumber)}
                </code>
                <button 
                  onClick={handleCopyCardNumber} 
                  className="p-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                >
                  {copied ? <FiCheck className="text-green-500 text-xl" /> : <FiCopy className="text-xl" />}
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">CVV</p>
                <div className="flex items-center gap-2">
                  <code className="font-mono text-xl tracking-wider flex-1">
                    {fullCardDetails.cvv}
                  </code>
                  <button 
                    onClick={handleCopyCVV} 
                    className="p-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                  >
                    {copied ? <FiCheck className="text-green-500" /> : <FiCopy />}
                  </button>
                </div>
              </div>
              
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Expiry Date</p>
                <code className="font-mono text-xl tracking-wider block">
                  {fullCardDetails.expiryMonth}/{fullCardDetails.expiryYear}
                </code>
              </div>
            </div>
            
            <p className="text-xs text-yellow-700 dark:text-yellow-500 text-center">
              ⚠️ These details will disappear in 30 seconds. Save them securely!
            </p>
          </div>
        </div>
      )}

      {card ? (
        <div className="space-y-5">
          {/* Using the separated VisaCard component */}
          <VisaCard
            cardNumber={card.cardNumber?.replace(/\D/g, '')}
            cardHolderName={card.cardHolderName}
            expiryMonth={card.expiryMonth}
            expiryYear={card.expiryYear}
            status={card.status}
          />

          {/* Card Stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800">
              <p className="text-gray-500 dark:text-gray-400 text-xs mb-1">Daily Limit</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                ETB{card.dailyLimit?.toLocaleString()}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800">
              <p className="text-gray-500 dark:text-gray-400 text-xs mb-1">Spent Today</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                ETB{card.spentToday?.toLocaleString()}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800">
              <p className="text-gray-500 dark:text-gray-400 text-xs mb-1">Available</p>
              <p className="text-lg font-semibold text-green-600 dark:text-green-400">
                ETB{card.remainingDailyLimit?.toLocaleString()}
              </p>
            </div>
          </div>

          {/* Card Actions */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => {
                fetchFullDetails();
                setShowFullDetails(true);
                setTimeout(() => {
                  setShowFullDetails(false);
                  setFullCardDetails(null);
                }, 30000);
              }}
              className="px-4 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl transition-colors flex items-center justify-center gap-2 font-medium"
            >
              <FiEye />
              View Details
            </button>
            <button
              onClick={handleToggleStatus}
              className={`px-4 py-3 rounded-xl transition-colors flex items-center justify-center gap-2 font-medium ${
                card.status === 'active' 
                  ? 'bg-yellow-500 hover:bg-yellow-600 text-white'
                  : 'bg-green-500 hover:bg-green-600 text-white'
              }`}
            >
              {card.status === 'active' ? <FiLock /> : <FiUnlock />}
              {card.status === 'active' ? 'Freeze' : 'Activate'}
            </button>
            <button
              onClick={handleDeleteCard}
              className="col-span-2 px-4 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl transition-colors flex items-center justify-center gap-2 font-medium"
            >
              <FiTrash2 />
              Delete Card
            </button>
          </div>
        </div>
      ) : showCreateForm ? (
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-800">
          <h3 className="text-lg font-semibold mb-5 text-gray-900 dark:text-white">Create Virtual Visa Card</h3>
          
          <form onSubmit={handleCreateCard} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Card Holder Name
              </label>
              <input
                type="text"
                value={formData.cardHolderName}
                onChange={(e) => setFormData({ ...formData, cardHolderName: e.target.value.toUpperCase() })}
                placeholder="JOHN DOE"
                className="w-full bg-gray-50 dark:bg-black border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-3 text-gray-900 dark:text-white placeholder-gray-400 uppercase tracking-wide"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Daily Spending Limit (ETB)
              </label>
              <input
                type="number"
                value={formData.dailyLimit}
                onChange={(e) => setFormData({ ...formData, dailyLimit: parseInt(e.target.value) || 5000 })}
                className="w-full bg-gray-50 dark:bg-black border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-3 text-gray-900 dark:text-white"
                min="100"
                max="10000"
                required
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Min: ETB100 • Max: ETB10,000
              </p>
            </div>
            
            {/* Card Preview using separated component */}
            <VisaCardPreview cardHolderName={formData.cardHolderName} />
            
            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                className="flex-1 px-4 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors font-medium"
              >
                Create Card
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowCreateForm(false);
                  setFormData({ ...formData, cardHolderName: user?.name || '' });
                }}
                className="px-4 py-3 bg-gray-300 dark:bg-gray-700 hover:bg-gray-400 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors font-medium"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      ) : (
        <button
          onClick={() => setShowCreateForm(true)}
          className="w-full bg-white dark:bg-gray-900 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl p-8 hover:border-green-500 dark:hover:border-green-500 transition-all duration-200 group"
        >
          <div className="flex flex-col items-center space-y-3">
            <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center group-hover:scale-110 transition-transform">
              <FiPlus className="text-3xl text-green-500" />
            </div>
            <span className="text-gray-600 dark:text-gray-400 font-medium">Create Virtual Card</span>
            <span className="text-sm text-gray-500 dark:text-gray-500">Generate a Visa card for online payments</span>
          </div>
        </button>
      )}
    </div>
  );
};

export default Cards;