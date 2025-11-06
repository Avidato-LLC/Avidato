/**
 * Warm-Up Exercise Renderer - Under 18
 * 
 * Displays ice-breaker questions to get the student ready for the lesson
 * Questions can be either strings OR objects with question/hint properties
 */

import React from 'react'

const safeReplace = (text: string | undefined | null): string => {
  return (text || '').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
}

interface WarmUpQuestion {
  question?: string
  hint?: string
}

type WarmUpQuestionData = string | WarmUpQuestion

interface WarmUpRendererProps {
  title: string
  description: string
  instructions: string
  questions: WarmUpQuestionData[]
  timeMinutes: number
}

export const WarmUpRenderer: React.FC<WarmUpRendererProps> = ({
  instructions,
  questions,
  timeMinutes,
}) => {
  // Normalize questions to handle both string[] and object[] formats
  const normalizedQuestions = questions?.map(q => 
    typeof q === 'string' 
      ? { question: q, hint: undefined }
      : q
  ) || []

  return (
    <div className="space-y-4">
      {/* Header Info */}
      <div className="border-l-4 border-blue-500 pl-4 mb-4">
        <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">{instructions}</p>
        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
          ⏱️ {timeMinutes} minutes
        </p>
      </div>

      {/* Questions - Always Visible */}
      <div className="space-y-3">
        {normalizedQuestions && normalizedQuestions.length > 0 ? (
          normalizedQuestions.map((q, index) => (
            <div key={index} className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="flex gap-4">
                <span className="flex-shrink-0 w-8 h-8 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center text-sm font-semibold">
                  {index + 1}
                </span>
                <div className="flex-1">
                  <p className="text-gray-900 dark:text-white font-medium mb-2 leading-relaxed">
                    <span dangerouslySetInnerHTML={{ __html: safeReplace(q?.question) }} />
                  </p>
                  {q?.hint && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 italic">
                      💡 Hint: {q.hint}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-600 dark:text-gray-400 text-center py-4">No questions available</p>
        )}
      </div>

      {/* Student Response Area */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mt-4">
        <p className="text-sm text-blue-800 dark:text-blue-300">
          💭 <strong>Your turn:</strong> Answer each question spontaneously. It&apos;s okay if your answers aren&apos;t perfect!
        </p>
      </div>
    </div>
  )
}
