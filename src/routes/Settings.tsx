import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Settings as SettingsIcon,
  Save,
  RefreshCw,
  Shield,
  Bell,
  Users,
  Database,
  Palette,
  Zap,
  BarChart3,
  Wifi,
  Server,
  CreditCard,
  Headphones,
  Dumbbell,
} from "lucide-react";

interface SettingsSection {
  id: string;
  titleKey: string;
  icon: React.ElementType;
  descriptionKey: string;
}

export default function Settings() {
  const { t } = useTranslation();

  const settingsSections: SettingsSection[] = [
    {
      id: "general",
      titleKey: "settings.sections.general.title",
      icon: SettingsIcon,
      descriptionKey: "settings.sections.general.description",
    },
    {
      id: "users",
      titleKey: "settings.sections.userManagement.title",
      icon: Users,
      descriptionKey: "settings.sections.userManagement.description",
    },
    {
      id: "notifications",
      titleKey: "settings.sections.notifications.title",
      icon: Bell,
      descriptionKey: "settings.sections.notifications.description",
    },
    {
      id: "fitness",
      titleKey: "settings.sections.fitness.title",
      icon: Dumbbell,
      descriptionKey: "settings.sections.fitness.description",
    },
    {
      id: "payments",
      titleKey: "settings.sections.payments.title",
      icon: CreditCard,
      descriptionKey: "settings.sections.payments.description",
    },
    {
      id: "integrations",
      titleKey: "settings.sections.integrations.title",
      icon: Wifi,
      descriptionKey: "settings.sections.integrations.description",
    },
    {
      id: "security",
      titleKey: "settings.sections.security.title",
      icon: Shield,
      descriptionKey: "settings.sections.security.description",
    },
    {
      id: "appearance",
      titleKey: "settings.sections.appearance.title",
      icon: Palette,
      descriptionKey: "settings.sections.appearance.description",
    },
    {
      id: "analytics",
      titleKey: "settings.sections.analytics.title",
      icon: BarChart3,
      descriptionKey: "settings.sections.analytics.description",
    },
    {
      id: "support",
      titleKey: "settings.sections.support.title",
      icon: Headphones,
      descriptionKey: "settings.sections.support.description",
    },
    {
      id: "backup",
      titleKey: "settings.sections.backup.title",
      icon: Database,
      descriptionKey: "settings.sections.backup.description",
    },
    {
      id: "advanced",
      titleKey: "settings.sections.advanced.title",
      icon: Server,
      descriptionKey: "settings.sections.advanced.description",
    },
  ];

  const [activeSection, setActiveSection] = useState("general");
  const [settings, setSettings] = useState({
    // General Settings
    appName: "Miran Fitness",
    appDescription: "Your comprehensive health and fitness platform",
    timezone: "UTC-5",
    language: "en",
    dateFormat: "MM/DD/YYYY",
    currency: "USD",

    // User Management
    allowRegistration: true,
    requireEmailVerification: true,
    defaultUserRole: "member",
    maxUsersPerTrainer: 50,
    sessionTimeout: 30,

    // Notifications
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
    workoutReminders: true,
    achievementNotifications: true,

    // Fitness Settings
    defaultWorkoutDuration: 30,
    calorieCalculationMethod: "mets",
    enableSocialFeatures: true,
    allowCustomWorkouts: true,

    // Payments
    stripeEnabled: true,
    paypalEnabled: false,
    subscriptionTrial: 7,

    // Security
    twoFactorAuth: false,
    passwordMinLength: 8,
    sessionSecurity: "standard",

    // Appearance
    theme: "system",
    primaryColor: "#3b82f6",
    logoUrl: "",

    // Analytics
    googleAnalytics: true,
    dataRetention: 365,
    anonymizeData: true,
  });

  const updateSetting = (key: string, value: unknown) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const renderGeneralSettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t("settings.appName")}
          </label>
          <input
            type="text"
            value={settings.appName}
            onChange={(e) => updateSetting("appName", e.target.value)}
            className="input-field"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t("settings.timezone")}
          </label>
          <select
            value={settings.timezone}
            onChange={(e) => updateSetting("timezone", e.target.value)}
            className="input-field"
          >
            <option value="UTC-8">Pacific Time (UTC-8)</option>
            <option value="UTC-5">Eastern Time (UTC-5)</option>
            <option value="UTC+0">UTC</option>
            <option value="UTC+1">Central European Time (UTC+1)</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t("settings.defaultLanguage")}
          </label>
          <select
            value={settings.language}
            onChange={(e) => updateSetting("language", e.target.value)}
            className="input-field"
          >
            <option value="en">English</option>
            <option value="ar">العربية</option>
            <option value="es">Spanish</option>
            <option value="fr">French</option>
            <option value="de">German</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t("settings.currency")}
          </label>
          <select
            value={settings.currency}
            onChange={(e) => updateSetting("currency", e.target.value)}
            className="input-field"
          >
            <option value="USD">USD ($)</option>
            <option value="EUR">EUR (€)</option>
            <option value="GBP">GBP (£)</option>
            <option value="CAD">CAD (C$)</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {t("settings.appDescription")}
        </label>
        <textarea
          value={settings.appDescription}
          onChange={(e) => updateSetting("appDescription", e.target.value)}
          rows={3}
          className="input-field"
        />
      </div>
    </div>
  );

  const renderUserManagement = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white">
              {t("settings.allowRegistration")}
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {t("settings.allowRegistrationDesc")}
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.allowRegistration}
              onChange={(e) =>
                updateSetting("allowRegistration", e.target.checked)
              }
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] ltr:after:left-[2px] rtl:after:right-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
          </label>
        </div>

        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white">
              {t("settings.emailVerification")}
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {t("settings.emailVerificationDesc")}
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.requireEmailVerification}
              onChange={(e) =>
                updateSetting("requireEmailVerification", e.target.checked)
              }
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] ltr:after:left-[2px] rtl:after:right-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
          </label>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t("settings.defaultUserRole")}
          </label>
          <select
            value={settings.defaultUserRole}
            onChange={(e) => updateSetting("defaultUserRole", e.target.value)}
            className="input-field"
          >
            <option value="member">{t("settings.options.member")}</option>
            <option value="premium">{t("settings.options.premium")}</option>
            <option value="trainer">{t("settings.options.trainer")}</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t("settings.sessionTimeout")}
          </label>
          <input
            type="number"
            value={settings.sessionTimeout}
            onChange={(e) =>
              updateSetting("sessionTimeout", parseInt(e.target.value))
            }
            className="input-field"
            min="5"
            max="480"
          />
        </div>
      </div>
    </div>
  );

  const renderFitnessSettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t("settings.defaultWorkoutDuration")}
          </label>
          <input
            type="number"
            value={settings.defaultWorkoutDuration}
            onChange={(e) =>
              updateSetting("defaultWorkoutDuration", parseInt(e.target.value))
            }
            className="input-field"
            min="5"
            max="180"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t("settings.calorieCalculationMethod")}
          </label>
          <select
            value={settings.calorieCalculationMethod}
            onChange={(e) =>
              updateSetting("calorieCalculationMethod", e.target.value)
            }
            className="input-field"
          >
            <option value="mets">{t("settings.options.mets")}</option>
            <option value="heartrate">{t("settings.options.heartrate")}</option>
            <option value="custom">{t("settings.options.custom")}</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white">
              {t("settings.socialFeatures")}
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {t("settings.socialFeaturesDesc")}
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.enableSocialFeatures}
              onChange={(e) =>
                updateSetting("enableSocialFeatures", e.target.checked)
              }
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] ltr:after:left-[2px] rtl:after:right-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
          </label>
        </div>

        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white">
              {t("settings.customWorkouts")}
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {t("settings.customWorkoutsDesc")}
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.allowCustomWorkouts}
              onChange={(e) =>
                updateSetting("allowCustomWorkouts", e.target.checked)
              }
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] ltr:after:left-[2px] rtl:after:right-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
          </label>
        </div>
      </div>
    </div>
  );

  const renderPaymentSettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white">
              {t("settings.stripeEnabled")}
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {t("settings.stripeEnabledDesc")}
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.stripeEnabled}
              onChange={(e) => updateSetting("stripeEnabled", e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] ltr:after:left-[2px] rtl:after:right-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
          </label>
        </div>

        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white">
              {t("settings.paypalEnabled")}
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {t("settings.paypalEnabledDesc")}
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.paypalEnabled}
              onChange={(e) => updateSetting("paypalEnabled", e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] ltr:after:left-[2px] rtl:after:right-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
          </label>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t("settings.subscriptionTrial")}
          </label>
          <input
            type="number"
            value={settings.subscriptionTrial}
            onChange={(e) =>
              updateSetting("subscriptionTrial", parseInt(e.target.value))
            }
            className="input-field"
            min="0"
            max="30"
          />
        </div>
      </div>
    </div>
  );

  const renderSecuritySettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white">
              {t("settings.twoFactorAuth")}
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {t("settings.twoFactorAuthDesc")}
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.twoFactorAuth}
              onChange={(e) => updateSetting("twoFactorAuth", e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] ltr:after:left-[2px] rtl:after:right-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
          </label>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t("settings.passwordMinLength")}
          </label>
          <input
            type="number"
            value={settings.passwordMinLength}
            onChange={(e) =>
              updateSetting("passwordMinLength", parseInt(e.target.value))
            }
            className="input-field"
            min="6"
            max="20"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t("settings.sessionSecurity")}
          </label>
          <select
            value={settings.sessionSecurity}
            onChange={(e) => updateSetting("sessionSecurity", e.target.value)}
            className="input-field"
          >
            <option value="standard">{t("settings.options.standard")}</option>
            <option value="high">{t("settings.options.high")}</option>
            <option value="maximum">{t("settings.options.maximum")}</option>
          </select>
        </div>
      </div>
    </div>
  );

  const renderAppearanceSettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t("settings.theme")}
          </label>
          <select
            value={settings.theme}
            onChange={(e) => updateSetting("theme", e.target.value)}
            className="input-field"
          >
            <option value="system">{t("settings.options.system")}</option>
            <option value="light">{t("settings.options.light")}</option>
            <option value="dark">{t("settings.options.dark")}</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t("settings.primaryColor")}
          </label>
          <input
            type="color"
            value={settings.primaryColor}
            onChange={(e) => updateSetting("primaryColor", e.target.value)}
            className="input-field h-10"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {t("settings.logoUrl")}
        </label>
        <input
          type="url"
          value={settings.logoUrl}
          onChange={(e) => updateSetting("logoUrl", e.target.value)}
          className="input-field"
          placeholder="https://example.com/logo.png"
        />
      </div>
    </div>
  );

  const renderAnalyticsSettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white">
              {t("settings.googleAnalytics")}
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {t("settings.googleAnalyticsDesc")}
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.googleAnalytics}
              onChange={(e) =>
                updateSetting("googleAnalytics", e.target.checked)
              }
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] ltr:after:left-[2px] rtl:after:right-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
          </label>
        </div>

        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white">
              {t("settings.anonymizeData")}
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {t("settings.anonymizeDataDesc")}
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.anonymizeData}
              onChange={(e) => updateSetting("anonymizeData", e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] ltr:after:left-[2px] rtl:after:right-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
          </label>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t("settings.dataRetention")}
          </label>
          <input
            type="number"
            value={settings.dataRetention}
            onChange={(e) =>
              updateSetting("dataRetention", parseInt(e.target.value))
            }
            className="input-field"
            min="30"
            max="2555"
          />
        </div>
      </div>
    </div>
  );

  const renderSectionContent = () => {
    switch (activeSection) {
      case "general":
        return renderGeneralSettings();
      case "users":
        return renderUserManagement();
      case "fitness":
        return renderFitnessSettings();
      case "payments":
        return renderPaymentSettings();
      case "security":
        return renderSecuritySettings();
      case "appearance":
        return renderAppearanceSettings();
      case "analytics":
        return renderAnalyticsSettings();
      default:
        return (
          <div className="text-center py-12">
            <SettingsIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              {t("common.select")}{" "}
              {t("settings.sections." + activeSection + ".title")}
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {t("settings.sections." + activeSection + ".description")}
            </p>
          </div>
        );
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
            <SettingsIcon className="w-8 h-8 text-primary-500 ltr:mr-3 rtl:ml-3" />
            {t("settings.title")}
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            {t("settings.subtitle")}
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex ltr:space-x-3 rtl:space-x-reverse">
          <button className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-medium rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105">
            <Save className="w-4 h-4 ltr:mr-2 rtl:ml-2" />
            {t("settings.saveChanges")}
          </button>
          <button className="inline-flex items-center px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 shadow-sm hover:shadow-md">
            <RefreshCw className="w-4 h-4 ltr:mr-2 rtl:ml-2" />
            {t("settings.resetSettings")}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Settings Navigation */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-soft border border-gray-200 dark:border-gray-700 p-4">
            <nav className="space-y-2">
              {settingsSections.map((section) => {
                const Icon = section.icon;
                const isActive = activeSection === section.id;

                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full flex items-center ltr:space-x-3 rtl:space-x-reverse px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                      isActive
                        ? "bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 border-r-2 ltr:border-r-primary-500 rtl:border-l-2 rtl:border-l-primary-500"
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white"
                    }`}
                  >
                    <Icon
                      className={`flex-shrink-0 w-5 h-5 transition-colors ${
                        isActive
                          ? "text-primary-600 dark:text-primary-400"
                          : "text-gray-500 dark:text-gray-400"
                      }`}
                    />
                    <span className="truncate">{t(section.titleKey)}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Settings Content */}
        <div className="lg:col-span-3">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-soft border border-gray-200 dark:border-gray-700 p-6">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {t("settings.sections." + activeSection + ".title")}
              </h2>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                {t("settings.sections." + activeSection + ".description")}
              </p>
            </div>

            {renderSectionContent()}
          </div>
        </div>
      </div>
    </div>
  );
}
