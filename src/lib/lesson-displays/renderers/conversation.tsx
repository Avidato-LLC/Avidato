/**
 * Conversation Exercise Renderer - Free Conversation
 * 
 * Displays open-ended conversation starters and discussion prompts
 * Duration: 5-6 minutes
 */

import React from 'react'

interface ConversationPrompt {
  question: string
  followUpQuestions?: string[]
  vocabulary?: string[]
}

interface ConversationRendererProps {
  instructions: string
  questions: ConversationPrompt[]
  timeMinutes: number
}

export const ConversationRenderer: React.FC<ConversationRendererProps> = ({
  instructions,
  questions,
  timeMinutes,
}) => {
  const [expandedIndex, setExpandedIndex] = React.useState<number | null>(null)

  return (
    <div className="space-y-4">
      {/* Header Info */}
      <div className="border-l-4 border-emerald-500 pl-4 mb-4">
        <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">{instructions}</p>
        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
          ⏱️ {timeMinutes} minutes
        </p>
      </div>

      {/* Conversation Prompts */}
      <div className="space-y-3">
        {questions.map((prompt, index) => (
          <div
            key={index}
            className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:border-emerald-300 dark:hover:border-emerald-700 transition-colors cursor-pointer"
            onClick={() => setExpandedIndex(expandedIndex === index ? null : index)}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-start gap-2 mb-2">
                  <span className="flex-shrink-0 w-6 h-6 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center text-sm font-bold">
                    {index + 1}
                  </span>
                  <h4 className="text-gray-900 dark:text-white font-semibold flex-1">
                    {prompt.question}
                  </h4>
                </div>

                {expandedIndex === index && (
                  <div className="mt-4 ml-8 space-y-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                    {/* Follow-up Questions */}
                    {prompt.followUpQuestions && prompt.followUpQuestions.length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                          Follow-up Questions:
                        </p>
                        <ul className="space-y-1 ml-3">
                          {prompt.followUpQuestions.map((q, qIndex) => (
                            <li key={qIndex} className="text-sm text-gray-700 dark:text-gray-300 flex items-start">
                              <span className="text-emerald-500 mr-2">•</span>
                              <span>{q}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Vocabulary Support */}
                    {prompt.vocabulary && prompt.vocabulary.length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                          Useful Vocabulary:
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {prompt.vocabulary.map((term, vIndex) => (
                            <span
                              key={vIndex}
                              className="px-2 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs rounded"
                            >
                              {term}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <svg
                className={`flex-shrink-0 w-5 h-5 text-gray-400 dark:text-gray-500 transition-transform ${
                  expandedIndex === index ? 'rotate-180' : ''
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </div>
          </div>
        ))}
      </div>

      {/* Conversation Tips */}
      <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg p-4">
        <p className="text-sm text-emerald-800 dark:text-emerald-300 mb-2">
          💬 <strong>Conversation Tips:</strong>
        </p>
        <ul className="text-sm text-emerald-700 dark:text-emerald-400 space-y-1 ml-4">
          <li>• Don&apos;t memorize - have a natural conversation</li>
          <li>• Ask your tutor follow-up questions too</li>
          <li>• If you don&apos;t understand, ask for clarification</li>
          <li>• Share your real opinions and experiences!</li>
        </ul>
      </div>

      {/* Reflection */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <p className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-2">
          ✨ After the conversation, reflect on:
        </p>
        <ul className="text-sm text-blue-700 dark:text-blue-400 space-y-1 ml-4">
          <li>• What phrases helped me communicate?</li>
          <li>• What did I struggle with?</li>
          <li>• What would I do differently next time?</li>
        </ul>
      </div>
    </div>
  )
}
