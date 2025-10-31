// B1 CEFR lesson module
// Generates lessons and filters vocabulary for B1 level

import { CEFRLessonModule } from './CEFRLessonModule';
import { StudentProfile, LearningTopic, GeneratedLesson } from '../../types/lesson-template';

export class B1LessonModule implements CEFRLessonModule {
  async generateLesson(student: StudentProfile, topic: LearningTopic, duration: number): Promise<GeneratedLesson> {
    const vocabulary = this.getVocabularyForLevel(topic.vocabulary);
    const grammarFocus = topic.grammarFocus || 'Past Simple vs Present Perfect';

    const exercises = [
      {
        type: 'vocabulary' as const,
        title: 'B1 Vocabulary Practice',
        description: `Practice vocabulary for '${topic.title}'.`,
        content: vocabulary,
        timeMinutes: 8,
      },
      {
        type: 'grammar' as const,
        title: 'Grammar Focus',
        description: `Learn and practice: ${grammarFocus}.`,
        content: {
          focus: grammarFocus,
          explanation: 'Review the difference between past simple and present perfect.',
          examples: ['I saw the movie.', 'I have seen the movie.'],
          practice: [
            { question: 'She ___ (finish) her homework.', answer: 'has finished' }
          ]
        },
        timeMinutes: 10,
      },
      {
        type: 'dialogue' as const,
        title: 'B1 Dialogue',
        description: 'Practice a conversation using target vocabulary.',
        content: {
          context: topic.context,
          characters: [
            { name: student.name || 'Student', role: student.occupation || 'Learner' },
            { name: 'Teacher', role: 'Teacher' }
          ],
          dialogue: [
            { character: 'Teacher', text: 'Have you ever traveled abroad?' },
            { character: student.name || 'Student', text: 'Yes, I have been to France.' }
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
            'Have you ever traveled abroad?',
            'Where have you been?'
          ]
        },
        timeMinutes: 7,
      }
    ];
    return {
      title: topic.title,
      lessonType: 'conversation',
      difficulty: 3,
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
   * Returns the vocabulary guide for B1 level
   */
  getVocabularyGuide(): string {
    return `B1/INTERMEDIATE VOCABULARY:
- Common phrasal verbs and their meanings
- Basic idioms and expressions
- Professional vocabulary at intermediate level
- Complex sentence structures
🎯 For professionals: Field-specific but not too advanced
Example: "put up with", "break the ice", "time management", "constructive feedback"`;
  }

  getVocabularyForLevel(words: string[]): string[] {
    // Dummy implementation: all words are treated as B1 for demonstration
    return words;
  }
}
