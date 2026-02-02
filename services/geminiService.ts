import { ChatMessage } from "../types";

// Using relative path triggers the Vite proxy defined in vite.config.ts
const API_URL = "/api/chat";

export const generateHistoryResponse = async (
  // apiKey argument is no longer needed
  history: ChatMessage[],
  newMessage: string
): Promise<string> => {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        history: history,
        message: newMessage
      }),
    });

    if (!response.ok) {
      // Try to parse error message, fallback to status text
      let errorMessage = `Lỗi kết nối (${response.status})`;
      try {
        const errorData = await response.json();
        if (errorData.error) errorMessage = errorData.error;
      } catch (e) {
        // Ignore JSON parse error if response is not JSON
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();
    return data.text;

  } catch (error: any) {
    console.error("API Request Error:", error);
    // Provide a more user-friendly error message for connection failures
    if (error.message === 'Failed to fetch') {
      throw new Error("Không thể kết nối đến Server. Hãy chắc chắn bạn đã chạy 'npm run server' hoặc 'node server.js'.");
    }
    throw new Error(error.message || "Không thể kết nối đến máy chủ.");
  }
};