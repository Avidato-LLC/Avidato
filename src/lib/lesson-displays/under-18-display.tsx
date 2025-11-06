/**
 * Under-18 Lesson Display Component
 * 
 * Modular display system for rendering under-18 lessons with 9 structured exercises
 * Each exercise type has its own optimized renderer component
 * 
 * File Structure:
 * - under-18-display.tsx (this file) - Main orchestrator
 * - renderers/
 *   ├── warm-up.tsx - Exercise 1
 *   ├── vocabulary.tsx - Exercise 2
 *   ├── expressions.tsx - Exercise 3
 *   ├── dialogue.tsx - Exercise 4
 *   ├── grammar.tsx - Exercise 5
 *   ├── dialogue-completion.tsx - Exercise 6
 *   ├── speaking.tsx - Exercise 7
 *   ├── conversation.tsx - Exercise 8
 *   └── challenge.tsx - Exercise 9
 */

import React from 'react'
import { WarmUpRenderer } from './renderers/warm-up'
import { VocabularyRenderer } from './renderers/vocabulary'
import { ExpressionsRenderer } from './renderers/expressions'
import { DialogueRenderer } from './renderers/dialogue'
import { GrammarRenderer } from './renderers/grammar'
import { DialogueCompletionRenderer } from './renderers/dialogue-completion'
import { ComprehensionRenderer } from './renderers/comprehension'
import { RoleplayRenderer } from './renderers/roleplay'
import { DiscussionRenderer } from './renderers/discussion'
import { SpeakingRenderer } from './renderers/speaking'
import { ConversationRenderer } from './renderers/conversation'
import { ChallengeRenderer } from './renderers/challenge'

/**
 * Main interface for Under-18 lesson data structure
 * Must match the shape from under-18-template.ts
 */
interface Under18Lesson {
  metadata: {
    id: string
    title: string
    level: string
    topic: string
    duration: number
    difficulty: number
    targetAudience: string
    ageGroup: string
  }
  learningObjectives: {
    communicative: string[]
    linguistic: string[]
    cultural: string[]
  }
  exercises: Array<{
    id: string
    number: number
    type: string
    title: string
    description: string
    timeMinutes: number
    instructions: string
    content: Record<string, unknown>
    practice?: Record<string, unknown>
  }>
}

interface Under18DisplayProps {
  lesson: Under18Lesson
  showObjectives?: boolean
  showProgressBar?: boolean
}

