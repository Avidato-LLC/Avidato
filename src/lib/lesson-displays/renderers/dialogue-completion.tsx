/**
 * Dialogue Completion Exercise Renderer
 * 
 * Displays a dialogue with blanks for students to fill in
 * Duration: 5-6 minutes
 */

import React from 'react'

interface DialogueLine {
  character: string
  text: string
  hasBlank?: boolean
  blankContent?: string
}

interface DialogueCompletionRendererProps {
  title: string
  instructions: string
  dialogue: DialogueLine[]
  timeMinutes: number
  difficulty?: string
}

export const DialogueCompletionRenderer: React.FC<DialogueCompletionRendererProps> = ({
  instructions,
  dialogue,
  timeMinutes,
  difficulty,
}) => {
  const [revealedBlanks, setRevealedBlanks] = React.useState<Set<number>>(new Set())

  const toggleBlank = (index: number) => {
    const newSet = new Set(revealedBlanks)
    if (newSet.has(index)) {
      newSet.delete(index)
    } else {
      newSet.add(index)
    }
    setRevealedBlanks(newSet)
  }

  // Extract characters
  const characters = [...new Set(dialogue.map((line) => line.character))]

  const getCharacterColor = (character: string) => {
    const colors: Record<string, string> = {
      0: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-700',
      1: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-300 dark:border-green-700',
      2: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-purple-300 dark:border-purple-700',
      3: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 border-orange-300 dark:border-orange-700',
    }
    const index = characters.indexOf(character)
    return colors[Math.min(index, 3)] || colors[0]
  }

  return (
    <div className="space-y-4">
      {/* Header Info */}
      <div className="border-l-4 border-amber-500 pl-4 mb-4">
        <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">{instructions}</p>
        <div className="flex gap-4 text-sm font-medium text-gray-600 dark:text-gray-400">
          <span>⏱️ {timeMinutes} minutes</span>
          {difficulty && <span>📊 Difficulty: {difficulty}</span>}
        </div>
      </div>

      {/* Characters */}
      <div className="flex flex-wrap gap-2">
        {characters.map((char, index) => (
          <div
            key={index}
            className={`px-3 py-1 rounded-full text-sm font-medium border-2 ${getCharacterColor(char)}`}
          >
            {char}
          </div>
        ))}
      </div>

      {/* Dialogue with Blanks */}
      <div className="space-y-2 bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
        {dialogue.map((line, index) => {
          const blankIndex = dialogue.slice(0, index).filter((l) => l.hasBlank).length
          const isBlank = line.hasBlank

          return (
            <div key={index} className="space-y-1">
              <div className="flex items-start gap-3">
                <span className={`flex-shrink-0 px-2 py-1 rounded text-xs font-bold border-2 ${getCharacterColor(line.character)}`}>
                  {line.character}
                </span>
                <div className="flex-1">
                  {isBlank ? (
                    <div className="space-y-2">
                      <p className="text-gray-900 dark:text-white">
                        {line.text}
                        <span className="inline-block ml-2 px-3 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded font-medium text-sm">
                          ______
                        </span>
                      </p>
                      <button
                        onClick={() => toggleBlank(blankIndex)}
                        className="text-xs px-2 py-1 rounded bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
                      >
                        {revealedBlanks.has(blankIndex) ? '✓ Hide' : 'Show'} Answer
                      </button>
                      {revealedBlanks.has(blankIndex) && (
                        <p className="text-sm text-green-700 dark:text-green-300 bg-green-50 dark:bg-green-900/20 p-2 rounded italic">
                          &quot;{line.blankContent}&quot;
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="text-gray-900 dark:text-white">{line.text}</p>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Summary of Blanks */}
      <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
        <p className="text-sm text-amber-800 dark:text-amber-300">
          ✏️ <strong>Your Task:</strong> Listen to your tutor and fill in the blanks with what you hear. This helps with listening comprehension!
        </p>
      </div>
    </div>
  )
}
