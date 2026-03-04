import React, { useEffect } from 'react';
// Toast component displays temporary notification messages with auto-dismiss functionality
const Toast = ({ message, type, onClose }) => {
  // Auto-dismiss timer - closes toast after 3 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);
    // Cleanup timer on component unmount to prevent memory leaks
    return () => clearTimeout(timer);
  }, [onClose]);
  // Determine background color based on notification type
  const bgColor = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    info: 'bg-blue-500',
    warning: 'bg-yellow-500'
  }[type] || 'bg-gray-500';
  // Select appropriate icon based on notification type
  const icon = {
    success: '✓',
    error: '✗',
    info: 'ℹ',
    warning: '⚠'
  }[type] || '•';

  return (
    <div className={`fixed top-5 right-5 ${bgColor} text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-slideIn`}>
      <div className="flex items-center gap-3">
        {/* Notification icon */}
        <span className="text-xl font-bold">{icon}</span>
        {/* Notification message */}
        <span className="font-medium">{message}</span>
        {/* Manual close button */}
        <button onClick={onClose} className="ml-4 text-white hover:text-gray-200">
          ✕
        </button>
      </div>
    </div>
  );
};
export default Toast;