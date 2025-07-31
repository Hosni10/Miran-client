import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  LayoutDashboard,
  Users,
  UtensilsCrossed,
  Dumbbell,
  GraduationCap,
  UserCheck,
  Settings,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  ChefHat,
  Crown,
} from "lucide-react";
import { WithRole } from "../withRole";
import { Permission, Resource, Action } from "../../store/AuthStore";
import { useAuth } from "../../contexts/AuthContext";

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

interface NavigationItem {
  name: string;
  href: string;
  icon: React.ElementType;
  permission?: Permission;
  resource?: Resource;
  action?: Action;
  alwaysShow?: boolean; // Flag to always show certain items
}

const navigation: NavigationItem[] = [
  {
    name: "nav.overview",
    href: "/",
    icon: LayoutDashboard,
    alwaysShow: true, // Always show overview
  },
  {
    name: "nav.nutrition",
    href: "/food",
    icon: UtensilsCrossed,
    resource: "products",
    action: "read",
  },
  {
    name: "nav.recipes",
    href: "/recipes",
    icon: ChefHat,
    resource: "recipes",
    action: "read",
  },
  {
    name: "nav.trainers",
    href: "/trainers",
    icon: UserCheck,
    resource: "trainers",
    action: "read",
  },
  {
    name: "nav.primeTrainer",
    href: "/prime-subscribers",
    icon: Crown,
    resource: "trainers", // Using existing trainer resource for now
    action: "read",
  },
  {
    name: "nav.programs",
    href: "/programs",
    icon: GraduationCap,
    resource: "programs",
    action: "read",
  },
  {
    name: "nav.workouts",
    href: "/workouts",
    icon: Dumbbell,
    resource: "workouts",
    action: "read",
  },
  {
    name: "nav.users",
    href: "/users",
    icon: Users,
    resource: "users",
    action: "read",
  },
  {
    name: "nav.settings",
    href: "/settings",
    icon: Settings,
    resource: "settings",
    action: "manage",
  },
];

export default function Sidebar({ isCollapsed, onToggle }: SidebarProps) {
  const location = useLocation();
  const { t, ready: translationReady } = useTranslation();
  const { user, loading: authLoading } = useAuth();

  // Show loading state if translations or auth are not ready
  if (!translationReady || authLoading) {
    return (
      <div
        className={`
        ${isCollapsed ? "w-16" : "w-64"} 
        bg-white dark:bg-gray-900 
        border-r border-gray-200 dark:border-gray-700 
        transition-all duration-300 ease-in-out 
        flex flex-col 
        shadow-soft
        relative
      `}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <img
                src="https://miranapp.com/images/Icon-light.jpg"
                alt="Miran"
                className="w-8 h-8 rounded-lg shadow-sm object-cover"
              />
            </div>
            {!isCollapsed && (
              <div className="flex flex-col">
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                  Miran
                </h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Admin Dashboard
                </p>
              </div>
            )}
          </div>
          <button
            onClick={onToggle}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            {isCollapsed ? (
              <ChevronRight className="w-4 h-4 text-gray-500" />
            ) : (
              <ChevronLeft className="w-4 h-4 text-gray-500" />
            )}
          </button>
        </div>

        {/* Loading Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navigation.map((item) => (
            <div
              key={item.name}
              className="group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg bg-gray-100 dark:bg-gray-800 animate-pulse"
            >
              <div className="flex-shrink-0 w-5 h-5 bg-gray-300 dark:bg-gray-600 rounded"></div>
              {!isCollapsed && (
                <div className="ml-3 h-4 bg-gray-300 dark:bg-gray-600 rounded flex-1"></div>
              )}
            </div>
          ))}
        </nav>
      </div>
    );
  }

  return (
    <div
      className={`
      ${isCollapsed ? "w-16" : "w-64"} 
      bg-white dark:bg-gray-900 
      border-r border-gray-200 dark:border-gray-700 
      transition-all duration-300 ease-in-out 
      flex flex-col 
      shadow-soft
      relative
    `}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-3">
          {/* Official Miran Logo */}
          <div className="flex-shrink-0">
            <img
              src="https://miranapp.com/images/Icon-light.jpg"
              alt="Miran"
              className="w-8 h-8 rounded-lg shadow-sm object-cover"
              onError={(e) => {
                // Fallback if logo fails to load
                const target = e.target as HTMLImageElement;
                target.style.display = "none";
                const fallback = target.nextElementSibling as HTMLElement;
                if (fallback) {
                  fallback.classList.remove("hidden");
                }
              }}
            />
            <div className="hidden w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-sm">
              <span className="text-white font-bold text-sm">M</span>
            </div>
          </div>
          {!isCollapsed && (
            <div className="flex flex-col">
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                Miran
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Admin Dashboard
              </p>
            </div>
          )}
        </div>

        {/* Collapse Toggle */}
        <button
          onClick={onToggle}
          className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4 text-gray-500" />
          ) : (
            <ChevronLeft className="w-4 h-4 text-gray-500" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href;

          // Render navigation item with proper fallback
          const NavigationItem = () => (
            <Link
              to={item.href}
              className={`
                group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 relative
                ${
                  isActive
                    ? "bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 border-r-2 border-primary-500"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white"
                }
              `}
              title={
                isCollapsed
                  ? t(item.name, item.name.split(".")[1] || item.name)
                  : undefined
              }
            >
              <item.icon
                className={`
                  flex-shrink-0 w-5 h-5 transition-colors
                  ${
                    isActive
                      ? "text-primary-600 dark:text-primary-400"
                      : "text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300"
                  }
                `}
              />
              {!isCollapsed && (
                <span className="ml-3 truncate flex-1 min-w-0">
                  {t(item.name, item.name.split(".")[1] || item.name)}
                </span>
              )}
              {isActive && !isCollapsed && (
                <div className="ml-auto flex-shrink-0 w-2 h-2 bg-primary-500 rounded-full"></div>
              )}

              {/* Tooltip for collapsed mode */}
              {isCollapsed && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50 pointer-events-none">
                  {t(item.name, item.name.split(".")[1] || item.name)}
                  <div className="absolute right-full top-1/2 transform -translate-y-1/2 border-4 border-transparent border-r-gray-900"></div>
                </div>
              )}
            </Link>
          );

          // Always show certain items or use role-based access control
          if (item.alwaysShow || !user) {
            return <NavigationItem key={item.name} />;
          }

          return (
            <WithRole
              key={item.name}
              permission={item.permission}
              resource={item.resource}
              action={item.action}
              fallback={null}
            >
              <NavigationItem />
            </WithRole>
          );
        })}
      </nav>

      {/* Help Section */}
      <div className="p-3 border-t border-gray-200 dark:border-gray-700">
        <Link
          to="/help"
          className="group flex items-center px-3 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white transition-all duration-200"
        >
          <HelpCircle className="flex-shrink-0 w-5 h-5 text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300" />
          {!isCollapsed && (
            <span className="ml-3">{t("nav.help", "Help & Support")}</span>
          )}
        </Link>

        {!isCollapsed && (
          <div className="mt-4 p-3 bg-gradient-to-r from-primary-50 to-secondary-50 dark:from-primary-900/20 dark:to-secondary-900/20 rounded-lg border border-primary-100 dark:border-primary-800">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-accent-500 rounded-full animate-pulse"></div>
              <p className="text-xs font-medium text-gray-900 dark:text-white">
                {t("common.systemStatus", "System Status")}
              </p>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              {t("common.systemOperational", "All systems operational")}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
