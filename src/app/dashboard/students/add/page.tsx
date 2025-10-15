'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { languages, levels, ageGroups } from '@/lib/form-data-mappings'
import { addStudent } from '../../../actions/students'

/**
 * AddStudentPage Component
 * 
 * A comprehensive form for adding new students to the system using modular layout.
 * Features:
 * - Complete student information collection
 * - Real-time form validation with error feedback
 * - Uses reusable DashboardLayout with sidebar
 * - Responsive design with brand styling
 * - Proper integration with dashboard navigation
 * - Uses centralized form data mappings for consistency
 * 
 * Form includes:
 * - Basic info: Name, languages, age group, level
 * - Academic info: Goals, weaknesses, interests
 * - Proper validation and error handling
 */

interface StudentFormData {
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

const initialFormData: StudentFormData = {
  name: '',
  targetLanguage: '',
  nativeLanguage: '',
  ageGroup: '',
  level: '',
  endGoals: '',
  occupation: '',
  weaknesses: '',
  interests: ''
}

export default function AddStudentPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [formData, setFormData] = useState<StudentFormData>(initialFormData)

  /**
   * Handles input changes and clears related errors
   * @param e - Input change event
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  /**
   * Validates the form data and returns validation errors
   * @returns Object containing validation errors
   */
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    // Required field validation
    if (!formData.name.trim()) newErrors.name = 'Student name is required'
    if (!formData.targetLanguage) newErrors.targetLanguage = 'Target language is required'
    if (!formData.nativeLanguage) newErrors.nativeLanguage = 'Native language is required'
    if (!formData.ageGroup) newErrors.ageGroup = 'Age group is required'
    if (!formData.level) newErrors.level = 'Language level is required'
    if (!formData.endGoals.trim()) newErrors.endGoals = 'Learning goals are required'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  /**
   * Handles form submission with validation and server action
   * @param e - Form submit event
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setIsSubmitting(true)
    
    try {
      // Create FormData for server action
      const formDataToSubmit = new FormData()
      formDataToSubmit.append('name', formData.name)
      formDataToSubmit.append('targetLanguage', formData.targetLanguage)
      formDataToSubmit.append('nativeLanguage', formData.nativeLanguage)
      formDataToSubmit.append('ageGroup', formData.ageGroup)
      formDataToSubmit.append('level', formData.level)
      formDataToSubmit.append('endGoals', formData.endGoals)
      formDataToSubmit.append('occupation', formData.occupation)
      formDataToSubmit.append('weaknesses', formData.weaknesses)
      formDataToSubmit.append('interests', formData.interests)
      
      // Call server action
      const result = await addStudent(formDataToSubmit)
      
      if (result.success) {
        // Redirect to dashboard on success
        router.push('/dashboard')
      } else {
        // Handle server-side validation or creation errors
        setErrors({ general: result.error || 'Failed to create student. Please try again.' })
      }
    } catch (error) {
      console.error('Error creating student:', error)
      setErrors({ general: 'Failed to create student. Please try again.' })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="min-h-full bg-gray-50 dark:bg-gray-900">
        {/* Page Header */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="min-w-0 flex-1">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                  Add New Student
                </h1>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                  Create a new student profile to start generating personalized lessons
                </p>
              </div>
              
              {/* Back Button */}
              <button
                onClick={() => router.back()}
                className="inline-flex items-center justify-center px-3 sm:px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors w-full sm:w-auto"
              >
                <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back
              </button>
            </div>
          </div>
        </div>

