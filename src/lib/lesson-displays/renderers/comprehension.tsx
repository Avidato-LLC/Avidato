/**
 * Comprehension Exercise Renderer
 * 
 * Displays comprehension questions about dialogue or text content
 * Students answer multiple-choice or open-ended questions
 * Duration: 5-8 minutes
 */

import React from 'react'

interface ComprehensionQuestion {
  question: string
  type?: 'multiple-choice' | 'open-ended' | 'true-false'
  options?: string[]
  answer?: string
}

interface ComprehensionRendererProps {
  title: string
  instructions: string
  questions: ComprehensionQuestion[]
  timeMinutes: number
}

export const ComprehensionRenderer: React.FC<ComprehensionRendererProps> = ({
  instructions,
  questions,
  timeMinutes,
}) => {
  const [selectedAnswers, setSelectedAnswers] = React.useState<Record<number, string>>({})
  const [answeredQuestions, setAnsweredQuestions] = React.useState<Set<number>>(new Set())

  const handleSelectAnswer = (questionIndex: number, answer: string) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionIndex]: answer,
    }))
    setAnsweredQuestions((prev) => new Set([...prev, questionIndex]))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-l-4 border-indigo-500 pl-4 mb-6">
        <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">{instructions}</p>
        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
          ⏱️ {timeMinutes} minutes • {questions.length} questions
        </p>
      </div>

      {/* Questions */}
      <div className="space-y-4">
        {questions.map((q, index) => (
          <div
            key={index}
            className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 sm:p-6"
          >
            {/* Question Number and Text */}
            <div className="mb-4">
              <div className="flex items-start gap-3 mb-2">
                <span className="flex-shrink-0 w-6 h-6 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full flex items-center justify-center text-sm font-bold">
                  {index + 1}
                </span>
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white flex-1">
                  {q.question}
                </h3>
              </div>
            </div>

            {/* Question Type Badge */}
            {q.type && (
              <div className="mb-3">
                <span className="inline-block px-2 py-1 text-xs font-medium rounded bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300">
                  {q.type === 'multiple-choice' && '📋 Multiple Choice'}
                  {q.type === 'open-ended' && '✏️ Open-ended'}
                  {q.type === 'true-false' && '✓ True/False'}
                </span>
              </div>
            )}

            {/* Multiple Choice Options */}
            {q.type === 'multiple-choice' && q.options && (
              <div className="space-y-2 mb-4">
                {q.options.map((option, optIndex) => {
                  const isSelected = selectedAnswers[index] === option
                  // Extract the letter (A, B, C, etc.) from the option text
                  const optionLetter = option.trim().charAt(0).toUpperCase()
                  const isCorrect = q.answer?.toUpperCase() === optionLetter
                  const hasAnswered = answeredQuestions.has(index)
                  const showCorrect = hasAnswered && isCorrect
                  const showWrong = hasAnswered && isSelected && !isCorrect

                  return (
                    <div key={optIndex}>
                      <button
                        onClick={() => handleSelectAnswer(index, option)}
                        className={`w-full text-left px-4 py-3 rounded-lg border-2 transition-colors ${
                          showCorrect
                            ? 'border-green-500 bg-green-100 dark:bg-green-900/40 text-green-900 dark:text-white font-medium'
                            : showWrong
                            ? 'border-red-500 bg-red-100 dark:bg-red-900/40 text-red-900 dark:text-white font-medium'
                            : isSelected
                            ? 'border-indigo-500 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-900 dark:text-white'
                            : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white hover:border-indigo-400 dark:hover:border-indigo-500'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-sm">{option}</span>
                          {showCorrect && <span className="ml-auto text-lg font-bold">✓</span>}
                          {showWrong && <span className="ml-auto text-lg font-bold">✗</span>}
                        </div>
                      </button>
                      {/* Show feedback below selected answer */}
                      {hasAnswered && isSelected && (
                        <div className={`mt-1 text-sm font-bold px-2 py-1 rounded flex items-center gap-1 ${
                          isCorrect 
                            ? 'text-green-700 dark:text-green-300 bg-green-50 dark:bg-green-900/20' 
                            : 'text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-900/20'
                        }`}>
                          {isCorrect ? (
                            <>
                              <span>✓</span>
                              <span>Correct</span>
                            </>
                          ) : (
                            <>
                              <span>✗</span>
                              <span>Incorrect</span>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}

            {/* True/False Options */}
            {q.type === 'true-false' && (
              <div className="space-y-2">
                <div className="flex gap-3 mb-4">
                  {['True', 'False'].map((option) => {
                    const isSelected = selectedAnswers[index] === option
                    const isCorrect = q.answer === option
                    const hasAnswered = answeredQuestions.has(index)
                    const showCorrect = hasAnswered && isCorrect
                    const showWrong = hasAnswered && isSelected && !isCorrect

                    return (
                      <button
                        key={option}
                        onClick={() => handleSelectAnswer(index, option)}
                        className={`flex-1 px-4 py-2 rounded-lg border-2 font-medium transition-colors ${
                          showCorrect
                            ? 'border-green-500 bg-green-100 dark:bg-green-900/40 text-green-900 dark:text-white'
                            : showWrong
                            ? 'border-red-500 bg-red-100 dark:bg-red-900/40 text-red-900 dark:text-white'
                            : isSelected
                            ? 'border-indigo-500 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-900 dark:text-white'
                            : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white hover:border-indigo-400 dark:hover:border-indigo-500'
                        }`}
                      >
                        {option}
                        {showCorrect && ' ✓'}
                        {showWrong && ' ✗'}
                      </button>
                    )
                  })}
                </div>
                {/* Show feedback below True/False */}
                {answeredQuestions.has(index) && (
                  <div className={`text-sm font-bold px-2 py-1 rounded flex items-center gap-1 ${
                    selectedAnswers[index] === q.answer
                      ? 'text-green-700 dark:text-green-300 bg-green-50 dark:bg-green-900/20' 
                      : 'text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-900/20'
                  }`}>
                    {selectedAnswers[index] === q.answer ? (
                      <>
                        <span>✓</span>
                        <span>Correct</span>
                      </>
                    ) : (
                      <>
                        <span>✗</span>
                        <span>Incorrect</span>
                      </>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Open-ended Text */}
            {q.type === 'open-ended' && (
              <textarea
                placeholder="Write your answer here..."
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent mb-4"
                rows={3}
                onChange={(e) => handleSelectAnswer(index, e.target.value)}
              />
            )}
          </div>
        ))}
      </div>

      {/* Study Tip */}
      <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-lg p-4">
        <p className="text-sm text-indigo-800 dark:text-indigo-300">
          🎯 <strong>Tip:</strong> Click on an answer to check if it&apos;s correct. You&apos;ll see instant feedback below each question!
        </p>
      </div>
    </div>
  )
}
