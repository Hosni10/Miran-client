import { QueryClient } from "@tanstack/react-query";

// Create a client with standard configuration
// Error handling is done via Axios interceptors
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});
