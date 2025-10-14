'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { getStudent } from '../../../actions/students'
import { languages, levels, ageGroups } from '@/lib/form-data-mappings'

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

type TabType = 'details' | 'learning-plan' | 'generate-lesson'

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
  }, [session, studentId])

  // Generate learning topics based on student's profile
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const generateLearningTopics = (studentData: StudentData) => {
    // TODO: This will be replaced with AI generation based on studentData later
    const mockTopics: LearningTopic[] = [
      {
        id: '1',
        title: 'Basic Greetings & Introductions',
        description: 'Learn essential phrases for meeting new people and introducing yourself',
        difficulty: 'Beginner',
        estimatedLessons: 2,
        skills: ['Speaking', 'Listening', 'Vocabulary']
      },
      {
        id: '2',
        title: 'Workplace Communication',
        description: 'Professional language for emails, meetings, and workplace interactions',
        difficulty: 'Intermediate',
        estimatedLessons: 4,
        skills: ['Writing', 'Speaking', 'Professional Vocabulary']
      },
      {
        id: '3',
        title: 'Travel & Transportation',
        description: 'Navigate airports, hotels, and public transportation with confidence',
        difficulty: 'Beginner',
        estimatedLessons: 3,
        skills: ['Speaking', 'Listening', 'Practical Vocabulary']
      },
      {
        id: '4',
        title: 'Food & Dining',
        description: 'Order food, understand menus, and discuss dietary preferences',
        difficulty: 'Beginner',
        estimatedLessons: 2,
        skills: ['Speaking', 'Vocabulary', 'Cultural Understanding']
      },
      {
        id: '5',
        title: 'Past Tense Storytelling',
        description: 'Master past tense forms to tell stories and describe experiences',
        difficulty: 'Intermediate',
        estimatedLessons: 3,
        skills: ['Grammar', 'Speaking', 'Writing']
      },
      {
        id: '6',
        title: 'Future Plans & Goals',
        description: 'Express intentions, make plans, and discuss future aspirations',
        difficulty: 'Intermediate',
        estimatedLessons: 2,
        skills: ['Grammar', 'Speaking', 'Vocabulary']
      },
      {
        id: '7',
        title: 'Shopping & Money',
        description: 'Handle transactions, compare prices, and make purchases',
        difficulty: 'Beginner',
        estimatedLessons: 2,
        skills: ['Speaking', 'Numbers', 'Practical Vocabulary']
      },
      {
        id: '8',
        title: 'Health & Medical',
        description: 'Describe symptoms, understand medical advice, and health vocabulary',
        difficulty: 'Intermediate',
        estimatedLessons: 3,
        skills: ['Speaking', 'Listening', 'Emergency Vocabulary']
      },
      {
        id: '9',
        title: 'Entertainment & Hobbies',
        description: 'Discuss movies, music, sports, and personal interests',
        difficulty: 'Beginner',
        estimatedLessons: 2,
        skills: ['Speaking', 'Vocabulary', 'Cultural Understanding']
      },
      {
        id: '10',
        title: 'Advanced Conversations',
        description: 'Engage in complex discussions about current events and opinions',
        difficulty: 'Advanced',
        estimatedLessons: 5,
        skills: ['Speaking', 'Listening', 'Critical Thinking']
      }
    ]
    
    setLearningTopics(mockTopics)
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
      <div className="p-6 lg:p-8">
        {/* Header with Back Button */}
        <div className="flex items-center mb-8">
          <Link
            href="/dashboard/students"
            className="inline-flex items-center text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 mr-4"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Students
          </Link>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
            <p className="text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary mx-auto"></div>
            <p className="mt-2 text-gray-600 dark:text-gray-400">Loading student profile...</p>
          </div>
        )}

        {/* Student Profile Content */}
        {!loading && !error && student && (
          <div className="space-y-6">
            {/* Student Header */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gradient-to-br from-brand-primary to-brand-accent rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold text-xl">
                    {student.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1">
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {student.name}
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400">
                    Learning {getLanguageLabel(student.targetLanguage)} • {getLevelLabel(student.level)}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {getAgeGroupLabel(student.ageGroup)} • Added {new Date(student.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex space-x-3">
                  <button 
                    onClick={() => setActiveTab('generate-lesson')}
                    className="bg-brand-primary text-white px-4 py-2 rounded-lg hover:bg-brand-accent transition-colors"
                  >
                    Generate Lesson
                  </button>
                  <Link
                    href={`/dashboard/students/${studentId}/edit`}
                    className="border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors inline-flex items-center"
                  >
                    Edit Profile
                  </Link>
                </div>
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="border-b border-gray-200 dark:border-gray-700">
                <nav className="-mb-px flex space-x-8 px-6">
                  <button
                    onClick={() => setActiveTab('details')}
                    className={`py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'details'
                        ? 'border-brand-primary text-brand-primary'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <span>Student Details</span>
                    </div>
                  </button>
                  <button
                    onClick={() => setActiveTab('learning-plan')}
                    className={`py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'learning-plan'
                        ? 'border-brand-primary text-brand-primary'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                      </svg>
                      <span>Learning Plan</span>
                    </div>
                  </button>
                  <button
                    onClick={() => setActiveTab('generate-lesson')}
                    className={`py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'generate-lesson'
                        ? 'border-brand-primary text-brand-primary'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C20.832 18.477 19.246 18 17.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                      <span>Generate Lesson</span>
                    </div>
                  </button>
                </nav>
              </div>

              {/* Tab Content */}
              <div className="p-6">
                {/* Student Details Tab */}
                {activeTab === 'details' && (
                  <div className="space-y-6">
                    {/* Personal Information Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Basic Info */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          Personal Information
                        </h3>
                        <div className="space-y-4">
                          <div>
                            <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Target Language</label>
                            <p className="text-gray-900 dark:text-white">{getLanguageLabel(student.targetLanguage)}</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Native Language</label>
                            <p className="text-gray-900 dark:text-white">{getLanguageLabel(student.nativeLanguage)}</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Current Level</label>
                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-brand-primary/10 text-brand-primary">
                              {getLevelLabel(student.level)}
                            </span>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Age Group</label>
                            <p className="text-gray-900 dark:text-white">{getAgeGroupLabel(student.ageGroup)}</p>
                          </div>
                          {student.occupation && (
                            <div>
                              <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Occupation</label>
                              <p className="text-gray-900 dark:text-white">{student.occupation}</p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Learning Stats */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          Learning Progress
                        </h3>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Lessons Generated</span>
                            <span className="text-2xl font-bold text-brand-primary">{student.lessonCount || 0}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Profile Created</span>
                            <span className="text-sm text-gray-900 dark:text-white">
                              {new Date(student.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Last Updated</span>
                            <span className="text-sm text-gray-900 dark:text-white">
                              {new Date(student.updatedAt).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</span>
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
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        Learning Goals
                      </h3>
                      <p className="text-gray-900 dark:text-white whitespace-pre-wrap">
                        {student.endGoals}
                      </p>
                    </div>

                    {/* Additional Information */}
                    {(student.weaknesses || student.interests) && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {student.weaknesses && (
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                              Areas to Improve
                            </h3>
                            <p className="text-gray-900 dark:text-white whitespace-pre-wrap">
                              {student.weaknesses}
                            </p>
                          </div>
                        )}
                        
                        {student.interests && (
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                              Interests & Hobbies
                            </h3>
                            <p className="text-gray-900 dark:text-white whitespace-pre-wrap">
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
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          Personalized Learning Plan
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          10 topics tailored to {student.name}&apos;s goals and level
                        </p>
                      </div>
                      <button className="bg-brand-primary text-white px-4 py-2 rounded-lg hover:bg-brand-accent transition-colors">
                        Regenerate Plan
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {learningTopics.map((topic, index) => (
                        <div key={topic.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center space-x-3">
                              <span className="w-8 h-8 bg-brand-primary text-white rounded-full flex items-center justify-center text-sm font-medium">
                                {index + 1}
                              </span>
                              <div>
                                <h4 className="font-medium text-gray-900 dark:text-white">
                                  {topic.title}
                                </h4>
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getDifficultyColor(topic.difficulty)}`}>
                                  {topic.difficulty}
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                            {topic.description}
                          </p>
                          
                          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                            <span>{topic.estimatedLessons} lesson{topic.estimatedLessons !== 1 ? 's' : ''}</span>
                            <div className="flex space-x-1">
                              {topic.skills.map((skill) => (
                                <span key={skill} className="bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded">
                                  {skill}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
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
                        Select a topic from the learning plan to generate a detailed lesson
                      </p>
                    </div>

                    <div className="grid grid-cols-1 gap-3">
                      {learningTopics.map((topic, index) => (
                        <div 
                          key={topic.id} 
                          className={`p-4 border rounded-lg cursor-pointer transition-all ${
                            selectedTopic === topic.id
                              ? 'border-brand-primary bg-brand-primary/5 dark:bg-brand-primary/10'
                              : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                          }`}
                          onClick={() => setSelectedTopic(selectedTopic === topic.id ? null : topic.id)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                                selectedTopic === topic.id
                                  ? 'bg-brand-primary text-white'
                                  : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300'
                              }`}>
                                {index + 1}
                              </span>
                              <div>
                                <h4 className="font-medium text-gray-900 dark:text-white">
                                  {topic.title}
                                </h4>
                                <p className="text-sm text-gray-600 dark:text-gray-300">
                                  {topic.description}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getDifficultyColor(topic.difficulty)}`}>
                                {topic.difficulty}
                              </span>
                              {selectedTopic === topic.id && (
                                <svg className="w-5 h-5 text-brand-primary" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {selectedTopic && (
                      <div className="bg-brand-primary/5 dark:bg-brand-primary/10 border border-brand-primary/20 rounded-lg p-6">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                            Ready to Generate Lesson
                          </h4>
                          <button className="bg-brand-primary text-white px-6 py-3 rounded-lg hover:bg-brand-accent transition-colors font-medium">
                            Generate AI Lesson
                          </button>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          Selected topic: <span className="font-medium">{learningTopics.find(t => t.id === selectedTopic)?.title}</span>
                        </p>
                      </div>
                    )}
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