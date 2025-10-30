'use client'

import { useRouter } from 'next/navigation'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarInset,
} from '@/components/ui/sidebar'
import { Wallet, Search, History, TrendingUp, Settings, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { Logo } from '../logo'

interface InvestorLayoutProps {
  children: React.ReactNode
}

export default function InvestorLayout({ children }: InvestorLayoutProps) {
  const router = useRouter()

  const navigation = [
    { name: 'Dashboard', href: '/investor/dashboard', icon: Wallet },
    { name: 'Browse NFTs', href: '/investor/browse', icon: Search },
    { name: 'My Investments', href: '/investor/portfolio', icon: History },
    // { name: 'Analytics', href: '/investor/analytics', icon: TrendingUp },
    // { name: 'Settings', href: '/investor/settings', icon: Settings },
  ]

  const handleSignOut = () => {
    sessionStorage.removeItem('token')
    sessionStorage.removeItem('userType')
    sessionStorage.removeItem('accessToken')
    sessionStorage.removeItem('refreshToken')
    sessionStorage.removeItem('expiredAt')

    toast.success('Signed out successfully');
    router.push('/investor/login')
  }

  return (
    <div className="h-full">
      <SidebarProvider>
        <Sidebar>
          <SidebarHeader>
            <div className="flex flex-col gap-2 h-16 items-center justify-center">
              <h1 className="text-xl font-bold">Investor Portal</h1>
              <Logo />
            </div>
          </SidebarHeader>

          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                  {navigation.map((item) => (
                    <SidebarMenuItem key={item.name}>
                      <SidebarMenuButton asChild>
                        <a href={item.href}>
                          <item.icon />
                          <span>{item.name}</span>
                        </a>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Button onClick={handleSignOut} variant="ghost" className="w-full justify-start">
                    <LogOut />
                    <span>Sign out</span>
                  </Button>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>

        <SidebarInset>
          <main className="flex-1 space-y-4 p-8 pt-6 h-full overflow-auto">
            {children}
          </main>
        </SidebarInset>
      </SidebarProvider>
    </div>
  )
}