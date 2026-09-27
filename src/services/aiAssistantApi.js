import apiClient from "./apiClient";

export const askAIAssistant = async (query) => {
  if (!query || !query.trim()) {
    throw new Error("Please enter a question.");
  }

  const response = await apiClient.post("/ai-assistant", {
    query: query.trim(),
  });

  return response.data;
};