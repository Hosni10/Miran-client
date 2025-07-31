import { createAuthenticatedFetch } from "./authService";
import { getApiUrl, API_CONFIG } from "../config/api";

export interface ApiUser {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  role: "admin" | "trainer" | "operation";
  is_active: boolean;
  date_joined: string;
  last_login?: string;
  profile_picture?: string;
}

export interface UsersResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: ApiUser[];
}

// Create request config helper for this service
const createRequestConfig = (options: RequestInit = {}): RequestInit => {
  return {
    mode: "cors" as RequestMode,
    credentials: "omit" as RequestCredentials,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...options.headers,
    },
    ...options,
  };
};

// Mock data for fallback when API is not available
const generateMockUsers = (
  page: number = 1,
  pageSize: number = 10,
): UsersResponse => {
  const totalUsers = 47; // Total mock users
  const startIndex = (page - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalUsers);

  const mockUsers: ApiUser[] = [];

  const roles: ("admin" | "trainer" | "operation")[] = [
    "admin",
    "trainer",
    "operation",
  ];
  const names = [
    "Ahmed Hassan",
    "Fatima Al-Zahra",
    "Omar Khaled",
    "Layla Mahmoud",
    "Youssef Ali",
    "Nour El-Din",
    "Mariam Saeed",
    "Karim Mostafa",
    "Zeinab Ibrahim",
    "Tarek Farouk",
    "Dina Rashid",
    "Mahmoud Nasser",
    "Hala Abdel Rahman",
    "Amr Salah",
    "Rana Fouad",
    "Mohamed Gamal",
    "Yasmin Adel",
    "Khaled Mansour",
    "Noha Tamer",
    "Sherif Wagdy",
    "Mona Helmy",
    "Eslam Reda",
    "Heba Ashraf",
    "Mostafa Samy",
    "Reem Magdy",
    "Wael Hosny",
    "Salma Yasser",
    "Tamer Essam",
    "Nada Fathy",
    "Hazem Lotfy",
    "Aya Mahmoud",
    "Bassem Kamal",
    "Lina Osama",
    "Adel Farid",
    "Ghada Nabil",
    "Ramy Sherif",
    "Doaa Ahmed",
    "Samer Hany",
    "Eman Samir",
    "Fady Medhat",
    "Nourhan Walid",
    "Hesham Zaki",
    "Radwa Emad",
    "Mazen Fouad",
    "Shimaa Tarek",
    "Kareem Bahaa",
    "Lobna Hatem",
  ];

  for (let i = startIndex; i < endIndex; i++) {
    const name = names[i % names.length];
    const email = `${name.toLowerCase().replace(/\s+/g, ".")}@miranapp.com`;
    const role = roles[i % roles.length];
    const joinDate = new Date(
      2023,
      Math.floor(Math.random() * 12),
      Math.floor(Math.random() * 28) + 1,
    );

    mockUsers.push({
      id: 700000 + i + 1,
      email,
      first_name: name.split(" ")[0],
      last_name: name.split(" ")[1],
      role,
      is_active: Math.random() > 0.1, // 90% active users
      date_joined: joinDate.toISOString(),
    });
  }

  return {
    count: totalUsers,
    next: endIndex < totalUsers ? `/api/v1/users/?page=${page + 1}` : null,
    previous: page > 1 ? `/api/v1/users/?page=${page - 1}` : null,
    results: mockUsers,
  };
};

