/**
 * Discussion Exercise Renderer
 * 
 * Displays discussion questions for open-ended conversation practice
 * Students discuss and debate questions using new vocabulary
 * Duration: 8-12 minutes
 */

import React from 'react'

interface DiscussionRendererProps {
  title: string
  instructions: string
  questions: string[]
  timeMinutes: number
}

export const DiscussionRenderer: React.FC<DiscussionRendererProps> = ({
  instructions,
  questions,
  timeMinutes,
}) => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-l-4 border-cyan-500 pl-4 mb-6">
        <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">{instructions}</p>
        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
          ⏱️ {timeMinutes} minutes • {questions.length} questions
        </p>
      </div>

      {/* Discussion Questions - No Dropdowns */}
      <div className="space-y-3">
        {questions.map((question, index) => (
          <div
            key={index}
            className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 sm:p-6"
          >
            <div className="flex items-start gap-3">
              <span className="flex-shrink-0 w-8 h-8 bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400 rounded-full flex items-center justify-center text-sm font-bold">
                {index + 1}
              </span>
              <p className="text-gray-900 dark:text-white font-medium leading-relaxed">
                {question}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Study Tip */}
      <div className="bg-cyan-50 dark:bg-cyan-900/20 border border-cyan-200 dark:border-cyan-800 rounded-lg p-4">
        <p className="text-sm text-cyan-800 dark:text-cyan-300">
          🎯 <strong>Practice:</strong> Have these discussions with a partner or record yourself
          answering these questions. The goal is to communicate naturally using the lesson
          vocabulary!
        </p>
      </div>
    </div>
  )
}
