/**
 * Vocabulary Exercise Renderer - Under 18
 * 
 * Displays vocabulary terms EXACTLY as the 18+ version
 * Two-column layout: left sidebar (word/synonym/POS) + right content (phonetics/definition/example/expressions)
 */

import React from 'react'

interface VocabularyTerm {
  word?: string
  term?: string
  partOfSpeech?: string
  phonetics?: string
  definition: string
  example: string
  synonym?: string
  expressions?: string[]
}

interface VocabularyRendererProps {
  title: string
  instructions: string
  vocabulary: VocabularyTerm[]
  practiceActivity?: {
    instructions: string
    content: string
  }
  timeMinutes: number
}

const safeReplace = (text: string | undefined | null): string => {
  return (text || '').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
}

export const VocabularyRenderer: React.FC<VocabularyRendererProps> = ({
  instructions,
  vocabulary,
  practiceActivity,
  timeMinutes,
}) => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-l-4 border-green-500 pl-4">
        <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">{instructions}</p>
        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
          ⏱️ {timeMinutes} minutes
        </p>
      </div>

      {/* Vocabulary List - EXACT 18+ Layout */}
      <div className="space-y-6">
        {vocabulary.map((item, index) => {
          const displayWord = item.word || item.term || ''
          return (
            <div key={index} className="border-b border-gray-200 dark:border-gray-700 pb-6 last:border-b-0">
              <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 max-w-4xl">
                {/* Left: Word section - full width on mobile, sidebar on desktop */}
                <div className="lg:flex-shrink-0 lg:w-48 lg:min-w-[180px]">
                  <div className="text-xl lg:text-lg font-semibold text-blue-600 dark:text-blue-400 break-words leading-tight mb-2">
                    {displayWord}
                  </div>
                  
                  {/* Synonym as subscript */}
                  {item.synonym && (
                    <div className="text-xs text-gray-600 dark:text-gray-400 mb-3 italic">
                      <sub>{item.synonym}</sub>
                    </div>
                  )}
                  
                  {/* Part of speech + audio icon */}
                  <div className="flex items-center gap-3 mb-3">
                    {item.partOfSpeech && (
                      <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs rounded font-medium">
                        {item.partOfSpeech}
                      </span>
                    )}
                    {/* Audio icon placeholder */}
                    <div className="text-gray-400 dark:text-gray-500">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 14.142M9 9a3 3 0 000 6h4a1 1 0 001-1v-4a1 1 0 00-1-1H9z" />
                      </svg>
                    </div>
                  </div>
                  
                  {/* Phonetics on mobile */}
                  <div className="lg:hidden">
                    {item.phonetics && (
                      <span className="text-orange-600 dark:text-orange-400 font-mono text-sm break-all">
                        {item.phonetics}
                      </span>
                    )}
                  </div>
                </div>
                
                {/* Right: Definition + Example + Expressions */}
                <div className="flex-1 min-w-0">
                  {/* Phonetics on desktop + Definition */}
                  <div className="mb-3">
                    {item.phonetics && (
                      <span className="hidden lg:inline text-orange-600 dark:text-orange-400 font-mono text-sm mr-3 break-all">
                        {item.phonetics}
                      </span>
                    )}
                    <span className="text-gray-700 dark:text-gray-300 text-sm break-words">
                      <span dangerouslySetInnerHTML={{ 
                        __html: safeReplace(item.definition) 
                      }} />
                    </span>
                  </div>
                  
                  {/* Example sentence */}
                  <div className="text-gray-600 dark:text-gray-400 text-sm break-words leading-relaxed mb-3 italic">
                    <span dangerouslySetInnerHTML={{ 
                      __html: safeReplace(item.example) 
                    }} />
                  </div>

                  {/* Expressions/collocations */}
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
          )
        })}
      </div>

      {/* Practice Activity */}
      {practiceActivity && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
          <p className="text-sm font-medium text-green-800 dark:text-green-300 mb-2">
            ✏️ Practice Activity:
          </p>
          <p className="text-sm text-green-700 dark:text-green-200 mb-2">
            {practiceActivity.instructions}
          </p>
          <p className="text-sm text-green-800 dark:text-green-300 italic">
            {practiceActivity.content}
          </p>
        </div>
      )}
    </div>
  )
}
