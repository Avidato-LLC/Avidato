'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { getStudents, toggleStudentArchive, deleteStudent } from '../../actions/students'
import { languages, levels, ageGroups } from '@/lib/form-data-mappings'

/**
 * StudentsPage Component
 * 
 * A comprehensive student management interface with tabular data display.
 * Features:
 * - Tabular format showing essential student information
 * - Active/Archived tabs for student organization  
 * - Search students by name, goals, occupation, or interests
 * - Filter by target language, level, and age group
 * - Sort by any column with visual indicators
 * - Clickable student names for detailed view
 * - Kebab menu with actions (view, archive, delete)
 * - Responsive design that works on all devices
 */

interface StudentData {
  id: string
  name: string
  targetLanguage: string
  nativeLanguage: string
  ageGroup: string
  level: string
  endGoals: string
  occupation?: string | null
  weaknesses?: string | null
  interests?: string | null
  createdAt: Date
  updatedAt: Date
  lessonCount?: number
  archived: boolean
}

interface StudentFilters {
  search?: string
  targetLanguage?: string
  level?: string
  ageGroup?: string
  sortBy?: 'name' | 'level' | 'occupation' | 'lessonCount' | 'createdAt'
  sortOrder?: 'asc' | 'desc'
  archived?: boolean
}

type TabType = 'active' | 'archived'

