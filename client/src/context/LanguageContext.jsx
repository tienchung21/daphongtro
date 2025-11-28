import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import viTranslations from '../locales/vi';
import enTranslations from '../locales/en';

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
};

export const useTranslation = () => {
  const { language, translations } = useLanguage();
  
  const t = (key, params = {}) => {
    const keys = key.split('.');
    let value = translations;
    
    for (const k of keys) {
      if (value && typeof value === 'object') {
        value = value[k];
      } else {
        // Fallback to Vietnamese if key not found
        const viValue = keys.reduce((obj, k) => obj?.[k], viTranslations);
        return viValue || key;
      }
    }
    
    // Replace params in string (e.g., "Hello {name}" -> "Hello John")
    if (typeof value === 'string' && Object.keys(params).length > 0) {
      return value.replace(/\{(\w+)\}/g, (match, key) => params[key] || match);
    }
    
    return value || key;
  };
  
  return { t, language };
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('vi');

  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') || 'vi';
    setLanguage(savedLanguage);
  }, []);

  const translations = useMemo(() => {
    return language === 'vi' ? viTranslations : enTranslations;
  }, [language]);

  const toggleLanguage = () => {
    const newLang = language === 'vi' ? 'en' : 'vi';
    setLanguage(newLang);
    localStorage.setItem('language', newLang);
    // Trigger custom event để các component khác có thể lắng nghe
    window.dispatchEvent(new CustomEvent('languageChanged', { detail: newLang }));
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, translations }}>
      {children}
    </LanguageContext.Provider>
  );
};

