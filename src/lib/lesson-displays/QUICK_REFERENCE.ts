/**
 * QUICK REFERENCE - Lesson Display System
 * 
 * Import the display system:
 *   import { Under18LessonDisplay } from '@/lib/lesson-displays'
 * 
 * Use it:
 *   <Under18LessonDisplay
 *     lesson={lessonData}
 *     studentName="Student Name"
 *   />
 */

export const LESSON_DISPLAYS_QUICK_REFERENCE = {
  // ════════════════════════════════════════════════════════════════
  // MAIN COMPONENT
  // ════════════════════════════════════════════════════════════════
  
  Under18LessonDisplay: {
    description: 'Main orchestrator for Under-18 lessons',
    location: 'src/lib/lesson-displays/under-18-display.tsx',
    props: {
      lesson: 'Required - Under18Lesson object with metadata and exercises',
      studentName: 'Optional - For personalization display',
      showObjectives: 'Optional - Show learning objectives (default: true)',
      showProgressBar: 'Optional - Show progress bar (default: true)',
    },
    features: [
      'Exercise navigation with dot indicators',
      'Completion tracking per exercise',
      'Progress visualization',
      'Responsive design',
      'Dark mode support',
    ],
  },

  // ════════════════════════════════════════════════════════════════
  // EXERCISE RENDERERS
  // ════════════════════════════════════════════════════════════════
  
  renderers: {
    WarmUpRenderer: {
      exercise_type: 'warm-up | warmup',
      duration: '2-3 minutes',
      purpose: 'Ice-breaker questions to engage students',
      features: ['Numbered questions', 'Optional hints', 'Simple format'],
    },

    VocabularyRenderer: {
      exercise_type: 'vocabulary',
      duration: '4-5 minutes',
      purpose: 'Learn vocabulary with definitions and examples',
      features: ['Expandable cards', 'Definitions', 'Examples', 'Categories', 'Practice activities'],
    },

    ExpressionsRenderer: {
      exercise_type: 'expressions | functional-language',
      duration: '3-4 minutes',
      purpose: 'Learn functional language expressions',
      features: ['Grid layout', 'Meanings', 'Examples', 'Usage context', 'Click-to-expand'],
    },

    DialogueRenderer: {
      exercise_type: 'dialogue',
      duration: '5-6 minutes',
      purpose: 'Present realistic conversations',
      features: ['Character color-coding', 'Setting context', 'Translation toggles', 'Comprehension questions'],
    },

    GrammarRenderer: {
      exercise_type: 'grammar | correct-the-mistake',
      duration: '4-5 minutes',
      purpose: 'Error identification and correction',
      features: ['Error highlighting', 'Progressive revelation', 'Detailed explanations', 'Categories'],
    },

    DialogueCompletionRenderer: {
      exercise_type: 'dialogue-completion | dialogue_completion',
      duration: '5-6 minutes',
      purpose: 'Fill-in-the-blanks dialogue practice',
      features: ['Character identification', 'Blank reveal buttons', 'Difficulty levels'],
    },

    SpeakingRenderer: {
      exercise_type: 'speaking | guided-speaking',
      duration: '5-6 minutes',
      purpose: 'Structured speaking practice',
      features: ['Progress tracking', 'Question selection', 'Difficulty indicators', 'Guiding points'],
    },

    ConversationRenderer: {
      exercise_type: 'conversation | free-conversation',
      duration: '5-6 minutes',
      purpose: 'Open-ended conversation practice',
      features: ['Expandable prompts', 'Follow-up questions', 'Vocabulary support', 'Tips'],
    },

    ChallengeRenderer: {
      exercise_type: 'challenge',
      duration: '5-7 minutes (optional)',
      purpose: 'Optional extension activity',
      features: ['Acceptance toggle', 'Difficulty levels', 'Progressive disclosure', 'Motivation'],
    },
  },

  // ════════════════════════════════════════════════════════════════
  // INTEGRATION STEPS
  // ════════════════════════════════════════════════════════════════
  
  integration: [
    '1. Import: import { Under18LessonDisplay } from "@/lib/lesson-displays"',
    '2. Get Data: Fetch or create lesson data matching Under18Lesson interface',
    '3. Render: <Under18LessonDisplay lesson={data} studentName={name} />',
    '4. Wrap in DashboardLayout if needed for consistent styling',
  ],

  // ════════════════════════════════════════════════════════════════
  // LESSON DATA INTERFACE
  // ════════════════════════════════════════════════════════════════
  
  data_structure: {
    metadata: {
      id: 'string',
      title: 'string',
      level: 'string (Pre-Intermediate, etc)',
      topic: 'string',
      duration: 'number (in minutes)',
      difficulty: 'number (1-10)',
      targetAudience: 'string',
      ageGroup: 'string (Under 18, etc)',
    },
    learningObjectives: {
      communicative: 'string[]',
      linguistic: 'string[]',
      cultural: 'string[]',
    },
    exercises: [
      {
        id: 'string',
        number: 'number',
        type: 'string (warm-up, vocabulary, etc)',
        title: 'string',
        description: 'string',
        timeMinutes: 'number',
        instructions: 'string',
        content: 'object (varies by type)',
        practice: 'optional object',
      },
    ],
  },

  // ════════════════════════════════════════════════════════════════
  // FILE LOCATIONS
  // ════════════════════════════════════════════════════════════════
  
  files: {
    main: {
      'index.ts': 'Central exports',
      'under-18-display.tsx': 'Main orchestrator (542 lines)',
      'README.md': 'Complete documentation',
      'INTEGRATION_GUIDE.md': 'Integration examples',
      'SUMMARY.md': 'Implementation summary',
    },
    renderers: {
      'warm-up.tsx': 'Exercise 1 - Ice breakers',
      'vocabulary.tsx': 'Exercise 2 - Vocabulary',
      'expressions.tsx': 'Exercise 3 - Expressions',
      'dialogue.tsx': 'Exercise 4 - Dialogue',
      'grammar.tsx': 'Exercise 5 - Grammar',
      'dialogue-completion.tsx': 'Exercise 6 - Completion',
      'speaking.tsx': 'Exercise 7 - Speaking',
      'conversation.tsx': 'Exercise 8 - Conversation',
      'challenge.tsx': 'Exercise 9 - Challenge',
    },
  },

  // ════════════════════════════════════════════════════════════════
  // STYLING & THEMING
  // ════════════════════════════════════════════════════════════════
  
  colors: {
    'warm-up': 'Blue (#3B82F6)',
    'vocabulary': 'Green (#10B981)',
    'expressions': 'Purple (#A855F7)',
    'dialogue': 'Indigo (#6366F1)',
    'grammar': 'Red (#EF4444)',
    'dialogue-completion': 'Amber (#F59E0B)',
    'speaking': 'Cyan (#06B6D4)',
    'conversation': 'Emerald (#059669)',
    'challenge': 'Gold (#F59E0B)',
  },

  // ════════════════════════════════════════════════════════════════
  // FEATURES
  // ════════════════════════════════════════════════════════════════
  
  features: {
    'Exercise Navigation': 'Click dots to jump to exercises',
    'Progress Tracking': 'Marks exercises as completed',
    'Responsive Design': 'Works on mobile, tablet, desktop',
    'Dark Mode': 'Automatic light/dark theme',
    'Accessibility': 'ARIA labels, keyboard nav',
    'Animations': 'Smooth transitions and scrolling',
    'Type Safety': 'Full TypeScript support',
    'Documentation': 'Comprehensive guides included',
  },

  // ════════════════════════════════════════════════════════════════
  // EXAMPLE USAGE
  // ════════════════════════════════════════════════════════════════
  
  example_code: `
import { Under18LessonDisplay } from '@/lib/lesson-displays'
import { dailyRoutinesLessonUnder18 } from '@/lib/lesson-templates/examples/daily-routines-lesson'

export default function LessonPage() {
  return (
    <DashboardLayout>
      <Under18LessonDisplay
        lesson={dailyRoutinesLessonUnder18}
        studentName="Maria"
        showObjectives={true}
        showProgressBar={true}
      />
    </DashboardLayout>
  )
}
  `,

  // ════════════════════════════════════════════════════════════════
  // NEXT STEPS
  // ════════════════════════════════════════════════════════════════
  
  next_steps: [
    'Step 1: Review INTEGRATION_GUIDE.md for detailed instructions',
    'Step 2: Import Under18LessonDisplay in your lesson page',
    'Step 3: Transform your existing lesson data to Under18Lesson format',
    'Step 4: Replace old renderExerciseContent logic with display component',
    'Step 5: Test all exercise types and navigation',
    'Step 6: Verify dark mode and responsive design',
    'Step 7: Deploy to production',
  ],

  // ════════════════════════════════════════════════════════════════
  // COMMON ISSUES
  // ════════════════════════════════════════════════════════════════
  
  troubleshooting: {
    'Exercises not rendering': 'Check exercise type matches supported types',
    'Styling looks wrong': 'Ensure Tailwind CSS is configured',
    'Dark mode not working': 'Check dark: classes in Tailwind config',
    'Navigation not working': 'Verify lesson.exercises array is populated',
    'Progress not tracking': 'Check setCompletedExercises state updates',
  },
}

// Export for quick reference in IDE
export default LESSON_DISPLAYS_QUICK_REFERENCE
