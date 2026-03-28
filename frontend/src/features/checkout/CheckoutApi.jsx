import { axiosi } from "../../config/axios";

const createApiError = (error, fallbackMessage) => {
    const nextError = new Error(
        error.response?.data?.message || error.message || fallbackMessage
    );
    nextError.status = error.response?.status;
    return nextError;
};

export const getPaymentConfig = async () => {
    try {
        const res = await axiosi.get("/payments/config");
        return res.data;
    } catch (error) {
        throw createApiError(error, "Unable to load payment configuration");
    }
};

export const createPaymentOrder = async (payload) => {
    try {
        const res = await axiosi.post("/payments/create-order", payload);
        return res.data;
    } catch (error) {
        throw createApiError(error, "Unable to create payment order");
    }
};

export const verifyPayment = async (payload) => {
    try {
        const res = await axiosi.post("/payments/verify", payload);
        return res.data;
    } catch (error) {
        throw createApiError(error, "Unable to verify payment");
    }
};
