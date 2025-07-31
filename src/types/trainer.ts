export interface Trainer {
  id: number;
  full_name: string;
  avatar: string | null;
  rating: number; // 0–10
  reviews: number;
  available: boolean;
  nationality?: { id?: number; name?: string };
  price: number; // assume SAR
  gender?: "male" | "female" | "other"; // Optional gender field
}

export interface PaginatedTrainer {
  num_pages: number;
  count: number;
  current_page: number;
  result: Trainer[];
}
