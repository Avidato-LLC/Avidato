'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { getStudent, updateStudent } from '../../../../actions/students'
import { languages, levels, ageGroups } from '@/lib/form-data-mappings'

/**
 * EditStudentPage Component
 * 
 * Allows editing of existing student information including:
 * - Personal details (name, languages, level, age group)
 * - Learning goals and preferences
 * - Areas of improvement and interests
 * - Occupation and other details
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
  archived: boolean
  createdAt: Date
  updatedAt: Date
  lessonCount?: number
}

interface FormData {
  name: string
  targetLanguage: string
  nativeLanguage: string
  ageGroup: string
  level: string
  endGoals: string
  occupation: string
  weaknesses: string
  interests: string
}

export default function EditStudentPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const studentId = params.id as string

  const [student, setStudent] = useState<StudentData | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [formData, setFormData] = useState<FormData>({
    name: '',
    targetLanguage: '',
    nativeLanguage: '',
    ageGroup: '',
    level: '',
    endGoals: '',
    occupation: '',
    weaknesses: '',
    interests: ''
  })

  // Fetch student data
  useEffect(() => {
    const fetchStudent = async () => {
      if (session && studentId) {
        try {
          setLoading(true)
          setError(null)
          
          const response = await getStudent(studentId)
          if (response.success && response.data) {
            setStudent(response.data)
            // Populate form with existing data
            setFormData({
              name: response.data.name,
              targetLanguage: response.data.targetLanguage,
              nativeLanguage: response.data.nativeLanguage,
              ageGroup: response.data.ageGroup,
              level: response.data.level,
              endGoals: response.data.endGoals,
              occupation: response.data.occupation || '',
              weaknesses: response.data.weaknesses || '',
              interests: response.data.interests || ''
            })
          } else {
            setError(response.error || 'Failed to load student')
          }
        } catch (err) {
          console.error('Error fetching student:', err)
          setError('Failed to load student. Please try again.')
        } finally {
          setLoading(false)
        }
      }
    }

    fetchStudent()
  }, [session, studentId])

  // Redirect if not authenticated
  useEffect(() => {
    if (status === 'loading') return
    if (!session) {
      router.push('/login')
      return
    }
  }, [session, status, router])

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!student) return
    
    setSaving(true)
    setError(null)
    setSuccess(null)
    
    try {
      // Create FormData from the current form state
      const formDataToSend = new FormData()
      formDataToSend.append('name', formData.name)
      formDataToSend.append('targetLanguage', formData.targetLanguage)
      formDataToSend.append('nativeLanguage', formData.nativeLanguage)
      formDataToSend.append('ageGroup', formData.ageGroup)
      formDataToSend.append('level', formData.level)
      formDataToSend.append('endGoals', formData.endGoals)
      formDataToSend.append('occupation', formData.occupation)
      formDataToSend.append('weaknesses', formData.weaknesses)
      formDataToSend.append('interests', formData.interests)

      const response = await updateStudent(studentId, formDataToSend)
      
      if (response.success) {
        // Show success message briefly before redirect
        setSuccess(response.message || 'Student updated successfully!')
        setTimeout(() => {
          router.push(`/dashboard/students/${studentId}`)
        }, 1500)
      } else {
        setError(response.error || 'Failed to update student')
      }
    } catch (err) {
      console.error('Error updating student:', err)
      setError('Failed to update student. Please try again.')
    } finally {
      setSaving(false)
    }
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
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center">
            <Link
              href={`/dashboard/students/${studentId}`}
              className="inline-flex items-center text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 mb-4 sm:mb-0 sm:mr-4 text-sm sm:text-base"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Student
            </Link>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                Edit Student Profile
              </h1>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                Update {student?.name}&apos;s information and learning preferences
              </p>
            </div>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 sm:p-6 mb-4 sm:mb-6">
            <p className="text-sm sm:text-base text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* Success State */}
        {success && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 sm:p-6 mb-4 sm:mb-6">
            <p className="text-sm sm:text-base text-green-600 dark:text-green-400">{success}</p>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-8 sm:py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary mx-auto"></div>
            <p className="mt-2 text-sm sm:text-base text-gray-600 dark:text-gray-400">Loading student data...</p>
          </div>
        )}

        {/* Edit Form */}
        {!loading && student && (
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
              <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-4 sm:mb-6">
                Personal Information
              </h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                {/* Name */}
                <div>
                  <label htmlFor="name" className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-brand-primary dark:bg-gray-700 dark:text-white"
                    required
                  />
                </div>

                {/* Age Group */}
                <div>
                  <label htmlFor="ageGroup" className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Age Group *
                  </label>
                  <select
                    id="ageGroup"
                    value={formData.ageGroup}
                    onChange={(e) => handleInputChange('ageGroup', e.target.value)}
                    className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-brand-primary dark:bg-gray-700 dark:text-white"
                    required
                  >
                    <option value="">Select age group</option>
                    {ageGroups.map((group) => (
                      <option key={group.value} value={group.value}>
                        {group.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Target Language */}
                <div>
                  <label htmlFor="targetLanguage" className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Target Language *
                  </label>
                  <select
                    id="targetLanguage"
                    value={formData.targetLanguage}
                    onChange={(e) => handleInputChange('targetLanguage', e.target.value)}
                    className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-brand-primary dark:bg-gray-700 dark:text-white"
                    required
                  >
                    <option value="">Select target language</option>
                    {languages.map((lang) => (
                      <option key={lang.value} value={lang.value}>
                        {lang.country} {lang.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Native Language */}
                <div>
                  <label htmlFor="nativeLanguage" className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Native Language *
                  </label>
                  <select
                    id="nativeLanguage"
                    value={formData.nativeLanguage}
                    onChange={(e) => handleInputChange('nativeLanguage', e.target.value)}
                    className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-brand-primary dark:bg-gray-700 dark:text-white"
                    required
                  >
                    <option value="">Select native language</option>
                    {languages.map((lang) => (
                      <option key={lang.value} value={lang.value}>
                        {lang.country} {lang.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Level */}
                <div>
                  <label htmlFor="level" className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Current Level *
                  </label>
                  <select
                    id="level"
                    value={formData.level}
                    onChange={(e) => handleInputChange('level', e.target.value)}
                    className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-brand-primary dark:bg-gray-700 dark:text-white"
                    required
                  >
                    <option value="">Select level</option>
                    {levels.map((level) => (
                      <option key={level.value} value={level.value}>
                        {level.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Occupation */}
                <div>
                  <label htmlFor="occupation" className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Occupation
                  </label>
                  <input
                    type="text"
                    id="occupation"
                    value={formData.occupation}
                    onChange={(e) => handleInputChange('occupation', e.target.value)}
                    className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-brand-primary dark:bg-gray-700 dark:text-white"
                    placeholder="e.g., Software Engineer, Teacher, Student"
                  />
                </div>
              </div>
            </div>

            {/* Learning Information */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
              <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-4 sm:mb-6">
                Learning Information
              </h2>
              
              <div className="space-y-4 sm:space-y-6">
                {/* End Goals */}
                <div>
                  <label htmlFor="endGoals" className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Learning Goals *
                  </label>
                  <textarea
                    id="endGoals"
                    value={formData.endGoals}
                    onChange={(e) => handleInputChange('endGoals', e.target.value)}
                    rows={4}
                    className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-brand-primary dark:bg-gray-700 dark:text-white"
                    placeholder="What does the student want to achieve with this language?"
                    required
                  />
                </div>

                {/* Weaknesses */}
                <div>
                  <label htmlFor="weaknesses" className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Areas to Improve
                  </label>
                  <textarea
                    id="weaknesses"
                    value={formData.weaknesses}
                    onChange={(e) => handleInputChange('weaknesses', e.target.value)}
                    rows={3}
                    className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-brand-primary dark:bg-gray-700 dark:text-white"
                    placeholder="What aspects of the language does the student struggle with?"
                  />
                </div>

                {/* Interests */}
                <div>
                  <label htmlFor="interests" className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Interests & Hobbies
                  </label>
                  <textarea
                    id="interests"
                    value={formData.interests}
                    onChange={(e) => handleInputChange('interests', e.target.value)}
                    rows={3}
                    className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-brand-primary dark:bg-gray-700 dark:text-white"
                    placeholder="What does the student enjoy doing in their free time?"
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-end gap-3 sm:gap-4">
              <Link
                href={`/dashboard/students/${studentId}`}
                className="px-4 sm:px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-center text-sm sm:text-base order-2 sm:order-1"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={saving}
                className="px-4 sm:px-6 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 text-sm sm:text-base order-1 sm:order-2"
              >
                {saving && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                )}
                <span>{saving ? 'Saving...' : 'Save Changes'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </DashboardLayout>
  )
}