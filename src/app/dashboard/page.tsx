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
    
    if (status === 'loading') return // Still loading
    if (!session) {
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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m9-6.13a4 4 0 11-8 0 4 4 0 018 0zm6 6a4 4 0 00-3-3.87" />
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

        {/* Upcoming Features */}
        <div className="mt-6 sm:mt-8 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 sm:p-8">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">Upcoming Features</h2>
            <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full">
              Q1 2026
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {/* YouTube ESL Generator card removed: hidden until release */}
            
            <div className="relative overflow-hidden bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg p-4 sm:p-6 border border-purple-200 dark:border-purple-800">
              <div className="flex items-start justify-between mb-3">
                <div className="p-2 bg-purple-500 rounded-lg">
                  <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <span className="text-xs font-medium text-purple-600 dark:text-purple-400 bg-purple-200 dark:bg-purple-900/40 px-2 py-1 rounded-full">
                  Analytics
                </span>
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2 text-sm sm:text-base">Progress Tracking</h3>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-3">Advanced analytics dashboard to track student progress, lesson completion rates, and learning outcomes.</p>
              <div className="flex items-center text-xs text-purple-600 dark:text-purple-400">
                <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Coming in March 2026
              </div>
            </div>
            
            <div className="relative overflow-hidden bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg p-4 sm:p-6 border border-green-200 dark:border-green-800 sm:col-span-2 lg:col-span-1">
              <div className="flex items-start justify-between mb-3">
                <div className="p-2 bg-green-500 rounded-lg">
                  <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <span className="text-xs font-medium text-green-600 dark:text-green-400 bg-green-200 dark:bg-green-900/40 px-2 py-1 rounded-full">
                  Collaboration
                </span>
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2 text-sm sm:text-base">Team Workspace</h3>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-3">Collaborate with other teachers, share lesson plans, and build a community-driven lesson library.</p>
              <div className="flex items-center text-xs text-green-600 dark:text-green-400">
                <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Coming in April 2026
              </div>
            </div>
          </div>
        </div>

        {/* Additional Feature Highlights */}
        <div className="mt-6 sm:mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6 sm:p-8 border border-blue-200 dark:border-blue-800">
            <div className="flex items-center mb-4">
              <div className="p-3 bg-blue-500 rounded-xl mr-4">
                <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Mobile App</h3>
                <p className="text-sm text-blue-600 dark:text-blue-400">Native iOS & Android</p>
              </div>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Take your lesson planning on the go with our upcoming mobile app. Create, edit, and share lessons from anywhere.
            </p>
            <div className="flex items-center justify-between">
              <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">Expected: Summer 2026</span>
              <div className="flex space-x-2">
                <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.71 19.5C17.88 20.74 17 21.95 15.66 21.97C14.32 22 13.89 21.18 12.37 21.18C10.84 21.18 10.37 21.95 9.1 22C7.79 22.05 6.8 20.68 5.96 19.47C4.25 17 2.94 12.45 4.7 9.39C5.57 7.87 7.13 6.91 8.82 6.88C10.1 6.86 11.32 7.75 12.11 7.75C12.89 7.75 14.37 6.68 15.92 6.84C16.57 6.87 18.39 7.1 19.56 8.82C19.47 8.88 17.39 10.1 17.41 12.63C17.44 15.65 20.06 16.66 20.09 16.67C20.06 16.74 19.67 18.11 18.71 19.5ZM13 3.5C13.73 2.67 14.94 2.04 15.94 2C16.07 3.17 15.6 4.35 14.9 5.19C14.21 6.04 13.07 6.7 11.95 6.61C11.8 5.46 12.36 4.26 13 3.5Z"/>
                  </svg>
                </div>
                <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.523 15.3414c-.5511 0-.9993-.4486-.9993-.9997s.4482-.9993.9993-.9993c.5511 0 .9993.4482.9993.9993.0001.5511-.4482.9997-.9993.9997m-11.046 0c-.5511 0-.9993-.4486-.9993-.9997s.4482-.9993.9993-.9993c.5511 0 .9993.4482.9993.9993 0 .5511-.4482.9997-.9993.9997m11.4045-6.02l1.9973-3.4592a.416.416 0 00-.1518-.5712.416.416 0 00-.5712.1518l-2.0223 3.5014c-1.5185-.7391-3.2583-1.1567-5.2064-1.1567-1.9481 0-3.6879.4176-5.2064 1.1567l-2.0223-3.5014a.416.416 0 00-.5712-.1518.416.416 0 00-.1518.5712l1.9973 3.4592c-2.1253 1.1393-3.6048 2.9183-4.1895 5.0781h16.4755c-.5847-2.1598-2.0642-3.9388-4.1895-5.0781"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-amber-50 to-orange-100 dark:from-amber-900/20 dark:to-orange-900/20 rounded-xl p-6 sm:p-8 border border-amber-200 dark:border-amber-800">
            <div className="flex items-center mb-4">
              <div className="p-3 bg-amber-500 rounded-xl mr-4">
                <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 016 0v6a3 3 0 01-3 3z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">AI Voice Integration</h3>
                <p className="text-sm text-amber-600 dark:text-amber-400">Smart pronunciation tools</p>
              </div>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Advanced AI-powered pronunciation exercises, voice recognition, and speaking practice tools for interactive lessons.
            </p>
            <div className="flex items-center justify-between">
              <span className="text-xs text-amber-600 dark:text-amber-400 font-medium">Expected: Fall 2026</span>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse"></div>
                <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}