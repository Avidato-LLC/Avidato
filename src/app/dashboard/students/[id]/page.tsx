'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { getStudent } from '../../../actions/students'
import { generateLearningPlan, generateLesson, generateInstantLesson, getGenerationStats, getStudentLearningPlan, shareLesson } from '../../../actions/ai-generation'
import { languages, levels, ageGroups } from '@/lib/form-data-mappings'
import { LearningPlan } from '@/lib/gemini'
import ShareIcon from '@/components/icons/ShareIcon'

/**
 * StudentProfilePage Component
 * 
 * Comprehensive student profile with 3 main tabs:
 * 1. Student Details - Personal info, learning preferences, and stats
 * 2. Learning Plan - AI-generated 10 topics based on goals
 * 3. Generate Lesson - Select topic and generate detailed lessons
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

interface LearningTopic {
  id: string
  title: string
  description: string
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced'
  estimatedLessons: number
  skills: string[]
}

interface StudentLesson {
  id: string
  title: string
  overview: string | null
  createdAt: Date
  sharedAt: Date | null
}

type TabType = 'details' | 'learning-plan' | 'generate-lesson' | 'generated-lessons' | 'instant-lesson'

export default function StudentProfilePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const studentId = params.id as string

  const [student, setStudent] = useState<StudentData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<TabType>('details')
  const [learningTopics, setLearningTopics] = useState<LearningTopic[]>([])
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null)
  const [generationStats, setGenerationStats] = useState({ used: 0, limit: 10, remaining: 10 })
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false)
  const [isGeneratingLesson, setIsGeneratingLesson] = useState(false)
  const [currentLearningPlan, setCurrentLearningPlan] = useState<LearningPlan | null>(null)
  const [lessons, setLessons] = useState<StudentLesson[]>([])
  const [loadingLessons, setLoadingLessons] = useState(false)
  const [instantPrompt, setInstantPrompt] = useState('')
  const [instantFocus, setInstantFocus] = useState<'speaking' | 'vocabulary' | 'grammar' | 'listening' | 'mixed'>('mixed')
  const [instantDuration, setInstantDuration] = useState<25 | 50>(50)
  const [isGeneratingInstantLesson, setIsGeneratingInstantLesson] = useState(false)
  // Issue #37: Track which lesson is currently being marked as taught
  const [markingTaughtId, setMarkingTaughtId] = useState<string | null>(null)

  // Helper function to check if a lesson already exists for a topic
  const isLessonGenerated = (topicTitle: string) => {
    return lessons.some(lesson => 
      lesson.title.toLowerCase().includes(topicTitle.toLowerCase()) ||
      topicTitle.toLowerCase().includes(lesson.title.toLowerCase())
    )
  }

  // Fetch lessons for the student
  const fetchLessons = useCallback(async () => {
    if (!studentId) return

    setLoadingLessons(true)
    try {
      const response = await fetch(`/api/students/${studentId}/lessons`)
      if (response.ok) {
        const data = await response.json()
        setLessons(data)
      } else {
        console.error('Failed to fetch lessons')
      }
    } catch (err) {
      console.error('Error fetching lessons:', err)
    } finally {
      setLoadingLessons(false)
    }
  }, [studentId])

  // Issue #37: Handle marking lesson as taught
  const handleMarkLessonAsTaught = useCallback(async (lessonId: string) => {
    setMarkingTaughtId(lessonId)
    try {
      const result = await shareLesson(lessonId, studentId)
      if (result.success) {
        // Refresh lessons to show updated status
        await fetchLessons()
      } else {
        console.error('Failed to mark lesson as taught:', result.error)
      }
    } catch (err) {
      console.error('Error marking lesson as taught:', err)
    } finally {
      setMarkingTaughtId(null)
    }
  }, [studentId, fetchLessons])

  // Fetch existing learning plan
  const fetchExistingLearningPlan = useCallback(async () => {
    if (!studentId) return

    try {
      const result = await getStudentLearningPlan(studentId)
      if (result.success && result.data) {
        setCurrentLearningPlan(result.data)
        // Convert AI topics to display format
        const aiTopics: LearningTopic[] = result.data.topics.map((topic) => ({
          id: topic.lessonNumber.toString(),
          title: topic.title,
          description: topic.objective,
          difficulty: topic.lessonNumber <= 3 ? 'Beginner' : 
                     topic.lessonNumber <= 7 ? 'Intermediate' : 'Advanced',
          estimatedLessons: 1,
          skills: topic.skills
        }))
        setLearningTopics(aiTopics)
      }
    } catch (err) {
      console.error('Error fetching existing learning plan:', err)
    }
  }, [studentId])

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
            // Generate learning topics based on student data
            generateLearningTopics(response.data)
            // Fetch lessons for this student
            fetchLessons()
            // Fetch existing learning plan
            fetchExistingLearningPlan()
          } else {
            setError(response.error || 'Failed to load student profile')
          }
        } catch (err) {
          console.error('Error fetching student:', err)
          setError('Failed to load student profile. Please try again.')
        } finally {
          setLoading(false)
        }
      }
    }

    fetchStudent()
  }, [session, studentId, fetchLessons, fetchExistingLearningPlan])

  // Fetch generation stats
  useEffect(() => {
    const fetchStats = async () => {
      if (session) {
        try {
          const stats = await getGenerationStats()
          setGenerationStats(stats)
        } catch (err) {
          console.error('Error fetching generation stats:', err)
        }
      }
    }

    fetchStats()
  }, [session])

  // Handle AI learning plan generation
  const handleGenerateLearningPlan = async () => {
    if (!student || isGeneratingPlan) return

    setIsGeneratingPlan(true)
    try {
      const result = await generateLearningPlan(student.id)
      if (result.success && result.data) {
        setCurrentLearningPlan(result.data)
        // Convert AI topics to display format
        const aiTopics: LearningTopic[] = result.data.topics.map((topic) => ({
          id: topic.lessonNumber.toString(),
          title: topic.title,
          description: topic.objective,
          difficulty: topic.lessonNumber <= 3 ? 'Beginner' : 
                     topic.lessonNumber <= 7 ? 'Intermediate' : 'Advanced',
          estimatedLessons: 1,
          skills: topic.skills
        }))
        setLearningTopics(aiTopics)
        
        // Update generation stats
        const stats = await getGenerationStats()
        setGenerationStats(stats)
      } else {
        setError(result.error || 'Failed to generate learning plan')
      }
    } catch (err) {
      console.error('Error generating learning plan:', err)
      setError('Failed to generate learning plan. Please try again.')
    } finally {
      setIsGeneratingPlan(false)
    }
  }

  // Handle AI lesson generation
  const handleGenerateLesson = async () => {
    if (!student || !selectedTopic || !currentLearningPlan || isGeneratingLesson) return

    const selectedAITopic = currentLearningPlan.topics.find(t => t.lessonNumber.toString() === selectedTopic)
    if (!selectedAITopic) return

    setIsGeneratingLesson(true)
    try {
      const result = await generateLesson(student.id, selectedAITopic, 50)
      if (result.success && result.data) {
        // Refresh lessons list and generation stats
        await fetchLessons()
        const stats = await getGenerationStats()
        setGenerationStats(stats)
        setSelectedTopic(null) // Clear selection
      } else {
        setError(result.error || 'Failed to generate lesson')
      }
    } catch (err) {
      console.error('Error generating lesson:', err)
      setError('Failed to generate lesson. Please try again.')
    } finally {
      setIsGeneratingLesson(false)
    }
  }

  // Generate learning topics based on student's profile
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const generateLearningTopics = (studentData: StudentData) => {
    // Remove demo data - topics will come from AI generation only
    setLearningTopics([])
  }

  // Handle instant lesson generation
  const handleInstantLessonGenerate = async () => {
    if (!instantPrompt.trim() || isGeneratingInstantLesson) return

    setIsGeneratingInstantLesson(true)
    try {
      const result = await generateInstantLesson(
        studentId,
        instantPrompt.trim(),
        instantFocus,
        instantDuration
      )
      
      if (result.success && result.data) {
        // Refresh lessons list
        await fetchLessons()
        // Clear the form
        setInstantPrompt('')
        // Show success message or redirect to lesson
        window.location.href = `/lessons/${result.data.lessonId}`
      } else {
        alert(result.error || 'Failed to generate instant lesson')
      }
    } catch (error) {
      console.error('Error generating instant lesson:', error)
      alert('Failed to generate instant lesson. Please try again.')
    } finally {
      setIsGeneratingInstantLesson(false)
    }
  }

  // Redirect if not authenticated
  useEffect(() => {
    if (status === 'loading') return
    if (!session) {
      router.push('/login')
      return
    }
  }, [session, status, router])

  // Get display labels for form data
  const getLanguageLabel = (value: string) => {
    const lang = languages.find(l => l.value === value)
    return lang ? `${lang.country} ${lang.label}` : value
  }

  const getLevelLabel = (value: string) => {
    const level = levels.find(l => l.value === value)
    return level ? level.label : value
  }

  const getAgeGroupLabel = (value: string) => {
    const group = ageGroups.find(g => g.value === value)
    return group ? group.label : value
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
      case 'Intermediate':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
      case 'Advanced':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
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
        {/* Header with Back Button */}
        <div className="flex items-center mb-4 sm:mb-6 lg:mb-8">
          <Link
            href="/dashboard/students"
            className="inline-flex items-center text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 mr-4 text-sm sm:text-base"
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Students
          </Link>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 sm:p-6 mb-4 sm:mb-6">
            <p className="text-sm sm:text-base text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-8 sm:py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary mx-auto"></div>
            <p className="mt-2 text-sm sm:text-base text-gray-600 dark:text-gray-400">Loading student profile...</p>
          </div>
        )}

        {/* Student Profile Content */}
        {!loading && !error && student && (
          <div className="space-y-4 sm:space-y-6">
            {/* Student Header */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
                <div className="flex items-center space-x-4 min-w-0 flex-1">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-brand-primary to-brand-accent rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-semibold text-lg sm:text-xl">
                      {student.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white truncate">
                      {student.name}
                    </h1>
                    <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                      Learning {getLanguageLabel(student.targetLanguage)} • {getLevelLabel(student.level)}
                    </p>
                    <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {getAgeGroupLabel(student.ageGroup)} • Added {new Date(student.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                
                {/* Actions - Stack on mobile, inline on desktop */}
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
                  <div className="text-center sm:text-right order-3 sm:order-1">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Generations: {generationStats.used}/{generationStats.limit}
                    </p>
                  </div>
                  <button 
                    onClick={() => setActiveTab('generate-lesson')}
                    className="bg-brand-primary text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-brand-accent transition-colors text-sm sm:text-base order-1 sm:order-2"
                  >
                    Generate Lesson
                  </button>
                  <Link
                    href={`/dashboard/students/${studentId}/edit`}
                    className="border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 px-3 sm:px-4 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors inline-flex items-center justify-center text-sm sm:text-base order-2 sm:order-3"
                  >
                    Edit Profile
                  </Link>
                </div>
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="border-b border-gray-200 dark:border-gray-700">
                {/* Mobile Tab Navigation - Dropdown Style */}
                <div className="block sm:hidden px-4 sm:px-6 py-4">
                  <select 
                    value={activeTab}
                    onChange={(e) => setActiveTab(e.target.value as TabType)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                  >
                    <option value="details">Student Details</option>
                    <option value="learning-plan">Learning Plan</option>
                    <option value="generated-lessons">Generated Lessons</option>
                    <option value="instant-lesson">Instant Lesson</option>
                  </select>
                </div>
                
                {/* Desktop Tab Navigation */}
                <nav className="hidden sm:flex -mb-px space-x-4 lg:space-x-8 px-4 sm:px-6 overflow-x-auto scrollbar-hide">
                  <button
                    onClick={() => setActiveTab('details')}
                    className={`py-4 px-1 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap ${
                      activeTab === 'details'
                        ? 'border-brand-primary text-brand-primary'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                    }`}
                  >
                    <div className="flex items-center space-x-1 sm:space-x-2">
                      <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <span className="hidden lg:inline">Student Details</span>
                      <span className="lg:hidden">Details</span>
                    </div>
                  </button>
                  <button
                    onClick={() => setActiveTab('learning-plan')}
                    className={`py-4 px-1 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap ${
                      activeTab === 'learning-plan'
                        ? 'border-brand-primary text-brand-primary'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                    }`}
                  >
                    <div className="flex items-center space-x-1 sm:space-x-2">
                      <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                      </svg>
                      <span className="hidden lg:inline">Learning Plan</span>
                      <span className="lg:hidden">Plan</span>
                    </div>
                  </button>
                  <button
                    onClick={() => setActiveTab('generated-lessons')}
                    className={`py-4 px-1 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap ${
                      activeTab === 'generated-lessons'
                        ? 'border-brand-primary text-brand-primary'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                    }`}
                  >
                    <div className="flex items-center space-x-1 sm:space-x-2">
                      <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10.5v6m3-3H9m4.06-7.19l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
                      </svg>
                      <span className="hidden lg:inline">Generated Lessons</span>
                      <span className="lg:hidden">Lessons</span>
                    </div>
                  </button>
                  <button
                    onClick={() => setActiveTab('instant-lesson')}
                    className={`py-4 px-1 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap ${
                      activeTab === 'instant-lesson'
                        ? 'border-brand-primary text-brand-primary'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                    }`}
                  >
                    <div className="flex items-center space-x-1 sm:space-x-2">
                      <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      <span className="hidden lg:inline">Instant Lesson</span>
                      <span className="lg:hidden">Instant</span>
                    </div>
                  </button>
                </nav>
              </div>

              {/* Tab Content */}
              <div className="p-4 sm:p-6">
                {/* Student Details Tab */}
                {activeTab === 'details' && (
                  <div className="space-y-4 sm:space-y-6">
                    {/* Personal Information Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                      {/* Basic Info */}
                      <div className="space-y-4">
                        <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                          Personal Information
                        </h3>
                        <div className="space-y-3 sm:space-y-4">
                          <div>
                            <label className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">Target Language</label>
                            <p className="text-sm sm:text-base text-gray-900 dark:text-white">{getLanguageLabel(student.targetLanguage)}</p>
                          </div>
                          <div>
                            <label className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">Native Language</label>
                            <p className="text-sm sm:text-base text-gray-900 dark:text-white">{getLanguageLabel(student.nativeLanguage)}</p>
                          </div>
                          <div>
                            <label className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">Current Level</label>
                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-brand-primary/10 text-brand-primary">
                              {getLevelLabel(student.level)}
                            </span>
                          </div>
                          <div>
                            <label className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">Age Group</label>
                            <p className="text-sm sm:text-base text-gray-900 dark:text-white">{getAgeGroupLabel(student.ageGroup)}</p>
                          </div>
                          {student.occupation && (
                            <div>
                              <label className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">Occupation</label>
                              <p className="text-sm sm:text-base text-gray-900 dark:text-white">{student.occupation}</p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Learning Stats */}
                      <div className="space-y-4">
                        <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                          Learning Progress
                        </h3>
                        <div className="space-y-3 sm:space-y-4">
                          <div className="flex items-center justify-between">
                            <span className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">Lessons Generated</span>
                            <span className="text-xl sm:text-2xl font-bold text-brand-primary">{student.lessonCount || 0}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">Profile Created</span>
                            <span className="text-xs sm:text-sm text-gray-900 dark:text-white">
                              {new Date(student.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">Last Updated</span>
                            <span className="text-xs sm:text-sm text-gray-900 dark:text-white">
                              {new Date(student.updatedAt).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">Status</span>
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              student.archived 
                                ? 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                                : 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                            }`}>
                              {student.archived ? 'Archived' : 'Active'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Learning Goals */}
                    <div>
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">
                        Learning Goals
                      </h3>
                      <p className="text-sm sm:text-base text-gray-900 dark:text-white whitespace-pre-wrap">
                        {student.endGoals}
                      </p>
                    </div>

                    {/* Additional Information */}
                    {(student.weaknesses || student.interests) && (
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                        {student.weaknesses && (
                          <div>
                            <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">
                              Areas to Improve
                            </h3>
                            <p className="text-sm sm:text-base text-gray-900 dark:text-white whitespace-pre-wrap">
                              {student.weaknesses}
                            </p>
                          </div>
                        )}
                        
                        {student.interests && (
                          <div>
                            <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">
                              Interests & Hobbies
                            </h3>
                            <p className="text-sm sm:text-base text-gray-900 dark:text-white whitespace-pre-wrap">
                              {student.interests}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Learning Plan Tab */}
                {activeTab === 'learning-plan' && (
                  <div className="space-y-4 sm:space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div>
                        <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                          Personalized Learning Plan
                        </h3>
                        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
                          {currentLearningPlan 
                            ? `AI-generated using ${currentLearningPlan.selectedMethodology} methodology`
                            : `10 topics tailored to ${student.name}'s goals and level`
                          }
                        </p>
                        {currentLearningPlan && (
                          <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                            {currentLearningPlan.methodologyReasoning}
                          </p>
                        )}
                      </div>
                      <button 
                        onClick={handleGenerateLearningPlan}
                        disabled={isGeneratingPlan || generationStats.remaining <= 0}
                        className="bg-brand-primary text-white px-4 py-2 rounded-lg hover:bg-brand-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                      >
                        {isGeneratingPlan && (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        )}
                        <span>{currentLearningPlan ? 'Regenerate Plan' : 'Generate AI Plan'}</span>
                      </button>
                    </div>

                    {learningTopics.length === 0 && !isGeneratingPlan && (
                      <div className="text-center py-12 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                        <h3 className="mt-2 text-sm font-semibold text-gray-900 dark:text-white">
                          No learning plan yet
                        </h3>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                          Generate an AI-powered learning plan based on {student.name}&apos;s profile
                        </p>
                        <div className="mt-6">
                          <button 
                            onClick={handleGenerateLearningPlan}
                            disabled={generationStats.remaining <= 0}
                            className="bg-brand-primary text-white px-4 py-2 rounded-lg hover:bg-brand-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Generate AI Learning Plan
                          </button>
                        </div>
                      </div>
                    )}

                    {isGeneratingPlan && (
                      <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary mx-auto"></div>
                        <p className="mt-2 text-gray-600 dark:text-gray-400">Generating personalized learning plan...</p>
                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">Using AI to analyze student profile and select optimal methodology</p>
                      </div>
                    )}

                    {learningTopics.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {learningTopics.map((topic, index) => {
                        const isGenerated = isLessonGenerated(topic.title)
                        return (
                          <div key={topic.id} className={`bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border ${isGenerated ? 'border-green-400 dark:border-green-600' : 'border-gray-200 dark:border-gray-600'}`}>
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-center space-x-3">
                                <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${isGenerated ? 'bg-green-500 text-white' : 'bg-brand-primary text-white'}`}>{isGenerated ? '✓' : index + 1}</span>
                                <div>
                                  <h4 className={`font-medium ${isGenerated ? 'text-green-700 dark:text-green-400' : 'text-gray-900 dark:text-white'}`}>{topic.title}</h4>
                                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getDifficultyColor(topic.difficulty)}`}>{topic.difficulty}</span>
                                </div>
                              </div>
                            </div>
                            <p className={`text-sm mb-3 ${isGenerated ? 'text-green-600 dark:text-green-300' : 'text-gray-600 dark:text-gray-300'}`}>{topic.description}</p>
                            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-2">
                              <span>{topic.estimatedLessons} lesson{topic.estimatedLessons !== 1 ? 's' : ''}</span>
                              <div className="flex space-x-1">
                                {topic.skills.map((skill) => (
                                  <span key={skill} className="bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded">{skill}</span>
                                ))}
                              </div>
                            </div>
                            {/* Generate/View Button */}
                            {!isGenerated ? (
                              <button
                                onClick={async () => {
                                  setSelectedTopic(topic.id);
                                  await handleGenerateLesson();
                                }}
                                disabled={isGeneratingLesson || generationStats.remaining <= 0}
                                className="w-full mt-2 bg-brand-primary text-white px-4 py-2 rounded-lg hover:bg-brand-accent transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                              >
                                {isGeneratingLesson ? 'Generating...' : 'Generate Lesson'}
                              </button>
                            ) : (
                              <Link
                                href={`/lessons/${lessons.find(l => l.title.toLowerCase().includes(topic.title.toLowerCase()))?.id}`}
                                className="w-full mt-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors text-sm font-medium flex items-center justify-center"
                              >
                                View Lesson
                              </Link>
                            )}
                          </div>
                        )
                      })}
                    </div>
                    )}
                  </div>
                )}

                {/* Generate Lesson Tab */}
                {activeTab === 'generate-lesson' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Generate AI Lesson
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Click on a topic below to see the &ldquo;Generate Lesson&rdquo; button appear directly underneath it
                      </p>
                      <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                        Generations remaining: {generationStats.remaining}/{generationStats.limit}
                      </div>
                    </div>

                    {learningTopics.length === 0 && (
                      <div className="text-center py-12 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C20.832 18.477 19.246 18 17.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                        <h3 className="mt-2 text-sm font-semibold text-gray-900 dark:text-white">
                          No learning plan available
                        </h3>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                          Generate a learning plan first to create individual lessons
                        </p>
                        <div className="mt-6">
                          <button 
                            onClick={() => setActiveTab('learning-plan')}
                            className="bg-brand-primary text-white px-4 py-2 rounded-lg hover:bg-brand-accent transition-colors"
                          >
                            Go to Learning Plan
                          </button>
                        </div>
                      </div>
                    )}

                    {learningTopics.length > 0 && (
                    <div className="grid grid-cols-1 gap-3">
                      {learningTopics.map((topic, index) => {
                        const isGenerated = isLessonGenerated(topic.title)
                        const isSelected = selectedTopic === topic.id
                        
                        return (
                        <div key={topic.id} className="space-y-3">
                          <div 
                            className={`p-4 border rounded-lg cursor-pointer transition-all ${
                              isSelected
                                ? 'border-brand-primary bg-brand-primary/5 dark:bg-brand-primary/10'
                                : isGenerated
                                  ? 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/10'
                                  : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                            }`}
                            onClick={() => {
                              if (!isGenerated) {
                                setSelectedTopic(selectedTopic === topic.id ? null : topic.id)
                              }
                            }}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                                  isGenerated
                                    ? 'bg-green-500 text-white'
                                    : isSelected
                                      ? 'bg-brand-primary text-white'
                                      : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300'
                                }`}>
                                  {isGenerated ? '✓' : index + 1}
                                </span>
                                <div>
                                  <h4 className={`font-medium ${isGenerated ? 'text-green-700 dark:text-green-400' : 'text-gray-900 dark:text-white'}`}>
                                    {topic.title}
                                  </h4>
                                  <p className={`text-sm ${isGenerated ? 'text-green-600 dark:text-green-300' : 'text-gray-600 dark:text-gray-300'}`}>
                                    {topic.description}
                                  </p>
                                  {isGenerated && (
                                    <p className="text-xs text-green-600 dark:text-green-400 mt-1 font-medium">
                                      ✅ Lesson already generated
                                    </p>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getDifficultyColor(topic.difficulty)}`}>
                                  {topic.difficulty}
                                </span>
                                {isSelected && !isGenerated && (
                                  <svg className="w-5 h-5 text-brand-primary" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                  </svg>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Generate Lesson Button - appears directly below clicked topic */}
                          {isSelected && !isGenerated && (
                            <div className="ml-11 bg-brand-primary/5 dark:bg-brand-primary/10 border border-brand-primary/20 rounded-lg p-4">
                              <div className="flex items-center justify-between">
                                <div>
                                  <h5 className="text-sm font-medium text-gray-900 dark:text-white">
                                    Ready to Generate Lesson
                                  </h5>
                                  <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">
                                    {currentLearningPlan && `Using ${currentLearningPlan.selectedMethodology} methodology`}
                                  </p>
                                </div>
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleGenerateLesson();
                                  }}
                                  disabled={isGeneratingLesson || generationStats.remaining <= 0}
                                  className="bg-brand-primary text-white px-4 py-2 rounded-lg hover:bg-brand-accent transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                                >
                                  {isGeneratingLesson && (
                                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                                  )}
                                  <span>{isGeneratingLesson ? 'Generating...' : 'Generate Lesson'}</span>
                                </button>
                              </div>
                              {generationStats.remaining <= 0 && (
                                <p className="text-xs text-red-600 dark:text-red-400 mt-2">
                                  Daily generation limit reached. Please try again tomorrow.
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                        )
                      })}
                    </div>
                    )}

                  </div>
                )}

                {/* Generated Lessons Tab */}
                {activeTab === 'generated-lessons' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          Generated Lessons
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          View and manage all lessons generated for {student.name}
                        </p>
                      </div>
                      {lessons.length > 0 && (
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {lessons.length} lesson{lessons.length !== 1 ? 's' : ''} created
                        </span>
                      )}
                    </div>

                    {loadingLessons && (
                      <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary mx-auto"></div>
                        <p className="mt-2 text-gray-600 dark:text-gray-400">Loading lessons...</p>
                      </div>
                    )}

                    {!loadingLessons && lessons.length === 0 && (
                      <div className="text-center py-12 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C20.832 18.477 19.246 18 17.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                        <h3 className="mt-2 text-sm font-semibold text-gray-900 dark:text-white">
                          No lessons generated yet
                        </h3>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                          Generate your first lesson from the learning plan topics in the &quot;Generate Lesson&quot; tab
                        </p>
                        <div className="mt-6">
                          <button 
                            onClick={() => setActiveTab('generate-lesson')}
                            className="bg-brand-primary text-white px-4 py-2 rounded-lg hover:bg-brand-accent transition-colors"
                          >
                            Go to Generate Lesson
                          </button>
                        </div>
                      </div>
                    )}

                    {!loadingLessons && lessons.length > 0 && (
                      <div className="grid grid-cols-1 gap-4">
                        {lessons.map((lesson, index) => (
                          <div key={lesson.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 border border-gray-200 dark:border-gray-600">
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <div className="flex items-center space-x-4">
                                  <span className="w-10 h-10 bg-brand-primary text-white rounded-full flex items-center justify-center text-sm font-bold">
                                    {index + 1}
                                  </span>
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                                        {lesson.title}
                                      </h4>
                                      {lesson.sharedAt && (
                                        <span className="text-green-600 dark:text-green-400" title="Marked as taught to student">
                                          <ShareIcon className="w-4 h-4" />
                                        </span>
                                      )}
                                    </div>
                                    {lesson.overview && (
                                      <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                                        {lesson.overview}
                                      </p>
                                    )}
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                                      Created {new Date(lesson.createdAt).toLocaleDateString()} at {new Date(lesson.createdAt).toLocaleTimeString()}
                                    </p>
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center space-x-3">
                                <Link
                                  href={`/lessons/${lesson.id}`}
                                  className="bg-brand-primary text-white px-4 py-2 rounded-lg hover:bg-brand-accent transition-colors text-sm font-medium"
                                >
                                  View Lesson
                                </Link>
                                {/* Merge behaviour: clicking Share will also mark as taught */}
                                <button
                                  onClick={async (e) => {
                                    e.preventDefault();
                                    try {
                                      // If not already marked as taught, mark it first
                                      if (!lesson.sharedAt && markingTaughtId !== lesson.id) {
                                        await handleMarkLessonAsTaught(lesson.id);
                                      }
                                    } catch (err) {
                                      // swallow errors so share still works
                                      console.error('Error marking lesson as taught before sharing:', err);
                                    }

                                    // Open the public share page in a new tab
                                    const shareUrl = `${window.location.origin}/lessons/${lesson.id}/share`;
                                    window.open(shareUrl, '_blank', 'noopener');
                                  }}
                                  disabled={markingTaughtId === lesson.id}
                                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                    markingTaughtId === lesson.id
                                      ? 'bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-400 cursor-not-allowed'
                                      : lesson.sharedAt
                                      ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 hover:bg-green-100'
                                      : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500'
                                  }`}
                                  title="Share this lesson with the student (this will also mark it as taught)">
                                  {markingTaughtId === lesson.id ? 'Sharing...' : lesson.sharedAt ? '✓ Taught' : 'Share'}
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Instant Lesson Tab */}
                {activeTab === 'instant-lesson' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                          Instant Lesson Generator
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">
                          Generate a lesson instantly based on specific needs or situations
                        </p>
                      </div>
                    </div>

                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                      <div className="flex">
                        <svg className="flex-shrink-0 w-5 h-5 text-blue-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div className="ml-3">
                          <h4 className="text-sm font-medium text-blue-800 dark:text-blue-400">
                            Examples of instant lesson prompts:
                          </h4>
                          <div className="mt-2 text-sm text-blue-700 dark:text-blue-300">
                            <ul className="list-disc list-inside space-y-1">
                              <li>&quot;I have a job interview tomorrow&quot;</li>
                              <li>&quot;I need to give a presentation next week&quot;</li>
                              <li>&quot;I&apos;m going to a business dinner&quot;</li>
                              <li>&quot;I need to negotiate a contract&quot;</li>
                              <li>&quot;I&apos;m traveling to London next month&quot;</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label htmlFor="instant-prompt" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Describe your immediate learning need
                        </label>
                        <textarea
                          id="instant-prompt"
                          rows={4}
                          value={instantPrompt}
                          onChange={(e) => setInstantPrompt(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent dark:bg-gray-700 dark:text-white"
                          placeholder="Example: I have a job interview tomorrow for a marketing position and need to practice talking about my experience and asking good questions..."
                        />
                      </div>

                      <div className="flex items-center space-x-4">
                        <div>
                          <label htmlFor="lesson-duration" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Lesson Duration
                          </label>
                          <select
                            id="lesson-duration"
                            value={instantDuration}
                            onChange={(e) => setInstantDuration(Number(e.target.value) as 25 | 50)}
                            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent dark:bg-gray-700 dark:text-white"
                          >
                            <option value={25}>25 minutes</option>
                            <option value={50}>50 minutes</option>
                          </select>
                        </div>

                        <div>
                          <label htmlFor="lesson-focus" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Primary Focus
                          </label>
                          <select
                            id="lesson-focus"
                            value={instantFocus}
                            onChange={(e) => setInstantFocus(e.target.value as 'speaking' | 'vocabulary' | 'grammar' | 'listening' | 'mixed')}
                            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent dark:bg-gray-700 dark:text-white"
                          >
                            <option value="speaking">Speaking Practice</option>
                            <option value="vocabulary">Vocabulary Building</option>
                            <option value="grammar">Grammar Focus</option>
                            <option value="listening">Listening Skills</option>
                            <option value="mixed">Mixed Skills</option>
                          </select>
                        </div>
                      </div>

                      <button
                        onClick={handleInstantLessonGenerate}
                        disabled={isGeneratingInstantLesson || !instantPrompt.trim()}
                        className="w-full bg-brand-primary text-white py-3 px-4 rounded-lg hover:bg-brand-accent transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isGeneratingInstantLesson ? 'Generating Instant Lesson...' : 'Generate Instant Lesson'}
                      </button>
                    </div>

                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 dark:text-white mb-2">How it works:</h4>
                      <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600 dark:text-gray-400">
                        <li>Describe your specific situation or learning need</li>
                        <li>AI analyzes your student profile and the context</li>
                        <li>Generates a customized lesson with relevant vocabulary and exercises</li>
                        <li>Practice immediately or save for later</li>
                      </ol>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* No Student Found */}
        {!loading && !student && !error && (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
            </svg>
            <h3 className="mt-2 text-sm font-semibold text-gray-900 dark:text-white">
              Student not found
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              The student you&apos;re looking for doesn&apos;t exist or you don&apos;t have permission to view it.
            </p>
            <div className="mt-6">
              <Link
                href="/dashboard/students"
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-brand-primary hover:bg-brand-accent"
              >
                <svg className="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Students
              </Link>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}