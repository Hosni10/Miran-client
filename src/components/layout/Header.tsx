import React, { useState } from "react";
import {
  Bell,
  Moon,
  Sun,
  User,
  Settings,
  LogOut,
  Menu,
  Globe,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useThemeStore } from "../../store/ThemeStore";
import { useAuth } from "../../contexts/AuthContext";
import { useToast } from "../ui/ToastContainer";
import { GlobalSearch } from "./GlobalSearch";

interface HeaderProps {
  onMenuClick: () => void;
}

// Language Toggle Component
function LanguageToggle() {
  const { i18n } = useTranslation();
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);

  const currentLanguage = i18n.language;

  const languages = [
    {
      code: "en",
      name: "English",
      flag: "🇺🇸",
      dir: "ltr",
    },
    {
      code: "ar",
      name: "العربية",
      flag: "🇸🇦",
      dir: "rtl",
    },
  ];

  const handleLanguageChange = (languageCode: string) => {
    // Change language
    i18n.changeLanguage(languageCode);

    // Update document direction
    const selectedLang = languages.find((lang) => lang.code === languageCode);
    if (selectedLang) {
      document.documentElement.dir = selectedLang.dir;
      document.documentElement.lang = languageCode;

      // Add/remove RTL class for Tailwind CSS
      if (selectedLang.dir === "rtl") {
        document.documentElement.classList.add("rtl");
      } else {
        document.documentElement.classList.remove("rtl");
      }
    }

    // Persist choice in localStorage
    localStorage.setItem("preferred-language", languageCode);

    setShowLanguageMenu(false);
  };

  // Load saved language preference on component mount
  React.useEffect(() => {
    const savedLanguage = localStorage.getItem("preferred-language");
    if (savedLanguage && savedLanguage !== currentLanguage) {
      // Change language
      i18n.changeLanguage(savedLanguage);

      // Update document direction
      const selectedLang = languages.find(
        (lang) => lang.code === savedLanguage,
      );
      if (selectedLang) {
        document.documentElement.dir = selectedLang.dir;
        document.documentElement.lang = savedLanguage;

        // Add/remove RTL class for Tailwind CSS
        if (selectedLang.dir === "rtl") {
          document.documentElement.classList.add("rtl");
        } else {
          document.documentElement.classList.remove("rtl");
        }
      }
    }
  }, []); // Empty dependency array is intentional - we only want this to run once on mount

  const currentLang =
    languages.find((lang) => lang.code === currentLanguage) || languages[0];

  return (
    <div className="relative">
      <button
        onClick={() => setShowLanguageMenu(!showLanguageMenu)}
        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors group flex items-center space-x-1"
        title="Change language"
      >
        <Globe className="w-5 h-5 text-gray-600 dark:text-gray-400 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors" />
        <span className="text-sm font-medium text-gray-600 dark:text-gray-400 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
          {currentLang.flag}
        </span>
      </button>

      {showLanguageMenu && (
        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-large border border-gray-200 dark:border-gray-700 z-50 animate-scale-in">
          <div className="py-2">
            {languages.map((language) => (
              <button
                key={language.code}
                onClick={() => handleLanguageChange(language.code)}
                className={`w-full flex items-center px-4 py-2 text-sm transition-colors ${
                  currentLanguage === language.code
                    ? "bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                }`}
              >
                <span className="mr-3 text-lg">{language.flag}</span>
                <span className="flex-1 text-left">{language.name}</span>
                {currentLanguage === language.code && (
                  <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function Header({ onMenuClick }: HeaderProps) {
  const { isDark, toggleTheme } = useThemeStore();
  const { user, logout, mockLogin } = useAuth();
  const { showSuccess } = useToast();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  const handleLogout = () => {
    logout();
    showSuccess(
      "Logged Out",
      "You have been successfully logged out. See you next time!",
    );
    setShowProfile(false);
  };

  const handleMockLogin = () => {
    mockLogin();
    showSuccess(
      "Mock Login",
      "Logged in with mock credentials for development",
    );
  };

  const notifications = [
    { id: 1, title: "New user registered", time: "2 min ago", type: "user" },
    {
      id: 2,
      title: "System backup completed",
      time: "1 hour ago",
      type: "system",
    },
    {
      id: 3,
      title: "New workout program added",
      time: "3 hours ago",
      type: "content",
    },
  ];

  return (
    <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 shadow-soft">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center space-x-4">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <Menu className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>

          <GlobalSearch />
        </div>

        <div className="flex items-center space-x-3">
          {/* Development Mock Login Button */}
          {import.meta.env.DEV && !user && (
            <button
              onClick={handleMockLogin}
              className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              title="Mock login for development"
            >
              Mock Login
            </button>
          )}

          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors group"
            title={isDark ? "Switch to light mode" : "Switch to dark mode"}
          >
            {isDark ? (
              <Sun className="w-5 h-5 text-gray-600 dark:text-gray-400 group-hover:text-yellow-500 transition-colors" />
            ) : (
              <Moon className="w-5 h-5 text-gray-600 group-hover:text-primary-600 transition-colors" />
            )}
          </button>

          <LanguageToggle />

          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors relative group"
            >
              <Bell className="w-5 h-5 text-gray-600 dark:text-gray-400 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-large border border-gray-200 dark:border-gray-700 z-50 animate-scale-in">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Notifications
                  </h3>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-700 last:border-b-0 transition-colors"
                    >
                      <div className="flex items-start ltr:space-x-3 rtl:space-x-reverse">
                        <div
                          className={`w-2 h-2 rounded-full mt-2 ${
                            notification.type === "user"
                              ? "bg-primary-500"
                              : notification.type === "system"
                                ? "bg-accent-500"
                                : "bg-secondary-500"
                          }`}
                        ></div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {notification.title}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {notification.time}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-3 border-t border-gray-200 dark:border-gray-700">
                  <button className="w-full text-center text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium transition-colors">
                    View all notifications
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="relative">
            <button
              onClick={() => setShowProfile(!showProfile)}
              className="flex items-center ltr:space-x-2 rtl:space-x-reverse p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors group"
            >
              <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              <div className="hidden md:block text-left rtl:text-right">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {user?.name || "User"}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {user?.email || "user@example.com"}
                </p>
              </div>
            </button>

            {showProfile && (
              <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-large border border-gray-200 dark:border-gray-700 z-50 animate-scale-in">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center ltr:space-x-3 rtl:space-x-reverse">
                    <div className="w-10 h-10 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {user?.name || "User"}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {user?.email || "user@example.com"}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="py-2">
                  <button className="w-full flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <Settings className="w-4 h-4 ltr:mr-3 rtl:ml-3" />
                    Account Settings
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  >
                    <LogOut className="w-4 h-4 ltr:mr-3 rtl:ml-3" />
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
