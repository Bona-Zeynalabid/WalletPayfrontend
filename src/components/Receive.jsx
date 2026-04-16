import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { QRCodeSVG } from 'qrcode.react';
import { FiCopy, FiCheck, FiShare2, FiDownload } from 'react-icons/fi';

const Receive = () => {
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);
  
  const handleCopy = () => {
    if (user?.walletId) {
      navigator.clipboard?.writeText(user.walletId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const downloadQRCode = () => {
    const canvas = document.getElementById('wallet-qr-code');
    if (canvas) {
      const svg = canvas.querySelector('svg');
      if (svg) {
        const svgData = new XMLSerializer().serializeToString(svg);
        const blob = new Blob([svgData], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `wallet-${user?.walletId}.svg`;
        link.click();
        URL.revokeObjectURL(url);
      }
    }
  };

  const shareWallet = async () => {
    if (navigator.share && user?.walletId) {
      try {
        await navigator.share({
          title: 'My Wallet ID',
          text: `Send money to my wallet: ${user.walletId}`,
        });
      } catch (err) {
       
      }
    } else {
      handleCopy();
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 lg:p-8 border border-gray-200 dark:border-gray-800">
        <h2 className="text-xl lg:text-2xl font-semibold mb-6 text-green-600 dark:text-green-400 flex items-center">
          <FiDownload className="mr-2" />
          Receive Money
        </h2>
        
        <div className="space-y-6">
          {/* QR Code */}
          <div className="flex justify-center">
            <div className="bg-white p-6 rounded-xl border border-gray-200 dark:border-gray-700" id="wallet-qr-code">
              <QRCodeSVG 
                value={user?.walletId || 'loading...'} 
                size={250}
                bgColor="#ffffff"
                fgColor="#000000"
                level="H"
                includeMargin={true}
              />
            </div>
          </div>

          {/* Wallet ID Display */}
          <div className="bg-gray-50 dark:bg-black rounded-xl p-4 lg:p-6 border border-gray-200 dark:border-gray-700">
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">Your Wallet ID</p>
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <code className="text-base lg:text-xl font-mono text-gray-900 dark:text-white break-all bg-gray-100 dark:bg-gray-800 px-4 py-2 rounded-lg">
                {user?.walletId || 'Loading...'}
              </code>
              <div className="flex gap-2">
                <button 
                  onClick={handleCopy}
                  className="flex-1 sm:flex-none px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm transition-colors duration-200 flex items-center justify-center gap-2"
                >
                  {copied ? <FiCheck /> : <FiCopy />}
                  {copied ? 'Copied!' : 'Copy'}
                </button>
                <button 
                  onClick={downloadQRCode}
                  className="flex-1 sm:flex-none px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm transition-colors duration-200 flex items-center justify-center gap-2"
                >
                  <FiDownload />
                  Save QR
                </button>
              </div>
            </div>
          </div>

          {/* Share Button */}
          <button
            onClick={shareWallet}
            className="w-full px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
          >
            <FiShare2 />
            Share Wallet
          </button>

          {/* Info */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
            <p className="text-blue-700 dark:text-blue-400 text-sm">
              Share your wallet ID or QR code with others to receive payments instantly. Anyone can scan this QR code to get your wallet address.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Receive;