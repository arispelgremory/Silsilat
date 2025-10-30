'use client'

import apiInstance from "@/lib/axios-v1";

export const renewToken = async (token: string) => {
    try {
        console.log("renew token called with token:", token)
        const response = await apiInstance.post(`/auth/refresh-token`, {
            refreshToken: token
        });

        return response.data;
    } catch (error) {
        console.log("Error refreshing token", error);
        return null;
    }
}