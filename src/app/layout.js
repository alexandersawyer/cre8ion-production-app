import './globals.css'
import { ThemeProvider } from '@/components/ui/theme-provider'
import { Sidebar } from '@/components/Sidebar'

export const metadata = {
  title: 'Cre8ion Production App',
  description: 'Production management system',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <div className="flex h-screen bg-background text-foreground">
            {/* Sidebar */}
            <Sidebar />

            {/* Main Content */}
            <main className="flex-1 overflow-auto bg-background">
              {children}
            </main>
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}