'use client'

import React, { useState } from 'react'

/**
 * GrammarLessonDisplay Component
 * 
 * Renders grammar-focused lessons with 6 exercise types:
 * 1. Grammar Focus Exercise - Level-scaled explanations
 * 2. Sentence Practice Exercise - Reading model sentences (non-interactive)
 * 3. Dialogue Practice Exercise - Personalized student dialogue
 * 4. Fill In The Blanks - Mixed difficulty with hints
 * 5. Multiple Choice - Grammar reinforcement
 * 6. Sentence Building - Productive output
 */

interface GrammarLessonData {
  title: string
  grammarTopic: string
  context: string
  explanation: {
    definition: string
    usage: string
    examples: string[]
  }
  exercises: {
    type: string
    title: string
    content: Record<string, unknown>
  }[]
}

interface GrammarLessonDisplayProps {
  lesson: GrammarLessonData
}

// Grammar Focus Exercise Component
function GrammarFocusExercise({ exercise }: { exercise: { type: string; title: string; content: Record<string, unknown> } }) {
  const content = exercise.content as {
    explanation?: string
    form?: string
    uses?: Array<string | { use?: string; example?: string; text?: string }>
    contrasts?: Array<string | { contrast: string; explanation?: string }>
    commonMistakes?: Array<{ incorrect: string; correct: string; why?: string }>
    miniChart?: Array<{ label: string; example: string }>
    structures?: Array<string | { pattern?: string; note?: string }>
    tips?: string[]
    registerNotes?: string
    keyPoints?: string[]
    examples?: string[]
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">{exercise.title}</h3>
      
      {content.explanation && (
        <div className="mb-6">
          <p className="text-gray-700 dark:text-gray-300 text-base leading-relaxed">
            {content.explanation}
          </p>
        </div>
      )}

      {content.form && (
        <div className="mb-6">
          <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Form</h4>
          <p className="text-gray-700 dark:text-gray-300">{content.form}</p>
        </div>
      )}

      {content.uses && content.uses.length > 0 && (
        <div className="mb-6">
          <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Main Uses</h4>
          <ul className="list-disc pl-6 space-y-1 text-gray-700 dark:text-gray-300">
            {content.uses.map((u, i) => {
              if (typeof u === 'string') return <li key={i}>{u}</li>
              const text = u.use || u.text || ''
              const example = u.example ? ` – ${u.example}` : ''
              return <li key={i}><span className="font-medium">{text}</span>{example}</li>
            })}
          </ul>
        </div>
      )}

      {content.structures && content.structures.length > 0 && (
        <div className="mb-6">
          <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Structures</h4>
          <ul className="list-disc pl-6 space-y-1 text-gray-700 dark:text-gray-300">
            {content.structures.map((s, i) => {
              if (typeof s === 'string') return <li key={i}>{s}</li>
              const pattern = s.pattern || ''
              const note = s.note ? ` – ${s.note}` : ''
              return <li key={i}><span className="font-medium">{pattern}</span>{note}</li>
            })}
          </ul>
        </div>
      )}

      {content.contrasts && content.contrasts.length > 0 && (
        <div className="mb-6">
          <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Contrasts</h4>
          <ul className="list-disc pl-6 space-y-1 text-gray-700 dark:text-gray-300">
            {content.contrasts.map((c, i) => {
              if (typeof c === 'string') return <li key={i}>{c}</li>
              const head = c.contrast
              const expl = c.explanation ? `: ${c.explanation}` : ''
              return <li key={i}><span className="font-medium">{head}</span>{expl}</li>
            })}
          </ul>
        </div>
      )}

      {content.miniChart && content.miniChart.length > 0 && (
        <div className="mb-6">
          <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Quick Patterns</h4>
          <div className="space-y-2">
            {content.miniChart.map((row, i) => (
              <div key={i} className="flex items-start gap-3">
                <span className="inline-flex items-center justify-center h-6 px-2 rounded bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 text-xs font-semibold flex-shrink-0">
                  {row.label}
                </span>
                <span className="text-gray-700 dark:text-gray-300">{row.example}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {content.keyPoints && content.keyPoints.length > 0 && (
        <div className="mb-6">
          <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Key Points:</h4>
          <ul className="space-y-2">
            {content.keyPoints.map((point, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 text-sm font-semibold flex-shrink-0">
                  {i + 1}
                </span>
                <span className="text-gray-700 dark:text-gray-300">{point}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {content.commonMistakes && content.commonMistakes.length > 0 && (
        <div className="mb-6">
          <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Common Mistakes</h4>
          <ul className="space-y-3">
            {content.commonMistakes.map((m, i) => (
              <li key={i} className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded p-3 text-sm">
                <div className="text-red-700 dark:text-red-300"><span className="font-semibold">Incorrect:</span> {m.incorrect}</div>
                <div className="text-green-700 dark:text-green-300"><span className="font-semibold">Correct:</span> {m.correct}</div>
                {m.why && (
                  <div className="text-gray-700 dark:text-gray-300"><span className="font-semibold">Why:</span> {m.why}</div>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {content.tips && content.tips.length > 0 && (
        <div className="mb-6">
          <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Tips</h4>
          <ul className="list-disc pl-6 space-y-1 text-gray-700 dark:text-gray-300">
            {content.tips.map((t, i) => (
              <li key={i}>{t}</li>
            ))}
          </ul>
        </div>
      )}

      {content.registerNotes && (
        <div className="mb-6">
          <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Register / Genre Notes</h4>
          <p className="text-gray-700 dark:text-gray-300">{content.registerNotes}</p>
        </div>
      )}

      {content.examples && content.examples.length > 0 && (
        <div>
          <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Examples:</h4>
          <ul className="space-y-2">
            {content.examples.map((example, i) => (
              <li key={i} className="text-gray-700 dark:text-gray-300 italic pl-4 border-l-2 border-blue-500">
                {example}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

// Sentence Practice Exercise Component
function SentencePracticeExercise({ exercise }: { exercise: { type: string; title: string; content: Record<string, unknown> } }) {
  const content = exercise.content as {
    sentences?: Array<{ sentence: string; context?: string }>
  }

  if (!content.sentences) return null

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">{exercise.title}</h3>

      <div className="space-y-3">
        {content.sentences.map((item, i) => (
          <div key={i} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-700">
            <p className="text-gray-900 dark:text-white">
              {item.sentence}
            </p>
            {item.context && (
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 italic">
                {item.context}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

// Dialogue Practice Exercise Component
function DialoguePracticeExercise({ exercise }: { exercise: { type: string; title: string; content: Record<string, unknown> } }) {
  const content = exercise.content as {
    character1?: string
    character2?: string
    context?: string
    dialogue?: Array<{ speaker: string; text: string }>
  }

  if (!content.dialogue) return null

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{exercise.title}</h3>
      {content.context && (
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 italic">{content.context}</p>
      )}
      
      <div className="space-y-4">
        {content.dialogue.map((line, i) => (
          <div key={i} className="flex gap-4">
            <div className="flex-shrink-0 font-semibold text-blue-600 dark:text-blue-400 min-w-[100px]">
              {line.speaker}
            </div>
            <div className="flex-1 text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 rounded p-3">
              {line.text}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// Fill In The Blanks Exercise Component
function FillInTheBlanksExercise({ exercise }: { exercise: { type: string; title: string; content: Record<string, unknown> } }) {
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [showHints, setShowHints] = useState<Record<number, boolean>>({})

  const content = exercise.content as {
    sentences?: Array<{ sentence: string; answer: string; hint?: string }>
  }

  if (!content.sentences) return null

  const isCorrect = (index: number) =>
    (answers[index] ?? '').toString().trim().toLowerCase() === content.sentences![index].answer.toLowerCase().trim()

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">{exercise.title}</h3>
      <div className="space-y-4">
        {content.sentences.map((item, i) => {
          const value = answers[i] || ''
          const correct = value.trim().length > 0 && isCorrect(i)
          const wrong = value.trim().length > 0 && !isCorrect(i)
          return (
            <div key={i} className={`rounded-lg p-4 ${correct ? 'bg-green-50 border border-green-300' : wrong ? 'bg-red-50 border border-red-300' : 'bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-700'}`}>
              <p className="text-gray-700 dark:text-gray-300 mb-3">
                {item.sentence.replace('_____', `_____ (${i + 1})`)}
              </p>
              <div className="flex flex-col gap-2">
                <input
                  type="text"
                  value={value}
                  onChange={(e) => setAnswers({ ...answers, [i]: e.target.value })}
                  placeholder="Type your answer..."
                  className={`px-3 py-2 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 border ${correct ? 'border-green-500' : wrong ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowHints({ ...showHints, [i]: !showHints[i] })}
                    className="px-4 py-2 bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-700 text-gray-900 dark:text-white rounded font-medium text-sm"
                  >
                    Hint
                  </button>
                </div>
                {showHints[i] && item.hint && (
                  <div className="text-sm text-yellow-700 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 rounded p-2">
                    💡 {item.hint}
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// Multiple Choice Exercise Component
function MultipleChoiceExercise({ exercise }: { exercise: { type: string; title: string; content: Record<string, unknown> } }) {
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({})
  const [touched, setTouched] = useState<Record<number, boolean>>({})

  const content = exercise.content as {
    questions?: Array<{
      question: string
      options: string[]
      correctAnswer: number
      explanation?: string
    }>
  }

  if (!content.questions) return null

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">{exercise.title}</h3>
      
      <div className="space-y-6">
        {content.questions.map((q, qIndex) => {
          const selected = selectedAnswers[qIndex]
          const isCorrect = selected === q.correctAnswer
          return (
            <div key={qIndex} className={`rounded-lg p-4 ${isCorrect ? 'bg-green-50 border border-green-300' : touched[qIndex] && selected !== undefined ? 'bg-red-50 border border-red-300' : 'bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-700'}`}>
              <p className="font-medium text-gray-900 dark:text-white mb-4">{q.question}</p>
              <div className="space-y-2">
                {q.options.map((option, oIndex) => {
                  const optionIsCorrect = oIndex === q.correctAnswer
                  const optionSelected = selected === oIndex
                  const highlight = optionSelected && touched[qIndex]
                    ? optionIsCorrect ? 'bg-green-100 text-green-900' : 'bg-red-100 text-red-900'
                    : optionIsCorrect && isCorrect ? 'bg-green-100 text-green-900' : 'bg-white dark:bg-gray-800'
                  return (
                    <label key={oIndex} className={`flex items-center gap-3 cursor-pointer rounded px-2 py-1 ${highlight}`}>
                      <input
                        type="radio"
                        name={`question-${qIndex}`}
                        checked={optionSelected}
                        onChange={() => { setSelectedAnswers({ ...selectedAnswers, [qIndex]: oIndex }); setTouched({ ...touched, [qIndex]: true }) }}
                        className="w-4 h-4"
                      />
                      <span className="text-gray-700 dark:text-gray-300">{option}</span>
                    </label>
                  )
                })}
              </div>
              {touched[qIndex] && q.explanation && (
                <div className="mt-3 text-sm text-gray-600 dark:text-gray-400 bg-blue-50 dark:bg-blue-900/20 rounded p-2">
                  {q.explanation}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// Sentence Building Exercise Component
function SentenceBuildingExercise({ exercise }: { exercise: { type: string; title: string; content: Record<string, unknown> } }) {
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [orders, setOrders] = useState<Record<number, string[]>>({})
  const [touched, setTouched] = useState<Record<number, boolean>>({})
  const [dragInfo, setDragInfo] = useState<{ idx: number; from: number } | null>(null)

  const content = exercise.content as {
    exercises?: Array<{
      instruction: string
      words?: string[]
      correct?: string
      from?: string
      target?: string
    }>
  }

  if (!content.exercises) return null

  const getExpected = (index: number) => {
    const ex = content.exercises![index]
    return (ex.correct ?? ex.target ?? '').toString()
  }

  const isOrderCorrect = (index: number) => {
    const ex = content.exercises![index]
    const current = orders[index] || ex.words || []
    const expected = getExpected(index)
    if (!expected) return false
    const expectedTokens = expected.split(/\s+/).map(s => s.trim()).filter(Boolean)
    return JSON.stringify(current) === JSON.stringify(expectedTokens)
  }

  const onDragStart = (exIndex: number, fromIndex: number) => setDragInfo({ idx: exIndex, from: fromIndex })
  const onDragOver = (e: React.DragEvent) => { e.preventDefault() }
  const onDrop = (exIndex: number, toIndex: number) => {
    if (!dragInfo || dragInfo.idx !== exIndex) return
    const ex = content.exercises![exIndex]
    const current = [...(orders[exIndex] || ex.words || [])]
    const [moved] = current.splice(dragInfo.from, 1)
    current.splice(toIndex, 0, moved)
    setOrders({ ...orders, [exIndex]: current })
    setTouched({ ...touched, [exIndex]: true })
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">{exercise.title}</h3>
      <div className="space-y-6">
        {content.exercises.map((ex, i) => {
          const expected = getExpected(i)
          const hasOrdering = Array.isArray(ex.words) && ex.words.length > 0
          const order = orders[i] || ex.words || []
          const correctOrder = hasOrdering && expected && isOrderCorrect(i)
          const textAnswer = (answers[i] ?? '').toString()
          const textCorrect = !hasOrdering && expected && textAnswer.trim().toLowerCase() === expected.trim().toLowerCase()
          const showGreen = correctOrder || textCorrect
          const showRed = touched[i] && !showGreen && (textAnswer.trim().length > 0 || hasOrdering)
          return (
            <div key={i} className={`rounded-lg p-4 ${showGreen ? 'bg-green-50 border border-green-300' : showRed ? 'bg-red-50 border border-red-300' : 'bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-700'}`}>
              <p className="font-medium text-gray-900 dark:text-white mb-3">{ex.instruction}</p>
              {hasOrdering && (
                <div className="mb-4 flex flex-wrap gap-2">
                  {order.map((word, wIndex) => (
                    <span
                      key={`${word}-${wIndex}`}
                      draggable
                      onDragStart={() => onDragStart(i, wIndex)}
                      onDragOver={onDragOver}
                      onDrop={() => onDrop(i, wIndex)}
                      className={`px-3 py-2 rounded font-mono text-sm cursor-move hover:shadow-md transition-shadow select-none ${showGreen ? 'bg-green-100 text-green-900' : showRed ? 'bg-red-100 text-red-900' : 'bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100'}`}
                    >
                      {word}
                    </span>
                  ))}
                </div>
              )}
              {ex.from && (
                <div className="mb-3 text-sm text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded p-2">
                  <span className="font-medium">Source:</span> {ex.from}
                </div>
              )}
              {!hasOrdering && (
                <textarea
                  value={answers[i] || ''}
                  onChange={(e) => { setAnswers({ ...answers, [i]: e.target.value }); setTouched({ ...touched, [i]: true }) }}
                  placeholder="Build your sentence here..."
                  className={`w-full px-3 py-2 rounded mb-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 border ${showGreen ? 'border-green-500' : showRed ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
                  rows={2}
                />
              )}
              {!showGreen && (
                <div className="flex gap-2">
                  <button
                    onClick={() => setTouched({ ...touched, [i]: true })}
                    className="px-4 py-2 bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-700 text-gray-900 dark:text-white rounded font-medium text-sm"
                  >
                    Check Answer
                  </button>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// Main Component
export default function GrammarLessonDisplay({ lesson }: GrammarLessonDisplayProps) {
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0)
  const [completedExercises, setCompletedExercises] = useState<Set<number>>(new Set())

  const markAsCompleted = (index: number) => {
    setCompletedExercises(new Set([...completedExercises, index]))
  }

  const currentExercise = lesson.exercises[currentExerciseIndex]
  const progressPercent = Math.round((completedExercises.size / lesson.exercises.length) * 100)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
            {lesson.title}
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-4">
            Grammar Focus: <span className="font-semibold text-blue-600 dark:text-blue-400">{lesson.grammarTopic}</span>
          </p>
          <p className="text-gray-600 dark:text-gray-400">{lesson.context}</p>
        </div>

        {/* Grammar Explanation Box */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-blue-900 dark:text-blue-100 mb-3">
            Definition
          </h2>
          <p className="text-blue-800 dark:text-blue-200 mb-4">{lesson.explanation.definition}</p>

          <h2 className="text-xl font-semibold text-blue-900 dark:text-blue-100 mb-3">
            When to Use It
          </h2>
          <p className="text-blue-800 dark:text-blue-200 mb-4">{lesson.explanation.usage}</p>

          <h2 className="text-xl font-semibold text-blue-900 dark:text-blue-100 mb-3">
            Quick Examples
          </h2>
          <ul className="space-y-2">
            {lesson.explanation.examples.map((example, i) => (
              <li key={i} className="text-blue-800 dark:text-blue-200 flex items-start gap-2">
                <span className="text-blue-600 dark:text-blue-300 mt-1">•</span>
                <span>{example}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Progress: {completedExercises.size} of {lesson.exercises.length} completed
            </span>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{progressPercent}%</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className="bg-blue-600 dark:bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Exercise Navigation Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 sticky top-4">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Exercises</h3>
              <div className="space-y-2">
                {lesson.exercises.map((exercise, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setCurrentExerciseIndex(i)
                      markAsCompleted(i)
                    }}
                    className={`w-full text-left px-3 py-2 rounded transition-colors text-sm font-medium ${
                      currentExerciseIndex === i
                        ? 'bg-blue-600 text-white dark:bg-blue-500'
                        : completedExercises.has(i)
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xs">
                        {completedExercises.has(i) ? '✓' : i + 1}
                      </span>
                      <span className="truncate">{exercise.title}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Main Exercise Area */}
          <div className="lg:col-span-3">
            <div className="mb-6">
              {currentExercise.type === 'grammar-focus' && (
                <GrammarFocusExercise exercise={currentExercise} />
              )}
              {currentExercise.type === 'sentence-practice' && (
                <SentencePracticeExercise exercise={currentExercise} />
              )}
              {currentExercise.type === 'dialogue-practice' && (
                <DialoguePracticeExercise exercise={currentExercise} />
              )}
              {currentExercise.type === 'fill-blanks' && (
                <FillInTheBlanksExercise exercise={currentExercise} />
              )}
              {currentExercise.type === 'multiple-choice' && (
                <MultipleChoiceExercise exercise={currentExercise} />
              )}
              {currentExercise.type === 'sentence-building' && (
                <SentenceBuildingExercise exercise={currentExercise} />
              )}
            </div>

            {/* Navigation Buttons */}
            <div className="flex gap-4 justify-between">
              <button
                onClick={() => setCurrentExerciseIndex(Math.max(0, currentExerciseIndex - 1))}
                disabled={currentExerciseIndex === 0}
                className="px-6 py-3 bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-gray-900 dark:text-white rounded-lg font-medium transition-colors"
              >
                ← Previous
              </button>
              <button
                onClick={() => setCurrentExerciseIndex(Math.min(lesson.exercises.length - 1, currentExerciseIndex + 1))}
                disabled={currentExerciseIndex === lesson.exercises.length - 1}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
              >
                Next →
              </button>
            </div>
          </div>
        </div>

        {/* Completion Message */}
        {completedExercises.size === lesson.exercises.length && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6 text-center">
            <h3 className="text-2xl font-bold text-green-900 dark:text-green-100 mb-2">
              🎉 Lesson Complete!
            </h3>
            <p className="text-green-800 dark:text-green-200">
              Great job! You&apos;ve completed all exercises for this grammar lesson.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
