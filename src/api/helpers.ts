export const unwrap = <T>(p: Promise<{ data: T }>) =>
  p
    .then((r) => r.data)
    .catch((error) => {
      // Log error for debugging
      console.error("🔧 API Error:", {
        message: error?.message,
        status: error?.response?.status,
        data: error?.response?.data,
      });
      throw error;
    });
