# Lesson Displays Module

Modular, reusable lesson display components for rendering different lesson structures with age-appropriate exercises.

## Overview

The `lesson-displays` module provides a complete, modular system for rendering lessons with specialized components for each exercise type. This ensures:

- **Clean Separation of Concerns**: Each exercise type has its own optimized renderer
- **Reusability**: Components can be used independently or together
- **Modularity**: Easy to extend with new lesson types or exercise renderers
- **Consistency**: All exercises follow the same UX patterns
- **Type Safety**: Full TypeScript support with proper interfaces

## Architecture

### File Structure

```
src/lib/lesson-displays/
├── index.ts                           # Central export file
├── under-18-display.tsx              # Main orchestrator for Under-18 lessons
├── README.md                         # This file
└── renderers/
    ├── warm-up.tsx                   # Exercise 1: Warm-up questions
    ├── vocabulary.tsx                # Exercise 2: Vocabulary with definitions
    ├── expressions.tsx               # Exercise 3: Functional language expressions
    ├── dialogue.tsx                  # Exercise 4: Realistic dialogue
    ├── grammar.tsx                   # Exercise 5: Correct the mistake
    ├── dialogue-completion.tsx       # Exercise 6: Fill in the blanks
    ├── speaking.tsx                  # Exercise 7: Guided speaking questions
    ├── conversation.tsx              # Exercise 8: Free conversation
    └── challenge.tsx                 # Exercise 9: Optional extension challenge
```

### Component Hierarchy

```
Under18LessonDisplay (Main Orchestrator)
├── Lesson Header (Title, Level, Objectives)
├── Progress Bar
├── Exercise Container (Renders based on exercise type)
│   ├── WarmUpRenderer
│   ├── VocabularyRenderer
│   ├── ExpressionsRenderer
│   ├── DialogueRenderer
│   ├── GrammarRenderer
│   ├── DialogueCompletionRenderer
│   ├── SpeakingRenderer
│   ├── ConversationRenderer
│   └── ChallengeRenderer
├── Navigation Controls
└── Completion Status
```

## Usage

### Basic Implementation

```tsx
import { Under18LessonDisplay } from '@/lib/lesson-displays'
import { dailyRoutinesLessonUnder18 } from '@/lib/lesson-templates/examples/daily-routines-lesson'

export default function LessonPage() {
  return (
    <Under18LessonDisplay
      lesson={dailyRoutinesLessonUnder18}
      studentName="Maria"
      showObjectives={true}
      showProgressBar={true}
    />
  )
}
```

### Advanced Configuration

```tsx
import { Under18LessonDisplay } from '@/lib/lesson-displays'
import { createUnder18Lesson } from '@/lib/lesson-templates'

const customLesson = createUnder18Lesson({
  title: 'My Custom Lesson',
  topic: 'School Life',
  level: 'Pre-Intermediate',
  // ... customize exercises
})

export default function LessonPage() {
  return (
    <Under18LessonDisplay
      lesson={customLesson}
      studentName={currentStudent.name}
      showObjectives={true}
      showProgressBar={true}
    />
  )
}
```

### Standalone Renderer Usage

Individual renderers can be used independently:

```tsx
import { VocabularyRenderer } from '@/lib/lesson-displays'

export function VocabularyPractice() {
  const vocabulary = [
    {
      term: 'wake up',
      definition: 'to stop sleeping',
      example: 'I wake up at 7 AM every morning',
      category: 'Daily Routine'
    },
    // ...
  ]

  return (
    <VocabularyRenderer
      instructions="Learn these daily routine vocabulary words"
      vocabulary={vocabulary}
      timeMinutes={5}
    />
  )
}
```

## Component Details

### Under18LessonDisplay

**Main orchestrator component** that manages the lesson flow and exercise navigation.

**Props:**
```typescript
interface Under18DisplayProps {
  lesson: Under18Lesson                  // Lesson data from templates
  studentName?: string                   // Optional student name for personalization
  showObjectives?: boolean              // Show learning objectives (default: true)
  showProgressBar?: boolean             // Show exercise progress (default: true)
}
```

**Features:**
- Exercise navigation with dot indicators
- Completion tracking per exercise
- Smooth scrolling between exercises
- Progress bar with visual feedback
- Responsive design for all screen sizes
- Dark mode support

### Exercise Renderers

Each renderer is optimized for its exercise type:

#### 1. WarmUpRenderer
**Purpose:** Ice-breaker questions to engage students  
**Exercise Type:** `warm-up`, `warmup`  
**Duration:** 2-3 minutes  
**Key Features:**
- Numbered questions with hints
- Student response prompts
- Easy-to-follow format

#### 2. VocabularyRenderer
**Purpose:** Learn new vocabulary with definitions and examples  
**Exercise Type:** `vocabulary`  
**Duration:** 4-5 minutes  
**Key Features:**
- Expandable vocabulary cards
- Definitions and examples
- Category badges
- Practice activities
- Click to reveal details

