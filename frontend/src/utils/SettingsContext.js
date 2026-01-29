import React, { createContext, useContext, useState, useEffect } from 'react';
import { settingsAPI } from '../services/api';

const SettingsContext = createContext();

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState({});
  const [paymentConfig, setPaymentConfig] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchSettings = async () => {
    try {
      const response = await settingsAPI.getPublic();
      if (response.data.success) {
        setSettings(response.data.data);
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPaymentConfig = async () => {
    try {
      const response = await settingsAPI.getPaymentConfig();
      if (response.data.success) {
        setPaymentConfig(response.data.data);
      }
    } catch (error) {
      console.error('Failed to load payment config:', error);
    }
  };

  useEffect(() => {
    fetchSettings();
    fetchPaymentConfig();
  }, []);

  // Helper to get a setting value with default
  const getSetting = (key, defaultValue = '') => {
    return settings[key] || defaultValue;
  };

  // Get full image URL for settings images
  const getSettingImageUrl = (key) => {
    const value = settings[key];
    if (!value) return null;
    
    const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
    // Check if value already has full URL
    if (value.startsWith('http://') || value.startsWith('https://')) {
      return value;
    }
    return `${baseUrl}${value}`;
  };

  // Refresh settings (useful after admin updates)
  const refreshSettings = () => {
    fetchSettings();
    fetchPaymentConfig();
  };

  const value = {
    settings,
    loading,
    getSetting,
    getSettingImageUrl,
    refreshSettings,
    // Direct access to common settings
    siteName: settings.site_name || 'Marketplace Jeans',
    siteLogo: settings.site_logo,
    siteDescription: settings.site_description,
    contactPhone: settings.contact_phone,
    contactWhatsapp: settings.contact_whatsapp,
    contactEmail: settings.contact_email,
    contactAddress: settings.contact_address,
    socialFacebook: settings.social_facebook,
    socialInstagram: settings.social_instagram,
    socialTwitter: settings.social_twitter,
    socialTiktok: settings.social_tiktok,
    socialYoutube: settings.social_youtube,
    // Payment configuration
    paymentConfig,
    midtransEnabled: paymentConfig?.midtrans?.enabled || false,
    midtransClientKey: paymentConfig?.midtrans?.clientKey || '',
    midtransSnapUrl: paymentConfig?.midtrans?.snapUrl || '',
    isMidtransProduction: paymentConfig?.midtrans?.isProduction || false,
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};

export default SettingsContext;
