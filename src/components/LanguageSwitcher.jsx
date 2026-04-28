import React from 'react';
import { useLanguage } from '../i18n/LanguageContext';

const LanguageSwitcher = () => {
  const { language, toggleLanguage } = useLanguage();

  return (
    <button
      onClick={toggleLanguage}
      className="relative flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border-2 border-gray-100 shadow-sm hover:border-indigo-300 transition-all group overflow-hidden"
      title={language === 'en' ? 'Switch to Hindi' : 'Switch to English'}
    >
      <div className="flex items-center gap-2 relative z-10">
        <span className={`text-[10px] font-black uppercase tracking-tight transition-colors ${language === 'en' ? 'text-indigo-600' : 'text-gray-400'}`}>
          EN
        </span>
        <div className="w-8 h-4 bg-gray-100 rounded-full relative">
          <div 
            className={`absolute top-0.5 bottom-0.5 w-3 rounded-full transition-all duration-300 ${
              language === 'en' 
                ? 'left-0.5 bg-indigo-500' 
                : 'left-[calc(100%-0.875rem)] bg-indigo-500'
            }`}
          />
        </div>
        <span className={`text-[10px] font-black uppercase tracking-tight transition-colors ${language === 'hi' ? 'text-indigo-600' : 'text-gray-400'}`}>
          HI
        </span>
      </div>
      <div className="absolute inset-0 bg-indigo-50 opacity-0 group-hover:opacity-100 transition-opacity" />
    </button>
  );
};

export default LanguageSwitcher;
