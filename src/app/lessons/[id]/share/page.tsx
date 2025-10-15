'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { useTheme } from 'next-themes'
import Link from 'next/link'
import Image from 'next/image'
import ClientThemeProvider from '@/components/ClientThemeProvider'
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
 * Shareable Lesson View
 * 
 * Clean, distraction-free lesson view for sharing with students
 * - No sidebar or navigation
 * - Just company logo and lesson content
 * - Optimized for reading and studying
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

export default function ShareableLessonPage() {
  const params = useParams()
  const lessonId = params.id as string
  const { theme, setTheme } = useTheme()

  const [lesson, setLesson] = useState<LessonData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)

  // Handle hydration to prevent theme flashing
  useEffect(() => {
    setMounted(true)
  }, [])

  // Theme-aware logo paths with fallback for SSR
  const logoSrc = mounted && theme === 'light' ? '/logo.svg' : '/white-logo.svg'
  const nameSrc = mounted && theme === 'light' ? '/name.svg' : '/white-name.svg'

  // Fetch lesson data (no auth required for shared view)
  useEffect(() => {
    const fetchLesson = async () => {
      if (lessonId) {
        try {
          setLoading(true)
          setError(null)
          
          const response = await fetch(`/api/lessons/${lessonId}/share`)
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
  }, [lessonId])

  const getExerciseIcon = (type: string) => {
    switch (type) {
      case 'controlled-input':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C20.832 18.477 19.246 18 17.5 18c-1.746 0-3.332.477-4.5 1.253z" />
          </svg>
        )
      case 'structured-practice':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        )
      case 'freer-production':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        )
      case 'extension':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        )
      case 'preparation':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
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
      case 'controlled-input':
        return 'Controlled Input'
      case 'structured-practice':
        return 'Structured Practice'
      case 'freer-production':
        return 'Freer Production'
      case 'extension':
        return 'Extension Activity'
      default:
        return type
    }
  }

  return (
    <ClientThemeProvider>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Simple Header with Logo */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-3">
            <Image
              src={logoSrc}
              alt="Avidato Logo"
              width={32}
              height={32}
              className="w-8 h-8"
            />
            <Image
              src={nameSrc}
              alt="Avidato"
              width={80}
              height={24}
              className="h-6"
            />
          </Link>
          
          {/* Theme Toggle */}
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            aria-label="Toggle theme"
          >
            <svg
              className="w-5 h-5 text-gray-700 dark:text-gray-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {theme === 'dark' ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                />
              )}
            </svg>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto p-6 lg:p-8">
        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary mx-auto"></div>
            <p className="mt-2 text-gray-600 dark:text-gray-400">Loading lesson...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 text-center">
            <h3 className="text-lg font-semibold text-red-800 dark:text-red-400 mb-2">
              Unable to Load Lesson
            </h3>
            <p className="text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* Lesson Content */}
        {!loading && !error && lesson && (
          <div className="space-y-8">
            {/* Lesson Header */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8">
              <div className="text-center mb-8">
                <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                  {lesson.content.title}
                </h1>
                <p className="text-xl text-gray-600 dark:text-gray-400 mb-6">
                  {lesson.content.objective}
                </p>
                <div className="flex justify-center flex-wrap gap-6 text-sm">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-gray-500 dark:text-gray-400">Duration:</span>
                    <span className="text-gray-900 dark:text-white">{lesson.content.duration} minutes</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-gray-500 dark:text-gray-400">Level:</span>
                    <span className="text-gray-900 dark:text-white">{lesson.student.level}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-gray-500 dark:text-gray-400">Type:</span>
                    <span className="px-3 py-1 bg-brand-primary/10 text-brand-primary rounded-full text-sm font-medium">
                      {lesson.content.lessonType}
                    </span>
                  </div>
                </div>
              </div>

              {/* Lesson Overview */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="text-center">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Skills You&apos;ll Practice</h3>
                  <div className="flex flex-wrap justify-center gap-2">
                    {lesson.content.skills.map((skill) => (
                      <span key={skill} className="px-3 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400 rounded-full text-sm">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div className="text-center">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Key Vocabulary</h3>
                  <div className="flex flex-wrap justify-center gap-2">
                    {lesson.content.vocabulary.slice(0, 8).map((word, index) => {
                      // Handle both string vocabulary and object vocabulary
                      const displayWord = typeof word === 'string' ? word : (word.word || word.term || String(word));
                      const key = typeof word === 'string' ? word : `vocab-${index}`;
                      
                      return (
                        <span key={key} className="px-3 py-1 bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400 rounded-full text-sm">
                          {displayWord}
                        </span>
                      );
                    })}
                    {lesson.content.vocabulary.length > 8 && (
                      <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full text-sm">
                        +{lesson.content.vocabulary.length - 8} more
                      </span>
                    )}
                  </div>
                </div>

                <div className="text-center">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Context</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-2">
                    {lesson.content.context}
                  </p>
                  <div>
                    <span className="font-medium text-gray-500 dark:text-gray-400 text-sm">Difficulty: </span>
                    <span className="text-sm text-gray-900 dark:text-white">{lesson.content.difficulty}/10</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Lesson Activities */}
            <div className="space-y-8">
              {lesson.content.exercises.map((exercise, index) => (
                <div key={index} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8">
                  <div className="flex items-center space-x-4 mb-6">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-brand-primary text-white rounded-xl flex items-center justify-center">
                        {getExerciseIcon(exercise.type)}
                      </div>
                      <div>
                        <h3 className="text-2xl font-semibold text-gray-900 dark:text-white">
                          {exercise.title}
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400">
                          {getExerciseTitle(exercise.type)} • {exercise.timeMinutes} minutes
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
                    {exercise.description}
                  </p>
                  
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    {renderExerciseContent(exercise)}
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="text-center py-8 border-t border-gray-200 dark:border-gray-700">
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                Lesson created with Avidato • Generated on {new Date(lesson.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        )}

        {/* No Lesson Found */}
        {!loading && !lesson && !error && (
          <div className="text-center py-16">
            <svg className="mx-auto h-16 w-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C20.832 18.477 19.246 18 17.5 18c-1.746 0-3.332.477-4.5 1.253z" />
            </svg>
            <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
              Lesson Not Available
            </h3>
            <p className="text-lg text-gray-500 dark:text-gray-400 mb-8">
              This lesson may have been removed or is no longer accessible.
            </p>
            <Link
              href="/"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-brand-primary hover:bg-brand-accent"
            >
              Visit Avidato
            </Link>
          </div>
        )}
      </main>
    </div>
    </ClientThemeProvider>
  )
}