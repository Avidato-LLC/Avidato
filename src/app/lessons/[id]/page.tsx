'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { 
  VocabularyExercise, 
  WarmupExercise, 
  DialogueExercise, 
  ComprehensionExercise, 
  RolePlayExercise, 
  DiscussionExercise,
  PreparationExercise,
  FinalPrepExercise
} from '@/components/lesson/EngooLessonComponents'

/**
 * Individual Lesson View Page
 * 
 * Displays a generated lesson with full content structure:
 * - Header/Overview with objectives, skills, vocabulary
 * - Exercise 1: Controlled Input
 * - Exercise 2: Structured Practice  
 * - Exercise 3: Freer Production
 * - Exercise 4: Optional Extension
 * 
 * Includes back navigation to student profile
 */

interface LessonData {
  id: string
  title: string
  overview: string | null
  content: {
    title: string
    lessonType: string
    difficulty: number
    duration: number
    objective: string
    skills: string[]
    vocabulary: (string | { word?: string; term?: string; definition?: string; example?: string })[]
    context: string
    exercises: {
      type: string
      title: string
      description: string
      content: string | string[] | object
      timeMinutes: number
    }[]
    homework?: string
    materials?: string[]
    teachingNotes?: string
  }
  createdAt: Date
  student: {
    id: string
    name: string
    targetLanguage: string
    level: string
  }
}

