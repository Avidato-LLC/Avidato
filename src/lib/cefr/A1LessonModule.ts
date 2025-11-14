// A1 CEFR lesson module
// Generates lessons and filters vocabulary for A1 level

import { CEFRLessonModule } from './CEFRLessonModule';
import { StudentProfile, LearningTopic, GeneratedLesson } from '../../types/lesson-template';

export class A1LessonModule implements CEFRLessonModule {
  /**
   * Generates an A1-level lesson for the student
   */
  async generateLesson(student: StudentProfile, topic: LearningTopic, duration: number): Promise<GeneratedLesson> {
    // Example A1 lesson generation logic
    const vocabulary = this.getVocabularyForLevel(topic.vocabulary);
    const grammarFocus = topic.grammarFocus || 'Present Simple';
    const exercises = [
      {
        type: 'vocabulary' as const,
        title: 'A1 Vocabulary Practice',
        description: `Practice basic vocabulary for '${topic.title}'.`,
        content: vocabulary,
        timeMinutes: 7,
      },
      {
        type: 'grammar' as const,
        title: 'Grammar Focus',
        description: `Learn and practice: ${grammarFocus}.`,
        content: {
          focus: grammarFocus,
          explanation: 'Review the present simple tense.',
          examples: ['I eat.', 'She works.'],
          practice: [
            { question: 'He ___ (play) football.', answer: 'plays' }
          ]
        },
        timeMinutes: 8,
      },
      {
        type: 'dialogue' as const,
        title: 'A1 Dialogue',
        description: 'Practice a simple conversation.',
        content: {
          context: topic.context,
          characters: [
            { name: student.name || 'Student', role: student.occupation || 'Learner' },
            { name: 'Teacher', role: 'Teacher' }
          ],
          dialogue: [
            { character: 'Teacher', text: 'Hello! How are you?' },
            { character: student.name || 'Student', text: 'I am fine, thank you.' }
          ],
          instructions: 'Read and practice.'
        },
        timeMinutes: 8,
      },
      {
        type: 'discussion' as const,
        title: 'Discussion Questions',
        description: 'Answer simple questions about the dialogue.',
        content: {
          questions: [
            'How are you?',
            'What do you do every day?'
          ]
        },
        timeMinutes: 5,
      }
    ];
    return {
      title: topic.title,
      lessonType: 'conversation',
      difficulty: 1,
      duration,
      objective: topic.objective,
      skills: topic.skills,
      vocabulary,
      context: topic.context,
      exercises,
      materials: [],
    };
  }

  /**
   * Returns the vocabulary guide for A1 level
   */
  getVocabularyGuide(): string {
    return `A1/BEGINNER VOCABULARY:
   Basic everyday words they don't know yet (family, colors, numbers, food)
   Simple verbs (be, have, go, like)
   Common adjectives (big, small, good, bad)
   Present tense focus
   ⚠️ Only use basic professional terms if student is NEW to the profession
   Structure: Single-word nouns, verbs, adjectives from basic everyday vocabulary. In the definition of the vocabulary, do not use any word an A1 student would not know`;
  }

  /**
   * Filters vocabulary for A1 level using CEFR word-level system
   */
  getVocabularyForLevel(words: string[]): string[] {
    // Example: filter words estimated as A1
    // Dummy implementation: all words are treated as A1 for demonstration
    return words;
  }
}

