import { Trainer } from "../lib/api";
import { PaginatedTrainer } from "../types/trainer";
import { getApiUrl, getMediaUrl, getAuthHeaders } from "../config/api";

// Helper function to get avatar URL
export const getTrainerAvatarUrl = (avatar: string | null): string => {
  if (avatar) {
    return getMediaUrl(avatar);
  }
  // Return placeholder avatar path - you can replace this with actual placeholder
  return "/assets/placeholder_avatar.png";
};

// Mock trainer data since the backend doesn't have a trainer-list endpoint
const mockTrainerData: Trainer[] = [
  {
    id: 1,
    full_name: "Ahmed Hassan",
    avatar: null,
    rating: 9.8,
    reviews: 127,
    available: true,
    available_for_renew: true,
    chat_uid: "chat_1",
    nationality: { id: 1, name: "Saudi Arabia" },
    price: 599,
  },
  {
    id: 2,
    full_name: "Fatima Al-Zahra",
    avatar: null,
    rating: 9.6,
    reviews: 89,
    available: true,
    available_for_renew: false,
    chat_uid: "chat_2",
    nationality: { id: 2, name: "Egypt" },
    price: 549,
  },
  {
    id: 3,
    full_name: "Omar Khaled",
    avatar: null,
    rating: 9.4,
    reviews: 156,
    available: false,
    available_for_renew: true,
    chat_uid: "chat_3",
    nationality: { id: 3, name: "UAE" },
    price: 649,
  },
  {
    id: 4,
    full_name: "Layla Mahmoud",
    avatar: null,
    rating: 9.7,
    reviews: 203,
    available: true,
    available_for_renew: true,
    chat_uid: "chat_4",
    nationality: { id: 1, name: "Saudi Arabia" },
    price: 699,
  },
  {
    id: 5,
    full_name: "Youssef Ali",
    avatar: null,
    rating: 9.2,
    reviews: 78,
    available: true,
    available_for_renew: false,
    chat_uid: "chat_5",
    nationality: { id: 4, name: "Jordan" },
    price: 499,
  },
  {
    id: 6,
    full_name: "Nour El-Din",
    avatar: null,
    rating: 9.5,
    reviews: 134,
    available: false,
    available_for_renew: false,
    chat_uid: "chat_6",
    nationality: { id: 5, name: "Lebanon" },
    price: 579,
  },
  {
    id: 7,
    full_name: "Mariam Saeed",
    avatar: null,
    rating: 9.9,
    reviews: 245,
    available: true,
    available_for_renew: true,
    chat_uid: "chat_7",
    nationality: { id: 1, name: "Saudi Arabia" },
    price: 799,
  },
  {
    id: 8,
    full_name: "Karim Mostafa",
    avatar: null,
    rating: 9.3,
    reviews: 167,
    available: true,
    available_for_renew: true,
    chat_uid: "chat_8",
    nationality: { id: 2, name: "Egypt" },
    price: 629,
  },
];

// Fetch trainer list with pagination - using mock data since backend doesn't have this endpoint
export const fetchTrainerList = async (params?: {
  page_num?: number;
  page_size?: number;
}): Promise<PaginatedTrainer> => {
  const { page_num = 1, page_size = 10 } = params || {};

  console.log("🔧 fetchTrainerList called with params:", {
    page_num,
    page_size,
  });
  console.log(
    "🔧 Using mock data since backend does not have trainer-list endpoint",
  );

  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  // Calculate pagination
  const startIndex = (page_num - 1) * page_size;
  const endIndex = startIndex + page_size;
  const paginatedTrainers = mockTrainerData.slice(startIndex, endIndex);

  const result: PaginatedTrainer = {
    result: paginatedTrainers,
    count: mockTrainerData.length,
    num_pages: Math.ceil(mockTrainerData.length / page_size),
    current_page: page_num,
  };

  console.log("🔧 fetchTrainerList mock result:", result);
  return result;
};
