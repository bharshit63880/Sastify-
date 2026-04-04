import {axiosi} from '../../config/axios'
import { AUTH_TOKEN_STORAGE_KEY } from '../../constants'

const persistAuthToken = (payload) => {
    if (typeof window === 'undefined') {
        return payload
    }

    if (payload?.token) {
        window.localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, payload.token)
    }

    return payload
}

const clearStoredAuthToken = () => {
    if (typeof window === 'undefined') {
        return
    }

    window.localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY)
}

export const signup=async(cred)=>{
    try {
        const res=await axiosi.post("auth/signup",cred)
        return persistAuthToken(res.data)
    } catch (error) {
        throw error.response?.data || error
    }
}
export const login=async(cred)=>{
    try { 
        const res=await axiosi.post("auth/login",cred)
        return persistAuthToken(res.data)
    } catch (error) {
        throw error.response?.data || error
    }
}
export const verifyOtp=async(cred)=>{
    try {
        const res=await axiosi.post("auth/verify-otp",cred)
        return persistAuthToken(res.data)
    } catch (error) {
        throw error.response?.data || error
    }
}
export const resendOtp=async(cred)=>{
    try {
        const res=await axiosi.post("auth/resend-otp",cred)
        return res.data
    } catch (error) {
        throw error.response?.data || error
    }
}
export const forgotPassword=async(cred)=>{
    try {
        const res=await axiosi.post("auth/forgot-password",cred)
        return res.data
    } catch (error) {
        throw error.response?.data || error
    }
}
export const resetPassword=async(cred)=>{
    try {
        const res=await axiosi.post("auth/reset-password",cred)
        return res.data
    } catch (error) {
        throw error.response?.data || error
    }
}
export const checkAuth=async(cred)=>{
    try {
        if (!getStoredAuthToken()) {
            return null
        }

        const res=await axiosi.get("auth/check-auth")
        return res.data
    } catch (error) {
        clearStoredAuthToken()
        throw error.response?.data || error
    }
}
export const logout=async()=>{
    try {
        const res=await axiosi.get("auth/logout")
        clearStoredAuthToken()
        return res.data
    } catch (error) {
        clearStoredAuthToken()
        throw error.response?.data || error
    }
}
