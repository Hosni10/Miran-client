import React, { createContext, useContext, useEffect } from "react";
import { useTranslation } from "react-i18next";

interface DirectionContextType {
  direction: "ltr" | "rtl";
  isRTL: boolean;
}

const DirectionContext = createContext<DirectionContextType>({
  direction: "ltr",
  isRTL: false,
});

export const useDirection = () => {
  const context = useContext(DirectionContext);
  if (!context) {
    throw new Error("useDirection must be used within a DirectionProvider");
  }
  return context;
};

interface DirectionProviderProps {
  children: React.ReactNode;
}

export function DirectionProvider({ children }: DirectionProviderProps) {
  const { i18n } = useTranslation();

  // RTL languages
  const rtlLanguages = ["ar", "he", "fa", "ur"];
  const isRTL = rtlLanguages.includes(i18n.language);
  const direction = isRTL ? "rtl" : "ltr";

  useEffect(() => {
    // Set document direction
    document.documentElement.dir = direction;
    document.documentElement.lang = i18n.language;

    // Add/remove RTL class for Tailwind CSS
    if (isRTL) {
      document.documentElement.classList.add("rtl");
    } else {
      document.documentElement.classList.remove("rtl");
    }
  }, [direction, isRTL, i18n.language]);

  const value: DirectionContextType = {
    direction,
    isRTL,
  };

  return (
    <DirectionContext.Provider value={value}>
      {children}
    </DirectionContext.Provider>
  );
}

export default DirectionProvider;
