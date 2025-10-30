"use client";

import axios, { AxiosError } from 'axios'

if (!process.env.NEXT_PUBLIC_API_URL) {
  throw new Error('NEXT_PUBLIC_API_URL is not set');
}

console.log("ℹ️ Running API URL on: ", process.env.NEXT_PUBLIC_API_URL );

const apiInstance = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_API_URL}/v1`,
  timeout: 300000,
}
);

// Request interceptor
apiInstance.interceptors.request.use(
  async (config) => {
    // Check if we're on the client side
    if (typeof window !== 'undefined') {
      const authState = JSON.parse(localStorage.getItem('authState') || '{}');
      const token = authState?.token;
      // console.log("ℹ️ Token: ", token);
      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
        console.log("ℹ️ Token found: ", token);
      }
    }
    return config;
  },
  (error: AxiosError) => {
    console.error('Request Error:', error); // Debug log
    return Promise.reject(error);
  }
);

// Response interceptor
apiInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
// api.interceptors.response.use(
//   (response) => response,
//   async (error) => {
//     const originalRequest = error.config;

//     // If the error is due to an invalid token (401) and we haven't already tried to refresh
//     if (error.response.status === 401 && !originalRequest._retry) {
//       originalRequest._retry = true;

//       try {
//         const refreshToken = (await cookies()).get('refreshToken')?.value;
//         const response = await axios.post('/api/auth/refresh', { refreshToken });
//         const { accessToken } = response.data;

//         (await cookies()).set('accessToken', accessToken);

//         // Retry the original request with the new token
//         originalRequest.headers['Authorization'] = `Bearer ${accessToken}`;
//         return api(originalRequest);
//       } catch (refreshError) {
//         // If refresh fails, log out the user
//         (await cookies()).delete('accessToken');
//         (await cookies()).delete('refreshToken');
//         // Redirect to login page or update your auth state
//         window.location.href = '/login';
//         return Promise.reject(refreshError);
//       }
//     }

//     return Promise.reject(error);
//   }
// );

export default apiInstance;