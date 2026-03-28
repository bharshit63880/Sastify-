import { axiosi } from "../../config/axios";

export const getAdminOverview = async () => {
  const res = await axiosi.get("/admin/overview");
  return res.data;
};

export const getAdminUsers = async () => {
  const res = await axiosi.get("/admin/users");
  return res.data;
};

export const updateAdminUser = async (id, payload) => {
  const res = await axiosi.patch(`/admin/users/${id}`, payload);
  return res.data;
};

export const createCategory = async (payload) => {
  const res = await axiosi.post("/categories", payload);
  return res.data;
};

export const updateCategory = async (id, payload) => {
  const res = await axiosi.patch(`/categories/${id}`, payload);
  return res.data;
};

export const createBrand = async (payload) => {
  const res = await axiosi.post("/brands", payload);
  return res.data;
};

export const createCoupon = async (payload) => {
  const res = await axiosi.post("/coupons", payload);
  return res.data;
};

export const updateCoupon = async (id, payload) => {
  const res = await axiosi.patch(`/coupons/${id}`, payload);
  return res.data;
};

export const getCoupons = async () => {
  const res = await axiosi.get("/coupons?admin=true");
  return res.data;
};
