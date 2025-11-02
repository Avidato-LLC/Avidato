/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/lesson/LessonLoader.tsx
'use client'

import { useState, useEffect } from 'react'
import { 
  VocabularyExercise, 
  DialogueExercise, 
  FinalPrepExercise,
  PreparationExercise,
  DiscussionExercise 
} from './EngooLessonComponents'

interface Exercise {
  type: string
  content: Record<string, unknown>
  title: string
  timeMinutes: number
}

interface LessonLoaderProps {
  exercises: Exercise[]
  priorityCount?: number // Load first N exercises immediately
}

export function LessonLoader({ exercises, priorityCount = 2 }: LessonLoaderProps) {
  const [loadedCount, setLoadedCount] = useState(priorityCount)

  // Load more exercises when user scrolls near the end
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && loadedCount < exercises.length) {
          setLoadedCount(prev => Math.min(prev + 2, exercises.length))
        }
      },
      { threshold: 0.1, rootMargin: '200px' }
    )

    const sentinel = document.getElementById('load-more-sentinel')
    if (sentinel) observer.observe(sentinel)

    return () => observer.disconnect()
  }, [loadedCount, exercises.length])

  const renderExercise = (exercise: Exercise) => {
    const content = exercise.content

    switch (exercise.type) {
      case 'vocabulary':
        return <VocabularyExercise vocabulary={content.vocabulary as any[]} />
      
      case 'dialogue':
        // Transform dialogue format as we did before
        const speakers = [...new Set(
          (content.dialogue as any[])?.map((line: any) => 
            line.speaker || line.character || 'Unknown'
          ) || []
        )]
        const characters = speakers.map(speaker => ({ name: speaker }))
        const transformedDialogue = (content.dialogue as any[])?.map((line: any) => ({
          character: line.speaker || line.character || 'Unknown',
          text: line.line || line.text || ''
        })) || []
        
        return (
          <DialogueExercise
            context={content.setting as string || content.context as string || ''}
            characters={characters}
            dialogue={transformedDialogue}
            instructions={content.instructions as string || ''}
          />
        )
      
      case 'finalprep':
        return (
          <FinalPrepExercise 
            phrases={content.phrases as string[] || []}
            checklist={content.checklist as string[] || []}
            confidence={content.confidence as string[] || []}
          />
        )
      
      case 'preparation':
        return (
          <PreparationExercise 
            questions={content.questions as string[] || []}
            tips={content.tips as string[] || []}
          />
        )
      
      case 'discussion':
        return (
          <DiscussionExercise 
            questions={content.questions as string[] || []}
            instructions={content.instructions as string || ''}
          />
        )
      
      default:
        // Fallback for unknown exercise types
        return (
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              Exercise type: {exercise.type}
            </p>
            <pre className="text-xs overflow-auto">
              {JSON.stringify(content, null, 2)}
            </pre>
          </div>
        )
    }
  }

  return (
    <div className="space-y-8">
      {exercises.slice(0, loadedCount).map((exercise, index) => (
        <div key={index} className="border-b border-gray-200 dark:border-gray-700 pb-8 last:border-b-0">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">
              {index + 1}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {exercise.title}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {exercise.timeMinutes} minutes
              </p>
            </div>
          </div>
          
          {index < priorityCount ? (
            // Render immediately for priority exercises
            renderExercise(exercise)
          ) : (
            // Lazy render for subsequent exercises
            <div className="min-h-[200px]">
              {renderExercise(exercise)}
            </div>
          )}
        </div>
      ))}
      
      {loadedCount < exercises.length && (
        <div id="load-more-sentinel" className="h-20 flex items-center justify-center">
          <div className="animate-pulse text-gray-500 dark:text-gray-400">
            Loading more exercises...
          </div>
        </div>
      )}
    </div>
  )
}