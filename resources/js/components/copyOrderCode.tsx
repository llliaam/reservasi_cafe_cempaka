import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

const CopyOrderCode = ({ orderCode }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(orderCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000); // Reset after 2 seconds
    } catch (err) {
      console.error('Failed to copy: ', err);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = orderCode;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <span className="text-orange-600 font-medium">{orderCode}</span>
      <button
        onClick={handleCopy}
        className={`flex items-center justify-center w-8 h-8 rounded-md transition-all duration-200 ${
          copied 
            ? 'bg-green-100 text-green-600' 
            : 'bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-800'
        }`}
        title={copied ? 'Copied!' : 'Copy order code'}
      >
        {copied ? (
          <Check size={16} />
        ) : (
          <Copy size={16} />
        )}
      </button>
    </div>
  );
};

// Usage example in your order detail component:
const OrderDetailExample = () => {
  const orderCode = "ORD-20250602-W1MX";
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm text-gray-600 mb-1">Order Code</h3>
          <CopyOrderCode orderCode={orderCode} />
        </div>
        <div>
          <h3 className="text-sm text-gray-600 mb-1">Status</h3>
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            Dikonfirmasi
          </span>
        </div>
      </div>
    </div>
  );
};

export default CopyOrderCode;