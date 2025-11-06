# Lesson Templates Module

## Overview

This module provides a modular, reusable lesson template system for Avidato. It emphasizes modularity and separation of concerns, allowing lesson templates to be defined independently and then used/modified by other parts of the application.

## File Structure

```
src/lib/lesson-templates/
├── README.md (this file)
├── index.ts (main export - central entry point)
├── under-18-template.ts (template definition for under-18 students)
└── examples/
    ├── work-experience-lesson.ts (example implementation)
    └── [other lesson examples...]
```

## Key Components

### 1. `under-18-template.ts`

Defines the **Under-18 Lesson Template** with a 9-exercise structure:

1. **Warm-Up** (2 min) - Ice breaker, activate prior knowledge
2. **Core Vocabulary** (4 min) - Introduce 8-12 key terms
3. **Functional Language** (3 min) - Teach 5-8 expressions  
4. **Dialogue** (5 min) - Model real usage with teacher
5. **Correct the Mistake** (4 min) - Grammar/structure focus
6. **Dialogue Completion** (5 min) - Fill-in-the-blanks practice
7. **Guided Speaking** (5 min) - Ask questions, structured practice
8. **Free Conversation** (5 min) - Open-ended discussion
9. **Challenge Activity** (5 min) - Optional extension for advanced students

**Key Exports:**
- `UNDER_18_LESSON_TEMPLATE()` - Base template factory function
- `createUnder18Lesson()` - Customization helper function
- TypeScript interfaces for type safety

### 2. `index.ts`

Central export file that:
- Re-exports the Under-18 template
- Exports all TypeScript types
- Provides placeholder for future templates (General English, Business English, Exam Prep)

### 3. `examples/work-experience-lesson.ts`

Complete example showing how to implement the template for a real lesson about work/jobs.

## TypeScript Types

```typescript
// Main lesson structure
interface Under18LessonTemplate {
  metadata: LessonMetadata
  learningObjectives: LearningObjective[]
  exercises: ExerciseTemplate[]
}

// Exercise structure
interface ExerciseTemplate {
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

// Practice activities
interface PracticeActivity {
  type: 'fill-blanks' | 'matching' | 'multiple-choice' | 'substitution' | 'gap-fill' | 'role-play' | 'q&a'
  instructions: string
  content: string | string[] | object[]
  answerPool?: string[]
}
```

## Usage Examples

### Basic Import
```typescript
import { UNDER_18_LESSON_TEMPLATE, createUnder18Lesson } from '@/lib/lesson-templates'
```

### Use the Base Template
```typescript
const baseTemplate = UNDER_18_LESSON_TEMPLATE()
// Access metadata, objectives, and exercises
console.log(baseTemplate.metadata.title) // "Untitled Lesson"
```

### Create a Custom Lesson
```typescript
const myLesson = createUnder18Lesson({
  metadata: {
    title: "Daily Routines",
    level: "Elementary",
    durationMinutes: 50,
    topic: "Lifestyle and Routines"
  },
  learningObjectives: [
    { objective: "Talk about daily activities", skill: "speaking" },
    { objective: "Learn routine verbs", skill: "vocabulary" }
  ]
})
```

### Use in a Lesson Renderer Component
```typescript
import { workExperienceLessonUnder18 } from '@/lib/lesson-templates/examples/work-experience-lesson'

export function LessonViewer() {
  return (
    <div>
      <h1>{workExperienceLessonUnder18.metadata.title}</h1>
      <p>Level: {workExperienceLessonUnder18.metadata.level}</p>
      
      {workExperienceLessonUnder18.exercises.map((exercise) => (
        <Exercise key={exercise.id} exercise={exercise} />
      ))}
    </div>
  )
}
```

### Access Specific Exercise
```typescript
const dialogueExercise = myLesson.exercises.find(
  (ex) => ex.type === 'dialogue'
)

if (dialogueExercise && dialogueExercise.content.dialogue) {
  dialogueExercise.content.dialogue.forEach((line) => {
    console.log(`${line.speaker}: ${line.text}`)
  })
}
```

## How to Create a New Lesson

### Step 1: Create a New Template File (if needed)
If you need a different structure for a new age group or proficiency level:
```typescript
// src/lib/lesson-templates/advanced-template.ts
export const ADVANCED_LESSON_TEMPLATE = () => { ... }
export function createAdvancedLesson(customization) { ... }
```

Then export it from `index.ts`:
```typescript
export { ADVANCED_LESSON_TEMPLATE, createAdvancedLesson } from './advanced-template'
```

### Step 2: Create a Lesson Implementation File
```typescript
// src/lib/lesson-templates/examples/my-new-lesson.ts
import { createUnder18Lesson } from '../under-18-template'

export const myNewLesson = createUnder18Lesson({
  metadata: { 
    title: "My Lesson Title",
    // ... customize metadata
  },
  learningObjectives: [
    // ... define objectives
  ],
  exercises: [
    // ... customize or completely replace exercises
  ]
})
```

### Step 3: Import and Use
```typescript
import { myNewLesson } from '@/lib/lesson-templates/examples/my-new-lesson'

// Now use myNewLesson in your components
```

## Modularity Benefits

1. **Separation of Concerns** - Template definitions are separate from implementations
2. **Reusability** - Base templates can be used for multiple lessons
3. **Maintainability** - Easy to update template structure in one place
4. **Type Safety** - Full TypeScript support prevents errors
5. **Scalability** - Easy to add new templates or lessons
6. **Testing** - Templates can be tested independently
7. **Documentation** - Each lesson is self-documenting

## Future Extensions

The system is designed to accommodate:

- [ ] Additional lesson templates (General English, Business, Exam Prep, etc.)
- [ ] Difficulty levels within templates
- [ ] Custom exercise types
- [ ] Media/image/audio support in exercises
- [ ] Adaptive difficulty based on student performance
- [ ] Integration with Gemini API for AI generation
- [ ] Lesson variations (e.g., same topic, different format)

## Contributing

When adding new lessons:

1. Use the existing template that best fits your needs
2. Create an example implementation file in `examples/`
3. Add comprehensive comments explaining customizations
4. Export from the main `index.ts` if creating a new template
5. Test that the lesson structure is valid

## Notes

- All exercises have estimated time values that sum to the lesson duration
- Exercise descriptions help both teachers and students understand each activity
- Practice activities provide clear instructions for both teacher and student
- Comprehension checks ensure students understand key content
- Challenge exercises allow for differentiation and advanced practice
