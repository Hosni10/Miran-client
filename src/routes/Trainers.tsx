/**
 * @deprecated This component has been replaced by TrainerListScreen which uses real API data.
 * This file is kept for reference but is no longer used in the application.
 * The new component is located at src/screens/TrainerListScreen.tsx
 */
import React, { useState } from "react";
import {
  Search,
  Plus,
  Star,
  Users,
  DollarSign,
  Clock,
  Award,
  TrendingUp,
  Mail,
  Globe,
  Calendar,
  MapPin,
} from "lucide-react";
import { mockTrainers } from "../lib/mockData";

export default function Trainers() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState("all");

  const filteredTrainers = mockTrainers.filter((trainer) => {
    const matchesSearch =
      trainer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trainer.specialties.some((s) =>
        s.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    const matchesSpecialty =
      selectedSpecialty === "all" ||
      trainer.specialties.some((s) =>
        s.toLowerCase().includes(selectedSpecialty.toLowerCase()),
      );

    return matchesSearch && matchesSpecialty;
  });

  const getExperienceColor = (years: number) => {
    if (years >= 10)
      return "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400";
    if (years >= 5)
      return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400";
    return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
  };

  const getSpecialtyColor = (specialty: string) => {
    const colors = [
      "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400",
      "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400",
      "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400",
      "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400",
      "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400",
      "bg-pink-100 text-pink-800 dark:bg-pink-900/20 dark:text-pink-400",
    ];
    return colors[specialty.length % colors.length];
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
            <Award className="w-8 h-8 text-green-500 mr-3" />
            Trainers
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Manage fitness trainers and track their performance metrics.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <button className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-medium rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105">
            <Plus className="w-4 h-4 mr-2" />
            Add Trainer
          </button>
          <button className="inline-flex items-center px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 shadow-sm hover:shadow-md">
            <TrendingUp className="w-4 h-4 mr-2" />
            Performance
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-soft border border-gray-200 dark:border-gray-700 animate-slide-up">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Total Trainers
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {mockTrainers.length}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
              <Award className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

        <div
          className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-soft border border-gray-200 dark:border-gray-700 animate-slide-up"
          style={{ animationDelay: "100ms" }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Active Clients
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {mockTrainers.reduce((acc, t) => acc + t.activeClients, 0)}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        <div
          className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-soft border border-gray-200 dark:border-gray-700 animate-slide-up"
          style={{ animationDelay: "200ms" }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Avg Rating
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {(
                  mockTrainers.reduce((acc, t) => acc + t.rating, 0) /
                  mockTrainers.length
                ).toFixed(1)}
              </p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg flex items-center justify-center">
              <Star className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
            </div>
          </div>
        </div>

        <div
          className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-soft border border-gray-200 dark:border-gray-700 animate-slide-up"
          style={{ animationDelay: "300ms" }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Avg Rate
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                $
                {Math.round(
                  mockTrainers.reduce((acc, t) => acc + t.hourlyRate, 0) /
                    mockTrainers.length,
                )}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-soft border border-gray-200 dark:border-gray-700 p-6 animate-slide-up">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search trainers or specialties..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
            />
          </div>

          {/* Filters */}
          <div className="flex space-x-4">
            <select
              value={selectedSpecialty}
              onChange={(e) => setSelectedSpecialty(e.target.value)}
              className="px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="all">All Specialties</option>
              <option value="hiit">HIIT</option>
              <option value="strength">Strength Training</option>
              <option value="yoga">Yoga</option>
              <option value="pilates">Pilates</option>
              <option value="weight loss">Weight Loss</option>
              <option value="muscle building">Muscle Building</option>
            </select>
          </div>
        </div>
      </div>

      {/* Trainers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTrainers.map((trainer, index) => (
          <div
            key={trainer.id}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-soft border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-medium transition-all duration-300 transform hover:scale-105 animate-slide-up group"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            {/* Trainer Header */}
            <div className="relative p-6 bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <img
                    src={trainer.avatar}
                    alt={trainer.name}
                    className="w-16 h-16 rounded-full object-cover ring-4 ring-white dark:ring-gray-700 shadow-lg group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white dark:border-gray-700 flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                    {trainer.name}
                  </h3>
                  <div className="flex items-center space-x-2 mt-1">
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        {trainer.rating.toFixed(2)}
                      </span>
                    </div>
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getExperienceColor(trainer.experience)}`}
                    >
                      {trainer.experience}y exp
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Trainer Info */}
            <div className="p-6">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                {trainer.bio}
              </p>

              {/* Specialties */}
              <div className="mb-4">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                  Specialties
                </p>
                <div className="flex flex-wrap gap-1">
                  {trainer.specialties.slice(0, 3).map((specialty, idx) => (
                    <span
                      key={idx}
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getSpecialtyColor(specialty)}`}
                    >
                      {specialty}
                    </span>
                  ))}
                  {trainer.specialties.length > 3 && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400">
                      +{trainer.specialties.length - 3} more
                    </span>
                  )}
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="text-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <div className="flex items-center justify-center mb-1">
                    <Users className="w-4 h-4 text-blue-500 mr-1" />
                  </div>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">
                    {trainer.activeClients}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Active Clients
                  </p>
                </div>
                <div className="text-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <div className="flex items-center justify-center mb-1">
                    <DollarSign className="w-4 h-4 text-green-500 mr-1" />
                  </div>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">
                    ${trainer.hourlyRate}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Per Hour
                  </p>
                </div>
              </div>

              {/* Contact Info */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                  <Mail className="w-4 h-4 mr-2 text-gray-400" />
                  <span className="truncate">{trainer.email}</span>
                </div>
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                  <Globe className="w-4 h-4 mr-2 text-gray-400" />
                  <span>{trainer.languages.join(", ")}</span>
                </div>
              </div>

              {/* Certifications */}
              <div className="mb-4">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                  Certifications
                </p>
                <div className="flex flex-wrap gap-1">
                  {trainer.certifications.slice(0, 2).map((cert, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800"
                    >
                      {cert}
                    </span>
                  ))}
                  {trainer.certifications.length > 2 && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400">
                      +{trainer.certifications.length - 2} more
                    </span>
                  )}
                </div>
              </div>

              {/* Availability */}
              <div className="mb-4">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                  Available Days
                </p>
                <div className="flex flex-wrap gap-1">
                  {trainer.availability.map((day, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400"
                    >
                      {day.slice(0, 3)}
                    </span>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex space-x-2">
                <button className="flex-1 px-3 py-2 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-lg text-sm font-medium hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors">
                  View Profile
                </button>
                <button className="flex-1 px-3 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg text-sm font-medium hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors">
                  Schedule
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredTrainers.length === 0 && (
        <div className="text-center py-12">
          <Award className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No trainers found
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Try adjusting your search or filter criteria.
          </p>
          <button className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors duration-200">
            <Plus className="w-4 h-4 mr-2" />
            Add New Trainer
          </button>
        </div>
      )}
    </div>
  );
}
