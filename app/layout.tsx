'use client'

import { useState, useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { Inter } from 'next/font/google'
import Sidebar from '@/components/Sidebar'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const checkAuth = () => {
      const auth = localStorage.getItem('isAuthenticated') === 'true'
      setIsAuthenticated(auth)

      if (!auth && !['/login', '/register'].includes(pathname)) {
        router.push('/login')
      }
    }

    checkAuth()
  }, [pathname, router])

  return isAuthenticated
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const isAuthenticated = useAuth()
  const pathname = usePathname()

  if (['/login', '/register'].includes(pathname)) {
    return (
      <html lang="es" className={inter.className}>
        <body>
          {children}
        </body>
      </html>
    )
  }

  if (isAuthenticated === null) {
    return (
      <html lang="es" className={inter.className}>
        <body>
          <div className="flex items-center justify-center h-screen">
            <p>Cargando...</p>
          </div>
        </body>
      </html>
    )
  }

  return (
    <html lang="es" className={inter.className}>
      <body className="bg-[#E6EBF5]">
        {isAuthenticated ? (
          <div className="flex h-screen bg-[#E6EBF5]">
          <Sidebar 
            isCollapsed={isSidebarCollapsed} 
            onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)} 
            />
            <main className={`flex-1 overflow-y-auto p-8 transition-all duration-300 ${
              isSidebarCollapsed ? 'ml-16' : 'ml-64'
            }`}>
              {children}
            </main>
          </div>
        ) : null}
      </body>
    </html>
  )
}