/**
 * Under-18 Lesson Template
 * 
 * A modular lesson structure specifically designed for students under 18 years old.
 * Features age-appropriate content with scaffolded exercises progressing from
 * receptive (listening/reading) to productive (speaking) skills.
 * 
 * This template can be used for any topic and adapted to different English levels.
 */

export interface ExerciseTemplate {
  id: string
  number: number
  type: 'warm-up' | 'vocabulary' | 'expressions' | 'dialogue' | 'grammar' | 'fill-blanks' | 'speaking' | 'conversation' | 'challenge'
  title: string
  description: string
  timeMinutes: number
  instructions: string
  content: ExerciseContent
  practice?: PracticeActivity
  checkUnderstanding?: ComprehensionQuestion[]
}

export interface ExerciseContent {
  text?: string
  items?: string[]
  dialogue?: DialogueExchange[]
  questions?: string[]
  sentences?: string[]
}

export interface DialogueExchange {
  speaker: string
  text: string
}

export interface PracticeActivity {
  type: 'fill-blanks' | 'matching' | 'multiple-choice' | 'substitution' | 'gap-fill' | 'role-play' | 'q&a'
  instructions: string
  content: string | string[] | { question: string; options: string[] }[]
  answerPool?: string[]
}

export interface ComprehensionQuestion {
  question: string
  expectedAnswer?: string
}

export interface Under18LessonTemplate {
  metadata: LessonMetadata
  learningObjectives: LearningObjective[]
  exercises: ExerciseTemplate[]
}

export interface LessonMetadata {
  title: string
  level: 'Beginner' | 'Elementary' | 'Pre-Intermediate' | 'Intermediate' | 'Upper-Intermediate' | 'Advanced'
  durationMinutes: number
  ageGroup: 'Under 18'
  lessonType: string
  topic: string
}

export interface LearningObjective {
  objective: string
  skill: 'speaking' | 'listening' | 'reading' | 'writing' | 'grammar' | 'vocabulary'
}

/**
 * Define the complete Under-18 Lesson Template Structure
 * 
 * Progression:
 * 1. Warm-up (1-2 min) - Ice breaker, activate prior knowledge
 * 2. Core Vocabulary (3-5 min) - Introduce 8-12 key terms
 * 3. Functional Language (2-3 min) - Teach 5-8 expressions
 * 4. Dialogue (3-5 min) - Model real usage with teacher
 * 5. Grammar Focus (3-4 min) - Reinforce accuracy
 * 6. Dialogue Completion (3-5 min) - Productive written practice
 * 7. Guided Speaking (3-5 min) - Structured production
 * 8. Free Conversation (3-5 min) - Fluency practice
 * 9. [Optional] Challenge (3-5 min) - Extension for advanced students
 * 
 * Total: ~25-50 minutes depending on depth and student level
 */

