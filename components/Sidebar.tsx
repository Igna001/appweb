'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Map, LayoutDashboard, Settings, LogOut, Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

const MOBILE_BREAKPOINT = 1024
const menuItems = [
  { icon: Map, label: 'Mapa', href: '/map' },
  { icon: LayoutDashboard, label: 'Panel de Control', href: '/dashboard' },
  { icon: Settings, label: 'Configuraciones', href: '/settings' },
]

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

export default function Sidebar({ isCollapsed, onToggle }: SidebarProps) {
  const [isMobile, setIsMobile] = useState(false)
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }

    checkScreenSize()
    window.addEventListener('resize', checkScreenSize)

    return () => window.removeEventListener('resize', checkScreenSize)
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated')
    router.push('/login')
  }

  return (
    <>
      {isMobile && (
        <Button
          variant="outline"
          size="icon"
          className="fixed top-4 left-4 z-50 bg-[#1E1E1E] text-white"
          onClick={onToggle}
        >
          <Menu className="h-6 w-6" />
        </Button>
      )}
      <div 
        className={`fixed inset-y-0 left-0 z-50 ${
          isCollapsed ? 'w-16' : 'w-64'
        } transform ${
          isMobile && isCollapsed ? '-translate-x-full' : 'translate-x-0'
        } transition-all duration-300 ease-in-out bg-[#1E1E1E] text-white`}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between h-16 px-4 border-b border-gray-700">
            {!isCollapsed && <h1 className="text-lg font-semibold">Prediction Climatology</h1>}
            {isMobile && (
              <Button variant="ghost" size="icon" onClick={onToggle}>
                <X className="h-6 w-6" />
              </Button>
            )}
          </div>
          <nav className="flex-1 overflow-y-auto py-4">
            {menuItems.map((item) => (
              <Link key={item.href} href={item.href} passHref>
                <Button
                  variant="ghost"
                  className={`w-full justify-start py-6 text-white hover:bg-gray-800 ${
                    pathname === item.href ? 'bg-gray-800' : ''
                  }`}
                >
                  <item.icon className="h-6 w-6 mr-4" />
                  {!isCollapsed && <span className="text-lg">{item.label}</span>}
                </Button>
              </Link>
            ))}
          </nav>
          <div className="p-4 border-t border-gray-700">
            <div className="flex items-center mb-4 space-x-2">
              <Avatar>
                <AvatarImage src="/placeholder-avatar.jpg" alt="User" />
                <AvatarFallback>U</AvatarFallback>
              </Avatar>
              {!isCollapsed && (
                <div>
                  <p className="text-sm font-medium">usuario@gmail.com</p>
                </div>
              )}
            </div>
            <Button 
              variant="ghost" 
              className="w-full justify-start py-6 text-white hover:bg-gray-800"
              onClick={handleLogout}
            >
              <LogOut className="h-6 w-6 mr-4" />
              {!isCollapsed && <span className="text-lg">Cerrar sesión</span>}
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}