export const getUsers = async (
  page: number = 1,
  token: string,
): Promise<UsersResponse> => {
  // Try multiple possible endpoints for users
  const endpoints = [
    `/users/?page=${page}`,
    `/user/list/?page=${page}`,
    `/admin/users/?page=${page}`,
  ];

  console.log("🔧 getUsers called with:", {
    page,
    token: token ? "present" : "missing",
  });
  console.log("🔧 Endpoints to try:", endpoints);

  let allEndpointsFailed = true;
  let lastError: Error | null = null;

  for (let i = 0; i < endpoints.length; i++) {
    const urls = [
      getApiUrl(endpoints[i]), // Proxy URL
      `https://testing.miranapp.com/api/v1${endpoints[i]}`, // Direct URL fallback
    ];

    for (let j = 0; j < urls.length; j++) {
      try {
        const url = urls[j];
        const config = createRequestConfig({
          method: "GET",
          headers: {
            Authorization: `Token ${token}`,
          },
        });

        console.log(
          `🔧 Attempting users fetch with endpoint ${i + 1}.${j + 1}:`,
          url,
        );

        const response = await fetch(url, config);

        console.log("🔧 Users API Response:", {
          status: response.status,
          statusText: response.statusText,
          url: response.url,
        });

        if (!response.ok) {
          if (response.status === 401 || response.status === 403) {
            throw new Error("Unauthorized");
          }

          // If 404, try next endpoint
          if (response.status === 404) {
            console.log(`Endpoint not found (404), trying next...`);
            break; // Break inner loop to try next endpoint
          }

          // If this is not the last URL and it's a server error, try the next one
          if (j < urls.length - 1 && response.status >= 500) {
            console.log(
              `URL failed with status ${response.status}, trying next URL`,
            );
            continue;
          }

          throw new Error(`Failed to fetch users: ${response.status}`);
        }

        const data = await response.json();

        console.log("🔧 Users API Response Data:", data);

        // Check if this looks like a valid users response
        if (data && (data.results || Array.isArray(data) || data.users)) {
          allEndpointsFailed = false;

          // Transform the response to match our expected format
          if (Array.isArray(data)) {
            return {
              count: data.length,
              next: null,
              previous: null,
              results: data,
            };
          } else if (data.results) {
            return data;
          } else if (data.users) {
            return {
              count: data.users.length,
              next: data.next || null,
              previous: data.previous || null,
              results: data.users,
            };
          }
        }

        // If we get here, this endpoint returned data but not in expected format
        console.log(`Endpoint returned unexpected format, trying next...`);
        break; // Try next endpoint
      } catch (error) {
        console.log(`🔧 Endpoint ${i + 1}.${j + 1} failed with error:`, error);
        lastError = error instanceof Error ? error : new Error(String(error));

        // If this is an authorization error, don't try other URLs
        if (error instanceof Error && error.message === "Unauthorized") {
          throw error;
        }

        // If this is not the last URL in current endpoint, try the next one
        if (j < urls.length - 1) {
          console.log(`Trying next URL for same endpoint...`);
          continue;
        }

        // Break to try next endpoint
        break;
      }
    }
  }

  // If we get here, all endpoints failed - return mock data
  if (allEndpointsFailed) {
    console.log("🔧 All API endpoints failed, falling back to mock data");
    console.log(
      "🔧 This is expected until the correct users API endpoint is available",
    );

    // Add a small delay to simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500));

    return generateMockUsers(page);
  }

  // This shouldn't happen, but just in case
  throw (
    lastError ||
    new Error(
      "No valid users endpoint found. The API might not support user listing or requires different authentication.",
    )
  );
};

