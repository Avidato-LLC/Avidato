/**
 * Challenge Exercise Renderer
 * 
 * Displays an optional extension or creative challenge activity
 * Duration: 5-7 minutes (optional)
 */

import React from 'react'

interface ChallengeRendererProps {
  title: string
  description: string
  instructions: string
  content: string
  timeMinutes: number
  level?: 'medium' | 'hard' | 'advanced'
}

export const ChallengeRenderer: React.FC<ChallengeRendererProps> = ({
  description,
  instructions,
  content,
  timeMinutes,
  level = 'advanced',
}) => {
  const [isAccepted, setIsAccepted] = React.useState(false)

  const getLevelColor = () => {
    switch (level) {
      case 'medium':
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 border-yellow-300 dark:border-yellow-700'
      case 'hard':
        return 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 border-orange-300 dark:border-orange-700'
      case 'advanced':
      default:
        return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-300 dark:border-red-700'
    }
  }

  return (
    <div className="space-y-4">
      {/* Challenge Header */}
      <div className={`border-l-4 pl-4 ${getLevelColor().split(' ')[0]} ${getLevelColor().split(' ')[1]} ${getLevelColor().split(' ')[2]}`}>
        <div className="flex items-center gap-2 mb-2">
          <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold border-2 ${getLevelColor()}`}>
            🏆 {level.toUpperCase()} CHALLENGE
          </span>
        </div>
        <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">{description}</p>
      </div>

      {/* Acceptance Toggle */}
      <div className={`p-4 rounded-lg border-2 transition-all ${
        isAccepted
          ? 'bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-700'
          : 'bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600'
      }`}>
        <button
          onClick={() => setIsAccepted(!isAccepted)}
          className={`w-full text-left flex items-center gap-3 transition-all ${
            isAccepted ? 'text-green-700 dark:text-green-300' : 'text-gray-700 dark:text-gray-300'
          }`}
        >
          <div
            className={`flex-shrink-0 w-6 h-6 rounded border-2 flex items-center justify-center transition-all ${
              isAccepted
                ? 'bg-green-500 border-green-500'
                : 'border-gray-400 dark:border-gray-500'
            }`}
          >
            {isAccepted && <span className="text-white text-sm font-bold">✓</span>}
          </div>
          <span className="font-semibold flex-1">
            {isAccepted ? 'Challenge Accepted! 💪' : 'Accept the Challenge'}
          </span>
        </button>
      </div>

      {/* Challenge Content - Only shown if accepted */}
      {isAccepted && (
        <div className="space-y-4 animate-in fade-in-50 duration-300">
          {/* Instructions */}
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">📋 Instructions:</p>
            <p className="text-sm text-gray-900 dark:text-white">{instructions}</p>
          </div>

          {/* Challenge Details */}
          <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 p-4 rounded-lg">
            <p className="text-sm font-medium text-indigo-800 dark:text-indigo-300 mb-2">🎯 Your Task:</p>
            <p className="text-sm text-indigo-900 dark:text-indigo-200 whitespace-pre-wrap">
              {content}
            </p>
          </div>

          {/* Time & Difficulty */}
          <div className="flex gap-4 text-sm font-medium text-gray-600 dark:text-gray-400">
            <span>⏱️ {timeMinutes} minutes</span>
            <span>📊 Difficulty: {level}</span>
          </div>

          {/* Motivation */}
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 p-4 rounded-lg">
            <p className="text-sm text-yellow-800 dark:text-yellow-300">
              ⚡ <strong>This challenge will help you:</strong>
            </p>
            <ul className="text-sm text-yellow-700 dark:text-yellow-400 space-y-1 ml-4 mt-2">
              <li>• Apply what you&apos;ve learned in a creative way</li>
              <li>• Build confidence in using English</li>
              <li>• Develop problem-solving skills</li>
              <li>• Have fun while learning!</li>
            </ul>
          </div>

          {/* Completion Reminder */}
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-4 rounded-lg">
            <p className="text-sm text-green-800 dark:text-green-300">
              ✅ <strong>When you finish:</strong> Share your work with your tutor and ask for feedback!
            </p>
          </div>
        </div>
      )}

      {/* Motivation when not accepted */}
      {!isAccepted && (
        <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 p-4 rounded-lg text-center">
          <p className="text-sm text-purple-800 dark:text-purple-300">
            💪 <strong>Ready to push your limits?</strong> Accept the challenge above!
          </p>
        </div>
      )}
    </div>
  )
}
