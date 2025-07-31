import React, { useState } from "react";
import {
  Search,
  Plus,
  Star,
  Users,
  Calendar,
  DollarSign,
  Target,
  Award,
  TrendingUp,
  Clock,
  Zap,
  Heart,
  Dumbbell,
} from "lucide-react";
import { mockPrograms } from "../lib/mockData";

export default function Programs() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState("all");

  const filteredPrograms = mockPrograms.filter((program) => {
    const matchesSearch =
      program.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      program.instructor.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === "all" || program.type === selectedType;
    const matchesDifficulty =
      selectedDifficulty === "all" || program.difficulty === selectedDifficulty;

    return matchesSearch && matchesType && matchesDifficulty;
  });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "beginner":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
      case "intermediate":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400";
      case "advanced":
        return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
    }
  };

  const getProgramTypeIcon = (type: string) => {
    switch (type) {
      case "weight-loss":
        return {
          icon: Target,
          color: "text-red-500",
          bg: "bg-red-100 dark:bg-red-900/20",
        };
      case "muscle-gain":
        return {
          icon: Dumbbell,
          color: "text-blue-500",
          bg: "bg-blue-100 dark:bg-blue-900/20",
        };
      case "endurance":
        return {
          icon: Zap,
          color: "text-green-500",
          bg: "bg-green-100 dark:bg-green-900/20",
        };
      case "flexibility":
        return {
          icon: Heart,
          color: "text-purple-500",
          bg: "bg-purple-100 dark:bg-purple-900/20",
        };
      case "general-fitness":
        return {
          icon: Award,
          color: "text-orange-500",
          bg: "bg-orange-100 dark:bg-orange-900/20",
        };
      default:
        return {
          icon: Target,
          color: "text-gray-500",
          bg: "bg-gray-100 dark:bg-gray-700",
        };
    }
  };

  const formatProgramType = (type: string) => {
    return type
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
            <Target className="w-8 h-8 text-purple-500 mr-3" />
            Programs
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Manage fitness programs and track enrollment metrics.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <button className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-medium rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105">
            <Plus className="w-4 h-4 mr-2" />
            Create Program
          </button>
          <button className="inline-flex items-center px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 shadow-sm hover:shadow-md">
            <TrendingUp className="w-4 h-4 mr-2" />
            Analytics
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-soft border border-gray-200 dark:border-gray-700 animate-slide-up">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Total Programs
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {mockPrograms.length}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
              <Target className="w-6 h-6 text-purple-600 dark:text-purple-400" />
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
                Total Enrolled
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {mockPrograms
                  .reduce((acc, p) => acc + p.enrolledUsers, 0)
                  .toLocaleString()}
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
                  mockPrograms.reduce((acc, p) => acc + p.rating, 0) /
                  mockPrograms.length
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
                Total Revenue
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                $
                {(
                  mockPrograms.reduce(
                    (acc, p) => acc + p.price * p.enrolledUsers,
                    0,
                  ) / 1000
                ).toFixed(0)}
                k
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-green-600 dark:text-green-400" />
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
              placeholder="Search programs or instructors..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
            />
          </div>

          {/* Filters */}
          <div className="flex space-x-4">
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="all">All Types</option>
              <option value="weight-loss">Weight Loss</option>
              <option value="muscle-gain">Muscle Gain</option>
              <option value="endurance">Endurance</option>
              <option value="flexibility">Flexibility</option>
              <option value="general-fitness">General Fitness</option>
            </select>

            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="all">All Levels</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>
        </div>
      </div>

      {/* Programs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPrograms.map((program, index) => {
          const typeInfo = getProgramTypeIcon(program.type);
          const TypeIcon = typeInfo.icon;

          return (
            <div
              key={program.id}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-soft border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-medium transition-all duration-300 transform hover:scale-105 animate-slide-up group"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Program Image */}
              <div className="relative h-48 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800">
                <img
                  src={program.thumbnail}
                  alt={program.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute top-4 left-4">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getDifficultyColor(program.difficulty)}`}
                  >
                    {program.difficulty}
                  </span>
                </div>
                <div className="absolute top-4 right-4">
                  <div
                    className={`w-10 h-10 ${typeInfo.bg} rounded-full flex items-center justify-center shadow-lg`}
                  >
                    <TypeIcon className={`w-5 h-5 ${typeInfo.color}`} />
                  </div>
                </div>
                <div className="absolute bottom-4 left-4">
                  <div className="bg-black/70 text-white px-3 py-1 rounded-full text-sm font-medium">
                    ${program.price}
                  </div>
                </div>
              </div>

              {/* Program Info */}
              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                    {program.name}
                  </h3>
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      {program.rating}
                    </span>
                  </div>
                </div>

                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                  {program.description}
                </p>

                <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      {program.duration}w
                    </div>
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      {program.workoutsPerWeek}/week
                    </div>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                    Program Type
                  </p>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${typeInfo.bg} ${typeInfo.color}`}
                  >
                    {formatProgramType(program.type)}
                  </span>
                </div>

                <div className="space-y-3 mb-4">
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {program.instructor}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {program.enrolledUsers.toLocaleString()} enrolled
                    </p>
                  </div>

                  {/* Features */}
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                      Features
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {program.features.slice(0, 2).map((feature, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
                        >
                          {feature}
                        </span>
                      ))}
                      {program.features.length > 2 && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400">
                          +{program.features.length - 2} more
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <button className="flex-1 px-3 py-2 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 rounded-lg text-sm font-medium hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors">
                    Edit
                  </button>
                  <button className="flex-1 px-3 py-2 bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-lg text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                    View Details
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredPrograms.length === 0 && (
        <div className="text-center py-12">
          <Target className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No programs found
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Try adjusting your search or filter criteria.
          </p>
          <button className="inline-flex items-center px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors duration-200">
            <Plus className="w-4 h-4 mr-2" />
            Create New Program
          </button>
        </div>
      )}
    </div>
  );
}
