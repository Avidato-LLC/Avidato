'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { getDashboardStats } from '../actions/dashboard'
import { getGenerationStats } from '../actions/ai-generation'

// Extended session type for our custom fields
interface ExtendedUser {
  name?: string | null
  email?: string | null
  image?: string | null
  dailyGenerationCount?: number
  dailyLimit?: number
}

interface ExtendedSession {
  user?: ExtendedUser
}

interface DashboardStats {
  studentCount: number
  lessonCount: number
  recentStudents: Array<{
    id: string
    name: string
    targetLanguage: string
    level: string
    createdAt: Date
  }>
}

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [currentDateTime, setCurrentDateTime] = useState('')
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null)
  const [statsLoading, setStatsLoading] = useState(true)
  const [generationStats, setGenerationStats] = useState({ used: 0, limit: 10, remaining: 10 })

  // Fetch dashboard statistics
  useEffect(() => {
    const fetchStats = async () => {
      if (session) {
        try {
          setStatsLoading(true)
          const [dashboardResponse, generationResponse] = await Promise.all([
            getDashboardStats(),
            getGenerationStats()
          ])
          
          if (dashboardResponse.success && dashboardResponse.data) {
            setDashboardStats(dashboardResponse.data)
          }
          
          setGenerationStats(generationResponse)
        } catch (error) {
          console.error('Error fetching dashboard stats:', error)
        } finally {
          setStatsLoading(false)
        }
      }
    }

    fetchStats()
  }, [session])

  // Update date and time every minute
  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date()
      const options: Intl.DateTimeFormatOptions = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      }
      setCurrentDateTime(now.toLocaleDateString('en-US', options))
    }

    updateDateTime() // Initial update
    const interval = setInterval(updateDateTime, 60000) // Update every minute

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    console.log('Dashboard - Session status:', status)
    console.log('Dashboard - Session data:', session)
    
    if (status === 'loading') return // Still loading
    if (!session) {
      console.log('No session found, redirecting to login')
      router.push('/login')
      return
    }
  }, [session, status, router])

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary mx-auto"></div>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return null // Will redirect via useEffect
  }

  const extendedSession = session as ExtendedSession

  return (
    <DashboardLayout>
      <div className="p-4 sm:p-6 lg:p-8">
        {/* Welcome Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="min-w-0 flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white truncate">
                Welcome back, {extendedSession.user?.name?.split(' ')[0] || 'there'}! 👋
              </h1>
              <p className="mt-1 sm:mt-2 text-sm sm:text-base text-gray-600 dark:text-gray-400">
                Ready to create some amazing lesson plans?
              </p>
              <p className="mt-1 text-xs sm:text-sm text-gray-500 dark:text-gray-500">
                {currentDateTime}
              </p>
            </div>
            
            {/* Quick Add Button - Hidden on mobile, shown on larger screens */}
            <Link
              href="/dashboard/students/add"
              className="hidden sm:flex items-center gap-2 bg-brand-primary text-white px-4 py-2 rounded-lg hover:bg-brand-accent transition-colors whitespace-nowrap"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add Student
            </Link>
          </div>
          
          {/* Mobile Quick Add Button */}
          <div className="mt-4 sm:hidden">
            <Link
              href="/dashboard/students/add"
              className="flex items-center justify-center gap-2 w-full bg-brand-primary text-white px-4 py-3 rounded-lg hover:bg-brand-accent transition-colors"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add Student
            </Link>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
            <div className="flex items-center">
              <div className="p-2 sm:p-3 bg-gradient-to-br from-brand-primary to-brand-accent rounded-xl shadow-lg">
                <svg className="h-6 w-6 sm:h-8 sm:w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
              <div className="ml-3 sm:ml-4 min-w-0 flex-1">
                <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white truncate">
                  {statsLoading ? (
                    <span className="animate-pulse bg-gray-200 dark:bg-gray-700 rounded w-6 sm:w-8 h-6 sm:h-8 block"></span>
                  ) : (
                    dashboardStats?.studentCount || 0
                  )}
                </p>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Students</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
            <div className="flex items-center">
              <div className="p-2 sm:p-3 bg-gradient-to-br from-brand-secondary to-brand-accent rounded-xl shadow-lg">
                <svg className="h-6 w-6 sm:h-8 sm:w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C20.832 18.477 19.246 18 17.5 18c-1.746 0-3.332.477-4.5 1.253z" />
                </svg>
              </div>
              <div className="ml-3 sm:ml-4 min-w-0 flex-1">
                <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white truncate">
                  {statsLoading ? (
                    <span className="animate-pulse bg-gray-200 dark:bg-gray-700 rounded w-6 sm:w-8 h-6 sm:h-8 block"></span>
                  ) : (
                    dashboardStats?.lessonCount || 0
                  )}
                </p>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Lessons</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
            <div className="flex items-center">
              <div className="p-2 sm:p-3 bg-gradient-to-br from-brand-accent to-brand-primary rounded-xl shadow-lg">
                <svg className="h-6 w-6 sm:h-8 sm:w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <div className="ml-3 sm:ml-4 min-w-0 flex-1">
                <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white truncate">
                  {statsLoading ? (
                    <span className="animate-pulse bg-gray-200 dark:bg-gray-700 rounded w-6 sm:w-8 h-6 sm:h-8 block"></span>
                  ) : (
                    generationStats.used
                  )}
                </p>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Generated Today</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
            <div className="flex items-center">
              <div className="p-2 sm:p-3 bg-gradient-to-br from-brand-dark to-brand-primary rounded-xl shadow-lg">
                <svg className="h-6 w-6 sm:h-8 sm:w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div className="ml-3 sm:ml-4 min-w-0 flex-1">
                <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white truncate">
                  {statsLoading ? (
                    <span className="animate-pulse bg-gray-200 dark:bg-gray-700 rounded w-6 sm:w-8 h-6 sm:h-8 block"></span>
                  ) : (
                    `${generationStats.remaining}/${generationStats.limit}`
                  )}
                </p>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Remaining</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
          {/* Conditional Get Started / Student Overview Card */}
          {!statsLoading && (dashboardStats?.studentCount || 0) === 0 ? (
            /* Get Started Card - shown when no students */
            <div className="bg-gradient-to-br from-brand-primary to-brand-accent rounded-xl p-6 sm:p-8 text-white">
              <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">Get Started</h2>
              <p className="text-blue-100 mb-4 sm:mb-6 text-sm sm:text-base">
                Create your first student profile to begin generating personalized lesson plans.
              </p>
              <Link 
                href="/dashboard/students/add"
                className="inline-block bg-white text-brand-primary font-semibold px-4 sm:px-6 py-2 sm:py-3 rounded-lg hover:bg-gray-50 transition-colors text-sm sm:text-base"
              >
                Add Your First Student
              </Link>
            </div>
          ) : (
            /* Students Overview Card - shown when students exist */
            <div className="bg-gradient-to-br from-brand-primary to-brand-accent rounded-xl p-6 sm:p-8 text-white">
              <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">Your Students</h2>
              <p className="text-blue-100 mb-4 sm:mb-6 text-sm sm:text-base">
                You have {dashboardStats?.studentCount || 0} student{(dashboardStats?.studentCount || 0) !== 1 ? 's' : ''} in your teaching portfolio.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link 
                  href="/dashboard/students/add"
                  className="inline-block bg-white text-brand-primary font-semibold px-4 sm:px-6 py-2 sm:py-3 rounded-lg hover:bg-gray-50 transition-colors text-center text-sm sm:text-base"
                >
                  Add Student
                </Link>
                <Link 
                  href="/dashboard/students"
                  className="inline-block bg-brand-dark/20 text-white font-semibold px-4 sm:px-6 py-2 sm:py-3 rounded-lg hover:bg-brand-dark/30 transition-colors text-center text-sm sm:text-base"
                >
                  View All
                </Link>
              </div>
            </div>
          )}

          {/* Recent Activity */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 sm:p-8">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">Recent Students</h2>
            {statsLoading ? (
              <div className="space-y-3 sm:space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse flex items-center space-x-3 sm:space-x-4">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                    <div className="flex-1 min-w-0">
                      <div className="h-3 sm:h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-1 sm:mb-2"></div>
                      <div className="h-2 sm:h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : dashboardStats?.recentStudents && dashboardStats.recentStudents.length > 0 ? (
              <div className="space-y-3 sm:space-y-4">
                {dashboardStats.recentStudents.map((student) => (
                  <div key={student.id} className="flex items-center space-x-3 sm:space-x-4 p-2 sm:p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-brand-primary to-brand-accent rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-semibold text-xs sm:text-sm">
                        {student.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 dark:text-white text-sm sm:text-base truncate">{student.name}</p>
                      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 truncate">
                        {student.targetLanguage} • {student.level}
                      </p>
                    </div>
                    <div className="text-xs text-gray-400 dark:text-gray-500 flex-shrink-0">
                      {new Date(student.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 sm:py-8">
                <svg className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
                <p className="mt-2 text-sm sm:text-base text-gray-500 dark:text-gray-400">No students yet</p>
                <p className="text-xs sm:text-sm text-gray-400 dark:text-gray-500">Your students will appear here once you add them</p>
              </div>
            )}
          </div>
        </div>

        {/* Feature Preview */}
        <div className="mt-6 sm:mt-8 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 sm:p-8">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6">What&apos;s Coming Next</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
            <div className="text-center">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-brand-primary/10 dark:bg-brand-primary/20 rounded-lg flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <svg className="h-5 w-5 sm:h-6 sm:w-6 text-brand-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2 text-sm sm:text-base">Student Management</h3>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Add and manage student profiles with learning goals and preferences.</p>
            </div>
            
            <div className="text-center">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-brand-secondary/10 dark:bg-brand-secondary/20 rounded-lg flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <svg className="h-5 w-5 sm:h-6 sm:w-6 text-brand-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2 text-sm sm:text-base">AI Lesson Generation</h3>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Generate personalized lesson plans using advanced AI technology.</p>
            </div>
            
            <div className="text-center sm:col-span-2 md:col-span-1">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-brand-accent/10 dark:bg-brand-accent/20 rounded-lg flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <svg className="h-5 w-5 sm:h-6 sm:w-6 text-brand-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2 text-sm sm:text-base">Share & Collaborate</h3>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Share lesson plans and collaborate with students and colleagues.</p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}