import { publicAxios } from "../../config/axios";

export const fetchSearchSuggestions = async ({ query = "", limit = 6 } = {}) => {
  const params = new URLSearchParams();
  if (query !== undefined) params.set("q", query);
  if (limit) params.set("limit", limit);

  try {
    const res = await publicAxios.get(`/search/suggestions?${params.toString()}`);
    return res.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};
