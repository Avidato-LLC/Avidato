/**
 * Dialogue Exercise Renderer
 * 
 * Displays a realistic conversation between characters
 * Duration: 5-6 minutes
 */

import React from 'react'

const safeReplace = (text: string | undefined | null): string => {
  return (text || '').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
}

// Function to generate a comprehensive setting from dialogue content
const generateDetailedSetting = (
  characters: string[], 
  dialogue: DialogueExchange[]
): string => {
  if (!dialogue || dialogue.length === 0) {
    const charNames = characters.slice(0, 3).join(', ')
    return `A conversation between ${charNames} discussing an interesting topic.`
  }

  // Extract key topics/nouns from the dialogue
  const allText = dialogue.map(d => d.text).join(' ').toLowerCase()
  
  // Get character names
  const charNames = characters.slice(0, 3).join(', ')
  
  // Detect topics based on keywords
  let topic = 'an interesting conversation'
  
  // Sports/Football
  if (allText.includes('messi') || allText.includes('ronaldo') || allText.includes('football') || 
      allText.includes('soccer') || allText.includes('player') || allText.includes('goal') ||
      allText.includes('skilled') || allText.includes('determined')) {
    topic = 'debating about the greatest football/soccer players'
  }
  // Cooking
  else if (allText.includes('cook') || allText.includes('recipe') || allText.includes('ingredient') ||
           allText.includes('delicious') || allText.includes('restaurant')) {
    topic = 'discussing cooking and food'
  }
  // Travel
  else if (allText.includes('travel') || allText.includes('trip') || allText.includes('airport') ||
           allText.includes('hotel') || allText.includes('destination')) {
    topic = 'planning a trip or discussing travel experiences'
  }
  // Technology
  else if (allText.includes('tech') || allText.includes('software') || allText.includes('computer') ||
           allText.includes('program') || allText.includes('app')) {
    topic = 'talking about technology and software'
  }
  // Movies/Entertainment
  else if (allText.includes('movie') || allText.includes('film') || allText.includes('actor') ||
           allText.includes('watch') || allText.includes('series')) {
    topic = 'discussing movies or entertainment'
  }
  // Work/Business
  else if (allText.includes('work') || allText.includes('job') || allText.includes('office') ||
           allText.includes('project') || allText.includes('meeting')) {
    topic = 'discussing work or business matters'
  }
  // Learning/Education
  else if (allText.includes('learn') || allText.includes('study') || allText.includes('exam') ||
           allText.includes('school') || allText.includes('language')) {
    topic = 'discussing learning and education'
  }
  // Health/Fitness
  else if (allText.includes('exercise') || allText.includes('gym') || allText.includes('health') ||
           allText.includes('sport') || allText.includes('fit')) {
    topic = 'talking about health and fitness'
  }
  // Environment/Nature
  else if (allText.includes('nature') || allText.includes('environment') || allText.includes('climate') ||
           allText.includes('weather') || allText.includes('garden')) {
    topic = 'discussing nature and the environment'
  }
  // Music
  else if (allText.includes('music') || allText.includes('song') || allText.includes('artist') ||
           allText.includes('concert') || allText.includes('musician')) {
    topic = 'talking about music and musicians'
  }
  
  // Build detailed setting message
  if (characters.length === 2) {
    return `${charNames} are having a conversation ${topic}. This is a realistic dialogue you should read with your tutor to practice your English.`
  } else if (characters.length === 3) {
    return `${charNames} are having a discussion ${topic}. This is a realistic multi-person dialogue you should read with your tutor to practice natural conversation.`
  } else {
    return `${charNames} and others are engaged in a conversation ${topic}. This is a group dialogue you should read aloud with your tutor.`
  }
}

interface DialogueExchange {
  character: string
  text: string
  translation?: string
}

interface DialogueRendererProps {
  title: string
  setting: string
  characters: string[]
  dialogue: DialogueExchange[]
  comprehensionQuestions?: {
    question: string
    options?: string[]
  }[]
  timeMinutes: number
}

