import React, { useEffect, useState } from 'react';
import { walletService } from '../services/api';

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const data = await walletService.getTransactions();
     
      
      // Handle different response structures
      if (data.transactions && Array.isArray(data.transactions)) {
        setTransactions(data.transactions);
      } else if (Array.isArray(data)) {
        setTransactions(data);
      } else {
        setTransactions([]);
      }
    } catch (err) {
      console.error('Failed to fetch transactions:', err);
      setError(err.response?.data?.error || 'Failed to load transactions');
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-800">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading transactions...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-800">
        <div className="text-center py-8">
          <p className="text-red-500 mb-4">{error}</p>
          <button 
            onClick={fetchTransactions}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 lg:p-6 border border-gray-200 dark:border-gray-800">
      <h2 className="text-xl lg:text-2xl font-semibold mb-4 lg:mb-6 text-green-600 dark:text-green-400">
        All Transactions
      </h2>
      
      <div className="space-y-3 max-h-[600px] overflow-y-auto">
        {transactions.length > 0 ? (
          transactions.map((transaction) => (
            <div 
              key={transaction.id || transaction._id} 
              className="bg-gray-50 dark:bg-black rounded-lg p-3 lg:p-4 border border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 transition-all duration-200"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 lg:w-12 lg:h-12 rounded-full flex items-center justify-center ${
                    transaction.type === 'receive' ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'
                  }`}>
                    <span className={`text-lg lg:text-xl ${transaction.type === 'receive' ? 'text-green-600 dark:text-green-500' : 'text-red-600 dark:text-red-500'}`}>
                      {transaction.type === 'receive' ? '↓' : '↑'}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{transaction.user}</p>
                    <p className="text-xs lg:text-sm text-gray-500 dark:text-gray-400">
                      {transaction.date} • {transaction.time}
                    </p>
                    {transaction.description && (
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                        {transaction.description}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center justify-between sm:justify-end sm:space-x-4">
                  <p className={`text-lg lg:text-xl font-semibold ${
                    transaction.type === 'receive' ? 'text-green-600 dark:text-green-500' : 'text-red-600 dark:text-red-500'
                  }`}>
                    {transaction.type === 'receive' ? '+' : '-'}ETB{transaction.amount.toFixed(2)}
                  </p>
                  <span className={`px-2 lg:px-3 py-1 rounded-full text-xs font-medium ${
                    transaction.status === 'success' 
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-500' 
                      : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-500'
                  }`}>
                    {transaction.status}
                  </span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500 dark:text-gray-400">No transactions found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Transactions;