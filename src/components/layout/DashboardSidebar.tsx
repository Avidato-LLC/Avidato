'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { useState, useEffect } from 'react'
import { useTheme } from 'next-themes'
import Image from 'next/image'

/**
 * DashboardSidebar Component
 * 
 * A reusable sidebar component for the dashboard layout that provides:
 * - Navigation menu with active state indicators
 * - User profile information with logo and branding
 * - Theme toggle functionality
 * - Sign out functionality
 * - Responsive design with brand colors and proper logo display
 * 
 * Features:
 * - Highlights current page based on pathname
 * - Shows user's name and email from session
 * - Modular design for reuse across dashboard pages
 * - Maintains original beautiful design with logos and theme toggle
 * - Collapsible sidebar with proper logo handling
 */

interface SidebarNavItem {
  href: string
  label: string
  icon: React.ReactNode
  badge?: string
  comingSoon?: boolean
}

interface DashboardSidebarProps {
  sidebarCollapsed?: boolean
  setSidebarCollapsed?: (collapsed: boolean) => void
}

export default function DashboardSidebar({ 
  sidebarCollapsed = false, 
  setSidebarCollapsed 
}: DashboardSidebarProps) {
  const { data: session } = useSession()
  const pathname = usePathname()
  const { theme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Handle hydration
  useEffect(() => {
    setMounted(true)
  }, [])

  // Theme-aware logo paths - fallback to white versions during SSR
  const logoSrc = mounted && theme === 'light' ? '/logo.svg' : '/white-logo.svg'
  const nameSrc = mounted && theme === 'light' ? '/name.svg' : '/white-name.svg'

  // Navigation items configuration
  const navigationItems: SidebarNavItem[] = [
    {
      href: '/dashboard',
      label: 'Dashboard',
      icon: (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v6H8V5z" />
        </svg>
      ),
    },
    {
      href: '/dashboard/students',
      label: 'Students',
      icon: (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
        </svg>
      ),
    },
    {
      href: '/dashboard/students/add',
      label: 'Add Student',
      icon: (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
        </svg>
      )
    },
    {
      href: '#',
      label: 'YouTube ESL Generator',
      icon: (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1a3 3 0 000-6h-1m1 6V4a3 3 0 00-3-3H6a3 3 0 00-3 3v6h1m7-6h.01M15 10h1a3 3 0 010 6h-1m-1-6V4a3 3 0 013-3h1a3 3 0 013 3v6h-1" />
        </svg>
      ),
      comingSoon: true
    }
  ]

  const bottomNavigation: SidebarNavItem[] = [
    {
      href: '/dashboard/settings',
      label: 'Settings',
      icon: (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      )
    }
  ]

  /**
   * Determines if a navigation item is currently active
   * @param href - The href of the navigation item
   * @returns boolean indicating if the item is active
   */
  const isActiveRoute = (href: string): boolean => {
    if (href === '/dashboard') {
      return pathname === '/dashboard'
    }
    return pathname.startsWith(href)
  }

  /**
   * Handles user sign out with proper error handling and session clearing
   */
  const handleSignOut = async () => {
    try {
      // Clear any local storage/session storage if needed
      if (typeof window !== 'undefined') {
        window.localStorage.clear()
        window.sessionStorage.clear()
      }
      
      // Sign out with NextAuth
      await signOut({ 
        callbackUrl: '/login?logout=true',
        redirect: true 
      })
    } catch (error) {
      console.error('Error during sign out:', error)
      // Fallback: redirect to login page
      window.location.href = '/login'
    }
  }

  return (
    <div className={`
      flex flex-col bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 h-full
      ${sidebarCollapsed ? 'w-16' : 'w-64'}
    `}>
      {/* Header with Logo */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        {!sidebarCollapsed && (
          <div className="flex items-center space-x-2">
            <Image
              src={logoSrc}
              alt="Avidato Logo"
              width={32}
              height={32}
              className="flex-shrink-0"
              style={{ width: '2rem', height: '2rem' }}
            />
            <Image
              src={nameSrc}
              alt="Avidato"
              width={110}
              height={26}
              className="flex-shrink-0"
              style={{ width: 'auto', height: '1.5rem' }}
            />
          </div>
        )}
        
        {/* Desktop collapse button */}
        {setSidebarCollapsed && (
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="hidden lg:block p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
            </svg>
          </button>
        )}
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navigationItems.map((item) => {
          const isActive = isActiveRoute(item.href)
          
          if (item.comingSoon) {
            return (
              <div
                key={item.href}
                className="group flex items-center px-3 py-2 text-sm font-medium rounded-lg cursor-not-allowed opacity-60"
                title={sidebarCollapsed ? `${item.label} - Coming Soon` : undefined}
              >
                <span className={`${sidebarCollapsed ? 'mr-0' : 'mr-3'} flex-shrink-0 text-gray-500 dark:text-gray-400`}>
                  {item.icon}
                </span>
                {!sidebarCollapsed && (
                  <>
                    <span className="flex-1 text-gray-500 dark:text-gray-400">{item.label}</span>
                    <span className="ml-2 px-2 py-1 text-xs font-medium bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 rounded-full">
                      Coming Soon
                    </span>
                  </>
                )}
              </div>
            )
          }
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors
                ${isActive 
                  ? 'bg-brand-primary/10 dark:bg-brand-primary/20 text-brand-primary' 
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                }
              `}
              title={sidebarCollapsed ? item.label : undefined}
            >
              <span className={`${sidebarCollapsed ? 'mr-0' : 'mr-3'} flex-shrink-0`}>
                {item.icon}
              </span>
              {!sidebarCollapsed && (
                <>
                  <span className="flex-1">{item.label}</span>
                  {item.badge && (
                    <span className="ml-2 px-2 py-1 text-xs font-medium bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Bottom Navigation and User Section */}
      <div className="border-t border-gray-200 dark:border-gray-700 p-3 space-y-1">
        {bottomNavigation.map((item) => {
          const isActive = isActiveRoute(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors
                ${isActive 
                  ? 'bg-brand-primary/10 dark:bg-brand-primary/20 text-brand-primary' 
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                }
              `}
              title={sidebarCollapsed ? item.label : undefined}
            >
              <span className={`${sidebarCollapsed ? 'mr-0' : 'mr-3'} flex-shrink-0`}>
                {item.icon}
              </span>
              {!sidebarCollapsed && <span>{item.label}</span>}
            </Link>
          )
        })}
        
        {/* Theme Toggle Section */}
        <ThemeToggle sidebarCollapsed={sidebarCollapsed} mounted={mounted} />
        
        {/* User profile section */}
        {session?.user && (
          <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
            <div className={`flex items-center ${sidebarCollapsed ? 'justify-center' : 'space-x-3'} px-3 py-2`}>
              {session.user.image ? (
                <Image
                  className="rounded-full flex-shrink-0"
                  src={session.user.image}
                  alt={session.user.name || 'User'}
                  width={32}
                  height={32}
                  style={{ width: '2rem', height: '2rem' }}
                />
              ) : (
                <div className="h-8 w-8 bg-brand-primary rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-sm font-medium">
                    {session.user.name?.charAt(0) || session.user.email?.charAt(0) || 'U'}
                  </span>
                </div>
              )}
              {!sidebarCollapsed && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {session.user.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {session.user.email}
                  </p>
                </div>
              )}
            </div>
            {!sidebarCollapsed && (
              <button
                onClick={handleSignOut}
                className="w-full mt-2 flex items-center px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white rounded-lg transition-colors"
              >
                <svg className="mr-3 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Sign out
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

/**
 * ThemeToggle Component
 * 
 * Theme toggle button that adapts to sidebar collapsed state
 * Handles theme switching with proper loading states and icons
 */
function ThemeToggle({ sidebarCollapsed, mounted }: { sidebarCollapsed: boolean; mounted: boolean }) {
  const { theme, setTheme } = useTheme()

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light')
  }

  if (!mounted) {
    return (
      <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
        <div className={`${sidebarCollapsed ? 'flex justify-center' : 'flex justify-center'}`}>
          <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700">
            <div className="h-4 w-4" />
          </div>
        </div>
      </div>
    )
  }

  if (sidebarCollapsed) {
    // Collapsed view - show single icon
    return (
      <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
        <div className="flex justify-center">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg transition-colors text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-700 dark:hover:text-gray-200"
            title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
          >
            {theme === 'light' ? (
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            ) : (
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </button>
        </div>
      </div>
    )
  }

  // Expanded view - show button with label
  return (
    <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
      <button
        onClick={toggleTheme}
        className="w-full flex items-center justify-center px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white rounded-lg transition-colors"
      >
        {theme === 'light' ? (
          <>
            <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            Light Mode
          </>
        ) : (
          <>
            <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
            Dark Mode
          </>
        )}
      </button>
    </div>
  )
}