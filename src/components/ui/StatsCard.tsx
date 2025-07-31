import React from "react";
import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string;
  change: string;
  trend: "up" | "down";
  icon: LucideIcon;
  color: "primary" | "secondary" | "accent";
}

export default function StatsCard({
  title,
  value,
  change,
  trend,
  icon: Icon,
  color,
}: StatsCardProps) {
  const colorClasses = {
    primary: {
      bg: "bg-primary-50 dark:bg-primary-900/20",
      icon: "text-primary-600 dark:text-primary-400",
      border: "border-primary-200 dark:border-primary-800",
    },
    secondary: {
      bg: "bg-secondary-50 dark:bg-secondary-900/20",
      icon: "text-secondary-600 dark:text-secondary-400",
      border: "border-secondary-200 dark:border-secondary-800",
    },
    accent: {
      bg: "bg-accent-50 dark:bg-accent-900/20",
      icon: "text-accent-600 dark:text-accent-400",
      border: "border-accent-200 dark:border-accent-800",
    },
  };

  const trendIcon = trend === "up" ? TrendingUp : TrendingDown;
  const trendColor =
    trend === "up"
      ? "text-green-600 dark:text-green-400"
      : "text-red-600 dark:text-red-400";
  const TrendIcon = trendIcon;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-soft border border-gray-200 dark:border-gray-700 hover:shadow-medium transition-all duration-200 group">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
            {title}
          </p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {value}
          </p>
          <div className="flex items-center space-x-1">
            <TrendIcon className={`w-4 h-4 ${trendColor}`} />
            <span className={`text-sm font-medium ${trendColor}`}>
              {change}
            </span>
          </div>
        </div>

        <div
          className={`
          w-12 h-12 rounded-lg flex items-center justify-center transition-all duration-200 group-hover:scale-110
          ${colorClasses[color].bg} ${colorClasses[color].border} border
        `}
        >
          <Icon className={`w-6 h-6 ${colorClasses[color].icon}`} />
        </div>
      </div>
    </div>
  );
}
