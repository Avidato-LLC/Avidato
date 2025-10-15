// src/components/lesson/LazyLessonContent.tsx
import { Suspense, lazy } from 'react'

// Import types
import type { VocabularyItem, DialogueLine } from '@/types/lesson-template'

// Lazy load heavy exercise components
const VocabularyExercise = lazy(() => 
  import('./EngooLessonComponents').then(module => ({ 
    default: module.VocabularyExercise 
  }))
)

const DialogueExercise = lazy(() => 
  import('./EngooLessonComponents').then(module => ({ 
    default: module.DialogueExercise 
  }))
)

const FinalPrepExercise = lazy(() => 
  import('./EngooLessonComponents').then(module => ({ 
    default: module.FinalPrepExercise 
  }))
)

// Loading skeleton for exercises
function ExerciseLoadingSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
      <div className="space-y-2">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-4/6"></div>
      </div>
    </div>
  )
}

export function LazyExerciseRenderer({ 
  exercise 
}: { 
  exercise: { type: string; content: unknown } 
}) {
  const content = exercise.content as Record<string, unknown>

  return (
    <Suspense fallback={<ExerciseLoadingSkeleton />}>
      {exercise.type === 'vocabulary' && (
        <VocabularyExercise vocabulary={content.vocabulary as VocabularyItem[]} />
      )}
      {exercise.type === 'dialogue' && (
        <DialogueExercise 
          context=""
          characters={[]}
          dialogue={content.dialogue as DialogueLine[]}
        />
      )}
      {exercise.type === 'finalprep' && (
        <FinalPrepExercise 
          phrases={content.phrases as string[] || []}
          checklist={content.checklist as string[] || []}
          confidence={content.confidence as string[] || []}
        />
      )}
    </Suspense>
  )
}