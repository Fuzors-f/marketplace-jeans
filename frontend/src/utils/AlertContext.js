import React, { createContext, useContext, useState, useCallback } from 'react';
import AlertModal from '../components/AlertModal';

const AlertContext = createContext(null);

export const useAlert = () => {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error('useAlert must be used within AlertProvider');
  }
  return context;
};

export const AlertProvider = ({ children }) => {
  const [alertState, setAlertState] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'info',
    onConfirm: null,
    confirmText: 'Ya',
    cancelText: 'Tidak'
  });

  const closeAlert = useCallback(() => {
    setAlertState(prev => ({ ...prev, isOpen: false }));
  }, []);

  const showAlert = useCallback((message, options = {}) => {
    setAlertState({
      isOpen: true,
      message,
      title: options.title || '',
      type: options.type || 'info',
      onConfirm: options.onConfirm || null,
      confirmText: options.confirmText || 'Ya',
      cancelText: options.cancelText || 'Tidak'
    });
  }, []);

  const showSuccess = useCallback((message, title = 'Berhasil') => {
    showAlert(message, { title, type: 'success' });
  }, [showAlert]);

  const showError = useCallback((message, title = 'Error') => {
    showAlert(message, { title, type: 'error' });
  }, [showAlert]);

  const showWarning = useCallback((message, title = 'Peringatan') => {
    showAlert(message, { title, type: 'warning' });
  }, [showAlert]);

  const showInfo = useCallback((message, title = 'Informasi') => {
    showAlert(message, { title, type: 'info' });
  }, [showAlert]);

  const showConfirm = useCallback((message, onConfirm, options = {}) => {
    showAlert(message, {
      title: options.title || 'Konfirmasi',
      type: 'confirm',
      onConfirm,
      confirmText: options.confirmText || 'Ya',
      cancelText: options.cancelText || 'Tidak'
    });
  }, [showAlert]);

  const value = {
    showAlert,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showConfirm
  };

  return (
    <AlertContext.Provider value={value}>
      {children}
      <AlertModal
        isOpen={alertState.isOpen}
        onClose={closeAlert}
        title={alertState.title}
        message={alertState.message}
        type={alertState.type}
        onConfirm={alertState.onConfirm}
        confirmText={alertState.confirmText}
        cancelText={alertState.cancelText}
        showCancelButton={alertState.type === 'confirm'}
      />
    </AlertContext.Provider>
  );
};
