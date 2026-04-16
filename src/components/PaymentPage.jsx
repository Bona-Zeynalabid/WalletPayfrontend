import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { paymentService } from '../services/api';
import { FiLock, FiCreditCard, FiUser, FiCalendar, FiShield, FiCheck, FiAlertCircle } from 'react-icons/fi';
import { SiVisa, SiMastercard } from 'react-icons/si';

const PaymentPage = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    cardNumber: '',
    cardHolder: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: ''
  });

  useEffect(() => {
    fetchSession();
  }, [sessionId]);

  const fetchSession = async () => {
    try {
      const data = await paymentService.getSession(sessionId);
      setSession(data);
    } catch (error) {
      setError(error.response?.data?.error || 'Invalid or expired payment session');
    } finally {
      setLoading(false);
    }
  };

  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    
    for (let i = 0; i < match.length; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    
    if (parts.length) {
      return parts.join(' ');
    } else {
      return value;
    }
  };

  const handleCardNumberChange = (e) => {
    setFormData({
      ...formData,
      cardNumber: formatCardNumber(e.target.value)
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setProcessing(true);
    setError(null);
    
    try {
      const result = await paymentService.processPayment(sessionId, {
        ...formData,
        cardNumber: formData.cardNumber.replace(/\s/g, '')
      });
      
      if (result.success) {
        setSuccess(true);
        setTimeout(() => {
          window.location.href = result.redirectUrl;
        }, 2000);
      } else {
        setError(result.error);
      }
    } catch (error) {
      setError(error.response?.data?.error || 'Payment failed');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-black">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (error && !session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-black p-4">
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 max-w-md w-full text-center border border-gray-200 dark:border-gray-800">
          <FiAlertCircle className="text-5xl text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Payment Error
          </h2>
          <p className="text-gray-600 dark:text-gray-400">{error}</p>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-black p-4">
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 max-w-md w-full text-center border border-gray-200 dark:border-gray-800">
          <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-4">
            <FiCheck className="text-4xl text-green-500" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Payment Successful!
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Redirecting you back to the merchant...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-black p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 lg:p-8 max-w-md w-full border border-gray-200 dark:border-gray-800 shadow-xl">
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-2 mb-2">
            <FiLock className="text-green-500" />
            <span className="text-sm text-gray-500 dark:text-gray-400">Secure Payment</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {session?.merchantName}
          </h2>
        </div>
        
        <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 mb-6">
          <div className="flex justify-between items-center">
            <span className="text-gray-600 dark:text-gray-400">Amount</span>
            <span className="text-2xl font-bold text-gray-900 dark:text-white">
              ETB{session?.amount?.toFixed(2)}
            </span>
          </div>
          {session?.description && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              {session.description}
            </p>
          )}
        </div>
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-600 text-red-700 dark:text-red-400 rounded-lg flex items-center gap-2">
            <FiAlertCircle />
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
              Card Number
            </label>
            <div className="relative">
              <FiCreditCard className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={formData.cardNumber}
                onChange={handleCardNumberChange}
                placeholder="1234 5678 9012 3456"
                maxLength="19"
                className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-black border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white"
                required
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-1">
                <SiVisa className="text-blue-600 text-xl" />
                <SiMastercard className="text-orange-600 text-xl" />
              </div>
            </div>
          </div>
          
          <div>
            <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
              Card Holder Name
            </label>
            <div className="relative">
              <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={formData.cardHolder}
                onChange={(e) => setFormData({ ...formData, cardHolder: e.target.value.toUpperCase() })}
                placeholder="JOHN DOE"
                className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-black border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white uppercase"
                required
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                Expiry Date
              </label>
              <div className="relative">
                <FiCalendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <div className="flex gap-1">
                  <input
                    type="text"
                    value={formData.expiryMonth}
                    onChange={(e) => setFormData({ ...formData, expiryMonth: e.target.value })}
                    placeholder="MM"
                    maxLength="2"
                    className="w-full pl-10 pr-2 py-3 bg-gray-50 dark:bg-black border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white"
                    required
                  />
                  <span className="text-gray-400 text-xl py-3">/</span>
                  <input
                    type="text"
                    value={formData.expiryYear}
                    onChange={(e) => setFormData({ ...formData, expiryYear: e.target.value })}
                    placeholder="YY"
                    maxLength="2"
                    className="w-full px-2 py-3 bg-gray-50 dark:bg-black border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white"
                    required
                  />
                </div>
              </div>
            </div>
            
            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                CVV
              </label>
              <div className="relative">
                <FiShield className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="password"
                  value={formData.cvv}
                  onChange={(e) => setFormData({ ...formData, cvv: e.target.value })}
                  placeholder="•••"
                  maxLength="4"
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-black border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white"
                  required
                />
              </div>
            </div>
          </div>
          
          <button
            type="submit"
            disabled={processing}
            className="w-full py-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-medium rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed mt-6"
          >
            {processing ? (
              <span className="flex items-center justify-center gap-2">
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                Processing...
              </span>
            ) : (
              `Pay ETB${session?.amount?.toFixed(2)}`
            )}
          </button>
        </form>
        
        <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-4">
          Secured by WalletPay • Your payment information is encrypted
        </p>
      </div>
    </div>
  );
};

export default PaymentPage;