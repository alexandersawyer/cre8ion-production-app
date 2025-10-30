import './globals.css'
import { ThemeProvider } from '@/components/ui/theme-provider'
import { AppSidebar } from '@/components/Sidebar'
import { SidebarProvider } from '@/components/ui/sidebar'

export const metadata = {
  title: 'Cre8ion Production App',
  description: 'Production management system',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <SidebarProvider>
            <AppSidebar />
            <main className="flex-1 overflow-auto bg-background w-full">
              {children}
            </main>
          </SidebarProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}