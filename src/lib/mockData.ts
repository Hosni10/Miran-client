import { PaginatedSubscribers, Subscriber } from "../api/primeTrainer";

// --- Mock Data for Prime Trainer Subscribers ---

const today = new Date();
const oneMonthAgo = new Date(new Date().setMonth(today.getMonth() - 1));
const oneMonthFromNow = new Date(new Date().setMonth(today.getMonth() + 1));
const twoMonthsFromNow = new Date(new Date().setMonth(today.getMonth() + 2));
const threeMonthsAgo = new Date(new Date().setMonth(today.getMonth() - 3));
const twoMonthsAgo = new Date(new Date().setMonth(today.getMonth() - 2));

export const mockSubscribers: Subscriber[] = [
  {
    id: 1,
    start_date: oneMonthAgo.toISOString().split("T")[0],
    end_date: oneMonthFromNow.toISOString().split("T")[0],
    is_private_coach: true,
    user: {
      id: 101,
      full_name: "Alice Johnson",
      mobile: "+1-555-0101",
      email: "alice.j@example.com",
    },
    plan_subscription: null,
  },
  {
    id: 2,
    start_date: threeMonthsAgo.toISOString().split("T")[0],
    end_date: twoMonthsAgo.toISOString().split("T")[0], // Expired
    is_private_coach: false,
    user: {
      id: 102,
      full_name: "Bob Williams",
      mobile: "+1-555-0102",
      email: "bob.w@example.com",
    },
    plan_subscription: null,
  },
  {
    id: 3,
    start_date: today.toISOString().split("T")[0],
    end_date: twoMonthsFromNow.toISOString().split("T")[0],
    is_private_coach: false,
    user: {
      id: 103,
      full_name: "Charlie Brown",
      mobile: "+1-555-0103",
      email: "charlie.b@example.com",
    },
    plan_subscription: null,
  },
  {
    id: 4,
    start_date: threeMonthsAgo.toISOString().split("T")[0],
    end_date: oneMonthAgo.toISOString().split("T")[0], // Expired
    is_private_coach: true,
    user: {
      id: 104,
      full_name: "Diana Miller",
      mobile: "+1-555-0104",
      email: "diana.m@example.com",
    },
    plan_subscription: null,
  },
  {
    id: 5,
    start_date: oneMonthAgo.toISOString().split("T")[0],
    end_date: oneMonthFromNow.toISOString().split("T")[0],
    is_private_coach: false,
    user: {
      id: 105,
      full_name: "Ethan Davis",
      mobile: null,
      email: "ethan.d@example.com",
    },
    plan_subscription: null,
  },
];

export const mockPaginatedSubscribers: PaginatedSubscribers = {
  count: mockSubscribers.length,
  next: null,
  previous: null,
  result: mockSubscribers,
};

export const dashboardStats = {
  totalUsers: 12543,
  activeUsers: 9820,
  premiumUsers: 3247,
  totalWorkouts: 1247,
  totalPrograms: 89,
  totalTrainers: 45,
  monthlyRevenue: 156780,
  avgSessionDuration: 45,
  userRetentionRate: 84.2,
  workoutCompletionRate: 78.5,
};

export const recentActivity = [
  {
    id: 1,
    user: "Sarah Johnson",
    action: 'Completed "Morning HIIT Blast"',
    time: "2 min ago",
    type: "workout",
    avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=50",
  },
  {
    id: 2,
    user: "Mike Chen",
    action: 'Started "Muscle Building Mastery" program',
    time: "5 min ago",
    type: "program",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=50",
  },
  {
    id: 3,
    user: "Emma Davis",
    action: "Logged breakfast nutrition",
    time: "12 min ago",
    type: "nutrition",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=50",
  },
  {
    id: 4,
    user: "Alex Rodriguez",
    action: "Achieved 7-day workout streak",
    time: "18 min ago",
    type: "achievement",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=50",
  },
  {
    id: 5,
    user: "Lisa Wang",
    action: "Booked session with Jessica Martinez",
    time: "25 min ago",
    type: "booking",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=50",
  },
];

export const mockWorkouts = [
  {
    id: "1",
    name: "Morning HIIT Blast",
    type: "hiit",
    duration: 25,
    difficulty: "intermediate",
    caloriesBurned: 320,
    equipment: ["dumbbells", "mat"],
    instructor: "Jessica Martinez",
    rating: 4.8,
    completions: 1247,
    description:
      "High-intensity interval training to kickstart your day with energy and burn calories efficiently.",
    muscleGroups: ["full body", "core", "legs"],
    thumbnail:
      "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300",
  },
  {
    id: "2",
    name: "Strength Builder Pro",
    type: "strength",
    duration: 45,
    difficulty: "advanced",
    caloriesBurned: 280,
    equipment: ["barbell", "dumbbells", "bench"],
    instructor: "Marcus Thompson",
    rating: 4.9,
    completions: 892,
    description:
      "Advanced strength training program focusing on compound movements for maximum muscle development.",
    muscleGroups: ["chest", "back", "shoulders", "arms"],
    thumbnail:
      "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=300",
  },
];

export const workoutCategories = [
  { name: "HIIT", count: 156, color: "bg-red-500", icon: "🔥" },
  { name: "Strength", count: 234, color: "bg-blue-500", icon: "💪" },
  { name: "Yoga", count: 189, color: "bg-purple-500", icon: "🧘" },
  { name: "Cardio", count: 298, color: "bg-green-500", icon: "❤️" },
  { name: "Pilates", count: 123, color: "bg-pink-500", icon: "🤸" },
  { name: "CrossFit", count: 87, color: "bg-orange-500", icon: "🏋️" },
];

export const mockPrograms = [
  {
    id: "1",
    name: "30-Day Transformation",
    description:
      "Complete body transformation program combining strength training, cardio, and nutrition guidance.",
    duration: 4,
    difficulty: "intermediate",
    type: "weight-loss",
    workoutsPerWeek: 5,
    enrolledUsers: 2847,
    rating: 4.8,
    instructor: "Jessica Martinez",
    price: 49.99,
    thumbnail:
      "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300",
    features: [
      "Personalized meal plans",
      "Progress tracking",
      "Community support",
      "Video workouts",
    ],
  },
  {
    id: "2",
    name: "Muscle Building Mastery",
    description:
      "Advanced 12-week program designed to maximize muscle growth and strength gains.",
    duration: 12,
    difficulty: "advanced",
    type: "muscle-gain",
    workoutsPerWeek: 4,
    enrolledUsers: 1523,
    rating: 4.9,
    instructor: "Marcus Thompson",
    price: 89.99,
    thumbnail:
      "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=300",
    features: [
      "Progressive overload system",
      "Nutrition calculator",
      "Form check videos",
      "Recovery protocols",
    ],
  },
];
export const mockTrainers: {name: string; specialties: string[]}[] = [];
