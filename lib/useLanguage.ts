"use client";

import { useEffect, useState } from "react";
import { getTranslations, type Language } from "@/lib/translations";

const LANGUAGE_STORAGE_KEY = "ds-language";

export function useLanguage() {
  const [language, setLanguage] = useState<Language>(() => {
    if (typeof window === "undefined") return "vi";

    const savedLanguage = localStorage.getItem(LANGUAGE_STORAGE_KEY);

    if (savedLanguage === "vi" || savedLanguage === "en") {
      return savedLanguage;
    }

    return "vi";
  });

  useEffect(() => {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
  }, [language]);

  const toggleLanguage = () => {
    setLanguage((current) => (current === "vi" ? "en" : "vi"));
  };

  return {
    language,
    setLanguage,
    toggleLanguage,
    t: getTranslations(language),
  };
}
