import { publicAxios } from "../../config/axios";

export const fetchStorefrontOverview = async () => {
  try {
    const res = await publicAxios.get("/storefront/overview");
    return res.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const fetchStorefrontHome = async () => {
  try {
    const res = await publicAxios.get("/storefront/home");
    return res.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};
