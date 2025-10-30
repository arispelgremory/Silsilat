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
import { TrendingUp, Settings, LogOut, FileText, Building2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { Logo } from '../logo'

interface InvestorLayoutProps {
  children: React.ReactNode
}

export default function InvestorLayout({ children }: InvestorLayoutProps) {
  const router = useRouter()

  const navigation = [
    { name: 'Dashboard', href: '/pawnshop/dashboard', icon: Building2 },
    { name: 'My NFTs', href: '/pawnshop/nfts', icon: FileText },
    // { name: 'Analytics', href: '/pawnshop/analytics', icon: TrendingUp },
    // { name: 'Settings', href: '/pawnshop/settings', icon: Settings },
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
              <Logo />
              <h1 className="text-lg font-bold">Investor Portal</h1>
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