// src/lib/vocabulary-tracker.ts
import { prisma } from './prisma';

/**
 * Vocabulary Tracker Module
 * 
 * Manages vocabulary continuity across sequential lessons by:
 * 1. Extracting vocabulary from previously shared lessons
 * 2. Providing context for natural vocabulary reuse in dialogues
 * 3. Ensuring new lessons introduce new vocabulary only
 * 
 * Modularity achieved through:
 * - Separate concerns (tracking vs generation)
 * - Pure functions for vocabulary extraction
 * - Clear interfaces for lesson/vocabulary data
 */

/**
 * Extracted vocabulary item from a lesson
 */
export interface ExtractedVocabulary {
  word: string;
  definition: string;
  example?: string;
  level?: string;
  partOfSpeech?: string;
}

/**
 * Context for vocabulary reuse in new lessons
 */
export interface VocabularyContext {
  previousLessonTitle?: string;
  previousVocabulary: ExtractedVocabulary[];
  lessonsBetween: number; // Number of lessons since last shared lesson
  shouldReuseInDialogue: boolean; // Flag to indicate if vocabulary should be naturally reused
}

/**
 * Extract vocabulary items from lesson content
 * 
 * This function safely parses lesson JSON content and extracts vocabulary items
 * from the first vocabulary exercise (Exercise 1).
 * 
 * @param lessonContent - The lesson content JSON object
 * @returns Array of extracted vocabulary items
 */
export function extractVocabularyFromLesson(lessonContent: unknown): ExtractedVocabulary[] {
  if (!lessonContent || typeof lessonContent !== 'object') {
    return [];
  }

  const content = lessonContent as {
    exercises?: Array<{
      type?: string;
      content?: {
        vocabulary?: Array<{
          word?: string;
          definition?: string;
          example?: string;
          partOfSpeech?: string;
        }>;
      };
    }>;
  };

  const exercises = content.exercises;
  if (!Array.isArray(exercises)) {
    return [];
  }

  // Find the vocabulary exercise (typically first)
  const vocabExercise = exercises.find(ex => ex.type === 'vocabulary');
  if (!vocabExercise || !vocabExercise.content?.vocabulary) {
    return [];
  }

  return vocabExercise.content.vocabulary
    .filter(
      (item): item is { word: string; definition: string; example?: string; partOfSpeech?: string } =>
        typeof item.word === 'string' && typeof item.definition === 'string'
    )
    .map(item => ({
      word: item.word,
      definition: item.definition,
      example: item.example,
      partOfSpeech: item.partOfSpeech,
    }));
}

/**
 * Merge and deduplicate vocabulary from multiple lessons
 * 
 * @param vocabularies - Array of vocabulary arrays to merge
 * @returns Deduplicated vocabulary list
 */
export function mergeVocabulary(vocabularies: ExtractedVocabulary[][]): ExtractedVocabulary[] {
  const seen = new Set<string>();
  const merged: ExtractedVocabulary[] = [];

  for (const vocabList of vocabularies) {
    for (const item of vocabList) {
      if (!seen.has(item.word.toLowerCase())) {
        seen.add(item.word.toLowerCase());
        merged.push(item);
      }
    }
  }

  return merged;
}

/**
 * Get vocabulary context for a new lesson
 * 
 * Retrieves vocabulary from the most recently shared lesson(s) to provide
 * context for natural vocabulary reuse. Only includes vocabulary that should
 * be naturally incorporated into dialogues, not explicitly re-taught.
 * 
 * @param studentId - The student ID
 * @returns Vocabulary context for the new lesson
 */
export async function getVocabularyContext(studentId: string): Promise<VocabularyContext> {
  try {
    // Get all lessons for this student, ordered by shared date (most recent first)
    // Note: sharedAt field is added in migration but may not exist in generated client yet
    const lessons = await (prisma.lesson.findMany as unknown as typeof prisma.lesson.findMany)({
      where: {
        studentId: studentId,
        sharedAt: { not: null }, // Only consider shared lessons
      },
      orderBy: {
        sharedAt: 'desc',
      },
      select: {
        id: true,
        title: true,
        content: true,
        sharedAt: true,
        createdAt: true,
      },
      take: 3, // Look at up to the last 3 shared lessons
    });

    if (lessons.length === 0) {
      return {
        previousVocabulary: [],
        lessonsBetween: 0,
        shouldReuseInDialogue: false,
      };
    }

    // Get vocabulary from the most recent shared lesson
    const mostRecent = lessons[0];
    const mostRecentVocab = extractVocabularyFromLesson(mostRecent.content);

    // Calculate lessons between (0 for immediately previous, 1 for one lesson back, etc.)
    const lessonsBetween = lessons.length - 1;

    // Determine if we should reuse vocabulary in dialogue:
    // - YES if it's from the immediately previous lesson (lessonsBetween = 0)
    // - YES if it's from 1-2 lessons back but should be reinforced
    // - NO if it's from 3+ lessons back (too old)
    const shouldReuseInDialogue = lessonsBetween <= 2;

    return {
      previousLessonTitle: mostRecent.title,
      previousVocabulary: shouldReuseInDialogue ? mostRecentVocab : [],
      lessonsBetween,
      shouldReuseInDialogue,
    };
  } catch (error) {
    console.error('Error getting vocabulary context:', error);
    return {
      previousVocabulary: [],
      lessonsBetween: 0,
      shouldReuseInDialogue: false,
    };
  }
}

/**
 * Mark a lesson as shared with the student
 * 
 * Sets the sharedAt timestamp to indicate the lesson has been shared/taught
 * with the student. This allows the system to track vocabulary continuity.
 * 
 * @param lessonId - The lesson ID to mark as shared
 * @returns The updated lesson
 */
export async function markLessonAsShared(lessonId: string) {
  try {
    const updatedLesson = await prisma.lesson.update({
      where: { id: lessonId },
      data: {
        sharedAt: new Date(),
      },
    });
    return { success: true, lesson: updatedLesson };
  } catch (error) {
    console.error('Error marking lesson as shared:', error);
    return { success: false, error };
  }
}

/**
 * Get vocabulary vocabulary history for a student
 * 
 * Returns a summary of all vocabulary words from shared lessons,
 * useful for audit/reporting purposes.
 * 
 * @param studentId - The student ID
 * @returns Array of all vocabulary from shared lessons with lesson titles
 */
export async function getVocabularyHistory(
  studentId: string
): Promise<
  Array<{
    lessonTitle: string;
    vocabulary: ExtractedVocabulary[];
    sharedAt: Date | null;
  }>
> {
  try {
    const lessons = await prisma.lesson.findMany({
      where: {
        studentId: studentId,
        sharedAt: { not: null },
      },
      orderBy: {
        sharedAt: 'desc',
      },
      select: {
        title: true,
        content: true,
        sharedAt: true,
      },
    });

    return lessons.map(lesson => ({
      lessonTitle: lesson.title,
      vocabulary: extractVocabularyFromLesson(lesson.content),
      sharedAt: lesson.sharedAt,
    }));
  } catch (error) {
    console.error('Error getting vocabulary history:', error);
    return [];
  }
}
