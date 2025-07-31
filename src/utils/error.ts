/**
 * Extracts a user-friendly error message from various error types
 */
export function getErrorMessage(error: unknown): string {
  if (typeof error === "string") {
    return error;
  }

  if (error instanceof Error) {
    return error.message;
  }

  if (error && typeof error === "object") {
    // Handle Axios errors
    if ("response" in error) {
      const axiosError = error as any;
      if (axiosError.response?.data?.message) {
        return axiosError.response.data.message;
      }
      if (axiosError.response?.data?.error) {
        return axiosError.response.data.error;
      }
      if (axiosError.response?.statusText) {
        return `${axiosError.response.status}: ${axiosError.response.statusText}`;
      }
    }

    // Handle other structured errors
    if ("message" in error && typeof error.message === "string") {
      return error.message;
    }
  }

  // Fallback to generic message
  return "Unexpected error, please try again.";
}