export default function StudentsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [students, setStudents] = useState<StudentData[]>([])
  const [total, setTotal] = useState(0) // Total students for pagination
  const [page, setPage] = useState(1)
  const pageSize = 10 // Students per page
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<TabType>('active')
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)
  const [filters, setFilters] = useState<StudentFilters>({
    sortBy: 'createdAt',
    sortOrder: 'desc',
    archived: false
  })

  // Fetch students data
  // Fetch students with pagination
  useEffect(() => {
    const fetchStudents = async () => {
      if (session) {
        try {
          setLoading(true)
          setError(null)
          // Add pagination params to filters
          const updatedFilters = { ...filters, archived: activeTab === 'archived', page, pageSize }
          const response = await getStudents(updatedFilters)
          if (response.success && response.data) {
            setStudents(response.data.students)
            setTotal(response.data.total)
          } else {
            setError(response.error || 'Failed to load students')
          }
        } catch (err) {
          console.error('Error fetching students:', err)
          setError('Failed to load students. Please try again.')
        } finally {
          setLoading(false)
        }
      }
    }

    fetchStudents()
  }, [session, filters, activeTab, page])

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setOpenMenuId(null)
    }

    if (openMenuId) {
      document.addEventListener('click', handleClickOutside)
      return () => document.removeEventListener('click', handleClickOutside)
    }
  }, [openMenuId])

  // Update filters when tab changes, reset to page 1
  useEffect(() => {
    setFilters(prev => ({
      ...prev,
      archived: activeTab === 'archived'
    }))
    setPage(1)
  }, [activeTab])

  // Redirect if not authenticated
  useEffect(() => {
    if (status === 'loading') return
    if (!session) {
      router.push('/login')
      return
    }
  }, [session, status, router])

  // Handle filter changes, reset to page 1
  const handleFilterChange = (key: keyof StudentFilters, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value || undefined
    }))
    setPage(1)
  }

  // Handle sort changes
  const handleSort = (column: 'name' | 'level' | 'occupation' | 'lessonCount' | 'createdAt') => {
    setFilters(prev => ({
      ...prev,
      sortBy: column,
      sortOrder: prev.sortBy === column && prev.sortOrder === 'asc' ? 'desc' : 'asc'
    }))
  }

  // Clear all filters except archived status
  const clearFilters = () => {
    setFilters({
      sortBy: 'createdAt',
      sortOrder: 'desc',
      archived: activeTab === 'archived'
    })
  }

  // Handle menu actions
  const handleMenuAction = async (action: string, studentId: string) => {
    setOpenMenuId(null)
    
    switch (action) {
      case 'view':
        router.push(`/dashboard/students/${studentId}`)
        break
      case 'archive':
        try {
          const response = await toggleStudentArchive(studentId, activeTab === 'active')
          if (response.success) {
            // Refresh the students list
            const updatedFilters = { ...filters, archived: activeTab === 'archived' }
            const studentsResponse = await getStudents(updatedFilters)
            if (studentsResponse.success && studentsResponse.data) {
              setStudents(studentsResponse.data.students)
            }
          } else {
            setError(response.error || 'Failed to archive student')
          }
        } catch (err) {
          console.error('Archive error:', err)
          setError('Failed to archive student')
        }
        break
      case 'delete':
        // Show confirmation dialog
        if (window.confirm('Are you sure you want to permanently delete this student? This action cannot be undone and will also delete all associated lessons.')) {
          try {
            const response = await deleteStudent(studentId)
            if (response.success) {
              // Refresh the students list
              const updatedFilters = { ...filters, archived: activeTab === 'archived' }
              const studentsResponse = await getStudents(updatedFilters)
              if (studentsResponse.success && studentsResponse.data) {
                setStudents(studentsResponse.data.students)
              }
            } else {
              setError(response.error || 'Failed to delete student')
            }
          } catch (err) {
            console.error('Delete error:', err)
            setError('Failed to delete student')
          }
        }
        break
    }
  }

  const getSortIcon = (column: string) => {
    if (filters.sortBy !== column) {
      return (
        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
        </svg>
      )
    }
    
    return filters.sortOrder === 'asc' ? (
      <svg className="w-4 h-4 text-brand-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
      </svg>
    ) : (
      <svg className="w-4 h-4 text-brand-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    )
  }

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
    return null
  }

  return (
    <DashboardLayout>
      <div className="p-4 sm:p-6 lg:p-8">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 sm:mb-8">
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
              Students
            </h1>
            <p className="mt-1 sm:mt-2 text-sm sm:text-base text-gray-600 dark:text-gray-400">
              Manage your student profiles and track their progress
            </p>
          </div>
          
          <Link
            href="/dashboard/students/add"
            className="mt-4 sm:mt-0 inline-flex items-center justify-center gap-2 bg-brand-primary text-white px-4 py-2 sm:py-2 rounded-lg hover:bg-brand-accent transition-colors text-sm sm:text-base w-full sm:w-auto"
          >
            <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add Student
          </Link>
        </div>

        {/* Tabs */}
        <div className="mb-4 sm:mb-6">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="-mb-px flex space-x-4 sm:space-x-8 overflow-x-auto">
              <button
                onClick={() => setActiveTab('active')}
                className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                  activeTab === 'active'
                    ? 'border-brand-primary text-brand-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                Active Students
              </button>
              <button
                onClick={() => setActiveTab('archived')}
                className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                  activeTab === 'archived'
                    ? 'border-brand-primary text-brand-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                Archived
              </button>
            </nav>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6 mb-4 sm:mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {/* Search */}
            <div className="sm:col-span-2 lg:col-span-1">
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Search Students
              </label>
              <input
                type="text"
                id="search"
                placeholder="Search by name, goals, occupation..."
                value={filters.search || ''}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-brand-primary dark:bg-gray-700 dark:text-white"
              />
            </div>

            {/* Target Language Filter */}
            <div>
              <label htmlFor="targetLanguage" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Target Language
              </label>
              <select
                id="targetLanguage"
                value={filters.targetLanguage || ''}
                onChange={(e) => handleFilterChange('targetLanguage', e.target.value)}
                className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-brand-primary dark:bg-gray-700 dark:text-white"
              >
                <option value="">All Languages</option>
                {languages.map((lang) => (
                  <option key={lang.value} value={lang.value}>
                    {lang.country} {lang.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Level Filter */}
            <div>
              <label htmlFor="level" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Level
              </label>
              <select
                id="level"
                value={filters.level || ''}
                onChange={(e) => handleFilterChange('level', e.target.value)}
                className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-brand-primary dark:bg-gray-700 dark:text-white"
              >
                <option value="">All Levels</option>
                {levels.map((level) => (
                  <option key={level.value} value={level.value}>
                    {level.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Age Group Filter */}
            <div>
              <label htmlFor="ageGroup" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Age Group
              </label>
              <select
                id="ageGroup"
                value={filters.ageGroup || ''}
                onChange={(e) => handleFilterChange('ageGroup', e.target.value)}
                className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-brand-primary dark:bg-gray-700 dark:text-white"
              >
                <option value="">All Ages</option>
                {ageGroups.map((group) => (
                  <option key={group.value} value={group.value}>
                    {group.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Clear Filters */}
          {(filters.search || filters.targetLanguage || filters.level || filters.ageGroup) && (
            <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={clearFilters}
                className="text-sm text-brand-primary hover:text-brand-accent"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
            <p className="text-sm sm:text-base text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* Students Count (paginated) */}
        {!loading && !error && (
          <div className="mb-3 sm:mb-4">
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
              Showing {students.length > 0 ? (page - 1) * pageSize + 1 : 0}
              -{(page - 1) * pageSize + students.length} of {total} {activeTab} student{total !== 1 ? 's' : ''}
            </p>
          </div>
        )}

        {/* Students Content */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          {loading ? (
            <div className="p-4 sm:p-6">
              <div className="animate-pulse space-y-3 sm:space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex items-center space-x-3 sm:space-x-4">
                    <div className="h-3 sm:h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
                    <div className="h-3 sm:h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/6"></div>
                    <div className="h-3 sm:h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
                    <div className="h-3 sm:h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/6"></div>
                    <div className="h-3 sm:h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/12"></div>
                  </div>
                ))}
              </div>
            </div>
          ) : students.length === 0 ? (
            /* Empty State */
            <div className="text-center py-8 sm:py-12 px-4">
              <svg className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
              <h3 className="mt-2 text-sm sm:text-base font-semibold text-gray-900 dark:text-white">
                No {activeTab} students found
              </h3>
              <p className="mt-1 text-xs sm:text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                {filters.search || filters.targetLanguage || filters.level || filters.ageGroup
                  ? 'Try adjusting your filters to see more results.'
                  : activeTab === 'active' 
                    ? 'Get started by adding your first student.'
                    : 'No archived students yet.'}
              </p>
              {activeTab === 'active' && (
                <div className="mt-4 sm:mt-6">
                  <Link
                    href="/dashboard/students/add"
                    className="inline-flex items-center px-3 sm:px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-brand-primary hover:bg-brand-accent"
                  >
                    <svg className="-ml-1 mr-2 h-4 w-4 sm:h-5 sm:w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Add Student
                  </Link>
                </div>
              )}
            </div>
          ) : (
            <>
              {/* Mobile Card View */}
              <div className="block lg:hidden">
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {students.map((student) => (
                    <div key={student.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <Link 
                            href={`/dashboard/students/${student.id}`}
                            className="block hover:text-brand-primary transition-colors"
                          >
                            <h3 className="text-base font-semibold text-gray-900 dark:text-white truncate">
                              {student.name}
                            </h3>
                          </Link>
                          <div className="mt-1 space-y-1">
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              <span className="font-medium">{student.targetLanguage}</span> • {student.level}
                            </p>
                            {student.occupation && (
                              <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                                {student.occupation}
                              </p>
                            )}
                            <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 space-x-4">
                              <span>{student.lessonCount || 0} lessons</span>
                              <span>Added {new Date(student.createdAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                        
                        {/* Mobile Menu */}
                        <div className="ml-3 relative">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              setOpenMenuId(openMenuId === student.id ? null : student.id)
                            }}
                            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                          >
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                            </svg>
                          </button>
                          
                          {openMenuId === student.id && (
                            <div className="absolute right-0 mt-1 w-48 bg-white dark:bg-gray-700 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600 z-10">
                              <div className="py-1">
                                <button
                                  onClick={() => handleMenuAction('view', student.id)}
                                  className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600"
                                >
                                  View Details
                                </button>
                                <button
                                  onClick={() => handleMenuAction('archive', student.id)}
                                  className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600"
                                >
                                  {activeTab === 'active' ? 'Archive' : 'Unarchive'}
                                </button>
                                <button
                                  onClick={() => handleMenuAction('delete', student.id)}
                                  className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-600"
                                >
                                  Delete
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Desktop Table View */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-900">
                  <tr>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                      onClick={() => handleSort('name')}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Student Name</span>
                        {getSortIcon('name')}
                      </div>
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                      onClick={() => handleSort('level')}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Level</span>
                        {getSortIcon('level')}
                      </div>
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                      onClick={() => handleSort('occupation')}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Occupation</span>
                        {getSortIcon('occupation')}
                      </div>
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                      onClick={() => handleSort('lessonCount')}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Lessons</span>
                        {getSortIcon('lessonCount')}
                      </div>
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                      onClick={() => handleSort('createdAt')}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Added</span>
                        {getSortIcon('createdAt')}
                      </div>
                    </th>
                    <th className="relative px-6 py-3">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {students.map((student) => (
                    <tr key={student.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 bg-gradient-to-br from-brand-primary to-brand-accent rounded-full flex items-center justify-center">
                              <span className="text-white font-semibold text-sm">
                                {student.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <button
                              onClick={() => router.push(`/dashboard/students/${student.id}`)}
                              className="text-sm font-medium text-gray-900 dark:text-white hover:text-brand-primary dark:hover:text-brand-primary transition-colors"
                            >
                              {student.name}
                            </button>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {student.targetLanguage}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-brand-primary/10 text-brand-primary">
                          {student.level}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {student.occupation || '—'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        <span className="font-medium">{student.lessonCount || 0}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {new Date(student.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="relative">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              setOpenMenuId(openMenuId === student.id ? null : student.id)
                            }}
                            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1 rounded transition-colors"
                          >
                            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                            </svg>
                          </button>
                          
                          {openMenuId === student.id && (
                            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-xl z-50 border border-gray-200 dark:border-gray-700 origin-top-right">
                              <div className="py-1">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleMenuAction('view', student.id)
                                  }}
                                  className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                >
                                  <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                  </svg>
                                  View Student
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleMenuAction('archive', student.id)
                                  }}
                                  className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                >
                                  <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                                  </svg>
                                  {activeTab === 'active' ? 'Archive Student' : 'Unarchive Student'}
                                </button>
                                <hr className="my-1 border-gray-200 dark:border-gray-600" />
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleMenuAction('delete', student.id)
                                  }}
                                  className="flex items-center w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                >
                                  <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                  Delete Student
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
                </table>
              </div>
            </>
          )}
        {/* Pagination Controls */}
        {!loading && !error && total > pageSize && (
          <div className="flex justify-center mt-6">
            <nav className="inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700 ${page === 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
                aria-label="Previous"
              >
                &lt;
              </button>
              {Array.from({ length: Math.ceil(total / pageSize) }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium ${p === page ? 'text-brand-primary font-bold bg-gray-100 dark:bg-gray-700' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                  aria-current={p === page ? 'page' : undefined}
                >
                  {p}
                </button>
              ))}
              <button
                onClick={() => setPage((p) => Math.min(Math.ceil(total / pageSize), p + 1))}
                disabled={page === Math.ceil(total / pageSize)}
                className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700 ${page === Math.ceil(total / pageSize) ? 'opacity-50 cursor-not-allowed' : ''}`}
                aria-label="Next"
              >
                &gt;
              </button>
            </nav>
          </div>
        )}
        </div>
      </div>
    </DashboardLayout>
  )
}