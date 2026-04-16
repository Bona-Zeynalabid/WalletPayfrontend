import React from 'react';
import { SiVisa } from 'react-icons/si';

// Format card number to show first 4 and last 4 digits
export const formatCardNumber = (number) => {
  if (!number) return '•••• •••• •••• ••••';
  const cleaned = number.replace(/\D/g, '');
  
  if (cleaned.length >= 8) {
    const first4 = cleaned.slice(0, 4);
    const last4 = cleaned.slice(-4);
    return `${first4} •••• •••• ${last4}`;
  }
  
  return '•••• •••• •••• ••••';
};

const VisaCard = ({ 
  cardNumber = '4532123456789012',
  cardHolderName = 'CARD HOLDER',
  expiryMonth = '12',
  expiryYear = '28',
  status = 'active',
  showDetails = true,
  className = ''
}) => {
  const displayNumber = showDetails ? formatCardNumber(cardNumber) : '•••• •••• •••• ••••';
  
  return (
    <div className={`relative h-52 sm:h-56 rounded-xl shadow-xl overflow-hidden ${className}`}>
      {/* Card Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950">
        {/* Subtle pattern overlay */}
        <div className="absolute inset-0 opacity-5">
          <div 
            className="absolute top-0 left-0 w-full h-full"
            style={{
              backgroundImage: `radial-gradient(circle at 20% 30%, #ffffff 1px, transparent 1px), 
                              radial-gradient(circle at 80% 70%, #ffffff 1px, transparent 1px)`,
              backgroundSize: '40px 40px'
            }}
          />
        </div>
        
        {/* Metallic sheen */}
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent" />
        
        {/* Card Chip */}
        <div className="absolute top-6 left-6 w-12 h-9 bg-gradient-to-br from-amber-200 via-amber-300 to-amber-400 rounded-md shadow-lg">
          <div className="absolute inset-0.5 bg-gradient-to-br from-amber-300 to-amber-400 rounded-sm" />
          <div className="absolute top-1.5 left-1.5 w-4 h-2.5 bg-amber-100/40 rounded-sm" />
          <div className="absolute top-1.5 right-1.5 w-1.5 h-2.5 bg-amber-100/30 rounded-sm" />
          <div className="absolute bottom-1.5 left-1.5 w-1.5 h-1.5 bg-amber-100/30 rounded-sm" />
        </div>
        
        {/* Contactless Icon */}
        <div className="absolute top-6 right-6">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className="opacity-50">
            <path d="M4 12C4 7.58172 7.58172 4 12 4C16.4183 4 20 7.58172 20 12" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
            <path d="M7 12C7 9.23858 9.23858 7 12 7C14.7614 7 17 9.23858 17 12" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
            <path d="M10 12C10 10.8954 10.8954 10 12 10C13.1046 10 14 10.8954 14 12" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </div>
        
        {/* Card Number */}
        <div className="absolute bottom-16 left-6 right-6">
          <p className="text-white text-lg sm:text-xl lg:text-2xl font-mono tracking-wider drop-shadow-md">
            {displayNumber}
          </p>
        </div>
        
        {/* Card Holder */}
        <div className="absolute bottom-5 left-6">
          <p className="text-white/50 text-[9px] uppercase tracking-wider mb-0.5">Card Holder</p>
          <p className="text-white/90 text-xs sm:text-sm font-medium tracking-wider uppercase truncate max-w-[120px] sm:max-w-[160px]">
            {cardHolderName}
          </p>
        </div>
        
        {/* Expiry Date */}
        <div className="absolute bottom-5 right-20 sm:right-24">
          <p className="text-white/50 text-[9px] uppercase tracking-wider mb-0.5">Expires</p>
          <p className="text-white/90 text-xs sm:text-sm font-medium tracking-wider">
            {expiryMonth}/{expiryYear}
          </p>
        </div>
        
        {/* Visa Logo - Moved left to avoid overlap */}
        <div className="absolute bottom-4 right-5">
          <SiVisa className="text-2xl sm:text-3xl text-white drop-shadow-md" />
        </div>
        
        {/* Status Overlays */}
        {status === 'frozen' && (
          <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px] flex items-center justify-center">
            <div className="bg-red-500/90 px-5 py-2 rounded-full transform -rotate-12 shadow-lg">
              <span className="text-white font-bold text-sm sm:text-base tracking-widest">FROZEN</span>
            </div>
          </div>
        )}
        
        {status === 'inactive' && (
          <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px] flex items-center justify-center">
            <div className="bg-gray-500/90 px-5 py-2 rounded-full transform -rotate-12 shadow-lg">
              <span className="text-white font-bold text-sm sm:text-base tracking-widest">INACTIVE</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Preview Card for create form
export const VisaCardPreview = ({ 
  cardHolderName = 'CARD HOLDER',
  className = ''
}) => {
  return (
    <div className={`relative h-44 sm:h-48 rounded-xl shadow-lg overflow-hidden ${className}`}>
      <div className="absolute inset-0 bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950">
        <div className="absolute inset-0 opacity-5">
          <div 
            className="absolute top-0 left-0 w-full h-full"
            style={{
              backgroundImage: `radial-gradient(circle at 20% 30%, #ffffff 1px, transparent 1px)`,
              backgroundSize: '40px 40px'
            }}
          />
        </div>
        
        <div className="absolute top-5 left-5 w-10 h-7 bg-gradient-to-br from-amber-200 to-amber-400 rounded-md shadow-lg" />
        
        <div className="absolute top-5 right-5">
          <SiVisa className="text-xl sm:text-2xl text-white opacity-80" />
        </div>
        
        <div className="absolute bottom-14 left-5 right-5">
          <p className="text-white text-base sm:text-lg font-mono tracking-wider">
            •••• •••• •••• ••••
          </p>
        </div>
        
        <div className="absolute bottom-4 left-5">
          <p className="text-white/50 text-[8px] uppercase mb-0.5">Card Holder</p>
          <p className="text-white/90 text-xs font-medium tracking-wide uppercase truncate max-w-[120px]">
            {cardHolderName || 'CARD HOLDER'}
          </p>
        </div>
        
        <div className="absolute bottom-4 right-16">
          <p className="text-white/50 text-[8px] uppercase mb-0.5">Expires</p>
          <p className="text-white/90 text-xs font-medium tracking-wider">
            ••/••
          </p>
        </div>
      </div>
    </div>
  );
};

export default VisaCard;