"use client"

import React, { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { useTheme } from 'next-themes'
import Link from 'next/link'
import Image from 'next/image'
import ClientThemeProvider from '@/components/ClientThemeProvider'
import { Under18LessonDisplay } from '@/lib/lesson-displays/under-18-display'
import {
  VocabularyExercise,
  WarmupExercise,
  DialogueExercise,
  ComprehensionExercise,
  RolePlayExercise,
  DiscussionExercise,
  PreparationExercise,
  FinalPrepExercise,
} from '@/components/lesson/EngooLessonComponents'

interface StudentInfo {
  id: string
  name: string
  level: string
}

interface BaseExerciseContent {
  instructions?: string
  [key: string]: unknown
}

interface LessonExercise {
  type: string
  title?: string
  description?: string
  timeMinutes?: number
  content: BaseExerciseContent
}

interface GrammarExplanationBlock {
  definition?: string
  usage?: string
  examples?: string[]
}

interface GrammarFocusContent extends BaseExerciseContent {
  explanation?: string
  uses?: Array<string | { use?: string; text?: string; example?: string }>
  structures?: Array<string | { pattern?: string; note?: string }>
  contrasts?: Array<string | { contrast?: string; explanation?: string }>
  commonMistakes?: Array<{ incorrect: string; correct: string; why?: string }>
  examples?: string[]
}

interface FillBlankSentence { sentence: string; answer: string; hint?: string }
interface MultipleChoiceQuestion { question: string; options: string[]; correctAnswer: number; explanation?: string }
interface SentenceBuildingItem { instruction: string; words?: string[]; correct?: string; target?: string; from?: string }
interface SentencePracticeItem { sentence: string; context?: string }
interface DialogueLine { speaker: string; text: string }

interface GrammarExerciseContent extends BaseExerciseContent {
  sentences?: FillBlankSentence[] | SentencePracticeItem[]
  questions?: MultipleChoiceQuestion[]
  exercises?: SentenceBuildingItem[]
  dialogue?: DialogueLine[]
  explanation?: string
  uses?: unknown
  structures?: unknown
  contrasts?: unknown
  commonMistakes?: unknown
  examples?: unknown
}

interface SharedLessonContent {
  title?: string
  objective?: string
  context?: string
  duration?: number
  difficulty?: number
  lessonType?: string
  isGrammarLesson?: boolean
  grammarTopic?: string
  explanation?: GrammarExplanationBlock
  skills?: string[]
  vocabulary?: Array<string | { word?: string; term?: string }>
  exercises?: LessonExercise[]
}

interface SharedLessonData {
  id: string
  createdAt: string
  content: SharedLessonContent
  student: StudentInfo
}

interface GrammarExercise {
  type: string
  title?: string
  content: GrammarExerciseContent
}

function SharedFillBlanks({ exercise }: { exercise: GrammarExercise }) {
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [showHints, setShowHints] = useState<Record<number, boolean>>({})
  const sentences = (exercise?.content?.sentences as Array<{ sentence: string; answer: string; hint?: string }> | undefined) || []
  if (!sentences.length) return null
  const isCorrect = (i: number) => (answers[i] || '').trim().toLowerCase() === sentences[i].answer.trim().toLowerCase()
  return (
    <div className="space-y-4">
      {sentences.map((s, i) => {
        const val = answers[i] || ''
        const correct = val.length > 0 && isCorrect(i)
        const wrong = val.length > 0 && !isCorrect(i)
        return (
          <div
            key={i}
            className={`rounded p-4 text-sm ${
              correct
                ? 'bg-green-50 border border-green-300'
                : wrong
                ? 'bg-red-50 border border-red-300'
                : 'bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-700'
            }`}
          >
            <p className="mb-2 text-gray-800 dark:text-gray-200">{s.sentence}</p>
            <input
              type="text"
              value={val}
              onChange={(e) => setAnswers({ ...answers, [i]: e.target.value })}
              placeholder="Type your answer..."
              className={`px-3 py-2 rounded w-full bg-white dark:bg-gray-800 text-gray-900 dark:text-white border ${
                correct ? 'border-green-500' : wrong ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
              }`}
            />
            {s.hint && (
              <div className="mt-2">
                <button
                  onClick={() => setShowHints({ ...showHints, [i]: !showHints[i] })}
                  className="px-3 py-1 text-xs rounded bg-gray-200 dark:bg-gray-600"
                >
                  Hint
                </button>
                {showHints[i] && (
                  <span className="ml-2 text-xs text-yellow-700 dark:text-yellow-400">{s.hint}</span>
                )}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

function SharedMultipleChoice({ exercise }: { exercise: GrammarExercise }) {
  const [selected, setSelected] = useState<Record<number, number>>({})
  const [touched, setTouched] = useState<Record<number, boolean>>({})
  const questions = (exercise?.content?.questions as Array<{
    question: string
    options: string[]
    correctAnswer: number
    explanation?: string
  }> | undefined) || []
  if (!questions.length) return null
  return (
    <ul className="space-y-4">
      {questions.map((q, qi) => {
        const chosen = selected[qi]
        const correct = chosen === q.correctAnswer
        return (
          <li
            key={qi}
            className={`rounded p-4 text-sm ${
              correct
                ? 'bg-green-50 border border-green-300'
                : touched[qi] && chosen !== undefined
                ? 'bg-red-50 border border-red-300'
                : 'bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-700'
            }`}
          >
            <p className="font-medium text-gray-900 dark:text-white mb-2">{q.question}</p>
            <div className="space-y-1">
              {q.options.map((opt, oi) => {
                const optionSelected = chosen === oi
                const optionIsCorrect = oi === q.correctAnswer
                const highlight =
                  optionSelected && touched[qi]
                    ? optionIsCorrect
                      ? 'bg-green-100 text-green-900'
                      : 'bg-red-100 text-red-900'
                    : optionIsCorrect && correct
                    ? 'bg-green-100 text-green-900'
                    : ''
                return (
                  <label key={oi} className={`flex items-center gap-3 cursor-pointer rounded px-2 py-1 ${highlight}`}>
                    <input
                      type="radio"
                      name={`shared-mcq-${qi}`}
                      checked={optionSelected}
                      onChange={() => {
                        setSelected({ ...selected, [qi]: oi })
                        setTouched({ ...touched, [qi]: true })
                      }}
                      className="w-4 h-4"
                    />
                    <span className="text-gray-700 dark:text-gray-300">{opt}</span>
                  </label>
                )
              })}
            </div>
            {touched[qi] && q.explanation && (
              <div className="text-xs text-gray-600 dark:text-gray-400 italic mt-2">{q.explanation}</div>
            )}
          </li>
        )
      })}
    </ul>
  )
}

function SharedSentenceBuilding({ exercise }: { exercise: GrammarExercise }) {
  const [orders, setOrders] = useState<Record<number, string[]>>({})
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [touched, setTouched] = useState<Record<number, boolean>>({})
  const [dragInfo, setDragInfo] = useState<{ ex: number; from: number } | null>(null)
  const list =
    (exercise?.content?.exercises as Array<{
      instruction: string
      words?: string[]
      correct?: string
      target?: string
      from?: string
    }> | undefined) || []
  if (!list.length) return null
  const expectedFor = (i: number) => (list[i].correct || list[i].target || '')
  const tokens = (s: string) => s.split(/\s+/).filter(Boolean)
  return (
    <div className="space-y-4">
      {list.map((ex, i) => {
        const expected = expectedFor(i)
        const hasOrdering = Array.isArray(ex.words) && ex.words.length > 0
        const order = orders[i] || ex.words || []
        const correctOrder = hasOrdering && expected && JSON.stringify(order) === JSON.stringify(tokens(expected))
        const typed = answers[i] || ''
        const textCorrect = !hasOrdering && expected && typed.trim().toLowerCase() === expected.trim().toLowerCase()
        const green = correctOrder || textCorrect
        const red = touched[i] && !green && (hasOrdering || typed.trim().length > 0)
        return (
          <div
            key={i}
            className={`rounded p-4 text-sm ${
              green
                ? 'bg-green-50 border border-green-300'
                : red
                ? 'bg-red-50 border border-red-300'
                : 'bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-700'
            }`}
          >
            <p className="font-medium text-gray-900 dark:text-white mb-2">{ex.instruction}</p>
            {hasOrdering ? (
              <div className="flex flex-wrap gap-2 mb-2">
                {order.map((w, wi) => (
                  <span
                    key={`${w}-${wi}`}
                    draggable
                    onDragStart={() => setDragInfo({ ex: i, from: wi })}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={() => {
                      if (!dragInfo || dragInfo.ex !== i) return
                      const current = [...order]
                      const [moved] = current.splice(dragInfo.from, 1)
                      current.splice(wi, 0, moved)
                      setOrders({ ...orders, [i]: current })
                      setTouched({ ...touched, [i]: true })
                    }}
                    className={`px-2 py-1 rounded cursor-move select-none ${
                      green
                        ? 'bg-green-100 text-green-900'
                        : red
                        ? 'bg-red-100 text-red-900'
                        : 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                    }`}
                  >
                    {w}
                  </span>
                ))}
              </div>
            ) : (
              <input
                type="text"
                value={typed}
                onChange={(e) => {
                  setAnswers({ ...answers, [i]: e.target.value })
                  setTouched({ ...touched, [i]: true })
                }}
                placeholder="Type your sentence..."
                className={`w-full px-3 py-2 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white border ${
                  green ? 'border-green-500' : red ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                }`}
              />
            )}
            {ex.from && <div className="text-xs text-gray-600 dark:text-gray-400 mt-2">Source: {ex.from}</div>}
            {!green && (
              <div className="mt-2">
                <button
                  onClick={() => setTouched({ ...touched, [i]: true })}
                  className="px-3 py-1 text-xs rounded bg-gray-200 dark:bg-gray-600"
                >
                  Check Answer
                </button>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

function SharedGrammarLesson({ lesson }: { lesson: SharedLessonData }) {
  const content = lesson.content || {}
  const title = content?.title || ''
  const grammarTopic = content?.grammarTopic || ''
  const context = content?.context || ''
  const explanation = content?.explanation || {}
  const exercises = (Array.isArray(content?.exercises) ? content.exercises : []) as GrammarExercise[]

  return (
    <div className="space-y-8">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">{title}</h1>
        {grammarTopic && (
          <p className="text-sm sm:text-base text-blue-700 dark:text-blue-300 mb-4 font-medium">
            Grammar Focus: {grammarTopic}
          </p>
        )}
        {context && <p className="text-gray-600 dark:text-gray-300 mb-4">{context}</p>}
        {explanation && (explanation.definition || explanation.usage || explanation.examples) && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 sm:p-6">
            {explanation.definition && (
              <>
                <h2 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">Definition</h2>
                <p className="text-blue-800 dark:text-blue-200 mb-4 whitespace-pre-line">{explanation.definition}</p>
              </>
            )}
            {explanation.usage && (
              <>
                <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">Usage</h3>
                <p className="text-blue-800 dark:text-blue-200 mb-4 whitespace-pre-line">{explanation.usage}</p>
              </>
            )}
            {Array.isArray(explanation.examples) && (
              <ul className="space-y-2">
                {explanation.examples.map((ex: string, i: number) => (
                  <li key={i} className="text-blue-700 dark:text-blue-300 italic">{ex}</li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>

      {exercises.length > 0 && (
        <div className="space-y-6">
          {exercises.map((ex: GrammarExercise, idx: number) => (
            <div
              key={idx}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5"
            >
              {ex.title && <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">{ex.title}</h4>}
              {ex.type === 'grammar-focus' && (
                <div className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
                  {ex?.content?.explanation && (
                    <p className="whitespace-pre-line">{String(ex.content.explanation)}</p>
                  )}
                  {Array.isArray(ex?.content?.uses) && (
                    <div>
                      <h5 className="font-medium text-gray-900 dark:text-white mb-2">Main Uses</h5>
                      <ul className="list-disc pl-5 space-y-1">
                        {Array.isArray((ex.content as GrammarFocusContent).uses) && (ex.content as GrammarFocusContent).uses!.map((u: string | { use?: string; text?: string; example?: string }, i: number) => {
                          if (typeof u === 'string') return <li key={i}>{u}</li>
                          const text = u.use || u.text || ''
                          const example = u.example ? ` – ${u.example}` : ''
                          return (
                            <li key={i}>
                              {text}
                              {example}
                            </li>
                          )
                        })}
                      </ul>
                    </div>
                  )}
                  {Array.isArray(ex?.content?.structures) && (
                    <div>
                      <h5 className="font-medium text-gray-900 dark:text-white mb-2">Structures</h5>
                      <ul className="list-disc pl-5 space-y-1">
                        {Array.isArray((ex.content as GrammarFocusContent).structures) && (ex.content as GrammarFocusContent).structures!.map((s: string | { pattern?: string; note?: string }, i: number) => {
                          if (typeof s === 'string') return <li key={i}>{s}</li>
                          const pattern = s.pattern || ''
                          const note = s.note ? ` – ${s.note}` : ''
                          return (
                            <li key={i}>
                              {pattern}
                              {note}
                            </li>
                          )
                        })}
                      </ul>
                    </div>
                  )}
                  {Array.isArray(ex?.content?.contrasts) && (
                    <div>
                      <h5 className="font-medium text-gray-900 dark:text-white mb-2">Contrasts</h5>
                      <ul className="list-disc pl-5 space-y-1">
                        {Array.isArray((ex.content as GrammarFocusContent).contrasts) && (ex.content as GrammarFocusContent).contrasts!.map((c: string | { contrast?: string; explanation?: string }, i: number) => {
                          if (typeof c === 'string') return <li key={i}>{c}</li>
                          const head = c.contrast
                          const expl = c.explanation ? `: ${c.explanation}` : ''
                          return (
                            <li key={i}>
                              {head}
                              {expl}
                            </li>
                          )
                        })}
                      </ul>
                    </div>
                  )}
                  {Array.isArray(ex?.content?.commonMistakes) && (
                    <div>
                      <h5 className="font-medium text-gray-900 dark:text-white mb-2">Common Mistakes</h5>
                      <ul className="space-y-2">
                        {Array.isArray((ex.content as GrammarFocusContent).commonMistakes) && (ex.content as GrammarFocusContent).commonMistakes!.map((m: { incorrect: string; correct: string; why?: string }, i: number) => (
                          <li
                            key={i}
                            className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded p-3 text-xs"
                          >
                            <div className="text-red-700 dark:text-red-300">
                              <span className="font-semibold">Incorrect:</span> {m.incorrect}
                            </div>
                            <div className="text-green-700 dark:text-green-300">
                              <span className="font-semibold">Correct:</span> {m.correct}
                            </div>
                            {m.why && (
                              <div className="text-gray-700 dark:text-gray-300">
                                <span className="font-semibold">Why:</span> {m.why}
                              </div>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {Array.isArray(ex?.content?.examples) && (
                    <div>
                      <h5 className="font-medium text-gray-900 dark:text-white mb-2">Examples</h5>
                      <ul className="space-y-1 italic">
                        {ex.content.examples.map((e: string, i: number) => (
                          <li key={i}>{e}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
                  {ex.type === 'sentence-practice' && Array.isArray(ex?.content?.sentences) && (
                    <ul className="space-y-2 text-sm">
                      {(ex.content.sentences as SentencePracticeItem[]).map((s, i) => (
                        <li key={i} className="bg-gray-50 dark:bg-gray-700 rounded p-3">
                          <div className="text-gray-900 dark:text-white">{s.sentence}</div>
                          {s.context && (
                            <div className="text-gray-600 dark:text-gray-400 text-xs mt-1 italic">{s.context}</div>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                  {ex.type === 'dialogue-practice' && Array.isArray(ex?.content?.dialogue) && (
                    <div className="space-y-3 text-sm">
                      {(ex.content.dialogue as DialogueLine[]).map((line, i) => (
                        <div key={i} className="flex gap-3">
                          <span className="font-semibold text-blue-600 dark:text-blue-400 min-w-[90px]">{line.speaker}</span>
                          <span className="flex-1 text-gray-700 dark:text-gray-300">{line.text}</span>
                        </div>
                      ))}
                    </div>
                  )}
              {ex.type === 'fill-blanks' && Array.isArray(ex?.content?.sentences) && <SharedFillBlanks exercise={ex} />}
              {ex.type === 'multiple-choice' && Array.isArray(ex?.content?.questions) && <SharedMultipleChoice exercise={ex} />}
              {ex.type === 'sentence-building' && Array.isArray(ex?.content?.exercises) && <SharedSentenceBuilding exercise={ex} />}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

const getExerciseIcon = (type: string) => {
  switch (type) {
    case 'controlled-input':
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C20.832 18.477 19.246 18 17.5 18c-1.746 0-3.332.477-4.5 1.253z" />
        </svg>
      )
    case 'structured-practice':
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      )
    case 'freer-production':
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      )
    case 'extension':
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      )
    case 'preparation':
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      )
    case 'final-prep':
    case 'finalPrep':
    case 'finalprep':
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
        </svg>
      )
    default:
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
  }
}

const renderExerciseContent = (exercise: { type: string; content: BaseExerciseContent; timeMinutes: number }) => {
  const content = exercise.content || {}
  switch (exercise.type) {
    case 'vocabulary':
      if (Array.isArray(content?.vocabulary)) {
        return <VocabularyExercise vocabulary={content.vocabulary} />
      }
      break
    case 'warmup':
      if (Array.isArray(content?.questions)) {
        return <WarmupExercise questions={content.questions} instructions={content.instructions as string} />
      }
      break
    case 'dialogue':
      if (Array.isArray(content?.dialogue)) {
        const rawDialogue = content.dialogue as Array<Record<string, unknown>>
        const speakers = [...new Set(rawDialogue.map((l) => (l.speaker || l.character || 'Unknown') as string))]
        const characters = speakers.map((speaker) => ({ name: speaker }))
        const transformedDialogue = rawDialogue.map((l) => ({
          character: (l.speaker || l.character || 'Unknown') as string,
          text: (l.line || l.text || '') as string,
        }))
        const setting = (content.setting as string) || (content.context as string) || ''
        return (
          <DialogueExercise context={setting} characters={characters} dialogue={transformedDialogue} instructions={(content.instructions as string) || ''} />
        )
      }
      break
    case 'comprehension':
      if (Array.isArray(content?.questions)) {
        return <ComprehensionExercise questions={content.questions} />
      }
      break
    case 'roleplay':
      if (content?.scenario && Array.isArray(content?.roles)) {
        return (
          <RolePlayExercise scenario={content.scenario as string} roles={content.roles} instructions={(content.instructions as string) || ''} timeMinutes={exercise.timeMinutes} />
        )
      }
      break
    case 'discussion':
      if (Array.isArray(content?.questions)) {
        return <DiscussionExercise questions={content.questions} instructions={content.instructions as string} />
      }
      break
    case 'preparation':
      if (Array.isArray(content?.questions)) {
        return <PreparationExercise questions={content.questions} tips={content.tips as string[]} />
      }
      break
  case 'final-prep':
  case 'finalPrep':
  case 'finalprep':
      return (
        <FinalPrepExercise phrases={(content.phrases as string[]) || []} checklist={(content.checklist as string[]) || []} confidence={(content.confidence as string[]) || []} />
      )
    default:
      return (
        <div className="whitespace-pre-wrap text-gray-900 dark:text-white">{typeof exercise.content === 'string' ? exercise.content : JSON.stringify(exercise.content, null, 2)}</div>
      )
  }
  return (
    <div className="whitespace-pre-wrap text-gray-900 dark:text-white">{typeof exercise.content === 'string' ? exercise.content : JSON.stringify(exercise.content, null, 2)}</div>
  )
}

const getExerciseTitle = (type: string) => {
  switch (type) {
    case 'controlled-input':
      return 'Controlled Input'
    case 'structured-practice':
      return 'Structured Practice'
    case 'freer-production':
      return 'Freer Production'
    case 'extension':
      return 'Extension Activity'
    default:
      return type
  }
}

export default function SharedLessonPage() {
  const params = useParams()
  const lessonId = params?.id as string
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [lesson, setLesson] = useState<SharedLessonData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => setMounted(true), [])

  useEffect(() => {
    const fetchLesson = async () => {
      if (!lessonId) return
      try {
        setLoading(true)
        setError(null)
        const res = await fetch(`/api/lessons/${lessonId}/share`)
        const data = await res.json()
        if (res.ok) {
          setLesson(data)
        } else {
          setError(data.error || 'Failed to load lesson')
        }
      } catch (e) {
        console.error(e)
        setError('Failed to load lesson. Please try again.')
      } finally {
        setLoading(false)
      }
    }
    fetchLesson()
  }, [lessonId])

  const logoSrc = mounted && theme === 'light' ? '/logo.svg' : '/white-logo.svg'
  const nameSrc = mounted && theme === 'light' ? '/name.svg' : '/white-name.svg'

  return (
    <ClientThemeProvider>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2 sm:space-x-3">
              <Image src={logoSrc} alt="Avidato Logo" width={32} height={32} className="w-6 h-6 sm:w-8 sm:h-8" />
              <Image src={nameSrc} alt="Avidato" width={80} height={24} className="h-5 sm:h-6" />
            </Link>
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              aria-label="Toggle theme"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {theme === 'dark' ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                )}
              </svg>
            </button>
          </div>
        </header>

        <main className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
          {loading && (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary mx-auto"></div>
              <p className="mt-2 text-sm sm:text-base text-gray-600 dark:text-gray-400">Loading lesson...</p>
            </div>
          )}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 text-center">
              <h3 className="text-lg font-semibold text-red-800 dark:text-red-400 mb-2">Unable to Load Lesson</h3>
              <p className="text-sm sm:text-base text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}
          {!loading && !error && lesson && (
            <>
              {lesson.content?.isGrammarLesson ? (
                <SharedGrammarLesson lesson={lesson} />
              ) : lesson.content?.lessonType === 'Under-18' ? (
                <Under18LessonDisplay
                  lesson={{
                    metadata: {
                      id: lesson.id,
                      title: lesson.content.title || '',
                      level: lesson.student.level,
                      topic: lesson.content.context || '',
                      duration: lesson.content.duration || 0,
                      difficulty: lesson.content.difficulty || 0,
                      targetAudience: 'Under 18',
                      ageGroup: 'Under 18',
                    },
                    learningObjectives: {
                      communicative: [lesson.content.objective || ''],
                      linguistic: lesson.content.skills || [],
                      cultural: [],
                    },
                    exercises: (lesson.content.exercises || []).map((ex: LessonExercise, i: number) => ({
                      id: `exercise-${i}`,
                      number: i + 1,
                      type: ex.type,
                      title: ex.title || '',
                      description: ex.description || '',
                      timeMinutes: ex.timeMinutes || 0,
                      instructions: ex?.content?.instructions || 'Complete this exercise',
                      content: (ex?.content as Record<string, unknown>) || {},
                    })),
                  }}
                  showObjectives={true}
                  showProgressBar={true}
                />
              ) : (
                <div className="space-y-8">
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                    <div className="text-center mb-6">
                      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">{lesson.content.title}</h1>
                      <p className="text-base text-gray-600 dark:text-gray-400 mb-4">{lesson.content.objective}</p>
                      <div className="flex flex-wrap justify-center gap-4 text-xs sm:text-sm">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-500 dark:text-gray-400">Duration:</span>
                          <span className="text-gray-900 dark:text-white">{lesson.content.duration} min</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-500 dark:text-gray-400">Level:</span>
                          <span className="text-gray-900 dark:text-white">{lesson.student.level}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-500 dark:text-gray-400">Type:</span>
                          <span className="px-2 py-1 bg-brand-primary/10 text-brand-primary rounded-full">{lesson.content.lessonType}</span>
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      <div className="text-center">
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Skills</h3>
                        {Array.isArray(lesson.content.skills) ? (
                          <div className="flex flex-wrap justify-center gap-2">
                            {lesson.content.skills.map((s: string) => (
                              <span key={s} className="px-2 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 rounded-full text-xs">{s}</span>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-gray-600 dark:text-gray-400">No skills listed</p>
                        )}
                      </div>
                      <div className="text-center">
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Vocabulary</h3>
                        {Array.isArray(lesson.content.vocabulary) && lesson.content.vocabulary.length > 0 ? (
                          <div className="flex flex-wrap justify-center gap-2">
                            {lesson.content.vocabulary?.slice(0, 8).map((w: string | { word?: string; term?: string }, i: number) => {
                              const word = typeof w === 'string' ? w : w.word || w.term || String(w)
                              return (
                                <span key={i} className="px-2 py-1 bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300 rounded-full text-xs">{word}</span>
                              )
                            })}
                            {lesson.content.vocabulary.length > 8 && (
                              <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full text-xs">+{lesson.content.vocabulary.length - 8} more</span>
                            )}
                          </div>
                        ) : (
                          <p className="text-xs text-gray-600 dark:text-gray-400">No vocabulary list</p>
                        )}
                      </div>
                      <div className="text-center">
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Context</h3>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">{lesson.content.context}</p>
                        <div>
                          <span className="font-medium text-gray-500 dark:text-gray-400 text-xs">Difficulty:</span>{' '}
                          <span className="text-xs text-gray-900 dark:text-white">{lesson.content.difficulty}/10</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    {(lesson.content.exercises || []).map((exercise: LessonExercise, index: number) => (
                      <div key={index} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                        <div className="flex items-center space-x-4 mb-4">
                          <div className="w-10 h-10 bg-brand-primary text-white rounded-xl flex items-center justify-center">
                            {getExerciseIcon(exercise.type)}
                          </div>
                          <div className="min-w-0 flex-1">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">{exercise.title}</h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{getExerciseTitle(exercise.type)} • {exercise.timeMinutes} min</p>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">{exercise.description}</p>
                        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 overflow-x-auto">{renderExerciseContent({ type: exercise.type, content: exercise.content, timeMinutes: exercise.timeMinutes || 0 })}</div>
                      </div>
                    ))}
                  </div>

                  <div className="text-center py-6 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-gray-500 dark:text-gray-400 text-xs">Lesson created with Avidato • Generated on {new Date(lesson.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              )}
            </>
          )}

          {!loading && !lesson && !error && (
            <div className="text-center py-16">
              <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C20.832 18.477 19.246 18 17.5 18c-1.746 0-3.332.477-4.5 1.253z" />
              </svg>
              <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">Lesson Not Available</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">This lesson may have been removed or is no longer accessible.</p>
              <Link href="/" className="inline-flex items-center px-6 py-3 rounded-md bg-brand-primary text-white hover:bg-brand-accent text-sm font-medium">Visit Avidato</Link>
            </div>
          )}
        </main>
      </div>
    </ClientThemeProvider>
  )
}