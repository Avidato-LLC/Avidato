/**
 * Lesson Displays Module - Central Export
 * 
 * Exports all lesson display components for rendering different lesson structures
 * 
 * File Structure:
 * src/lib/lesson-displays/
 * ├── index.ts (this file)
 * ├── under-18-display.tsx
 * ├── README.md
 * └── renderers/
 *     ├── warm-up.tsx
 *     ├── vocabulary.tsx
 *     ├── expressions.tsx
 *     ├── dialogue.tsx
 *     ├── grammar.tsx
 *     ├── dialogue-completion.tsx
 *     ├── speaking.tsx
 *     ├── conversation.tsx
 *     └── challenge.tsx
 */

// Main display components
export { Under18LessonDisplay } from './under-18-display'

// Individual renderers (if needed for standalone use)
export { WarmUpRenderer } from './renderers/warm-up'
export { VocabularyRenderer } from './renderers/vocabulary'
export { ExpressionsRenderer } from './renderers/expressions'
export { DialogueRenderer } from './renderers/dialogue'
export { GrammarRenderer } from './renderers/grammar'
export { DialogueCompletionRenderer } from './renderers/dialogue-completion'
export { ComprehensionRenderer } from './renderers/comprehension'
export { RoleplayRenderer } from './renderers/roleplay'
export { DiscussionRenderer } from './renderers/discussion'
export { SpeakingRenderer } from './renderers/speaking'
export { ConversationRenderer } from './renderers/conversation'
export { ChallengeRenderer } from './renderers/challenge'

/**
 * Usage Example:
 * 
 * In your lesson page component:
 * 
 * ```tsx
 * import { Under18LessonDisplay } from '@/lib/lesson-displays'
 * import { dailyRoutinesLessonUnder18 } from '@/lib/lesson-templates/examples/daily-routines-lesson'
 * 
 * export default function LessonPage() {
 *   return (
 *     <Under18LessonDisplay
 *       lesson={dailyRoutinesLessonUnder18}
 *       studentName="Maria"
 *       showObjectives={true}
 *       showProgressBar={true}
 *     />
 *   )
 * }
 * ```
 */
