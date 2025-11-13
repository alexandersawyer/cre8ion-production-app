'use client'

import { usePathname } from 'next/navigation'
import { AppSidebar } from '@/components/Sidebar'
import { SidebarProvider } from '@/components/ui/sidebar'

export function ConditionalLayout({ children }) {
  const pathname = usePathname()
  
  // Pages that should NOT have sidebar
  const isAuthPage = pathname.startsWith('/login') || 
                     pathname.startsWith('/signup') ||
                     pathname.startsWith('/auth/callback')
  
  const isPublicPage = pathname.startsWith('/public')
  
  const hideSidebar = isAuthPage || isPublicPage

  if (hideSidebar) {
    // No sidebar for auth and public pages
    return <>{children}</>
  }

  // Show sidebar for authenticated pages
  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="flex-1 overflow-auto bg-background w-full">
        {children}
      </main>
    </SidebarProvider>
  )
}