export const Under18LessonDisplay: React.FC<Under18DisplayProps> = ({
  lesson,
  showObjectives = true,
  showProgressBar = true,
}) => {
  const [currentExerciseIndex, setCurrentExerciseIndex] = React.useState(0)
  const [completedExercises, setCompletedExercises] = React.useState<Set<number>>(new Set())

  const currentExercise = lesson.exercises[currentExerciseIndex]

  const toggleCompleted = (index: number) => {
    const newSet = new Set(completedExercises)
    if (newSet.has(index)) {
      newSet.delete(index)
    } else {
      newSet.add(index)
    }
    setCompletedExercises(newSet)
  }

  const goToExercise = (index: number) => {
    setCurrentExerciseIndex(index)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const goToNext = () => {
    if (currentExerciseIndex < lesson.exercises.length - 1) {
      goToExercise(currentExerciseIndex + 1)
    }
  }

  const goToPrevious = () => {
    if (currentExerciseIndex > 0) {
      goToExercise(currentExerciseIndex - 1)
    }
  }

  const renderExercise = (exercise: Under18Lesson['exercises'][0]) => {
    const content = exercise.content as Record<string, unknown>

    switch (exercise.type) {
      case 'warm-up':
      case 'warmup':
        return (
          <WarmUpRenderer
            title={exercise.title}
            description={exercise.description}
            instructions={exercise.instructions}
            questions={content.questions as Parameters<typeof WarmUpRenderer>[0]['questions']}
            timeMinutes={exercise.timeMinutes}
          />
        )

      case 'vocabulary':
        return (
          <VocabularyRenderer
            title={exercise.title}
            instructions={exercise.instructions}
            vocabulary={content.vocabulary as Parameters<typeof VocabularyRenderer>[0]['vocabulary']}
            practiceActivity={content.practice as Parameters<typeof VocabularyRenderer>[0]['practiceActivity']}
            timeMinutes={exercise.timeMinutes}
          />
        )

      case 'expressions':
      case 'functional-language':
        return (
          <ExpressionsRenderer
            instructions={exercise.instructions}
            expressions={content.expressions as Parameters<typeof ExpressionsRenderer>[0]['expressions']}
            timeMinutes={exercise.timeMinutes}
          />
        )

      case 'dialogue': {
        // Handle characters as array of objects or strings
        const charactersArray = content.characters as Array<{name: string; role?: string; avatar?: string} | string>;
        const characterNames = charactersArray.map((char) => 
          typeof char === 'string' ? char : char.name
        );
        
        return (
          <DialogueRenderer
            title={exercise.title}
            setting={content.setting as string}
            characters={characterNames}
            dialogue={content.dialogue as Parameters<typeof DialogueRenderer>[0]['dialogue']}
            comprehensionQuestions={content.comprehensionQuestions as Parameters<typeof DialogueRenderer>[0]['comprehensionQuestions']}
            timeMinutes={exercise.timeMinutes}
          />
        )
      }

      case 'grammar':
      case 'correct-the-mistake':
        return (
          <GrammarRenderer
            title={exercise.title}
            instructions={exercise.instructions}
            sentences={content.sentences as Parameters<typeof GrammarRenderer>[0]['sentences']}
            timeMinutes={exercise.timeMinutes}
          />
        )

      case 'dialogue-completion':
      case 'dialogue_completion':
        return (
          <DialogueCompletionRenderer
            title={exercise.title}
            instructions={exercise.instructions}
            dialogue={content.dialogue as Parameters<typeof DialogueCompletionRenderer>[0]['dialogue']}
            timeMinutes={exercise.timeMinutes}
            difficulty={content.difficulty as string}
          />
        )

      case 'comprehension':
        return (
          <ComprehensionRenderer
            title={exercise.title}
            instructions={exercise.instructions}
            questions={content.questions as Parameters<typeof ComprehensionRenderer>[0]['questions']}
            timeMinutes={exercise.timeMinutes}
          />
        )

      case 'speaking':
      case 'guided-speaking':
        return (
          <SpeakingRenderer
            instructions={exercise.instructions}
            questions={content.questions as Parameters<typeof SpeakingRenderer>[0]['questions']}
            timeMinutes={exercise.timeMinutes}
          />
        )

      case 'roleplay':
        return (
          <RoleplayRenderer
            title={exercise.title}
            instructions={exercise.instructions}
            scenario={content.scenario as string}
            roles={content.roles as Parameters<typeof RoleplayRenderer>[0]['roles']}
            timeMinutes={exercise.timeMinutes}
          />
        )

      case 'discussion':
        return (
          <DiscussionRenderer
            title={exercise.title}
            instructions={exercise.instructions}
            questions={content.questions as string[]}
            timeMinutes={exercise.timeMinutes}
          />
        )

      case 'conversation':
      case 'free-conversation':
        return (
          <ConversationRenderer
            instructions={exercise.instructions}
            questions={content.questions as Parameters<typeof ConversationRenderer>[0]['questions']}
            timeMinutes={exercise.timeMinutes}
          />
        )

      case 'challenge':
        return (
          <ChallengeRenderer
            title={exercise.title}
            description={exercise.description}
            instructions={exercise.instructions}
            content={content.content as string}
            timeMinutes={exercise.timeMinutes}
            level={content.level as 'medium' | 'hard' | 'advanced'}
          />
        )

      default:
        return (
          <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Unknown exercise type: {exercise.type}
            </p>
          </div>
        )
    }
  }

  return (
    <div className="space-y-6">
      {/* Lesson Header */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          {lesson.metadata.title}
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 mb-4">
          Level: {lesson.metadata.level} • Topic: {lesson.metadata.topic}
        </p>

        {/* Learning Objectives */}
        {showObjectives && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-2">
                Communicative Goals
              </h3>
              <ul className="space-y-1 text-sm text-gray-700 dark:text-gray-300">
                {lesson.learningObjectives.communicative.slice(0, 3).map((goal, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-blue-500 mt-0.5">•</span>
                    <span>{goal}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-2">
                Language Focus
              </h3>
              <ul className="space-y-1 text-sm text-gray-700 dark:text-gray-300">
                {lesson.learningObjectives.linguistic.slice(0, 3).map((goal, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-green-500 mt-0.5">•</span>
                    <span>{goal}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* Progress Bar */}
      {showProgressBar && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-gray-900 dark:text-white">
                Exercise {currentExerciseIndex + 1} of {lesson.exercises.length}
              </span>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {completedExercises.size} completed
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
              <div
                className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-500"
                style={{
                  width: `${((currentExerciseIndex + 1) / lesson.exercises.length) * 100}%`,
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Current Exercise */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 text-white rounded-full flex items-center justify-center font-bold">
              {currentExercise.number}
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {currentExercise.title}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {currentExercise.description}
              </p>
            </div>
          </div>
          <button
            onClick={() => toggleCompleted(currentExerciseIndex)}
            className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all ${
              completedExercises.has(currentExerciseIndex)
                ? 'bg-green-500 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-400'
            }`}
          >
            ✓
          </button>
        </div>

        {/* Exercise Content */}
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 overflow-x-auto">
          {renderExercise(currentExercise)}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex gap-3 justify-between">
        <button
          onClick={goToPrevious}
          disabled={currentExerciseIndex === 0}
          className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          ← Previous
        </button>

        {/* Exercise Dots */}
        <div className="flex gap-2">
          {lesson.exercises.map((_, index) => (
            <button
              key={index}
              onClick={() => goToExercise(index)}
              className={`w-3 h-3 rounded-full transition-all ${
                index === currentExerciseIndex
                  ? 'bg-blue-500 w-8'
                  : completedExercises.has(index)
                    ? 'bg-green-500 hover:bg-green-600'
                    : 'bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500'
              }`}
              title={`Exercise ${index + 1}`}
            />
          ))}
        </div>

        <button
          onClick={goToNext}
          disabled={currentExerciseIndex === lesson.exercises.length - 1}
          className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Next →
        </button>
      </div>

      {/* Completion Message */}
      {currentExerciseIndex === lesson.exercises.length - 1 && completedExercises.size === lesson.exercises.length && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-6 text-center">
          <p className="text-lg font-semibold text-green-800 dark:text-green-300">
            🎉 Excellent! You&apos;ve completed all exercises!
          </p>
          <p className="text-sm text-green-700 dark:text-green-400 mt-2">
            Great effort! Review any challenging parts and discuss with your tutor.
          </p>
        </div>
      )}
    </div>
  )
}

export default Under18LessonDisplay
