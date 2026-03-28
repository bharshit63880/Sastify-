import { axiosi } from '../../config/axios'

export const createOrder = async (order) => {
    try {
        const res = await axiosi.post("/orders/cod", order)
        return res.data
    } catch (error) {
        throw error.response?.data || error
    }
}

export const getOrderByUserId = async () => {
    try {
        const res = await axiosi.get(`/orders/mine`)
        return res.data
    } catch (error) {
        throw error.response?.data || error
    }
}

export const getOrderById = async (id) => {
    try {
        const res = await axiosi.get(`/orders/${id}`)
        return res.data
    } catch (error) {
        throw error.response?.data || error
    }
}

export const getCheckoutPreview = async (params) => {
    try {
        const query = new URLSearchParams(params).toString()
        const res = await axiosi.get(`/orders/checkout/preview?${query}`)
        return res.data
    } catch (error) {
        throw error.response?.data || error
    }
}

export const cancelOrderById = async ({ id, reason }) => {
    try {
        const res = await axiosi.post(`/orders/${id}/cancel`, { reason })
        return res.data
    } catch (error) {
        throw error.response?.data || error
    }
}

export const getAllOrders = async () => {
    try {
        const res = await axiosi.get(`/orders`)
        return res.data
    } catch (error) {
        throw error.response?.data || error
    }
}

export const updateOrderById = async (update) => {
    try {
        const res = await axiosi.patch(`/orders/${update._id}`, update)
        return res.data
    } catch (error) {
        throw error.response?.data || error
    }
}
