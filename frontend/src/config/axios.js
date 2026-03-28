import axios from 'axios'

const baseURL = (process.env.REACT_APP_BASE_URL || 'http://localhost:8000').replace(/\/+$/, '')

export const axiosi = axios.create({
  withCredentials: true,
  baseURL,
})