export const UNDER_18_LESSON_TEMPLATE: (overrides?: Partial<Under18LessonTemplate>) => Under18LessonTemplate = (overrides) => ({
  metadata: {
    title: 'Untitled Lesson',
    level: 'Intermediate',
    durationMinutes: 50,
    ageGroup: 'Under 18',
    lessonType: 'General English',
    topic: 'General Topic',
    ...overrides?.metadata,
  },
  
  learningObjectives: [
    {
      objective: 'Objective 1 - Replace with specific learning goal',
      skill: 'speaking',
    },
    {
      objective: 'Objective 2 - Replace with specific learning goal',
      skill: 'listening',
    },
    {
      objective: 'Objective 3 - Replace with specific learning goal',
      skill: 'vocabulary',
    },
    ...overrides?.learningObjectives || [],
  ],
  
  exercises: [
    // EXERCISE 1: WARM-UP
    {
      id: 'exercise-1-warmup',
      number: 1,
      type: 'warm-up',
      title: 'Warm-Up',
      description: 'Ice breaker and context setting',
      timeMinutes: 2,
      instructions: 'Have a short conversation based on these questions. This helps activate your prior knowledge and prepares you for the lesson.',
      content: {
        questions: [
          'Question 1 - Customize for your topic',
          'Question 2 - Customize for your topic',
          'Question 3 - Customize for your topic',
          'Question 4 - Customize for your topic (optional)',
        ],
      },
    },
    
    // EXERCISE 2: CORE VOCABULARY
    {
      id: 'exercise-2-vocabulary',
      number: 2,
      type: 'vocabulary',
      title: 'Core Vocabulary',
      description: 'Introduce key terms and phrases you will need for this lesson',
      timeMinutes: 4,
      instructions: 'Listen and repeat these words/phrases with your tutor. If you don\'t know a word, ask your tutor to read the definition and give an example sentence.',
      content: {
        items: [
          'Vocabulary Item 1 - Definition',
          'Vocabulary Item 2 - Definition',
          'Vocabulary Item 3 - Definition',
          'Vocabulary Item 4 - Definition',
          'Vocabulary Item 5 - Definition',
          'Vocabulary Item 6 - Definition',
          'Vocabulary Item 7 - Definition',
          'Vocabulary Item 8 - Definition',
        ],
      },
      practice: {
        type: 'fill-blanks',
        instructions: 'Fill in the blanks using words from the list above.',
        content: [
          'Sentence 1: __________ is used to...',
          'Sentence 2: When you __________, you...',
          'Sentence 3: A __________ is someone who...',
          'Sentence 4: To __________ means to...',
        ],
        answerPool: ['word1', 'word2', 'word3', 'word4'],
      },
    },
    
    // EXERCISE 3: FUNCTIONAL LANGUAGE / EXPRESSIONS
    {
      id: 'exercise-3-expressions',
      number: 3,
      type: 'expressions',
      title: 'Functional Language',
      description: 'Learn common ways to express the key concept',
      timeMinutes: 3,
      instructions: 'Listen and repeat these phrases and expressions with your tutor. These are natural ways to talk about the topic.',
      content: {
        items: [
          'Expression 1 - Example: ...',
          'Expression 2 - Example: ...',
          'Expression 3 - Example: ...',
          'Expression 4 - Example: ...',
          'Expression 5 - Example: ...',
          'Expression 6 - Example: ...',
        ],
      },
      practice: {
        type: 'substitution',
        instructions: 'Replace the underlined phrase with one of the expressions from above.',
        content: [
          'Sentence 1: I [usually do this] when...',
          'Sentence 2: Can you [help me with this]...',
          'Sentence 3: I\'ve never [tried this before]...',
        ],
      },
    },
    
    // EXERCISE 4: DIALOGUE (TEACHER MODELS)
    {
      id: 'exercise-4-dialogue',
      number: 4,
      type: 'dialogue',
      title: 'Dialogue',
      description: 'Listen to and read a realistic conversation using the vocabulary and expressions',
      timeMinutes: 5,
      instructions: 'Read the dialogue aloud with your tutor. Pay attention to how the vocabulary and expressions are used in real conversation.',
      content: {
        dialogue: [
          { speaker: 'Tutor', text: 'First question or statement from tutor' },
          { speaker: 'Student', text: 'Student response using new vocabulary' },
          { speaker: 'Tutor', text: 'Follow-up from tutor' },
          { speaker: 'Student', text: 'Student response using new expressions' },
          { speaker: 'Tutor', text: 'Another follow-up' },
          { speaker: 'Student', text: 'Final student response with natural language' },
        ],
      },
      checkUnderstanding: [
        {
          question: 'Comprehension Question 1 - Based on the dialogue',
          expectedAnswer: 'Expected answer or answer key',
        },
        {
          question: 'Comprehension Question 2 - Based on the dialogue',
          expectedAnswer: 'Expected answer or answer key',
        },
        {
          question: 'Comprehension Question 3 - Based on the dialogue',
          expectedAnswer: 'Expected answer or answer key',
        },
      ],
    },
    
    // EXERCISE 5: GRAMMAR / LANGUAGE STRUCTURE FOCUS
    {
      id: 'exercise-5-grammar',
      number: 5,
      type: 'grammar',
      title: 'Correct the Mistake',
      description: 'Find and correct grammatical errors or choose grammatically correct sentences',
      timeMinutes: 4,
      instructions: 'Find and correct the mistake in each sentence. Be careful — not all sentences have a mistake!',
      content: {
        sentences: [
          'Sentence 1 (may or may not have error)',
          'Sentence 2 (may or may not have error)',
          'Sentence 3 (may or may not have error)',
          'Sentence 4 (correct - no error)',
          'Sentence 5 (may or may not have error)',
          'Sentence 6 (may or may not have error)',
          'Sentence 7 (may or may not have error)',
          'Sentence 8 (correct - no error)',
        ],
      },
      practice: {
        type: 'multiple-choice',
        instructions: 'For each sentence, identify if it is correct or incorrect. If incorrect, what is the mistake?',
        content: 'Practice identifying and correcting errors',
      },
    },
    
    // EXERCISE 6: DIALOGUE COMPLETION (FILL IN BLANKS)
    {
      id: 'exercise-6-dialogue-completion',
      number: 6,
      type: 'fill-blanks',
      title: 'Dialogue Completion',
      description: 'Complete a dialogue by filling in missing words or phrases',
      timeMinutes: 5,
      instructions: 'Read the dialogue aloud with your tutor and fill in the blanks. You will be [Student Role Name].',
      content: {
        dialogue: [
          { speaker: 'Tutor', text: 'First line to student' },
          { speaker: 'Student', text: 'I (1) __________ (answer from pool)' },
          { speaker: 'Tutor', text: 'Follow-up question' },
          { speaker: 'Student', text: 'I (2) __________ (answer from pool)' },
          { speaker: 'Tutor', text: 'Another question' },
          { speaker: 'Student', text: 'Yes, and I also (3) __________ (answer from pool)' },
          { speaker: 'Tutor', text: 'That sounds interesting! Do you (4) __________?' },
          { speaker: 'Student', text: 'Not really, but I (5) __________' },
        ],
      },
      practice: {
        type: 'fill-blanks',
        instructions: 'Fill in blanks 1-6 using words/phrases from the answer pool below',
        content: 'Answer Pool will be provided with 8-10 options',
        answerPool: ['option1', 'option2', 'option3', 'option4', 'option5', 'option6'],
      },
    },
    
    // EXERCISE 7: GUIDED SPEAKING PRACTICE
    {
      id: 'exercise-7-guided-speaking',
      number: 7,
      type: 'speaking',
      title: 'Guided Speaking Practice',
      description: 'Ask your tutor questions or participate in a guided role-play',
      timeMinutes: 5,
      instructions: 'Ask your tutor these questions. Listen carefully to their responses and ask follow-up questions if needed.',
      content: {
        questions: [
          'Question 1 - Using new vocabulary',
          'Question 2 - Using new expressions',
          'Question 3 - Using new vocabulary',
          'Question 4 - Using new expressions',
          'Question 5 - Combined usage',
          'Question 6 - Follow-up or personal variation',
        ],
      },
      practice: {
        type: 'q&a',
        instructions: 'Ask your tutor the questions above. Try to maintain a natural conversation.',
        content: 'Speaking practice through question-asking',
      },
    },
    
    // EXERCISE 8: FREE CONVERSATION
    {
      id: 'exercise-8-conversation',
      number: 8,
      type: 'conversation',
      title: 'Free Conversation',
      description: 'Have a natural conversation using everything you learned',
      timeMinutes: 5,
      instructions: 'Have a conversation based on these questions. Don\'t forget to ask your tutor some questions too! Try to personalize your answers.',
      content: {
        questions: [
          'Open question 1 - Allows for personal response',
          'Open question 2 - Allows for personal response',
          'Open question 3 - Allows for personal response',
          'Open question 4 - Allows for personal response',
          'Open question 5 - Encourages student to ask tutor questions',
        ],
      },
      practice: {
        type: 'role-play',
        instructions: 'Have a free conversation. Your tutor will guide you, but try to lead some of the conversation yourself.',
        content: 'Fluency practice with personal expression',
      },
    },
    
    // EXERCISE 9: CHALLENGE (OPTIONAL - FOR ADVANCED STUDENTS)
    {
      id: 'exercise-9-challenge',
      number: 9,
      type: 'challenge',
      title: 'Challenge (Optional)',
      description: 'Extended activity for faster learners or deeper practice',
      timeMinutes: 5,
      instructions: 'This is an optional challenge activity. Try it if you finish the main lesson early or want extra practice.',
      content: {
        text: 'Challenge activity - could be: ordering sentences, discussing advanced topics, or creating your own dialogue',
      },
      practice: {
        type: 'role-play',
        instructions: 'Challenge yourself by creating a dialogue or explaining complex concepts using what you learned.',
        content: 'Advanced extension activity',
      },
    },
  ],
  
  ...overrides,
})

/**
 * Helper function to customize a lesson using this template
 * 
 * Example usage:
 * const myLesson = createUnder18Lesson({
 *   metadata: {
 *     title: "What Do You Have to Do at Work?",
 *     level: "Intermediate",
 *     durationMinutes: 50,
 *     topic: "Work and Jobs",
 *   },
 *   learningObjectives: [
 *     { objective: "Learn vocabulary related to jobs and work", skill: "vocabulary" },
 *     { objective: "Practice talking about job responsibilities", skill: "speaking" },
 *   ],
 * })
 */
export function createUnder18Lesson(
  customization: Partial<Under18LessonTemplate>
): Under18LessonTemplate {
  const baseTemplate = UNDER_18_LESSON_TEMPLATE()
  
  return {
    metadata: {
      ...baseTemplate.metadata,
      ...customization.metadata,
    },
    learningObjectives: customization.learningObjectives || baseTemplate.learningObjectives,
    exercises: customization.exercises || baseTemplate.exercises,
  }
}