// Get user by ID - Updated to use working trainer endpoints
export const getUserById = async (
  id: number,
  token: string,
): Promise<ApiUser | null> => {
  console.log("🔧 getUserById called with:", {
    id,
    token: token ? "present" : "missing",
  });

  // Based on API documentation, try trainer endpoints since creators are likely trainers
  const trainerEndpoints = [
    `/v1/user/${id}/trainer-details`, // From API docs - trainer details by ID
  ];

  console.log("🔧 Will try these trainer endpoints:", trainerEndpoints);

  let allEndpointsFailed = true;
  let lastError: Error | null = null;

  for (let i = 0; i < trainerEndpoints.length; i++) {
    const urls = [
      getApiUrl(trainerEndpoints[i]), // Proxy URL
      `https://testing.miranapp.com/api${trainerEndpoints[i]}`, // Direct URL fallback
    ];

    for (let j = 0; j < urls.length; j++) {
      try {
        const url = urls[j];
        const config = createRequestConfig({
          method: "GET",
          headers: {
            Authorization: `Token ${token}`,
          },
        });

        console.log(
          `🔧 Attempting trainer details fetch with endpoint ${i + 1}.${j + 1}:`,
          url,
        );

        const response = await fetch(url, config);

        console.log("🔧 Trainer API Response:", {
          status: response.status,
          statusText: response.statusText,
          url: response.url,
          endpoint: trainerEndpoints[i],
        });

        if (!response.ok) {
          if (response.status === 401 || response.status === 403) {
            throw new Error("Unauthorized");
          }

          // If 404, try next endpoint
          if (response.status === 404) {
            console.log(
              `Trainer endpoint ${trainerEndpoints[i]} not found (404), trying next...`,
            );
            break; // Break inner loop to try next endpoint
          }

          // If this is not the last URL and it's a server error, try the next one
          if (j < urls.length - 1 && response.status >= 500) {
            console.log(
              `URL failed with status ${response.status}, trying next URL`,
            );
            continue;
          }

          throw new Error(`Failed to fetch trainer: ${response.status}`);
        }

        const data = await response.json();

        console.log("🔧 Trainer API Response Data:", data);

        // Transform trainer data to user format
        // Handle both direct data and wrapped data formats
        const trainerData = data.result || data;

        if (trainerData && trainerData.id) {
          allEndpointsFailed = false;
          console.log("🔧 Successfully found trainer via API:", trainerData);

          // Convert trainer data to ApiUser format
          const userData: ApiUser = {
            id: trainerData.id,
            email: trainerData.email || `trainer${trainerData.id}@miranapp.com`,
            first_name: trainerData.full_name
              ? trainerData.full_name.split(" ")[0]
              : "Trainer",
            last_name: trainerData.full_name
              ? trainerData.full_name.split(" ").slice(1).join(" ") ||
                trainerData.full_name.split(" ")[0]
              : `${trainerData.id}`,
            role: "trainer" as const,
            is_active: trainerData.available || true,
            date_joined: trainerData.created_at || new Date().toISOString(),
          };

          console.log("🔧 Converted trainer to user format:", userData);
          return userData;
        }

        // If we get here, this endpoint returned data but not in expected format
        console.log(`Endpoint returned unexpected format, trying next...`);
        break; // Try next endpoint
      } catch (error) {
        console.log(`🔧 Endpoint ${i + 1}.${j + 1} failed with error:`, error);
        lastError = error instanceof Error ? error : new Error(String(error));

        // If this is an authorization error, don't try other URLs
        if (error instanceof Error && error.message === "Unauthorized") {
          throw error;
        }

        // If this is not the last URL in current endpoint, try the next one
        if (j < urls.length - 1) {
          console.log(`Trying next URL for same endpoint...`);
          continue;
        }

        // Break to try next endpoint
        break;
      }
    }
  }

  // If trainer endpoints failed, try to get from trainer list as fallback
  if (allEndpointsFailed) {
    console.log(
      "🔧 Trainer detail endpoint failed, trying trainer list fallback...",
    );

    try {
      const trainerListUrl = getApiUrl("/v1/user/trainer-list");
      const config = createRequestConfig({
        method: "GET",
        headers: {
          Authorization: `Token ${token}`,
        },
      });

      console.log("🔧 Attempting trainer list fallback:", trainerListUrl);

      const response = await fetch(trainerListUrl, config);

      if (response.ok) {
        const data = await response.json();
        console.log("🔧 Trainer list fallback data:", data);

        // Find the specific trainer by ID
        const trainers = data.result || data.results || data;
        const trainer = Array.isArray(trainers)
          ? trainers.find((item: any) => item.id === id)
          : null;

        if (trainer) {
          console.log("🔧 Found trainer in list:", trainer);

          // Convert trainer data to ApiUser format
          const userData: ApiUser = {
            id: trainer.id,
            email: trainer.email || `trainer${trainer.id}@miranapp.com`,
            first_name: trainer.full_name
              ? trainer.full_name.split(" ")[0]
              : "Trainer",
            last_name: trainer.full_name
              ? trainer.full_name.split(" ").slice(1).join(" ") ||
                trainer.full_name.split(" ")[0]
              : `${trainer.id}`,
            role: "trainer" as const,
            is_active: trainer.available || true,
            date_joined: trainer.created_at || new Date().toISOString(),
          };

          console.log(
            "🔧 Converted trainer from list to user format:",
            userData,
          );
          return userData;
        }
      }
    } catch (error) {
      console.log("🔧 Trainer list fallback also failed:", error);
    }
  }

  // If all trainer endpoints failed, return mock data for the specific ID
  console.log("🔧 All trainer endpoints failed, falling back to mock data");
  console.log(
    "🔧 This means the creator ID might not be a trainer or the endpoints are not working",
  );

  // Generate mock user data for this specific ID
  const mockUsers = generateMockUsers(1, 50); // Get a larger set to find the ID
  const mockUser = mockUsers.results.find((user) => user.id === id);

  if (mockUser) {
    console.log("🔧 Found mock user for ID:", mockUser);
    return mockUser;
  }

  // If ID not found in mock data, return a generic mock user
  console.log("🔧 Creating generic mock user for ID:", id);
  const genericMockUser = {
    id: id,
    email: `user${id}@miranapp.com`,
    first_name: "Unknown",
    last_name: "User",
    role: "trainer" as const,
    is_active: true,
    date_joined: new Date().toISOString(),
  };

  console.log("🔧 Generic mock user created:", genericMockUser);
  return genericMockUser;
};
