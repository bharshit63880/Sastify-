import { axiosi } from "../../config/axios";

export const fetchStorefrontOverview = async () => {
  try {
    const res = await axiosi.get("/storefront/overview");
    return res.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};
