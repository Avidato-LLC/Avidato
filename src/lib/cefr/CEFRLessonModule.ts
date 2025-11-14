// Interface for CEFR-level lesson modules
// Each module implements lesson generation and vocabulary filtering for a specific CEFR level

import { StudentProfile, LearningTopic, GeneratedLesson } from '../../types/lesson-template';

export interface CEFRLessonModule {
  /**
   * Generates a lesson for the given student, topic, and duration
   */
  generateLesson(student: StudentProfile, topic: LearningTopic, duration: number): Promise<GeneratedLesson>;

  /**
   * Filters and returns vocabulary appropriate for the CEFR level
   */
  getVocabularyForLevel(words: string[]): string[];

  /**
   * Returns vocabulary guidance specific to this CEFR level
   */
  getVocabularyGuide(): string;
}
