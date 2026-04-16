import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { walletService } from '../services/api';
import { FiSend, FiCheck, FiAlertCircle, FiCopy, FiUser, FiCamera, FiX } from 'react-icons/fi';
import QrScanner from 'react-qr-scanner';

const Send = () => {
  const { balance, refreshBalance } = useAuth();
  const [formData, setFormData] = useState({
    toWalletId: '',
    amount: '',
    description: '',
  });
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);
  const [showScanner, setShowScanner] = useState(false);
  const [scanError, setScanError] = useState(null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setFormData({
        ...formData,
        toWalletId: text
      });
      setNotification({ type: 'success', message: 'Wallet ID pasted!' });
      setTimeout(() => setNotification(null), 2000);
    } catch (err) {
      setNotification({ type: 'error', message: 'Failed to paste. Please enter manually.' });
      setTimeout(() => setNotification(null), 2000);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.toWalletId.trim()) {
      setNotification({ type: 'error', message: 'Please enter receiver wallet ID' });
      setTimeout(() => setNotification(null), 3000);
      return;
    }
    
    const amount = parseFloat(formData.amount);
    if (!amount || amount <= 0) {
      setNotification({ type: 'error', message: 'Please enter a valid amount' });
      setTimeout(() => setNotification(null), 3000);
      return;
    }
    
    if (amount > balance) {
      setNotification({ type: 'error', message: 'Insufficient funds' });
      setTimeout(() => setNotification(null), 3000);
      return;
    }

    setLoading(true);
    
    try {
      const result = await walletService.sendMoney(
        formData.toWalletId,
        amount,
        formData.description
      );
      
      await refreshBalance();
      
      setNotification({ type: 'success', message: result.message || 'Money sent successfully!' });
      setFormData({ toWalletId: '', amount: '', description: '' });
      
      setTimeout(() => {
        setNotification(null);
        navigate('/');
      }, 2000);
    } catch (error) {
      setNotification({ 
        type: 'error', 
        message: error.response?.data?.error || 'Failed to send money' 
      });
      setTimeout(() => setNotification(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleScan = (data) => {
    if (data && data.text) {
      setFormData({
        ...formData,
        toWalletId: data.text
      });
      setShowScanner(false);
      setScanError(null);
      setNotification({ type: 'success', message: 'QR code scanned successfully!' });
      setTimeout(() => setNotification(null), 2000);
    }
  };

  const handleScanError = (error) => {
    console.error('Scan error:', error);
    setScanError('Failed to scan QR code. Please try again or enter manually.');
  };

  const setQuickAmount = (value) => {
    setFormData({
      ...formData,
      amount: value.toString()
    });
  };

  const previewStyle = {
    height: 300,
    width: '100%',
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 lg:p-8 border border-gray-200 dark:border-gray-800">
        <h2 className="text-xl lg:text-2xl font-semibold mb-2 text-green-600 dark:text-green-400 flex items-center">
          <FiSend className="mr-2" />
          Send Money
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Available Balance: <span className="text-gray-900 dark:text-white font-semibold">ETB{balance.toFixed(2)}</span>
        </p>
        
        {notification && (
          <div className={`mb-4 p-4 rounded-lg flex items-center gap-2 animate-slideIn ${
            notification.type === 'success' 
              ? 'bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-600 text-green-700 dark:text-green-400' 
              : 'bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-600 text-red-700 dark:text-red-400'
          }`}>
            {notification.type === 'success' ? <FiCheck /> : <FiAlertCircle />}
            {notification.message}
          </div>
        )}

        {/* Scanner Toggle Button */}
        <div className="mb-4">
          <button
            type="button"
            onClick={() => setShowScanner(!showScanner)}
            className="w-full px-4 py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
          >
            <FiCamera />
            {showScanner ? 'Hide Scanner' : 'Scan QR Code'}
          </button>
        </div>

        {/* QR Scanner */}
        {showScanner && (
          <div className="mb-6">
            <div className="relative rounded-lg overflow-hidden border-2 border-purple-500">
              <QrScanner
                delay={300}
                style={previewStyle}
                onError={handleScanError}
                onScan={handleScan}
                constraints={{
                  video: { facingMode: 'environment' }
                }}
              />
              <button
                onClick={() => setShowScanner(false)}
                className="absolute top-2 right-2 p-2 bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors z-10"
              >
                <FiX />
              </button>
            </div>
            {scanError && (
              <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                <FiAlertCircle /> {scanError}
              </p>
            )}
            <p className="text-gray-500 dark:text-gray-400 text-xs mt-2 text-center">
              Position the QR code within the camera view
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">Receiver Wallet ID</label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <FiUser />
              </div>
              <input
                type="text"
                name="toWalletId"
                value={formData.toWalletId}
                onChange={handleChange}
                placeholder="Enter or scan receiver wallet ID"
                className="w-full bg-gray-50 dark:bg-black border border-gray-300 dark:border-gray-700 rounded-lg pl-10 pr-24 py-3 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-green-500 dark:focus:border-green-500 transition-colors duration-200"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                <button
                  type="button"
                  onClick={handlePaste}
                  className="p-2 text-gray-500 hover:text-green-500 transition-colors"
                  title="Paste from clipboard"
                >
                  <FiCopy className="text-xl" />
                </button>
                <button
                  type="button"
                  onClick={() => setShowScanner(!showScanner)}
                  className="p-2 text-gray-500 hover:text-purple-500 transition-colors"
                  title="Scan QR code"
                >
                  <FiCamera className="text-xl" />
                </button>
              </div>
            </div>
          </div>
          
          <div>
            <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">Amount (ETB)</label>
            <input
              type="number"
              name="amount"
              step="0.01"
              value={formData.amount}
              onChange={handleChange}
              placeholder="0.00"
              className="w-full bg-gray-50 dark:bg-black border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-3 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-green-500 dark:focus:border-green-500 transition-colors duration-200"
            />
            {/* Quick amount buttons */}
            <div className="grid grid-cols-4 gap-2 mt-2">
              {[10, 50, 100, 500].map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setQuickAmount(value)}
                  className="px-3 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm transition-colors"
                >
                  ETB{value}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">Description (Optional)</label>
            <input
              type="text"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="What's this for?"
              className="w-full bg-gray-50 dark:bg-black border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-3 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-green-500 dark:focus:border-green-500 transition-colors duration-200"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-medium py-3 rounded-lg shadow-sm hover:shadow-lg transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <FiSend />
            {loading ? 'Sending...' : 'Send Money'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Send;