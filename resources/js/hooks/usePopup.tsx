// usePopup.tsx - Custom hook untuk manage popup state
import { useState } from 'react';

interface PopupData {
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  autoClose?: number;
}

export const usePopup = () => {
  const [popupData, setPopupData] = useState<PopupData | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const showPopup = (data: PopupData) => {
    setPopupData(data);
    setIsOpen(true);
  };

  const closePopup = () => {
    setIsOpen(false);
    setTimeout(() => setPopupData(null), 300); // Wait for animation
  };

  // Helper functions untuk berbagai jenis popup
  const showSuccess = (title: string, message: string, actionLabel?: string, onAction?: () => void) => {
    showPopup({
      type: 'success',
      title,
      message,
      actionLabel,
      onAction,
      autoClose: 5000 // Auto close after 5 seconds
    });
  };

  const showError = (title: string, message: string, actionLabel?: string, onAction?: () => void) => {
    showPopup({
      type: 'error',
      title,
      message,
      actionLabel,
      onAction
    });
  };

  const showInfo = (title: string, message: string, actionLabel?: string, onAction?: () => void) => {
    showPopup({
      type: 'info',
      title,
      message,
      actionLabel,
      onAction,
      autoClose: 4000
    });
  };

  const showWarning = (title: string, message: string, actionLabel?: string, onAction?: () => void) => {
    showPopup({
      type: 'warning',
      title,
      message,
      actionLabel,
      onAction
    });
  };

  return {
    popupData,
    isOpen,
    closePopup,
    showSuccess,
    showError,
    showInfo,
    showWarning
  };
};