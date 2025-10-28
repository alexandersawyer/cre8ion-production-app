import './globals.css'
import Link from 'next/link'

export const metadata = {
  title: 'Cre8ion Production App',
  description: 'Production management system',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <div className="flex h-screen bg-cre8ion-dark-bg">
          {/* Sidebar */}
          <aside className="w-64 bg-gray-900 text-white flex flex-col">
            {/* Logo/Header */}
            <div className="p-6 border-b border-cre8ion-dark-blue">
              <h1 className="text-xl font-bold">cre8ion</h1>
              <p className="text-sm text-gray-400">Production App</p>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-2">
              <Link 
                href="/"
                className="block px-4 py-2 rounded hover:bg-gray-800 transition-colors"
              >
                🏠 Home
              </Link>
              
              <Link 
                href="/shows"
                className="block px-4 py-2 rounded hover:bg-gray-800 transition-colors"
              >
                📋 Shows
              </Link>

              {/* We'll make this dynamic later */}
              <div className="ml-4 space-y-1 mt-2">
                <Link 
                  href="/shows/1"
                  className="block px-4 py-2 text-sm text-gray-300 rounded hover:bg-gray-800 transition-colors"
                >
                  → FutureForward Summit
                </Link>
                <Link 
                  href="/shows/1/schedule"
                  className="block px-4 py-2 text-xs text-gray-400 rounded hover:bg-gray-800 transition-colors ml-4"
                >
                  • Production Schedule
                </Link>
              </div>
            </nav>

            {/* Footer */}
            <div className="p-4 border-t border-gray-700 text-xs text-gray-400">
              <p>© 2025 Cre8ion</p>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 overflow-auto">
            {children}
          </main>
        </div>
      </body>
    </html>
  )
}