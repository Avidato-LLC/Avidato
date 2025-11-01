'use client'

// src/components/lesson/EngooLessonComponents.tsx
import React, { useState } from 'react'

/**
 * Engoo-style Lesson Components
 * Renders lessons in the exact Engoo format with proper vocabulary structure,
 * character dialogues, and exercise layouts
 */

// Utility function to safely handle string replacements
const safeReplace = (text: string | undefined | null): string => {
  return (text || '').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
}

interface VocabularyItem {
  word: string
  partOfSpeech: string
  phonetics: string
  definition: string
  example: string
  synonym?: string
  expressions?: string[] // Common collocations/phrases using this word
}

interface Character {
  name: string
  role?: string
  avatar?: string
}

interface DialogueLine {
  character: string
  text: string
}

// Vocabulary Exercise Component
export function VocabularyExercise({ vocabulary }: { vocabulary: VocabularyItem[] }) {
  return (
    <div className="space-y-6">
      {vocabulary.map((item, index) => (
        <div key={index} className="border-b border-gray-200 dark:border-gray-700 pb-6 last:border-b-0">
          <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 max-w-4xl">
            {/* Word section - full width on mobile, left side on desktop */}
            <div className="lg:flex-shrink-0 lg:w-48 lg:min-w-[180px] lg:max-w-[200px]">
              <div className="text-xl lg:text-lg font-semibold text-blue-600 dark:text-blue-400 break-words leading-tight mb-2">
                {item.word}
              </div>
              {/* Synonym subscript - only show if available and contextually appropriate */}
              {item.synonym && (
                <div className="text-xs text-gray-600 dark:text-gray-400 mb-3 italic">
                  <sub>{item.synonym}</sub>
                </div>
              )}
              <div className="flex items-center gap-3 mb-3 lg:mb-2">
                <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs rounded font-medium">
                  {item.partOfSpeech}
                </span>
                {/* Audio icon */}
                <div className="text-gray-400 dark:text-gray-500">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 14.142M9 9a3 3 0 000 6h4a1 1 0 001-1v-4a1 1 0 00-1-1H9z" />
                  </svg>
                </div>
              </div>
              {/* Phonetics - show on mobile too */}
              <div className="lg:hidden mb-3">
                <span className="text-orange-600 dark:text-orange-400 font-mono text-sm break-all">
                  {item.phonetics}
                </span>
              </div>
            </div>
            
            {/* Definition and example section */}
            <div className="flex-1 min-w-0">
              {/* Phonetics and Definition */}
              <div className="mb-3">
                {/* Phonetics only show on desktop */}
                <span className="hidden lg:inline text-orange-600 dark:text-orange-400 font-mono text-sm mr-3 break-all">
                  {item.phonetics || ''}
                </span>
                <span className="text-gray-700 dark:text-gray-300 text-sm lg:text-sm break-words">
                  <span dangerouslySetInnerHTML={{ 
                    __html: safeReplace(item.definition) 
                  }} />
                </span>
              </div>
              
              {/* Example sentence */}
              <div className="text-gray-600 dark:text-gray-400 text-sm break-words leading-relaxed mb-3">
                <span dangerouslySetInnerHTML={{ 
                  __html: safeReplace(item.example) 
                }} />
              </div>

              {/* Expressions/collocations - show useful phrases if available (A2+) */}
              {item.expressions && item.expressions.length > 0 && (
                <div className="mt-2 pt-3 border-t border-gray-200 dark:border-gray-600">
                  <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                    Useful phrases:
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {item.expressions.map((expr, exprIndex) => (
                      <span
                        key={exprIndex}
                        className="px-2 py-1 text-xs bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-300 rounded border border-amber-200 dark:border-amber-800"
                      >
                        {expr}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

// Warm-up Exercise Component
export function WarmupExercise({ questions, instructions }: { questions: string[], instructions?: string }) {
  return (
    <div className="space-y-4 max-w-4xl">
      {instructions && (
        <p className="text-gray-600 dark:text-gray-400 italic">
          <span dangerouslySetInnerHTML={{ 
            __html: safeReplace(instructions) 
          }} />
        </p>
      )}
      <div className="space-y-3">
        {questions.map((question, index) => (
          <div key={index} className="flex items-start space-x-3">
            <span className="flex-shrink-0 w-6 h-6 bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400 rounded-full flex items-center justify-center text-sm font-medium">
              {index + 1}
            </span>
            <p className="text-gray-900 dark:text-white">
              <span dangerouslySetInnerHTML={{ 
                __html: safeReplace(question) 
              }} />
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}

// Character Avatar Component
function CharacterAvatar({ character }: { character: Character }) {
  // Gender-based avatar assignment
  const getGenderAvatar = (name: string) => {
    const femaleNames = [
      'sarah', 'emily', 'jessica', 'ashley', 'amanda', 'stephanie', 'melissa', 'nicole', 
      'elizabeth', 'heather', 'tiffany', 'michelle', 'amber', 'megan', 'rachel', 'amy',
      'kimberly', 'christina', 'brittany', 'rebecca', 'laura', 'danielle', 'maria', 'lisa',
      'jennifer', 'karen', 'nancy', 'betty', 'helen', 'sandra', 'donna', 'carol', 'ruth',
      'sharon', 'michelle', 'laura', 'sarah', 'kimberly', 'deborah', 'dorothy', 'lisa',
      'anna', 'emma', 'olivia', 'ava', 'isabella', 'sophia', 'charlotte', 'mia', 'amelia',
      'harper', 'evelyn', 'abigail', 'ella', 'grace', 'chloe', 'victoria', 'riley'
    ]
    
    const maleNames = [
      'james', 'john', 'robert', 'michael', 'william', 'david', 'richard', 'joseph', 'thomas',
      'christopher', 'charles', 'daniel', 'matthew', 'anthony', 'mark', 'donald', 'steven',
      'paul', 'andrew', 'joshua', 'kenneth', 'kevin', 'brian', 'george', 'edward', 'ronald',
      'timothy', 'jason', 'jeffrey', 'ryan', 'jacob', 'gary', 'nicholas', 'eric', 'jonathan',
      'stephen', 'larry', 'justin', 'scott', 'brandon', 'benjamin', 'samuel', 'gregory',
      'alexander', 'patrick', 'frank', 'raymond', 'jack', 'dennis', 'jerry', 'tyler',
      'aaron', 'jose', 'henry', 'adam', 'douglas', 'nathan', 'peter', 'zachary', 'kyle'
    ]
    
    const normalizedName = name.toLowerCase().split(' ')[0]
    
    if (femaleNames.includes(normalizedName)) {
      return '👩'
    } else if (maleNames.includes(normalizedName)) {
      return '👨'
    } else {
      // Default neutral avatar
      return '👤'
    }
  }

  const getAvatarColor = (name: string) => {
    const colors = [
      'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-red-500', 
      'bg-yellow-500', 'bg-indigo-500', 'bg-pink-500', 'bg-teal-500'
    ]
    const colorIndex = name.length % colors.length
    return colors[colorIndex]
  }

  const avatarEmoji = getGenderAvatar(character.name)
  const avatarColor = getAvatarColor(character.name)

  return (
    <div className="flex flex-col items-center space-y-1">
      <div className={`w-10 h-10 ${avatarColor} rounded-full flex items-center justify-center text-white text-lg`}>
        {avatarEmoji}
      </div>
    </div>
  )
}

// Dialogue Exercise Component
export function DialogueExercise({ 
  context, 
  characters, 
  dialogue, 
  instructions 
}: { 
  context: string
  characters: Character[]
  dialogue: DialogueLine[]
  instructions?: string 
}) {
  return (
    <div className="space-y-6">
      {context && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <p className="text-blue-800 dark:text-blue-400 text-sm">
            <strong>Context:</strong>{' '}
            <span dangerouslySetInnerHTML={{ 
              __html: safeReplace(context) 
            }} />
          </p>
        </div>
      )}
      
      {instructions && (
        <p className="text-gray-600 dark:text-gray-400 italic text-sm">
          <span dangerouslySetInnerHTML={{ 
            __html: instructions.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') 
          }} />
        </p>
      )}

      <div className="space-y-4 max-w-4xl">
        {dialogue.map((line, index) => {
          const character = characters.find(c => c.name === line.character)
          const isFirstSpeaker = index === 0 || dialogue[index - 1]?.character !== line.character
          
          return (
            <div key={index} className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                {isFirstSpeaker && (
                  <CharacterAvatar character={character || { name: line.character }} />
                )}
                {!isFirstSpeaker && <div className="w-10"></div>}
              </div>
              <div className="flex-1 min-w-0">
                {isFirstSpeaker && (
                  <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {line.character}
                  </div>
                )}
                <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4 relative shadow-sm">
                  {isFirstSpeaker && (
                    <div className="absolute left-0 top-3 w-0 h-0 border-t-[6px] border-b-[6px] border-r-[8px] border-transparent border-r-gray-100 dark:border-r-gray-700 -ml-2"></div>
                  )}
                  <p className="text-gray-900 dark:text-white leading-relaxed">
                    <span dangerouslySetInnerHTML={{ 
                      __html: line.text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') 
                    }} />
                  </p>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// Comprehension Exercise Component
export function ComprehensionExercise({ 
  questions 
}: { 
  questions: Array<{
    question: string
    type: 'multiple-choice' | 'true-false' | 'short-answer'
    options?: string[]
    answer?: string
  }>
}) {
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: number]: string }>({})
  const [showAnswers, setShowAnswers] = useState<{ [key: number]: boolean }>({})

  const handleAnswerSelect = (questionIndex: number, answer: string, event?: React.ChangeEvent<HTMLInputElement>) => {
    if (event) {
      event.preventDefault()
      event.stopPropagation()
    }
    setSelectedAnswers(prev => ({
      ...prev,
      [questionIndex]: answer
    }))
  }

  const toggleShowAnswer = (questionIndex: number) => {
    setShowAnswers(prev => ({
      ...prev,
      [questionIndex]: !prev[questionIndex]
    }))
  }

  const isCorrect = (questionIndex: number, selectedAnswer: string) => {
    const question = questions[questionIndex]
    if (question.type === 'multiple-choice' && question.answer) {
      // Handle both cases: answer as letter ("A") and answer as full option ("A) Option text")
      const correctAnswer = question.answer
      
      // If the answer is just a letter (A, B, C, etc.), match it with the option that starts with that letter
      if (correctAnswer.length === 1 && /^[A-Z]$/.test(correctAnswer)) {
        return selectedAnswer.startsWith(correctAnswer + ')')
      }
      
      // Otherwise, do exact match
      return selectedAnswer === correctAnswer
    }
    return false
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {questions.map((q, index) => (
        <div key={index} className="space-y-4">
          <div className="flex items-start space-x-3">
            <span className="flex-shrink-0 w-6 h-6 bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-400 rounded-full flex items-center justify-center text-sm font-medium">
              {index + 1}
            </span>
            <div className="flex-1">
              <p className="text-gray-900 dark:text-white mb-4">
                <span dangerouslySetInnerHTML={{ 
                  __html: safeReplace(q.question) 
                }} />
              </p>

              {q.type === 'multiple-choice' && q.options && (
                <div className="space-y-2 mb-4">
                  {q.options.map((option, optionIndex) => {
                    const optionLetter = String.fromCharCode(65 + optionIndex)
                    const isSelected = selectedAnswers[index] === option
                    const isCorrectAnswer = isCorrect(index, option)
                    
                    return (
                      <label 
                        key={optionIndex} 
                        className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-colors ${
                          isSelected 
                            ? isCorrectAnswer 
                              ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' 
                              : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
                            : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                        }`}
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          handleAnswerSelect(index, option)
                        }}
                      >
                        <input
                          type="radio"
                          name={`question-${index}`}
                          value={option}
                          checked={isSelected}
                          readOnly
                          className="sr-only"
                        />
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-sm font-medium ${
                          isSelected 
                            ? isCorrectAnswer
                              ? 'bg-green-600 border-green-600 text-white'
                              : 'bg-red-600 border-red-600 text-white'
                            : 'border-gray-300 dark:border-gray-600'
                        }`}>
                          {isSelected && (
                            isCorrectAnswer ? '✓' : '✗'
                          )}
                          {!isSelected && optionLetter}
                        </div>
                        <span className={`${isSelected ? 'font-medium' : ''}`}>
                          <span dangerouslySetInnerHTML={{ 
                            __html: safeReplace(option) 
                          }} />
                        </span>
                      </label>
                    )
                  })}
                </div>
              )}

              {q.type === 'true-false' && (
                <div className="space-y-2 mb-4">
                  {['True', 'False'].map((option) => {
                    const isSelected = selectedAnswers[index] === option
                    const isCorrectAnswer = isCorrect(index, option)
                    
                    return (
                      <label 
                        key={option} 
                        className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-colors ${
                          isSelected 
                            ? isCorrectAnswer 
                              ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' 
                              : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
                            : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                        }`}
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          handleAnswerSelect(index, option)
                        }}
                      >
                        <input
                          type="radio"
                          name={`question-${index}`}
                          value={option}
                          checked={isSelected}
                          readOnly
                          className="sr-only"
                        />
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-sm font-medium ${
                          isSelected 
                            ? isCorrectAnswer
                              ? 'bg-green-600 border-green-600 text-white'
                              : 'bg-red-600 border-red-600 text-white'
                            : 'border-gray-300 dark:border-gray-600'
                        }`}>
                          {isSelected && (
                            isCorrectAnswer ? '✓' : '✗'
                          )}
                          {!isSelected && (option === 'True' ? 'T' : 'F')}
                        </div>
                        <span className={`${isSelected ? 'font-medium' : ''}`}>
                          {option}
                        </span>
                      </label>
                    )
                  })}
                </div>
              )}

              {q.type === 'short-answer' && (
                <div className="space-y-3 mb-4">
                  <textarea
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
                    rows={3}
                    placeholder="Write your answer here..."
                    value={selectedAnswers[index] || ''}
                    onChange={(e) => handleAnswerSelect(index, e.target.value)}
                  />
                </div>
              )}

              {q.answer && (
                <div className="flex items-center space-x-4">
                  <button
                    type="button"
                    onClick={() => toggleShowAnswer(index)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                  >
                    {showAnswers[index] ? 'Hide Answer' : 'Show Answer'}
                  </button>
                  
                  {showAnswers[index] && (
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 flex-1">
                      <p className="text-blue-800 dark:text-blue-300 text-sm">
                        <span className="font-medium">Answer:</span>{' '}
                        <span dangerouslySetInnerHTML={{ 
                          __html: q.answer.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') 
                        }} />
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

// Role Play Exercise Component
export function RolePlayExercise({ 
  scenario, 
  roles, 
  instructions,
  timeMinutes 
}: { 
  scenario: string
  roles: Array<{
    name: string
    description: string
    keyPoints?: string[]
  }>
  instructions: string
  timeMinutes: number
}) {
  return (
    <div className="space-y-6 max-w-4xl">
      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
        <h4 className="font-semibold text-yellow-800 dark:text-yellow-400 mb-2">Scenario</h4>
        <p className="text-yellow-700 dark:text-yellow-300 text-sm">
          <span dangerouslySetInnerHTML={{ 
            __html: scenario.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') 
          }} />
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {roles.map((role, index) => (
          <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <h5 className="font-semibold text-gray-900 dark:text-white mb-2">
              <span dangerouslySetInnerHTML={{ 
                __html: role.name.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') 
              }} />
            </h5>
            <p className="text-gray-700 dark:text-gray-300 text-sm mb-3">
              <span dangerouslySetInnerHTML={{ 
                __html: role.description.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') 
              }} />
            </p>
            {role.keyPoints && (
              <div>
                <h6 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                  Key Points:
                </h6>
                <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  {role.keyPoints.map((point, pointIndex) => (
                    <li key={pointIndex} className="flex items-start space-x-1">
                      <span className="text-gray-400">•</span>
                      <span dangerouslySetInnerHTML={{ 
                        __html: point.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') 
                      }} />
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>
      
      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-semibold text-gray-900 dark:text-white">Instructions</h4>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {timeMinutes} minutes
          </span>
        </div>
        <p className="text-gray-700 dark:text-gray-300 text-sm">
          <span dangerouslySetInnerHTML={{ 
            __html: instructions.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') 
          }} />
        </p>
      </div>
    </div>
  )
}

// Discussion Exercise Component  
export function DiscussionExercise({ questions, instructions }: { questions: string[], instructions?: string }) {
  return (
    <div className="space-y-4 max-w-4xl">
      {instructions && (
        <p className="text-gray-600 dark:text-gray-400 italic text-sm">
          <span dangerouslySetInnerHTML={{ 
            __html: instructions.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') 
          }} />
        </p>
      )}
      
      <div className="space-y-4">
        {questions.map((question, index) => (
          <div key={index} className="flex items-start space-x-3">
            <span className="flex-shrink-0 w-6 h-6 bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-400 rounded-full flex items-center justify-center text-sm font-medium">
              {index + 1}
            </span>
            <p className="text-gray-900 dark:text-white">
              <span dangerouslySetInnerHTML={{ 
                __html: question.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') 
              }} />
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}

// Preparation Exercise Component
export function PreparationExercise({ 
  questions, 
  tips 
}: { 
  questions: string[]
  tips: string[] 
}) {
  return (
    <div className="space-y-6 max-w-4xl">
      {/* Tips Section */}
      {tips && tips.length > 0 && (
        <div>
          <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
            <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M12 20a8 8 0 100-16 8 8 0 000 16z" />
            </svg>
            Tips for Success
          </h4>
          <ul className="space-y-2">
            {tips.map((tip, index) => (
              <li key={index} className="flex items-start space-x-3">
                <span className="flex-shrink-0 w-5 h-5 bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400 rounded-full flex items-center justify-center text-xs">
                  ✓
                </span>
                <span className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                  <span dangerouslySetInnerHTML={{ 
                    __html: tip.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') 
                  }} />
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Questions Section */}
      {questions && questions.length > 0 && (
        <div>
          <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
            <svg className="w-5 h-5 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Preparation Questions
          </h4>
          <div className="space-y-3">
            {questions.map((question, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <span className="flex-shrink-0 w-6 h-6 bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-400 rounded-full flex items-center justify-center text-sm font-medium">
                  {index + 1}
                </span>
                <p className="text-gray-900 dark:text-white text-sm leading-relaxed">
                  <span dangerouslySetInnerHTML={{ 
                    __html: question.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') 
                  }} />
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// Final Preparation Exercise Component
export function FinalPrepExercise({ 
  phrases, 
  checklist, 
  confidence 
}: { 
  phrases: string[]
  checklist: string[] 
  confidence: string[]
}) {
  return (
    <div className="space-y-6 max-w-4xl">
      {/* Key Phrases Section */}
      {phrases && phrases.length > 0 && (
        <div>
          <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
            <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-1l-4 4z" />
            </svg>
            Key Phrases to Remember
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {phrases.map((phrase, index) => (
              <div key={index} className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                <span className="text-blue-800 dark:text-blue-300 font-medium text-sm">
                  <span dangerouslySetInnerHTML={{ 
                    __html: `&ldquo;${phrase.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}&rdquo;` 
                  }} />
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Checklist Section */}
      {checklist && checklist.length > 0 && (
        <div>
          <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
            <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
            Final Checklist
          </h4>
          <div className="space-y-2">
            {checklist.map((item, index) => (
              <label key={index} className="flex items-start space-x-3 cursor-pointer group">
                <input type="checkbox" className="mt-1 rounded border-gray-300 text-green-600 focus:ring-green-500" />
                <span className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed group-hover:text-gray-900 dark:group-hover:text-white">
                  <span dangerouslySetInnerHTML={{ 
                    __html: item.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') 
                  }} />
                </span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Confidence Building Section */}
      {confidence && confidence.length > 0 && (
        <div>
          <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
            <svg className="w-5 h-5 mr-2 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
            Confidence Boosters
          </h4>
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <ul className="space-y-2">
              {confidence.map((item, index) => (
                <li key={index} className="flex items-start space-x-2">
                  <span className="text-yellow-600 dark:text-yellow-400 text-lg">💪</span>
                  <span className="text-yellow-800 dark:text-yellow-300 text-sm leading-relaxed">
                    <span dangerouslySetInnerHTML={{ 
                      __html: item.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') 
                    }} />
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}