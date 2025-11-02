// Interface for CEFR-level lesson modules
// Each module implements lesson generation and vocabulary filtering for a specific CEFR level

import { StudentProfile, LearningTopic, GeneratedLesson, VocabularyItem } from '../../types/lesson-template';

export interface CEFRLessonModule {
  /**
   * Generates a lesson for the given student, topic, and duration
   */
  generateLesson(student: StudentProfile, topic: LearningTopic, duration: number): Promise<GeneratedLesson>;

  /**
   * Generates level-appropriate vocabulary items with definitions, examples, synonyms, and expressions
   */
  generateVocabularyItems(topic: LearningTopic, occupation?: string): Promise<VocabularyItem[]>;

  /**
   * Filters and returns vocabulary appropriate for the CEFR level
   */
  getVocabularyForLevel(words: string[]): string[];

  /**
   * Returns vocabulary guidance specific to this CEFR level
   */
  getVocabularyGuide(): string;

  /**
   * Gets the list of acceptable vocabulary words for this CEFR level
   * Used to validate AI-generated vocabulary matches the level
   */
  getAcceptableVocabulary(): string[];

  /**
   * Validates if a word is appropriate for this CEFR level
   */
  isWordAcceptableForLevel(word: string): boolean;

