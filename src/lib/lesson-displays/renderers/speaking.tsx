/**
 * Speaking Exercise Renderer - Guided Speaking
 * 
 * Displays structured speaking prompts and questions
 * Duration: 5-6 minutes
 */

import React from 'react'

interface SpeakingPrompt {
  question: string
  guidingPoints?: string[]
  difficulty?: 'easy' | 'medium' | 'hard'
}

interface SpeakingRendererProps {
  instructions: string
  questions: SpeakingPrompt[]
  timeMinutes: number
}

export const SpeakingRenderer: React.FC<SpeakingRendererProps> = ({
  instructions,
  questions,
  timeMinutes,
}) => {
  const [currentQuestion, setCurrentQuestion] = React.useState(0)
  const [answeredIndexes, setAnsweredIndexes] = React.useState<Set<number>>(new Set())

  const toggleAnswered = (index: number) => {
    const newSet = new Set(answeredIndexes)
    if (newSet.has(index)) {
      newSet.delete(index)
    } else {
      newSet.add(index)
    }
    setAnsweredIndexes(newSet)
  }

  const getDifficultyColor = (difficulty?: string) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
      case 'medium':
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
      case 'hard':
        return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
      default:
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
    }
  }

  return (
    <div className="space-y-4">
      {/* Header Info */}
      <div className="border-l-4 border-cyan-500 pl-4 mb-4">
        <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">{instructions}</p>
        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
          ⏱️ {timeMinutes} minutes
        </p>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
            Progress: {answeredIndexes.size} of {questions.length}
          </span>
          <span className="text-sm font-medium text-cyan-600 dark:text-cyan-400">
            Current: {currentQuestion + 1}
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div
            className="bg-cyan-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Questions */}
      <div className="space-y-3">
        {questions.map((question, index) => (
          <div
            key={index}
            className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
              currentQuestion === index
                ? 'border-cyan-500 bg-cyan-50 dark:bg-cyan-900/20'
                : answeredIndexes.has(index)
                  ? 'border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-900/20'
                  : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
            }`}
            onClick={() => setCurrentQuestion(index)}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="flex-shrink-0 w-6 h-6 bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400 rounded-full flex items-center justify-center text-sm font-bold">
                    {index + 1}
                  </span>
                  <h4 className="text-gray-900 dark:text-white font-semibold flex-1">
                    {question.question}
                  </h4>
                  {question.difficulty && (
                    <span className={`text-xs font-medium px-2 py-1 rounded ${getDifficultyColor(question.difficulty)}`}>
                      {question.difficulty.charAt(0).toUpperCase() + question.difficulty.slice(1)}
                    </span>
                  )}
                </div>

                {currentQuestion === index && question.guidingPoints && (
                  <div className="mt-3 space-y-2 pl-8">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                      💡 Consider mentioning:
                    </p>
                    {question.guidingPoints.map((point, pIndex) => (
                      <div key={pIndex} className="flex items-start gap-2">
                        <span className="text-cyan-600 dark:text-cyan-400 mt-0.5">•</span>
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          {point}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation()
                  toggleAnswered(index)
                }}
                className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center transition-all"
                style={{
                  backgroundColor: answeredIndexes.has(index) ? '#10b981' : '#e5e7eb',
                  color: answeredIndexes.has(index) ? 'white' : '#9ca3af',
                }}
              >
                {answeredIndexes.has(index) ? '✓' : ''}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Speaking Tips */}
      <div className="bg-cyan-50 dark:bg-cyan-900/20 border border-cyan-200 dark:border-cyan-800 rounded-lg p-4">
        <p className="text-sm text-cyan-800 dark:text-cyan-300 mb-2">
          🎤 <strong>Speaking Tips:</strong>
        </p>
        <ul className="text-sm text-cyan-700 dark:text-cyan-400 space-y-1 ml-4">
          <li>• Speak slowly and clearly</li>
          <li>• Use complete sentences when possible</li>
          <li>• It&apos;s okay to make mistakes - that&apos;s how we learn!</li>
          <li>• Mark questions as ✓ when you&apos;ve practiced</li>
        </ul>
      </div>
    </div>
  )
}
