"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { translations } from "./translations";

type Language = "en" | "es";

interface LanguageContextType {
  language: Language;
  t: Record<string, any>; // satisfies eslint if rule is relaxed, or we can use unknown
  setLanguage: (lang: Language) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("es");

  useEffect(() => {
    const saved = localStorage.getItem("qrfoto_lang") as Language;
    if (saved) {
      setLanguageState(saved);
    } else {
      const browserLang = navigator.language.split('-')[0];
      const defaultLang: Language = browserLang === 'en' ? 'en' : 'es';
      setLanguageState(defaultLang);
      localStorage.setItem("qrfoto_lang", defaultLang);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("qrfoto_lang", lang);
  };

  const t = translations[language];

  return (
    <LanguageContext.Provider value={{ language, t, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useTranslation must be used within LanguageProvider");
  return context;
}
