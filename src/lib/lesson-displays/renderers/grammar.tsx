/**
 * Grammar Exercise Renderer - Correct the Mistake
 * 
 * Displays sentences with errors for students to identify and correct
 * Duration: 4-5 minutes
 */

import React from 'react'

interface GrammarSentence {
  incorrect: string
  correct: string
}

interface GrammarRendererProps {
  title: string
  instructions: string
  sentences: GrammarSentence[]
  timeMinutes: number
}

export const GrammarRenderer: React.FC<GrammarRendererProps> = ({
  instructions,
  sentences,
  timeMinutes,
}) => {
  const [revealedIndexes, setRevealedIndexes] = React.useState<Set<number>>(new Set())

  const toggleReveal = (index: number) => {
    const newSet = new Set(revealedIndexes)
    if (newSet.has(index)) {
      newSet.delete(index)
    } else {
      newSet.add(index)
    }
    setRevealedIndexes(newSet)
  }

  return (
    <div className="space-y-4">
      {/* Header Info */}
      <div className="border-l-4 border-red-500 pl-4 mb-4">
        <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">{instructions}</p>
        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
          ⏱️ {timeMinutes} minutes
        </p>
      </div>

      {/* Sentences */}
      <div className="space-y-3">
        {sentences.map((sentence, index) => (
          <div
            key={index}
            className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-3"
          >
            <div className="flex items-start gap-3">
              <span className="flex-shrink-0 w-8 h-8 bg-blue-500 dark:bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                {index + 1}
              </span>
              <div className="flex-1">
                {/* Sentence to Check */}
                <div className="mb-3">
                  <p className="text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-700 p-3 rounded italic">
                    {sentence.incorrect}
                  </p>
                </div>

                {/* Reveal Button */}
                <button
                  onClick={() => toggleReveal(index)}
                  className="text-sm px-4 py-2 rounded font-medium bg-blue-500 dark:bg-blue-600 text-white hover:bg-blue-600 dark:hover:bg-blue-700 transition-colors mb-3"
                >
                  {revealedIndexes.has(index) ? '✓ Show' : 'Show'} Correction
                </button>

                {/* Correct Sentence */}
                {revealedIndexes.has(index) && (
                  <div>
                    <p className="text-xs font-medium text-green-600 dark:text-green-400 mb-1">✅ Correct:</p>
                    <p className="text-gray-900 dark:text-white bg-green-50 dark:bg-green-900/20 p-3 rounded font-medium">
                      {sentence.correct}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Study Tip */}
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mt-4">
        <p className="text-sm text-red-800 dark:text-red-300">
          🎓 <strong>Learning Strategy:</strong> Try to find the error BEFORE clicking show. This helps your brain learn!
        </p>
      </div>
    </div>
  )
}
