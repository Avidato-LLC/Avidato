// A2 CEFR lesson module
// Generates lessons and filters vocabulary for A2 level

import { CEFRLessonModule } from './CEFRLessonModule';
import { StudentProfile, LearningTopic, GeneratedLesson } from '../../types/lesson-template';

export class A2LessonModule implements CEFRLessonModule {
  async generateLesson(student: StudentProfile, topic: LearningTopic, duration: number): Promise<GeneratedLesson> {
    // Generate an A2-level lesson, scaling exercises and vocabulary for A2
    // Integrate student profile data (age, occupation, interests, goals, weaknesses)

    // Filter vocabulary for A2 level
    const vocabulary = this.getVocabularyForLevel(topic.vocabulary);

    // Example grammar focus for A2
    const grammarFocus = topic.grammarFocus || 'Present Simple vs Present Continuous';

    // Example exercises for A2
    const exercises = [
      {
        type: 'vocabulary' as const,
        title: 'A2 Vocabulary Practice',
        description: `Practice key vocabulary for the topic '${topic.title}'.`,
        content: vocabulary,
        timeMinutes: 8,
      },
      {
        type: 'grammar' as const,
        title: 'Grammar Focus',
        description: `Learn and practice: ${grammarFocus}.`,
        content: {
          focus: grammarFocus,
          explanation: 'Review the difference between present simple and present continuous.',
          examples: [
            'I eat breakfast every day. (Present Simple)',
            'I am eating breakfast now. (Present Continuous)'
          ],
          practice: [
            { question: 'She ___ (read) a book now.', answer: 'is reading' },
            { question: 'He ___ (go) to school every day.', answer: 'goes' }
          ]
        },
        timeMinutes: 10,
      },
      {
        type: 'dialogue' as const,
        title: 'A2 Dialogue',
        description: 'Practice a simple conversation using target vocabulary.',
        content: {
          context: topic.context,
          characters: [
            { name: student.name || 'Student', role: student.occupation || 'Learner' },
            { name: 'Teacher', role: 'Teacher' }
          ],
          dialogue: [
            { character: 'Teacher', text: `Hello! What do you do every day?` },
            { character: student.name || 'Student', text: `I go to work and study English.` },
            { character: 'Teacher', text: `Are you studying English now?` },
            { character: student.name || 'Student', text: `Yes, I am studying English now.` }
          ],
          instructions: 'Read the dialogue and practice with a partner.'
        },
        timeMinutes: 10,
      },
      {
        type: 'discussion' as const,
        title: 'Discussion Questions',
        description: 'Answer questions about the dialogue.',
        content: {
          questions: [
            'What does the student do every day?',
            'Is the student studying English now?'
          ]
        },
        timeMinutes: 7,
      }
    ];

    // Compose lesson
    return {
      title: topic.title,
      lessonType: 'conversation',
      difficulty: 2,
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
   * Returns the vocabulary guide for A2 level
   */
  getVocabularyGuide(): string {
    return `A2/ELEMENTARY VOCABULARY:
- Expanded everyday vocabulary
- Simple phrasal verbs (basic two-word verbs)
- Basic collocations (common verb+noun combinations)
- Past tense forms
⚠️ Still avoid advanced professional jargon
Structure: Single words or basic phrasal verbs from expanded everyday vocabulary`;
  }

  getVocabularyForLevel(words: string[]): string[] {
    // Dummy implementation: all words are treated as A2 for demonstration
    return words;
  }
}