export default function LessonPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const lessonId = params.id as string

  const [lesson, setLesson] = useState<LessonData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch lesson data
  useEffect(() => {
    const fetchLesson = async () => {
      if (session && lessonId) {
        try {
          setLoading(true)
          setError(null)
          
          const response = await fetch(`/api/lessons/${lessonId}`)
          const data = await response.json()
          
          if (response.ok) {
            setLesson(data)
          } else {
            setError(data.error || 'Failed to load lesson')
          }
        } catch (err) {
          console.error('Error fetching lesson:', err)
          setError('Failed to load lesson. Please try again.')
        } finally {
          setLoading(false)
        }
      }
    }

    fetchLesson()
  }, [session, lessonId])

  // Redirect if not authenticated
  useEffect(() => {
    if (status === 'loading') return
    if (!session) {
      router.push('/login')
      return
    }
  }, [session, status, router])

  const getExerciseIcon = (type: string) => {
    switch (type) {
      case 'vocabulary':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C20.832 18.477 19.246 18 17.5 18c-1.746 0-3.332.477-4.5 1.253z" />
          </svg>
        )
      case 'expressions':
      case 'dialogue':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        )
      case 'roleplay':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        )
      case 'discussion':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
          </svg>
        )
      case 'grammar':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        )
      case 'article':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
          </svg>
        )
      case 'fill_blanks':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        )
      case 'sentence_building':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
          </svg>
        )
      case 'preparation':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        )
      case 'final-prep':
      case 'finalPrep':
      case 'finalprep':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
          </svg>
        )
      default:
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )
    }
  }

  const renderExerciseContent = (exercise: { type: string; content: unknown; timeMinutes: number }) => {
    // Type assertion for content - we know the structure from our AI generation
    const content = exercise.content as Record<string, unknown>

    switch (exercise.type) {
      case 'vocabulary':
        if (content?.vocabulary && Array.isArray(content.vocabulary)) {
          return <VocabularyExercise vocabulary={content.vocabulary} />
        }
        break
      
      case 'warmup':
        if (content?.questions && Array.isArray(content.questions)) {
          return <WarmupExercise questions={content.questions} instructions={content.instructions as string} />
        }
        break
      
      case 'dialogue':
        if (content?.dialogue && Array.isArray(content.dialogue)) {
          // Extract unique speakers from dialogue to create characters array
          const speakers = [...new Set(
            content.dialogue.map((line: Record<string, unknown>) => 
              (line.speaker || line.character || 'Unknown') as string
            )
          )];
          const characters = speakers.map(speaker => ({ name: speaker }));
          
          // Transform dialogue format to match component expectations
          const transformedDialogue = content.dialogue.map((line: Record<string, unknown>) => ({
            character: (line.speaker || line.character || 'Unknown') as string,
            text: (line.line || line.text || '') as string
          }));
          
          const setting = content.setting as string || content.context as string || '';
          
          return (
            <DialogueExercise
              context={setting}
              characters={characters}
              dialogue={transformedDialogue}
              instructions={content.instructions as string || ''}
            />
          )
        }
        break
      
      case 'comprehension':
        if (content?.questions && Array.isArray(content.questions)) {
          return <ComprehensionExercise questions={content.questions} />
        }
        break
      
      case 'roleplay':
        if (content?.scenario && content?.roles && Array.isArray(content.roles)) {
          return (
            <RolePlayExercise
              scenario={content.scenario as string}
              roles={content.roles}
              instructions={content.instructions as string || ''}
              timeMinutes={exercise.timeMinutes}
            />
          )
        }
        break
      
      case 'discussion':
        if (content?.questions && Array.isArray(content.questions)) {
          return <DiscussionExercise questions={content.questions} instructions={content.instructions as string} />
        }
        break

      case 'preparation':
        if (content?.questions && Array.isArray(content.questions)) {
          return <PreparationExercise questions={content.questions} tips={content.tips as string[]} />
        }
        break

      case 'final-prep':
      case 'finalPrep':
      case 'finalprep':
        return (
          <FinalPrepExercise 
            phrases={content.phrases as string[] || []}
            checklist={content.checklist as string[] || []}
            confidence={content.confidence as string[] || []}
          />
        )
      
      default:
        // Fallback for other exercise types or malformed content
        return (
          <div className="whitespace-pre-wrap text-gray-900 dark:text-white">
            {typeof exercise.content === 'string' ? exercise.content : JSON.stringify(exercise.content, null, 2)}
          </div>
        )
    }

    // Fallback if content doesn't match expected structure
    return (
      <div className="whitespace-pre-wrap text-gray-900 dark:text-white">
        {typeof exercise.content === 'string' ? exercise.content : JSON.stringify(exercise.content, null, 2)}
      </div>
    )
  }

  const getExerciseTitle = (type: string) => {
    switch (type) {
      case 'vocabulary':
        return 'Vocabulary'
      case 'expressions':
        return 'Useful Expressions'
      case 'dialogue':
        return 'Dialogue Practice'
      case 'roleplay':
        return 'Role Play'
      case 'discussion':
        return 'Discussion'
      case 'grammar':
        return 'Grammar Focus'
      case 'article':
        return 'Article Reading'
      case 'fill_blanks':
        return 'Fill in the Blanks'
      case 'sentence_building':
        return 'Sentence Building'
      default:
        return type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
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
      <div className="h-full flex flex-col">
        <div className="flex-1 overflow-y-auto">
          <div className="p-4 sm:p-6 lg:p-8">
            {/* Loading State */}
            {loading && (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary mx-auto"></div>
                  <p className="mt-2 text-sm sm:text-base text-gray-600 dark:text-gray-400">Loading lesson...</p>
                </div>
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 sm:p-6">
                <p className="text-sm sm:text-base text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}

            {/* Lesson Content */}
            {!loading && !error && lesson && (
          <div className="space-y-4 sm:space-y-6">
            {/* Header with Back Button */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
              <Link
                href={`/dashboard/students/${lesson.student.id}`}
                className="inline-flex items-center text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 text-sm sm:text-base"
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to {lesson.student.name}
              </Link>
              
              <Link
                href={`/lessons/${lessonId}/share`}
                target="_blank"
                className="inline-flex items-center justify-center px-3 sm:px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm sm:text-base w-full sm:w-auto"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                </svg>
                Share Lesson
              </Link>
            </div>

            {/* Lesson Header */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6 lg:p-8">
              <div className="mb-4 sm:mb-6">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  {lesson.content.title}
                </h1>
                <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 mb-3 sm:mb-4">
                  {lesson.content.objective}
                </p>
                <div className="flex flex-wrap gap-3 sm:gap-4 text-xs sm:text-sm">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-gray-500 dark:text-gray-400">Student:</span>
                    <span className="text-gray-900 dark:text-white">{lesson.student.name}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-gray-500 dark:text-gray-400">Level:</span>
                    <span className="text-gray-900 dark:text-white">{lesson.student.level}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-gray-500 dark:text-gray-400">Duration:</span>
                    <span className="text-gray-900 dark:text-white">{lesson.content.duration} minutes</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-gray-500 dark:text-gray-400">Lesson Type:</span>
                    <span className="px-2 py-1 bg-brand-primary/10 text-brand-primary rounded-full text-xs font-medium">
                      {lesson.content.lessonType}
                    </span>
                  </div>
                </div>
              </div>

              {/* Lesson Overview */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2 text-sm sm:text-base">Skills Practiced</h3>
                  <div className="flex flex-wrap gap-2">
                    {lesson.content.skills.map((skill) => (
                      <span key={skill} className="px-2 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400 rounded text-xs sm:text-sm">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2 text-sm sm:text-base">Key Vocabulary</h3>
                  <div className="flex flex-wrap gap-2">
                    {lesson.content.vocabulary.slice(0, 6).map((word, index) => {
                      // Handle both string vocabulary and object vocabulary
                      const displayWord = typeof word === 'string' ? word : (word.word || word.term || String(word));
                      const key = typeof word === 'string' ? word : `vocab-${index}`;
                      
                      return (
                        <span key={key} className="px-2 py-1 bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400 rounded text-xs sm:text-sm">
                          {displayWord}
                        </span>
                      );
                    })}
                    {lesson.content.vocabulary.length > 6 && (
                      <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded text-xs sm:text-sm">
                        +{lesson.content.vocabulary.length - 6} more
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2 text-sm sm:text-base">Context</h3>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                    {lesson.content.context}
                  </p>
                  <div className="mt-2">
                    <span className="font-medium text-gray-500 dark:text-gray-400 text-xs sm:text-sm">Difficulty: </span>
                    <span className="text-xs sm:text-sm text-gray-900 dark:text-white">{lesson.content.difficulty}/10</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Lesson Exercises */}
            <div className="space-y-4 sm:space-y-6">
              {lesson.content.exercises.map((exercise, index) => (
                <div key={index} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
                  <div className="flex items-start sm:items-center space-x-3 sm:space-x-4 mb-3 sm:mb-4">
                    <div className="flex items-center space-x-3 min-w-0 flex-1">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-brand-primary text-white rounded-full flex items-center justify-center flex-shrink-0">
                        {getExerciseIcon(exercise.type)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white truncate">
                          {exercise.title}
                        </h3>
                        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                          {getExerciseTitle(exercise.type)} • {exercise.timeMinutes} minutes
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 mb-3 sm:mb-4">
                    {exercise.description}
                  </p>
                  
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 sm:p-4 overflow-x-auto">
                    {renderExerciseContent(exercise)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* No Lesson Found */}
        {!loading && !lesson && !error && (
          <div className="text-center py-8 sm:py-12 px-4">
            <svg className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C20.832 18.477 19.246 18 17.5 18c-1.746 0-3.332.477-4.5 1.253z" />
            </svg>
            <h3 className="mt-2 text-sm sm:text-base font-semibold text-gray-900 dark:text-white">
              Lesson not found
            </h3>
            <p className="mt-1 text-xs sm:text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto">
              The lesson you&apos;re looking for doesn&apos;t exist or you don&apos;t have permission to view it.
            </p>
            <div className="mt-4 sm:mt-6">
              <Link
                href="/dashboard/students"
                className="inline-flex items-center px-3 sm:px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-brand-primary hover:bg-brand-accent"
              >
                <svg className="-ml-1 mr-2 h-4 w-4 sm:h-5 sm:w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Students
              </Link>
            </div>
          </div>
        )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}