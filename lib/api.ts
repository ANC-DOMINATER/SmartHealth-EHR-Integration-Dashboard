// API utility functions for EHR system
// This file provides reusable templates for API calls using Axios and React Query

import axios from "axios"

// Configure axios instance
export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "/api",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
})

// Request interceptor for auth tokens
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("auth_token")
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error),
)

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem("auth_token")
      window.location.href = "/login"
    }
    return Promise.reject(error)
  },
)

// Generic API functions
export const apiClient = {
  get: (url: string) => api.get(url).then((res) => res.data),
  post: (url: string, data?: any) => api.post(url, data).then((res) => res.data),
  put: (url: string, data?: any) => api.put(url, data).then((res) => res.data),
  delete: (url: string) => api.delete(url).then((res) => res.data),
}

// Types for common API responses
export interface ApiResponse {
  data: any
  message: string
  success: boolean
}

export interface PaginatedResponse {
  data: any[]
  total: number
  page: number
  limit: number
}