#### 3. ExpressionsRenderer
**Purpose:** Learn functional language expressions  
**Exercise Type:** `expressions`, `functional-language`  
**Duration:** 3-4 minutes  
**Key Features:**
- Expression grid layout
- Meaning, examples, and usage context
- Click-to-expand interface
- Color-coded selections

#### 4. DialogueRenderer
**Purpose:** Present realistic conversation  
**Exercise Type:** `dialogue`  
**Duration:** 5-6 minutes  
**Key Features:**
- Character color-coding
- Setting context display
- Optional translation toggles
- Comprehension questions
- Character badges

#### 5. GrammarRenderer
**Purpose:** Error identification and correction practice  
**Exercise Type:** `grammar`, `correct-the-mistake`  
**Duration:** 4-5 minutes  
**Key Features:**
- Incorrect sentence highlighting
- Reveal button for progressive disclosure
- Detailed explanations
- Category badges
- Learning strategies

#### 6. DialogueCompletionRenderer
**Purpose:** Fill-in-the-blanks dialogue practice  
**Exercise Type:** `dialogue-completion`, `dialogue_completion`  
**Duration:** 5-6 minutes  
**Key Features:**
- Character identification
- Blank answer reveal buttons
- Difficulty levels
- Character color-coding

#### 7. SpeakingRenderer
**Purpose:** Structured speaking practice  
**Exercise Type:** `speaking`, `guided-speaking`  
**Duration:** 5-6 minutes  
**Key Features:**
- Progress tracking
- Question selection interface
- Difficulty indicators
- Guiding points for each question
- Speaking tips

#### 8. ConversationRenderer
**Purpose:** Open-ended conversation practice  
**Exercise Type:** `conversation`, `free-conversation`  
**Duration:** 5-6 minutes  
**Key Features:**
- Expandable conversation prompts
- Follow-up questions
- Vocabulary support
- Conversation tips
- Reflection prompts

#### 9. ChallengeRenderer
**Purpose:** Optional extension activity  
**Exercise Type:** `challenge`  
**Duration:** 5-7 minutes (optional)  
**Key Features:**
- Challenge acceptance toggle
- Progressive disclosure of challenge details
- Difficulty levels (medium, hard, advanced)
- Motivation and tips
- Completion rewards

## Integration with Templates

The displays module works seamlessly with the `lesson-templates` module:

```tsx
// Template provides the lesson data structure
import { UNDER_18_LESSON_TEMPLATE } from '@/lib/lesson-templates'

// Display renders it beautifully
import { Under18LessonDisplay } from '@/lib/lesson-displays'

// Create and render
const lessonData = UNDER_18_LESSON_TEMPLATE()
return <Under18LessonDisplay lesson={lessonData} />
```

## Styling & Theming

All components support:
- **Dark Mode**: Automatic dark theme support via `dark:` utilities
- **Responsive Design**: Mobile, tablet, and desktop layouts
- **Color Coding**: Semantic colors for different exercise types:
  - Blue: Warm-up, Dialogue
  - Green: Vocabulary
  - Purple: Expressions
  - Red: Grammar
  - Amber: Dialogue Completion
  - Cyan: Speaking
  - Emerald: Conversation
  - Gold: Challenge

## Accessibility Features

- Semantic HTML structure
- ARIA labels for interactive elements
- Keyboard navigation support
- Color not the only indicator
- Sufficient color contrast
- Clear focus states

## Future Extensions

### Additional Renderers
- Reading comprehension
- Listening comprehension
- Writing practice
- Video exercises
- Interactive games

### Additional Display Orchestrators
- `general-english-display.tsx` - For general English lessons
- `business-english-display.tsx` - For business English
- `exam-prep-display.tsx` - For exam preparation

### Enhancement Ideas
- Exercise history and analytics
- Student note-taking within exercises
- Gamification elements (badges, streaks)
- AI-powered feedback integration
- Peer comparison features

## Performance Considerations

- Lazy rendering of off-screen exercises
- Memoized components to prevent re-renders
- Smooth scroll behavior
- Optimized re-renders with useState
- Efficient progress tracking

## Testing

Components are built with testability in mind:
- Pure functional components
- Props-based configuration
- No external dependencies
- Mockable interfaces

## Contributing

When adding new exercise types:

1. **Create new renderer** in `renderers/` folder
2. **Export from** `index.ts`
3. **Add case to** `Under18LessonDisplay.renderExercise()`
4. **Update documentation** with new type
5. **Add test cases** for the renderer

## Dependencies

- React 18+
- TypeScript
- Tailwind CSS (for styling)

## Notes

- All components are client-side rendered (`'use client'`)
- No external API calls from display components
- Stateless exercise renderers (state managed by orchestrator)
- Full dark mode support
- SEO-friendly HTML structure
