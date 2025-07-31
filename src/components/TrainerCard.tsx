import React, { useState } from "react";
import {
  Star,
  ChevronDown,
  ChevronUp,
  MapPin,
  Award,
  DollarSign,
  User,
} from "lucide-react";
import { Trainer } from "../types/trainer";
import { buildImageUrl } from "../utils/imageUrl";

interface TrainerCardProps {
  trainer: Trainer;
  onCardClick?: (trainerId: number) => void;
}

const TrainerCard: React.FC<TrainerCardProps> = React.memo(
  ({ trainer, onCardClick }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    // Format rating to one decimal place
    const formattedRating = (Math.round(trainer.rating * 10) / 10).toFixed(1);

    const handleExpandClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      setIsExpanded(!isExpanded);
    };

    const handleCardClick = () => {
      if (onCardClick) {
        onCardClick(trainer.id);
      }
    };

    // Gender icon helper
    const getGenderIcon = (gender?: string) => {
      switch (gender) {
        case "male":
          return "👨";
        case "female":
          return "👩";
        default:
          return "👤";
      }
    };

    const getGenderColor = (gender?: string) => {
      switch (gender) {
        case "male":
          return "text-blue-600";
        case "female":
          return "text-pink-600";
        default:
          return "text-gray-600";
      }
    };

    return (
      <div className="group relative bg-white dark:bg-gray-800 rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 border border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-600 overflow-hidden">
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/20 via-transparent to-purple-50/20 dark:from-indigo-900/20 dark:to-purple-900/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Main card content */}
        <div className="relative p-4">
          {/* Centered Avatar Section */}
          <div className="flex flex-col items-center mb-4">
            {/* Avatar with status indicator */}
            <div className="relative mb-3">
              <img
                src={buildImageUrl(trainer.avatar)}
                alt={trainer.full_name}
                className="w-20 h-20 rounded-xl object-cover bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 ring-2 ring-white dark:ring-gray-600 shadow-md group-hover:ring-indigo-200 dark:group-hover:ring-indigo-700 transition-all duration-300"
                loading="lazy"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = "/assets/placeholder_avatar.svg";
                }}
                onLoad={() => {
                  if (process.env.NODE_ENV !== "production") {
                    console.debug(
                      "[TrainerCard] img →",
                      buildImageUrl(trainer.avatar),
                    );
                  }
                }}
              />
              {/* Availability indicator */}
              <div
                className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white dark:border-gray-800 flex items-center justify-center text-xs ${
                  trainer.available ? "bg-green-500" : "bg-red-500"
                }`}
              >
                {trainer.available ? "✓" : "✕"}
              </div>
            </div>

            {/* Name and Title */}
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white text-center mb-2 group-hover:text-indigo-700 dark:group-hover:text-indigo-400 transition-colors">
              {trainer.full_name}
            </h3>

            {/* Rating Section */}
            <div className="flex items-center justify-center space-x-1 mb-3">
              <div className="flex items-center space-x-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-3.5 h-3.5 ${
                      i < Math.floor(trainer.rating / 2)
                        ? "text-amber-400 fill-current"
                        : "text-gray-300 dark:text-gray-600"
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm font-semibold text-gray-900 dark:text-white">
                {formattedRating}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                ({trainer.reviews})
              </span>
            </div>

            {/* Location and Gender Row */}
            <div className="flex items-center justify-center space-x-2 mb-3">
              {/* Location */}
              <div className="flex items-center space-x-1 text-xs text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 px-2 py-1 rounded-full">
                <MapPin className="w-3 h-3" />
                <span className="font-medium">
                  {trainer.nationality?.name ?? "Unknown"}
                </span>
              </div>

              {/* Gender */}
              {trainer.gender && (
                <div
                  className={`flex items-center space-x-1 text-xs bg-gray-50 dark:bg-gray-700 px-2 py-1 rounded-full ${getGenderColor(trainer.gender)}`}
                >
                  <span className="text-sm leading-none select-none">
                    {getGenderIcon(trainer.gender)}
                  </span>
                  <span className="font-medium capitalize">
                    {trainer.gender}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Price - Centered */}
          <div className="text-center mb-2">
            <div className="flex items-center justify-center space-x-1">
              <DollarSign className="w-4 h-4 text-green-600 dark:text-green-400" />
              <span className="text-xl font-bold text-gray-900 dark:text-white">
                {trainer.price}
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                SAR
              </span>
            </div>
          </div>

          {/* Availability Status - Below price */}
          <div className="flex justify-center mb-4">
            <div
              className={`px-3 py-1 rounded-full text-xs font-medium border ${
                trainer.available
                  ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800"
                  : "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800"
              }`}
            >
              {trainer.available ? "🟢 Available" : "🔴 Unavailable"}
            </div>
          </div>

          {/* Action button - Only More/Less */}
          <div className="flex justify-center">
            <button
              onClick={handleExpandClick}
              className="flex items-center justify-center space-x-1 px-3 py-2 text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-all duration-200 border border-gray-200 dark:border-gray-600 hover:border-indigo-200 dark:hover:border-indigo-700 text-sm font-medium"
            >
              <span>{isExpanded ? "Less" : "More"}</span>
              {isExpanded ? (
                <ChevronUp className="w-3.5 h-3.5" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5" />
              )}
            </button>
          </div>

          {/* Expanded details */}
          {isExpanded && (
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 space-y-3 animate-in slide-in-from-top-2 duration-300">
              {/* Detailed Stats Grid */}
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900/30 dark:to-indigo-800/30 p-3 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Award className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    <div>
                      <p className="text-xs text-indigo-600 dark:text-indigo-400 uppercase tracking-wide font-semibold">
                        Trainer ID
                      </p>
                      <p className="text-sm font-bold text-indigo-900 dark:text-indigo-300">
                        #{trainer.id}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/30 dark:to-amber-800/30 p-3 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Star className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    <div>
                      <p className="text-xs text-amber-600 dark:text-amber-400 uppercase tracking-wide font-semibold">
                        Full Rating
                      </p>
                      <p className="text-sm font-bold text-amber-900 dark:text-amber-300">
                        {trainer.rating.toFixed(2)}/10
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30 p-3 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-4 h-4 text-green-600 dark:text-green-400" />
                    <div>
                      <p className="text-xs text-green-600 dark:text-green-400 uppercase tracking-wide font-semibold">
                        Location
                      </p>
                      <p className="text-xs font-bold text-green-900 dark:text-green-300">
                        {trainer.nationality?.name ?? "Unknown"}
                      </p>
                    </div>
                  </div>
                </div>

                <div
                  className={`bg-gradient-to-br p-3 rounded-lg ${
                    trainer.available
                      ? "from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30"
                      : "from-red-50 to-red-100 dark:from-red-900/30 dark:to-red-800/30"
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <div
                      className={`w-4 h-4 rounded-full ${trainer.available ? "bg-green-500" : "bg-red-500"}`}
                    />
                    <div>
                      <p
                        className={`text-xs uppercase tracking-wide font-semibold ${
                          trainer.available
                            ? "text-green-600 dark:text-green-400"
                            : "text-red-600 dark:text-red-400"
                        }`}
                      >
                        Status
                      </p>
                      <p
                        className={`text-xs font-bold ${
                          trainer.available
                            ? "text-green-900 dark:text-green-300"
                            : "text-red-900 dark:text-red-300"
                        }`}
                      >
                        {trainer.available
                          ? "Available Now"
                          : "Currently Unavailable"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Stats Summary */}
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-lg p-4">
                <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-3 text-center">
                  Quick Stats
                </h4>
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="space-y-1">
                    <p className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
                      {formattedRating}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wide font-semibold">
                      Rating
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-lg font-bold text-green-600 dark:text-green-400">
                      {trainer.reviews}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wide font-semibold">
                      Reviews
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-lg font-bold text-purple-600 dark:text-purple-400">
                      {trainer.price}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wide font-semibold">
                      SAR
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  },
);

TrainerCard.displayName = "TrainerCard";

export default TrainerCard;
