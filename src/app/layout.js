import './globals.css'
import { ThemeProvider } from '@/components/ui/theme-provider'
import { ConditionalLayout } from '@/components/ConditionalLayout'

export const metadata = {
  title: 'cre8ionOS',
  description: 'Production management system',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <ConditionalLayout>
            {children}
          </ConditionalLayout>
        </ThemeProvider>
      </body>
    </html>
  )
}