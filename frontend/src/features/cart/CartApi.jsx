import { axiosi } from '../../config/axios'

export const addToCart = async (item) => {
    try {
        const res = await axiosi.post('/cart', item)
        return res.data
    } catch (error) {
        throw error.response?.data || error
    }
}

export const fetchCartByUserId = async () => {
    try {
        const res = await axiosi.get('/cart/me')
        return res.data
    } catch (error) {
        throw error.response?.data || error
    }
}

export const updateCartItemById = async (update) => {
    try {
        const res = await axiosi.patch(`/cart/${update._id}`, update)
        return res.data
    } catch (error) {
        throw error.response?.data || error
    }
}

export const deleteCartItemById = async (id) => {
    try {
        const res = await axiosi.delete(`/cart/${id}`)
        return res.data
    } catch (error) {
        throw error.response?.data || error
    }
}

export const resetCartByUserId = async () => {
    try {
        const res = await axiosi.delete('/cart/me')
        return res.data
    } catch (error) {
        throw error.response?.data || error
    }
}
