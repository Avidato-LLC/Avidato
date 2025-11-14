// C1 CEFR lesson module
// Generates lessons and filters vocabulary for C1 level

import { CEFRLessonModule } from './CEFRLessonModule';
import { StudentProfile, LearningTopic, GeneratedLesson } from '../../types/lesson-template';

export class C1LessonModule implements CEFRLessonModule {
  async generateLesson(student: StudentProfile, topic: LearningTopic, duration: number): Promise<GeneratedLesson> {
    const vocabulary = this.getVocabularyForLevel(topic.vocabulary);
    const grammarFocus = topic.grammarFocus || 'Advanced Conditionals';

    const exercises = [
      {
        type: 'vocabulary' as const,
        title: 'C1 Vocabulary Practice',
        description: `Practice advanced vocabulary for '${topic.title}'.`,
        content: vocabulary,
        timeMinutes: 8,
      },
      {
        type: 'grammar' as const,
        title: 'Grammar Focus',
        description: `Learn and practice: ${grammarFocus}.`,
        content: {
          focus: grammarFocus,
          explanation: 'Review advanced conditionals and their uses.',
          examples: ['If I had known, I would have come.', 'Were I to see him, I would say hello.'],
          practice: [
            { question: 'If you ___ (be) there, you would have seen it.', answer: 'had been' }
          ]
        },
        timeMinutes: 10,
      },
      {
        type: 'dialogue' as const,
        title: 'C1 Dialogue',
        description: 'Practice a conversation using advanced vocabulary.',
        content: {
          context: topic.context,
          characters: [
            { name: student.name || 'Student', role: student.occupation || 'Learner' },
            { name: 'Teacher', role: 'Teacher' }
          ],
          dialogue: [
            { character: 'Teacher', text: 'If you had the chance, what would you do?' },
            { character: student.name || 'Student', text: 'I would travel the world.' }
          ],
          instructions: 'Read and practice.'
        },
        timeMinutes: 10,
      },
      {
        type: 'discussion' as const,
        title: 'Discussion Questions',
        description: 'Answer questions about the dialogue.',
        content: {
          questions: [
            'If you had the chance, what would you do?',
            'What is your dream destination?'
          ]
        },
        timeMinutes: 7,
      }
    ];

    return {
      title: topic.title,
      lessonType: 'conversation',
      difficulty: 5,
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
   * Returns the vocabulary guide for C1 level
   */
  getVocabularyGuide(): string {
    return `C1/ADVANCED VOCABULARY:
- Sophisticated idiomatic expressions
- Complex phrasal verbs and collocations
- Nuanced vocabulary for subtle distinctions
- Academic and professional register at expert level
- Metaphorical language and advanced concepts
🚫 CRITICAL: NO basic professional terms (computer, email, hospital, court, etc.)
🎯 Focus on: Specialized jargon, advanced concepts, nuanced communication
Structure: Advanced single words (specialized terminology), sophisticated idioms, complex collocations appropriate for expert-level communication`;
  }

  getVocabularyForLevel(words: string[]): string[] {
    // Dummy implementation: all words are treated as C1 for demonstration
    return words;
  }
}

