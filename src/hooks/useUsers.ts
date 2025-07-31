import { useQuery } from "@tanstack/react-query";
import { getUsers, UsersResponse } from "../services/userService";
import { useAuth } from "../contexts/AuthContext";

export const useUsers = (page: number = 1) => {
  const { token } = useAuth();

  return useQuery<UsersResponse, Error>({
    queryKey: ["users", page],
    queryFn: () => {
      if (!token) {
        throw new Error("No authentication token");
      }
      return getUsers(page, token);
    },
    enabled: !!token,
    placeholderData: (previousData) => previousData,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};
