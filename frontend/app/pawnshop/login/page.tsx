"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from '@/components/ui/input'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { EyeIcon, EyeOffIcon, LockIcon, MailIcon, ShieldIcon, StoreIcon } from "lucide-react"
import { Logo } from "@/components/logo"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import apiInstance from '@/lib/axios-v1'
import { toast } from 'sonner'
import type { AxiosError, AxiosResponse } from 'axios'
import { useAuth } from "@/hooks/use-auth"

const loginSchema = z.object({
  username: z.string().email('Please enter a valid email address'),
  password: z.string().min(2, 'Password must be at least 2 characters'),
})

type LoginFormData = z.infer<typeof loginSchema>

export default function PawnshopLoginPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const { authenticateUser } = useAuth()

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  })

  const onSubmit = async (data: LoginFormData) => {
    sessionStorage.setItem("userType", "pawnshop");

    const response = apiInstance.post('/auth/login', data);

    toast.promise(response, {
      loading: 'Signing in...',
      success: (returnedData: AxiosResponse) => {
        const tokenData = returnedData.data.data;

        sessionStorage.setItem("accessToken", tokenData.accessToken);
        sessionStorage.setItem("refreshToken", tokenData.refreshToken);
        sessionStorage.setItem("expiredAt", tokenData.expiredAt);

        setTimeout(() => {
          router.push('/pawnshop/dashboard')
        }, 2000)

        return `Login Successful!`
      },
      error: (error: AxiosError) => {
        console.log("error", error);

        if (error.status === 401) {
          form.setError('password', {
            type: 'manual',
            message: 'Invalid email or password. Please try again.',
          })

          return 'Invalid email or password. Please try again.'
        }

        return 'Error signing in. Please try again later.'
      }
    });
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 bg-gradient-to-br from-emerald-50 to-gold-50 flex items-center justify-center p-4">
        <div className="w-full max-w-lg">
        <div className="flex flex-col items-center space-y-2 text-center mb-8">
          <div className="mx-auto mb-4">
            <Logo />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-emerald-800">Pawnshop Portal</h1>
          <p className="text-sm text-muted-foreground">Sign in to your pawnshop account</p>
        </div>

        <Card className="shadow-2xl border-emerald-200">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <CardHeader className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-t-lg">
                <CardTitle className="flex items-center gap-2">
                  <StoreIcon className="h-5 w-5" />
                  Pawnshop Login
                </CardTitle>
                <CardDescription className="text-emerald-100">Enter your credentials to access your pawnshop dashboard</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 p-6">
                  <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email address</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <MailIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                              autoComplete="email"
                              className="pl-10"
                              placeholder="name@example.com"
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex justify-between">
                          Password
                          <Link
                            href="/forgot-password"
                            className="text-xs text-muted-foreground underline-offset-4 hover:underline"
                          >
                            Forgot password?
                          </Link>
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <LockIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                              type={showPassword ? "text" : "password"}
                              autoComplete="current-password"
                              placeholder="Enter your password"
                              className="pl-10"
                              {...field}
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-3 h-4 w-4 text-muted-foreground"
                            >
                              {showPassword ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                            </Button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
                <CardFooter className="flex flex-col space-y-4 p-6">
                  <Button 
                    disabled={form.formState.isSubmitting} 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white"
                  >
                    {form.formState.isSubmitting ? (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Signing in...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <StoreIcon className="h-4 w-4" />
                        Sign in to Pawnshop
                      </div>
                    )}
                  </Button>

                  <div className="flex items-center gap-2 w-full">
                    <hr className="flex-1 border-t border-emerald-200" />
                    <span className="text-xs text-muted-foreground">OR</span>
                    <hr className="flex-1 border-t border-emerald-200" />
                  </div>

                  <Button type="button" variant="outline" className="w-full border-emerald-200 text-emerald-700 hover:bg-emerald-50" onClick={() => router.push("/admin/login")}>
                    <ShieldIcon className="mr-2 h-4 w-4" />
                    Admin Login
                  </Button>

                  <p className="text-center text-sm text-muted-foreground">
                    Don&apos;t have an account?{" "}
                    <Link href="/register" className="text-emerald-600 underline-offset-4 hover:underline font-medium">
                      Register
                    </Link>
                  </p>
                </CardFooter>
              </form>
            </Form>
          </Card>

          <div className="text-center mt-6">
            <p className="text-xs text-muted-foreground">
              🔒 Secure pawnshop access with encrypted authentication
            </p>
            <div className="mt-2 space-x-2">
              <Link href="/login" className="text-xs text-emerald-600 underline-offset-4 hover:underline">
                Customer Login
              </Link>
              <span className="text-xs text-muted-foreground">|</span>
              <Link href="/" className="text-xs text-emerald-600 underline-offset-4 hover:underline">
                Return to Homepage
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}