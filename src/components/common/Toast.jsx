import React, { useEffect } from 'react';

const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColor = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    info: 'bg-blue-500',
    warning: 'bg-yellow-500'
  }[type] || 'bg-gray-500';

  const icon = {
    success: '✓',
    error: '✗',
    info: 'ℹ',
    warning: '⚠'
  }[type] || '•';

  return (
    <div className={`fixed top-5 right-5 ${bgColor} text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-slideIn`}>
      <div className="flex items-center gap-3">
        <span className="text-xl font-bold">{icon}</span>
        <span className="font-medium">{message}</span>
        <button onClick={onClose} className="ml-4 text-white hover:text-gray-200">
          ✕
        </button>
      </div>
    </div>
  );
};

export default Toast;