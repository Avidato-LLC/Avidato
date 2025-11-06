/**
 * Lesson Templates Index
 * 
 * Central export file for all lesson template modules.
 * This allows for easy importing from other parts of the application.
 * 
 * Usage:
 * import { UNDER_18_LESSON_TEMPLATE, createUnder18Lesson } from '@/lib/lesson-templates'
 */

// Import and re-export the Under-18 lesson template
export {
  UNDER_18_LESSON_TEMPLATE,
  createUnder18Lesson,
  type Under18LessonTemplate,
  type ExerciseTemplate,
  type LessonMetadata,
  type LearningObjective,
  type ExerciseContent,
  type DialogueExchange,
  type PracticeActivity,
  type ComprehensionQuestion,
} from './under-18-template'

// Future lesson templates can be added here:
// export { GENERAL_ENGLISH_TEMPLATE, createGeneralEnglishLesson } from './general-english-template'
// export { BUSINESS_ENGLISH_TEMPLATE, createBusinessEnglishLesson } from './business-english-template'
// export { EXAM_PREP_TEMPLATE, createExamPrepLesson } from './exam-prep-template'