        {/* Form Content */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6 lg:p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* General Error Display */}
              {errors.general && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 sm:p-4">
                  <p className="text-sm sm:text-base text-red-600 dark:text-red-400">{errors.general}</p>
                </div>
              )}

              {/* Basic Information Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                {/* Student Name */}
                <div className="lg:col-span-1">
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Student Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={`w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-brand-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-colors ${
                      errors.name ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'
                    }`}
                    placeholder="Enter student's full name"
                  />
                  {errors.name && <p className="mt-1 text-xs sm:text-sm text-red-600 dark:text-red-400">{errors.name}</p>}
                </div>

                {/* Target Language */}
                <div className="lg:col-span-1">
                  <label htmlFor="targetLanguage" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Target Language *
                  </label>
                  <select
                    id="targetLanguage"
                    name="targetLanguage"
                    value={formData.targetLanguage}
                    onChange={handleChange}
                    className={`w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-brand-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-colors ${
                      errors.targetLanguage ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'
                    }`}
                  >
                    <option value="">Select target language</option>
                    {languages.map((lang) => (
                      <option key={lang.value} value={lang.value}>
                        {lang.country} {lang.label}
                      </option>
                    ))}
                  </select>
                  {errors.targetLanguage && <p className="mt-1 text-xs sm:text-sm text-red-600 dark:text-red-400">{errors.targetLanguage}</p>}
                </div>

                {/* Native Language */}
                <div className="lg:col-span-1">
                  <label htmlFor="nativeLanguage" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Native Language *
                  </label>
                  <select
                    id="nativeLanguage"
                    name="nativeLanguage"
                    value={formData.nativeLanguage}
                    onChange={handleChange}
                    className={`w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-brand-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-colors ${
                      errors.nativeLanguage ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'
                    }`}
                  >
                    <option value="">Select native language</option>
                    {languages.map((lang) => (
                      <option key={lang.value} value={lang.value}>
                        {lang.country} {lang.label}
                      </option>
                    ))}
                  </select>
                  {errors.nativeLanguage && <p className="mt-1 text-xs sm:text-sm text-red-600 dark:text-red-400">{errors.nativeLanguage}</p>}
                </div>

                {/* Age Group */}
                <div className="lg:col-span-1">
                  <label htmlFor="ageGroup" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Age Group *
                  </label>
                  <select
                    id="ageGroup"
                    name="ageGroup"
                    value={formData.ageGroup}
                    onChange={handleChange}
                    className={`w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-brand-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-colors ${
                      errors.ageGroup ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'
                    }`}
                  >
                    <option value="">Select age group</option>
                    {ageGroups.map((group) => (
                      <option key={group.value} value={group.value}>
                        {group.label}
                      </option>
                    ))}
                  </select>
                  {errors.ageGroup && <p className="mt-1 text-xs sm:text-sm text-red-600 dark:text-red-400">{errors.ageGroup}</p>}
                </div>

                {/* Language Level */}
                <div className="lg:col-span-1">
                  <label htmlFor="level" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Current Level *
                  </label>
                  <select
                    id="level"
                    name="level"
                    value={formData.level}
                    onChange={handleChange}
                    className={`w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-brand-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-colors ${
                      errors.level ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'
                    }`}
                  >
                    <option value="">Select current level</option>
                    {levels.map((level) => (
                      <option key={level.value} value={level.value}>
                        {level.label}
                      </option>
                    ))}
                  </select>
                  {errors.level && <p className="mt-1 text-xs sm:text-sm text-red-600 dark:text-red-400">{errors.level}</p>}
                </div>

                {/* Occupation */}
                <div className="lg:col-span-1">
                  <label htmlFor="occupation" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Occupation <span className="text-gray-500 dark:text-gray-400">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    id="occupation"
                    name="occupation"
                    value={formData.occupation}
                    onChange={handleChange}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-brand-primary dark:bg-gray-700 dark:text-white transition-colors"
                    placeholder="e.g., Student, Engineer, Teacher"
                  />
                </div>
              </div>

              {/* Learning Goals */}
              <div>
                <label htmlFor="endGoals" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Learning Goals *
                </label>
                <textarea
                  id="endGoals"
                  name="endGoals"
                  value={formData.endGoals}
                  onChange={handleChange}
                  rows={4}
                  className={`w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-brand-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-colors resize-y ${
                    errors.endGoals ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'
                  }`}
                  placeholder="What does the student want to achieve? (e.g., business communication, travel, academic studies, certification exam)"
                />
                {errors.endGoals && <p className="mt-1 text-xs sm:text-sm text-red-600 dark:text-red-400">{errors.endGoals}</p>}
              </div>

              {/* Areas for Improvement */}
              <div>
                <label htmlFor="weaknesses" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Areas for Improvement <span className="text-gray-500 dark:text-gray-400">(Optional)</span>
                </label>
                <textarea
                  id="weaknesses"
                  name="weaknesses"
                  value={formData.weaknesses}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-brand-primary dark:bg-gray-700 dark:text-white transition-colors resize-y"
                  placeholder="What areas need the most work? (e.g., pronunciation, grammar, vocabulary, speaking confidence)"
                />
              </div>

              {/* Interests & Hobbies */}
              <div>
                <label htmlFor="interests" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Interests & Hobbies <span className="text-gray-500 dark:text-gray-400">(Optional)</span>
                </label>
                <textarea
                  id="interests"
                  name="interests"
                  value={formData.interests}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-brand-primary dark:bg-gray-700 dark:text-white transition-colors resize-y"
                  placeholder="What topics and activities interest the student? This helps personalize lesson content."
                />
              </div>

              {/* Form Actions */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4 sm:pt-6 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors order-2 sm:order-1"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base bg-brand-primary text-white rounded-lg hover:bg-brand-accent disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center order-1 sm:order-2"
                >
                  {isSubmitting ? (
                    <div className="flex items-center space-x-2">
                      <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" />
                        <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" className="opacity-75" />
                      </svg>
                      <span>Creating Student...</span>
                    </div>
                  ) : (
                    'Create Student'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}