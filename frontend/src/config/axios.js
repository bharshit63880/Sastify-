import axios from 'axios'
import { AUTH_TOKEN_STORAGE_KEY } from '../constants'

const baseURL = (process.env.REACT_APP_BASE_URL || 'http://localhost:8000').replace(/\/+$/, '')

const getStoredAuthToken = () => {
  if (typeof window === 'undefined') {
    return ''
  }

  return window.localStorage.getItem(AUTH_TOKEN_STORAGE_KEY) || ''
}

export const axiosi = axios.create({
  withCredentials: true,
  baseURL,
})

export const publicAxios = axios.create({
  baseURL,
})

axiosi.interceptors.request.use((config) => {
  const token = getStoredAuthToken()

  if (token) {
    config.headers = config.headers || {}
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})
