/**
 * Expressions (Functional Language) Exercise Renderer
 * 
 * Displays useful expressions and how to use them naturally
 * Duration: 3-4 minutes
 */

import React from 'react'

interface Expression {
  expression: string
  meaning: string
  example: string
  whenToUse?: string
}

interface ExpressionsRendererProps {
  instructions: string
  expressions: Expression[]
  timeMinutes: number
}

export const ExpressionsRenderer: React.FC<ExpressionsRendererProps> = ({
  instructions,
  expressions,
  timeMinutes,
}) => {
  const [selectedIndex, setSelectedIndex] = React.useState<number | null>(null)

  return (
    <div className="space-y-4">
      {/* Header Info */}
      <div className="border-l-4 border-purple-500 pl-4 mb-4">
        <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">{instructions}</p>
        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
          ⏱️ {timeMinutes} minutes
        </p>
      </div>

      {/* Expressions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {expressions.map((expr, index) => (
          <div
            key={index}
            className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
              selectedIndex === index
                ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-purple-300 dark:hover:border-purple-700'
            }`}
            onClick={() => setSelectedIndex(selectedIndex === index ? null : index)}
          >
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2 text-lg">
              {expr.expression}
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              {expr.meaning}
            </p>

            {selectedIndex === index && (
              <div className="mt-3 space-y-2 pt-3 border-t border-gray-200 dark:border-gray-700">
                <div>
                  <p className="text-xs font-medium text-purple-600 dark:text-purple-400 mb-1">Example:</p>
                  <p className="text-sm text-gray-900 dark:text-gray-100 italic bg-purple-50 dark:bg-purple-900/20 p-2 rounded">
                    &quot;{expr.example}&quot;
                  </p>
                </div>
                {expr.whenToUse && (
                  <div>
                    <p className="text-xs font-medium text-purple-600 dark:text-purple-400 mb-1">When to use:</p>
                    <p className="text-sm text-gray-900 dark:text-gray-100">
                      {expr.whenToUse}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Study Tip */}
      <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4 mt-4">
        <p className="text-sm text-purple-800 dark:text-purple-300">
          💡 <strong>Tip:</strong> Click on each expression to see examples. Try using these in your speaking practice!
        </p>
      </div>
    </div>
  )
}
