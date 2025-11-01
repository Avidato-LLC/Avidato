// Legacy/compatibility exports for GeminiService
export interface StudentProfile {
  name: string;
  targetLanguage: string;
  nativeLanguage: string;
  ageGroup: string;
  level: string;
  endGoals: string;
  occupation?: string;
  weaknesses?: string;
  interests?: string;
}

export interface LearningTopic {
  lessonNumber: number;
  title: string;
  objective: string;
  vocabulary: string[];
  grammarFocus?: string;
  skills: string[];
  context: string;
  methodology: 'CLT' | 'TBLT' | 'PPP' | 'TTT';
}

export interface LearningPlan {
  selectedMethodology: 'CLT' | 'TBLT' | 'PPP' | 'TTT';
  methodologyReasoning: string;
  topics: LearningTopic[];
}

export interface LessonExercise {
  type: 'vocabulary' | 'expressions' | 'dialogue' | 'roleplay' | 'discussion' | 'grammar' | 'article' | 'fill_blanks' | 'sentence_building' | 'pronunciation' | 'listening';
  title: string;
  description: string;
  content: string | string[] | object;
  timeMinutes: number;
}

export interface GeneratedLesson {
  title: string;
  lessonType: 'business' | 'grammar' | 'article' | 'conversation' | 'mixed';
  difficulty: number;
  duration: number;
  objective: string;
  skills: string[];
  vocabulary: string[];
  context: string;
  exercises: LessonExercise[];
  homework?: string;
  materials: string[];
  teachingNotes?: string;
}
/**
 * Comprehensive Lesson Template Types
 * Based on Engoo lesson structure with proper vocabulary and dialogue formatting
 */

export interface VocabularyItem {
  word: string
  partOfSpeech: 'Noun' | 'Verb' | 'Adjective' | 'Adverb' | 'Preposition' | 'Conjunction' | 'Interjection'
  phonetics: string // IPA pronunciation like "/ˈklæsɪfaɪd/"
  definition: string
  example: string
  synonym?: string // Contextually appropriate synonym, displayed as subscript. Leave empty if no suitable synonym exists.
  expressions?: string[] // Common collocations or phrase patterns, e.g., ["demonstrate compliance", "breach of compliance"]. For A2+.
}

export interface DialogueCharacter {
  name: string
  role?: string // e.g., "Chairman", "Manager", etc.
  avatar?: string // Character description for avatar generation
}

export interface DialogueLine {
  character: string
  text: string
}

export interface Exercise {
  number: number
  title: string
  type: 'vocabulary' | 'warmup' | 'dialogue' | 'comprehension' | 'roleplay' | 'discussion' | 'grammar'
  timeMinutes: number
  description?: string
  content: VocabularyExercise | WarmupExercise | DialogueExercise | ComprehensionExercise | RoleplayExercise | DiscussionExercise | GrammarExercise
}

export interface VocabularyExercise {
  vocabulary: VocabularyItem[]
}

export interface WarmupExercise {
  questions: string[]
  instructions?: string
}

export interface DialogueExercise {
  context: string
  characters: DialogueCharacter[]
  dialogue: DialogueLine[]
  instructions?: string
}

export interface ComprehensionExercise {
  questions: {
    question: string
    type: 'multiple-choice' | 'true-false' | 'short-answer'
    options?: string[] // for multiple choice
    answer?: string // for reference
  }[]
}

export interface RoleplayExercise {
  scenario: string
  roles: {
    name: string
    description: string
    keyPoints?: string[]
  }[]
  instructions: string
  timeMinutes: number
}

export interface DiscussionExercise {
  questions: string[]
  instructions?: string
}

export interface GrammarExercise {
  focus: string // e.g., "Present Perfect vs Past Simple"
  explanation: string
  examples: string[]
  practice: {
    question: string
    answer?: string
  }[]
}

export interface LessonTemplate {
  // Header Information
  title: string
  courseTitle: string // e.g., "Talking with Confidence"
  lessonNumber: number
  level: 'Beginner' | 'Elementary' | 'Intermediate' | 'Upper-Intermediate' | 'Advanced'
  duration: number // in minutes
  
  // Lesson Content
  objective: string
  context: string
  skills: string[] // e.g., ["Speaking", "Listening", "Vocabulary"]
  
  // Exercises in order
  exercises: Exercise[]
  
  // Additional Resources
  homework?: string
  additionalMaterials?: string[]
  teacherNotes?: string
}

// Helper type for the complete lesson data structure
export interface LessonData {
  id: string
  title: string
  overview: string | null
  content: LessonTemplate
  createdAt: Date
  student: {
    id: string
    name: string
    targetLanguage: string
    level: string
  }
}