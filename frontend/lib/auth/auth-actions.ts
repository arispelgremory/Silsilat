'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import apiServerInstance from '@/lib/axios-server-v1';
import { AxiosError } from 'axios';
// import { getMemberByToken } from '@/features/profile/services/profile-service';

export async function authenticateUser(credentials: { email: string; password: string }) {
  try {
    credentials.email = credentials.email.toLowerCase();
    const response = await apiServerInstance.post('/auth/login', {
        username: credentials.email,
        password: credentials.password,
    });

    const repsonseData = response.data.data;


    if (!repsonseData?.accessToken) {
      return { success: false, error: response.data.message || 'No token received' }
    }

    const cookieStore = await cookies()
    cookieStore.set('accessToken', repsonseData.accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      path: '/',
      maxAge: 60 * 60 * 0.15 // 15 minutes
    })

    cookieStore.set('refreshToken', repsonseData.refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      path: '/',
      maxAge: 60 * 60 * 24 * 30 // 30 days
    })

    const member = (await apiServerInstance.get('/auth/user/profile')).data;
    if (!member.success) {
      return { success: false, error: member.message }
    }

    return {
      success: true,
      data: member.data,
      userType: repsonseData.roleName,
      token: repsonseData.accessToken,
      refreshToken: repsonseData.refreshToken,
    };

  } catch(error: unknown) {
    if (error instanceof AxiosError) {

      if (error.status === 401) {
        return { success: false, error: error.response?.data?.message || 'Invalid email or password. Please try again.' }
      }

      return { success: false, error: error.response?.data?.message || 'Authentication failed, Please try again later.' }
    }

    return { success: false, error: 'Authentication failed, Please try again later.' }
  }
}

export async function logoutUser() {
    const cookieStore = await cookies()
  //   const response = await memberLogout();
  //   if (!response.success) {
    //     return { success: false, error: response.message }
    //   }
    cookieStore.delete('authToken')
    cookieStore.delete('accessToken')
    cookieStore.delete('refreshToken')

    
    redirect('/en/admin/login')
}
