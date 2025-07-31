import { API_CONFIG, getApiUrl, getAuthHeaders } from "../config/api";

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  [key: string]: any;
}

export interface ApiResponse<T> {
  result: T;
  status: boolean;
  message: string;
}

export interface LoginResult {
  id: number;
  email: string;
  full_name: string;
  token: string;
  user_role: string;
  [key: string]: any;
}

export interface LoginResponse {
  token: string;
  user: User;
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

export const login = async (
  email: string,
  password: string,
): Promise<LoginResponse> => {
  // Try proxy first, then fallback to direct API
  const urls = [
    getApiUrl("/user/trainer-login"), // Proxy URL
    `https://testing.miranapp.com/api/user/trainer-login`, // Direct URL fallback
  ];

  for (let i = 0; i < urls.length; i++) {
    try {
      const url = urls[i];
      const config = createRequestConfig({
        method: "POST",
        body: JSON.stringify({ email, password }),
      });

      if (import.meta.env.DEV) {
        console.log(`Attempting login with URL ${i + 1}:`, url);
        console.log("Request config:", {
          method: config.method,
          headers: config.headers,
          body: config.body,
        });
      }

      const res = await fetch(url, config);

      if (import.meta.env.DEV) {
        console.log("🔧 API Response:", {
          status: res.status,
          statusText: res.statusText,
          headers: Object.fromEntries(res.headers.entries()),
        });
      }

      if (!res.ok) {
        let errorMessage = "Login failed";
        let responseBody = "";

        try {
          responseBody = await res.text();

          // Try to parse as JSON to get the API error message
          try {
            const errorData = JSON.parse(responseBody);
            errorMessage = errorData.message || errorMessage;
          } catch (e) {
            // If not JSON, use the raw text
            errorMessage = responseBody || errorMessage;
          }
        } catch (e) {
          // If we can't read the error text, use default message
        }

        if (import.meta.env.DEV) {
          console.log(`URL ${i + 1} failed with status ${res.status}:`, {
            status: res.status,
            statusText: res.statusText,
            headers: Object.fromEntries(res.headers.entries()),
            body: responseBody,
          });
        }

        // For authentication errors (401, 422), don't try fallback URLs
        // These are credential issues, not connection issues
        if (res.status === 401 || res.status === 422) {
          console.log("🔧 Authentication error detected:", {
            status: res.status,
            statusText: res.statusText,
            responseBody,
            errorMessage,
            parsedResponse: (() => {
              try {
                return JSON.parse(responseBody);
              } catch (e) {
                return "Not JSON";
              }
            })(),
          });

          if (res.status === 401) {
            throw new Error(
              "Invalid credentials: The email or password you entered is incorrect.",
            );
          } else if (res.status === 422) {
            // For 422, let's check if it's actually a credentials issue
            // Some APIs return 422 for invalid credentials instead of 401
            if (
              responseBody.toLowerCase().includes("invalid") ||
              responseBody.toLowerCase().includes("wrong") ||
              responseBody.toLowerCase().includes("incorrect") ||
              responseBody.toLowerCase().includes("credential") ||
              responseBody.toLowerCase().includes("password") ||
              responseBody.toLowerCase().includes("email")
            ) {
              throw new Error(
                "Invalid credentials: The email or password you entered is incorrect.",
              );
            } else {
              throw new Error(
                "Invalid input: Please check your email and password format.",
              );
            }
          }
        }

        // If this is not the last URL and it's a connection issue, try the next one
        if (i < urls.length - 1 && (res.status >= 500 || res.status === 0)) {
          if (import.meta.env.DEV) {
            console.log(`Trying next URL due to server error...`);
          }
          continue;
        }

        throw new Error(`${errorMessage} (Status: ${res.status})`);
      }

      const responseData: ApiResponse<LoginResult> = await res.json();

      if (import.meta.env.DEV) {
        console.log("🔧 API Response Data:", responseData);
        console.log("🔧 Extracted result:", responseData.result);
      }

      // Extract the actual login data from the result field
      if (responseData.status && responseData.result) {
        const result = responseData.result;
        return {
          token: result.token,
          user: {
            id: result.id.toString(),
            email: result.email,
            name: result.full_name,
            role: result.user_role,
          },
        };
      } else {
        console.log("🔧 API returned status: false", {
          status: responseData.status,
          message: responseData.message,
          result: responseData.result,
        });

        // Check if this is an invalid credentials error
        const message = responseData.message || "Login failed";
        if (
          message.toLowerCase().includes("invalid") ||
          message.toLowerCase().includes("wrong") ||
          message.toLowerCase().includes("incorrect") ||
          message.toLowerCase().includes("credential")
        ) {
          throw new Error(
            "Invalid credentials: The email or password you entered is incorrect.",
          );
        }

        throw new Error(message);
      }
    } catch (error) {
      // If this is an authentication error, don't try other URLs
      if (
        error instanceof Error &&
        (error.message.includes("Invalid credentials") ||
          error.message.includes("Invalid input"))
      ) {
        throw error;
      }

      // If this is not the last URL, try the next one
      if (i < urls.length - 1) {
        if (import.meta.env.DEV) {
          console.log(`URL ${i + 1} failed with error:`, error);
        }
        continue;
      }

      if (error instanceof TypeError && error.message.includes("fetch")) {
        throw new Error(
          "Network error: Unable to connect to the server. Please check your internet connection.",
        );
      }
      throw error;
    }
  }

  // If we get here, all URLs failed
  throw new Error("All connection attempts failed. Please try again later.");
};

export const requestReset = async (email: string): Promise<any> => {
  // Try proxy first, then fallback to direct API
  const urls = [
    `${getApiUrl("/user/forgot-password")}?email=${encodeURIComponent(email)}`, // Proxy URL
    `https://testing.miranapp.com/api/user/forgot-password?email=${encodeURIComponent(email)}`, // Direct URL fallback
  ];

  for (let i = 0; i < urls.length; i++) {
    try {
      const url = urls[i];
      const config = createRequestConfig({
        method: "GET",
      });

      if (import.meta.env.DEV) {
        console.log(`Attempting password reset with URL ${i + 1}:`, url);
      }

      const res = await fetch(url, config);

      if (!res.ok) {
        let errorMessage = "Password reset request failed";
        try {
          const errorText = await res.text();
          errorMessage = errorText || errorMessage;
        } catch (e) {
          // If we can't read the error text, use default message
        }

        // If this is not the last URL, try the next one
        if (i < urls.length - 1) {
          if (import.meta.env.DEV) {
            console.log(
              `URL ${i + 1} failed with status ${res.status}, trying next URL`,
            );
          }
          continue;
        }

        throw new Error(errorMessage);
      }

      const responseData: ApiResponse<any> = await res.json();

      if (import.meta.env.DEV) {
        console.log("🔧 Password Reset Response:", responseData);
      }

      if (responseData.status) {
        return responseData.result || responseData;
      } else {
        throw new Error(responseData.message || "Password reset failed");
      }
    } catch (error) {
      // If this is not the last URL, try the next one
      if (i < urls.length - 1) {
        if (import.meta.env.DEV) {
          console.log(`URL ${i + 1} failed with error:`, error);
        }
        continue;
      }

      if (error instanceof TypeError && error.message.includes("fetch")) {
        throw new Error(
          "Network error: Unable to connect to the server. Please check your internet connection.",
        );
      }
      throw error;
    }
  }

  // If we get here, all URLs failed
  throw new Error("All connection attempts failed. Please try again later.");
};

// Helper function for authenticated requests
export const createAuthenticatedFetch = (token: string) => {
  return async (url: string, options: RequestInit = {}) => {
    return fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Token ${token}`,
        "Content-Type": "application/json",
      },
    });
  };
};
