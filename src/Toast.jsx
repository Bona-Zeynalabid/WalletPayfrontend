// Toast.jsx
import React, { useEffect } from 'react'

const Toast = ({ message, type }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      // Auto dismiss handled by parent
    }, 3000)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="fixed top-4 right-4 z-50 animate-slideIn">
      <div className={`
        px-6 py-4 rounded-lg shadow-lg border
        ${type === 'success' 
          ? 'bg-green-900/95 border-green-600 text-green-100' 
          : 'bg-red-900/95 border-red-600 text-red-100'
        }
        backdrop-blur-sm
      `}>
        <div className="flex items-center space-x-3">
          <span className="text-xl">
            {type === 'success' ? '✓' : '✕'}
          </span>
          <p className="font-medium">{message}</p>
        </div>
      </div>
    </div>
  )
}

export default Toast