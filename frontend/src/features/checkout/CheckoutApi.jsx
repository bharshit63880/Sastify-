import { axiosi } from "../../config/axios";

export const getPaymentConfig = async () => {
    try {
        const res = await axiosi.get("/payments/config");
        return res.data;
    } catch (error) {
        throw {
            status: error.response?.status,
            message: error.response?.data?.message || error.message || "Unable to load payment configuration",
        };
    }
};

export const createPaymentOrder = async (payload) => {
    try {
        const res = await axiosi.post("/payments/create-order", payload);
        return res.data;
    } catch (error) {
        throw {
            status: error.response?.status,
            message: error.response?.data?.message || error.message || "Unable to create payment order",
        };
    }
};

export const verifyPayment = async (payload) => {
    try {
        const res = await axiosi.post("/payments/verify", payload);
        return res.data;
    } catch (error) {
        throw {
            status: error.response?.status,
            message: error.response?.data?.message || error.message || "Unable to verify payment",
        };
    }
};
