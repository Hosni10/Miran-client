import React, { useState } from "react";
import {
  Search,
  Filter,
  Plus,
  Play,
  Clock,
  Flame,
  Star,
  Users,
  Dumbbell,
  Heart,
  Zap,
  Target,
  Award,
  TrendingUp,
} from "lucide-react";
import { mockWorkouts, workoutCategories } from "../lib/mockData";

export default function Workouts() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState("all");

  const filteredWorkouts = mockWorkouts.filter((workout) => {
    const matchesSearch =
      workout.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      workout.instructor.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || workout.type === selectedCategory;
    const matchesDifficulty =
      selectedDifficulty === "all" || workout.difficulty === selectedDifficulty;

    return matchesSearch && matchesCategory && matchesDifficulty;
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

  const getWorkoutTypeIcon = (type: string) => {
    switch (type) {
      case "hiit":
        return { icon: Flame, color: "text-red-500" };
      case "strength":
        return { icon: Dumbbell, color: "text-blue-500" };
      case "yoga":
        return { icon: Heart, color: "text-purple-500" };
      case "cardio":
        return { icon: Zap, color: "text-green-500" };
      case "pilates":
        return { icon: Target, color: "text-pink-500" };
      case "crossfit":
        return { icon: Award, color: "text-orange-500" };
      default:
        return { icon: Dumbbell, color: "text-gray-500" };
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
            <Dumbbell className="w-8 h-8 text-blue-500 mr-3" />
            Workouts
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Manage and monitor all workout content in your fitness app.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <button className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105">
            <Plus className="w-4 h-4 mr-2" />
            Add Workout
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
                Total Workouts
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {mockWorkouts.length}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
              <Dumbbell className="w-6 h-6 text-blue-600 dark:text-blue-400" />
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
                Avg Rating
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {(
                  mockWorkouts.reduce((acc, w) => acc + w.rating, 0) /
                  mockWorkouts.length
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
          style={{ animationDelay: "200ms" }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Total Completions
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {mockWorkouts
                  .reduce((acc, w) => acc + w.completions, 0)
                  .toLocaleString()}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-green-600 dark:text-green-400" />
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
                Avg Duration
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {Math.round(
                  mockWorkouts.reduce((acc, w) => acc + w.duration, 0) /
                    mockWorkouts.length,
                )}
                min
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-purple-600 dark:text-purple-400" />
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
              placeholder="Search workouts or instructors..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            />
          </div>

          {/* Filters */}
          <div className="flex space-x-4">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Categories</option>
              <option value="hiit">HIIT</option>
              <option value="strength">Strength</option>
              <option value="yoga">Yoga</option>
              <option value="cardio">Cardio</option>
              <option value="pilates">Pilates</option>
              <option value="crossfit">CrossFit</option>
            </select>

            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Levels</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>
        </div>
      </div>

      {/* Workouts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredWorkouts.map((workout, index) => {
          const typeInfo = getWorkoutTypeIcon(workout.type);
          const TypeIcon = typeInfo.icon;

          return (
            <div
              key={workout.id}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-soft border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-medium transition-all duration-300 transform hover:scale-105 animate-slide-up group"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Workout Image */}
              <div className="relative h-48 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800">
                <img
                  src={workout.thumbnail}
                  alt={workout.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute top-4 left-4">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getDifficultyColor(workout.difficulty)}`}
                  >
                    {workout.difficulty}
                  </span>
                </div>
                <div className="absolute top-4 right-4">
                  <div
                    className={`w-10 h-10 bg-white/90 dark:bg-gray-800/90 rounded-full flex items-center justify-center shadow-lg`}
                  >
                    <TypeIcon className={`w-5 h-5 ${typeInfo.color}`} />
                  </div>
                </div>
                <div className="absolute bottom-4 right-4">
                  <button className="w-12 h-12 bg-blue-600 hover:bg-blue-700 rounded-full flex items-center justify-center text-white shadow-lg transform hover:scale-110 transition-all duration-200">
                    <Play className="w-5 h-5 ml-0.5" />
                  </button>
                </div>
              </div>

              {/* Workout Info */}
              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {workout.name}
                  </h3>
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      {workout.rating}
                    </span>
                  </div>
                </div>

                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                  {workout.description}
                </p>

                <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      {workout.duration}min
                    </div>
                    <div className="flex items-center">
                      <Flame className="w-4 h-4 mr-1 text-orange-500" />
                      {workout.caloriesBurned} cal
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {workout.instructor}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {workout.completions.toLocaleString()} completions
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <button className="px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg text-sm font-medium hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors">
                      Edit
                    </button>
                    <button className="px-3 py-1.5 bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-lg text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                      View
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredWorkouts.length === 0 && (
        <div className="text-center py-12">
          <Dumbbell className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No workouts found
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Try adjusting your search or filter criteria.
          </p>
          <button className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200">
            <Plus className="w-4 h-4 mr-2" />
            Add New Workout
          </button>
        </div>
      )}
    </div>
  );
}
