import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { walletService, cardService } from '../services/api';
import { FiArrowUp, FiArrowDown, FiCreditCard, FiTrendingUp, FiTrendingDown, FiPlus, FiEye, FiEyeOff } from 'react-icons/fi';
import { SiVisa } from 'react-icons/si';
import VisaCard from './VisaCard';

const Dashboard = () => {
  const { user, balance, refreshBalance } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [card, setCard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cardLoading, setCardLoading] = useState(true);
  const [showBalance, setShowBalance] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchTransactions();
    fetchCard();
  }, []);

  const fetchTransactions = async () => {
    try {
      const data = await walletService.getTransactions();
      setTransactions(data.transactions || []);
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCard = async () => {
    try {
      setCardLoading(true);
      const data = await cardService.getMyCard();
      setCard(data.card);
    } catch (error) {
      if (error.response?.status !== 404) {
        console.error('Failed to fetch card:', error);
      }
      setCard(null);
    } finally {
      setCardLoading(false);
    }
  };

  const totalSent = transactions
    .filter(t => t.type === 'send' && t.status === 'success')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const totalReceived = transactions
    .filter(t => t.type === 'receive' && t.status === 'success')
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Balance Card */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 lg:p-8 border border-gray-200 dark:border-gray-800 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <p className="text-gray-500 dark:text-gray-400 text-sm">Total Balance</p>
          <button
            onClick={() => setShowBalance(!showBalance)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            {showBalance ? (
              <FiEyeOff className="text-gray-500 text-xl" />
            ) : (
              <FiEye className="text-gray-500 text-xl" />
            )}
          </button>
        </div>
        <h3 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-green-600 to-green-800 dark:from-green-400 dark:to-green-600 bg-clip-text text-transparent">
          {showBalance ? (
            `ETB ${balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
          ) : (
            'ETB ••••••'
          )}
        </h3>
        <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">
          Wallet ID: {user?.walletId?.slice(0, 8)}...
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 rounded-xl p-6 border border-red-200 dark:border-red-800">
          <div className="flex items-center justify-between mb-2">
            <p className="text-red-600 dark:text-red-400 text-sm">Total Sent</p>
            <FiTrendingUp className="text-red-500 text-xl" />
          </div>
          <p className="text-2xl lg:text-3xl font-bold text-red-700 dark:text-red-500">
            {showBalance ? `ETB ${totalSent.toFixed(2)}` : 'ETB ••••••'}
          </p>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl p-6 border border-green-200 dark:border-green-800">
          <div className="flex items-center justify-between mb-2">
            <p className="text-green-600 dark:text-green-400 text-sm">Total Received</p>
            <FiTrendingDown className="text-green-500 text-xl" />
          </div>
          <p className="text-2xl lg:text-3xl font-bold text-green-700 dark:text-green-500">
            {showBalance ? `ETB ${totalReceived.toFixed(2)}` : 'ETB ••••••'}
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-4">
        <button 
          onClick={() => navigate('/send')}
          className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 p-4 lg:p-6 rounded-xl shadow-sm hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1 group"
        >
          <div className="flex items-center justify-center space-x-2 lg:space-x-3">
            <FiArrowUp className="text-xl lg:text-2xl text-white group-hover:scale-110 transition-transform" />
            <span className="text-base lg:text-lg font-semibold text-white">Send</span>
          </div>
        </button>
        <button 
          onClick={() => navigate('/receive')}
          className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 p-4 lg:p-6 rounded-xl shadow-sm hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1 group"
        >
          <div className="flex items-center justify-center space-x-2 lg:space-x-3">
            <FiArrowDown className="text-xl lg:text-2xl text-white group-hover:scale-110 transition-transform" />
            <span className="text-base lg:text-lg font-semibold text-white">Receive</span>
          </div>
        </button>
      </div>

      {/* Card Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <FiCreditCard className="text-green-500" />
            Your Card
          </h3>
          {card && (
            <button
              onClick={() => navigate('/cards')}
              className="text-sm text-green-500 hover:text-green-600"
            >
              Manage Card →
            </button>
          )}
        </div>

        {cardLoading ? (
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 border border-gray-200 dark:border-gray-800">
            <div className="animate-pulse space-y-4">
              <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
            </div>
          </div>
        ) : card ? (
          <div onClick={() => navigate('/cards')} className="cursor-pointer">
            <VisaCard
              cardNumber={card.cardNumber?.replace(/\D/g, '')}
              cardHolderName={card.cardHolderName}
              expiryMonth={card.expiryMonth}
              expiryYear={card.expiryYear}
              status={card.status}
            />
          </div>
        ) : (
          <button
            onClick={() => navigate('/cards')}
            className="w-full bg-white dark:bg-gray-900 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl p-6 hover:border-green-500 dark:hover:border-green-500 transition-all duration-200 group"
          >
            <div className="flex flex-col items-center space-y-3">
              <div className="w-14 h-14 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                <FiPlus className="text-2xl text-green-500" />
              </div>
              <div className="text-center">
                <span className="text-gray-600 dark:text-gray-400 font-medium">Create Virtual Card</span>
                <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                  Generate a Visa card for online payments
                </p>
              </div>
            </div>
          </button>
        )}
      </div>

      {/* Recent Transactions */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 lg:p-6 border border-gray-200 dark:border-gray-800">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg lg:text-xl font-semibold text-green-600 dark:text-green-400">
            Recent Transactions
          </h3>
          <button
            onClick={() => navigate('/transactions')}
            className="text-sm text-green-500 hover:text-green-600"
          >
            View All →
          </button>
        </div>
        
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto"></div>
          </div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 dark:text-gray-400">No transactions yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {transactions.slice(0, 5).map((transaction, idx) => (
              <div key={transaction.id || idx} className="bg-gray-50 dark:bg-black rounded-lg p-3 lg:p-4 border border-gray-200 dark:border-gray-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 lg:w-10 lg:h-10 rounded-full flex items-center justify-center ${
                      transaction.type === 'receive' ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'
                    }`}>
                      {transaction.type === 'receive' ? (
                        <FiArrowDown className="text-green-600 dark:text-green-500" />
                      ) : (
                        <FiArrowUp className="text-red-600 dark:text-red-500" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-sm lg:text-base text-gray-900 dark:text-white">
                        {transaction.user}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {transaction.time}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm lg:text-lg font-semibold ${
                      transaction.type === 'receive' ? 'text-green-600 dark:text-green-500' : 'text-red-600 dark:text-red-500'
                    }`}>
                      {showBalance ? (
                        `${transaction.type === 'receive' ? '+' : '-'} ETB ${transaction.amount.toFixed(2)}`
                      ) : (
                        `${transaction.type === 'receive' ? '+' : '-'} ETB ••••••`
                      )}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;