export const DialogueRenderer: React.FC<DialogueRendererProps> = ({
  setting,
  characters,
  dialogue,
  comprehensionQuestions,
  timeMinutes,
}) => {
  const [showTranslations, setShowTranslations] = React.useState(false)
  
  // Generate detailed setting if empty
  const displaySetting = setting || generateDetailedSetting(characters, dialogue)
  
  const getCharacterColor = (index: number) => {
    const colors = [
      { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-300', border: 'border-blue-300 dark:border-blue-700' },
      { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-300', border: 'border-green-300 dark:border-green-700' },
      { bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-700 dark:text-purple-300', border: 'border-purple-300 dark:border-purple-700' },
      { bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-700 dark:text-orange-300', border: 'border-orange-300 dark:border-orange-700' },
    ]
    return colors[index % colors.length]
  }

  return (
    <div className="space-y-4">
      {/* Setting */}
      <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg border-l-4 border-indigo-500">
        <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Setting:</p>
        <p className="text-gray-900 dark:text-white font-semibold">
          <span dangerouslySetInnerHTML={{ __html: safeReplace(displaySetting) }} />
        </p>
      </div>

      {/* Characters */}
      <div className="flex flex-wrap gap-2">
        {characters.map((char, index) => {
          const color = getCharacterColor(index)
          return (
            <div
              key={index}
              className={`px-3 py-1 rounded-full text-sm font-medium border-2 ${color.bg} ${color.text} ${color.border}`}
            >
              {char}
            </div>
          )
        })}
      </div>

      {/* Translation Toggle and Time */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setShowTranslations(!showTranslations)}
          className="text-sm px-4 py-2 rounded bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-200 dark:hover:bg-indigo-800 transition-colors font-medium"
        >
          {showTranslations ? '✓ Translations On' : 'Show Translations'}
        </button>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          ⏱️ {timeMinutes} minutes
        </p>
      </div>

      {/* Dialogue - Clean List Format */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 divide-y divide-gray-200 dark:divide-gray-700">
        {dialogue.map((exchange, index) => {
          const charIndex = characters.indexOf(exchange.character)
          const color = getCharacterColor(charIndex)
          return (
            <div key={index} className="p-4 sm:p-6">
              <div className="flex gap-3 mb-2">
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${color.bg} ${color.text} border-2 ${color.border}`}>
                  {exchange.character[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`font-bold text-sm mb-1 ${color.text}`}>
                    {exchange.character}
                  </p>
                  <p className="text-gray-900 dark:text-white text-base leading-relaxed">
                    {exchange.text}
                  </p>
                </div>
              </div>
              {showTranslations && exchange.translation && (
                <div className="ml-11 mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-sm text-gray-600 dark:text-gray-400 italic">
                    {exchange.translation}
                  </p>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Comprehension Questions */}
      {comprehensionQuestions && comprehensionQuestions.length > 0 && (
        <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-lg p-4">
          <p className="text-sm font-medium text-indigo-800 dark:text-indigo-300 mb-3">
            ❓ Comprehension Check:
          </p>
          <div className="space-y-3">
            {comprehensionQuestions.map((q, index) => (
              <div key={index} className="space-y-2">
                <p className="text-sm text-indigo-900 dark:text-indigo-200 font-medium">
                  {index + 1}. {q.question}
                </p>
                {q.options && (
                  <div className="space-y-1 ml-4">
                    {q.options.map((opt, optIndex) => (
                      <p key={optIndex} className="text-sm text-indigo-800 dark:text-indigo-300">
                        {String.fromCharCode(97 + optIndex)}) {opt}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Study Tip */}
      <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-lg p-4">
        <p className="text-sm text-indigo-800 dark:text-indigo-300">
          🎯 <strong>Practice:</strong> Read the dialogue aloud with different intonations. Then try to memorize it!
        </p>
      </div>
    </div>
  )
}
