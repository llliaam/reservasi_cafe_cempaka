// SimplePopup.tsx - Komponen popup sederhana
import React, { useEffect } from 'react';

interface SimplePopupProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  autoClose?: number; // Auto close after X milliseconds
}

const SimplePopup: React.FC<SimplePopupProps> = ({
  isOpen,
  onClose,
  type,
  title,
  message,
  actionLabel,
  onAction,
  autoClose
}) => {
  // Auto close functionality
  useEffect(() => {
    if (isOpen && autoClose) {
      const timer = setTimeout(() => {
        onClose();
      }, autoClose);
      
      return () => clearTimeout(timer);
    }
  }, [isOpen, autoClose, onClose]);

  if (!isOpen) return null;

  // Colors based on type
  const getTypeStyles = () => {
    switch (type) {
      case 'success':
        return {
          bg: 'bg-green-50',
          border: 'border-green-200',
          icon: '✅',
          iconBg: 'bg-green-100',
          iconColor: 'text-green-600',
          button: 'bg-green-600 hover:bg-green-700'
        };
      case 'error':
        return {
          bg: 'bg-red-50',
          border: 'border-red-200',
          icon: '❌',
          iconBg: 'bg-red-100',
          iconColor: 'text-red-600',
          button: 'bg-red-600 hover:bg-red-700'
        };
      case 'warning':
        return {
          bg: 'bg-yellow-50',
          border: 'border-yellow-200',
          icon: '⚠️',
          iconBg: 'bg-yellow-100',
          iconColor: 'text-yellow-600',
          button: 'bg-yellow-600 hover:bg-yellow-700'
        };
      case 'info':
      default:
        return {
          bg: 'bg-blue-50',
          border: 'border-blue-200',
          icon: 'ℹ️',
          iconBg: 'bg-blue-100',
          iconColor: 'text-blue-600',
          button: 'bg-blue-600 hover:bg-blue-700'
        };
    }
  };

  const styles = getTypeStyles();

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-20" 
        onClick={onClose}
      />
      
      {/* Popup */}
      <div className={`
        relative mt-16 mr-4 max-w-sm w-full
        ${styles.bg} ${styles.border}
        border rounded-lg shadow-lg
        transform transition-all duration-300 ease-in-out
        animate-slide-in-right
      `}>
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Content */}
        <div className="p-4">
          <div className="flex items-start space-x-3">
            {/* Icon */}
            <div className={`
              flex-shrink-0 w-8 h-8 rounded-full 
              ${styles.iconBg} ${styles.iconColor}
              flex items-center justify-center text-sm
            `}>
              {styles.icon}
            </div>

            {/* Text content */}
            <div className="flex-1 pt-0.5">
              <h3 className="text-sm font-medium text-gray-900 mb-1">
                {title}
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                {message}
              </p>

              {/* Action button */}
              {actionLabel && onAction && (
                <div className="mt-3">
                  <button
                    onClick={() => {
                      onAction();
                      onClose();
                    }}
                    className={`
                      px-3 py-1.5 text-xs font-medium text-white rounded
                      ${styles.button}
                      transition-colors duration-200
                    `}
                  >
                    {actionLabel}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Auto close indicator */}
        {autoClose && (
          <div className="absolute bottom-0 left-0 h-1 bg-gray-300 rounded-b-lg overflow-hidden">
            <div 
              className="h-full bg-gray-500 animate-shrink-width"
              style={{ animationDuration: `${autoClose}ms` }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default SimplePopup;