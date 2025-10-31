// B2 CEFR lesson module
// Generates lessons and filters vocabulary for B2 level

import { CEFRLessonModule } from './CEFRLessonModule';
import { StudentProfile, LearningTopic, GeneratedLesson } from '../../types/lesson-template';

export class B2LessonModule implements CEFRLessonModule {
  async generateLesson(student: StudentProfile, topic: LearningTopic, duration: number): Promise<GeneratedLesson> {
    const vocabulary = this.getVocabularyForLevel(topic.vocabulary);
    const grammarFocus = topic.grammarFocus || 'Modal Verbs';

    const exercises = [
      {
        type: 'vocabulary' as const,
        title: 'B2 Vocabulary Practice',
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
          explanation: 'Review modal verbs and their uses.',
          examples: ['You should study.', 'He might come.'],
          practice: [
            { question: 'You ___ (can) speak English.', answer: 'can' }
          ]
        },
        timeMinutes: 10,
      },
      {
        type: 'dialogue' as const,
        title: 'B2 Dialogue',
        description: 'Practice a conversation using advanced vocabulary.',
        content: {
          context: topic.context,
          characters: [
            { name: student.name || 'Student', role: student.occupation || 'Learner' },
            { name: 'Teacher', role: 'Teacher' }
          ],
          dialogue: [
            { character: 'Teacher', text: 'What should you do to improve your English?' },
            { character: student.name || 'Student', text: 'I should practice every day.' }
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
            'What should you do to improve your English?',
            'How often do you practice?'
          ]
        },
        timeMinutes: 7,
      }
    ];
    return {
      title: topic.title,
      lessonType: 'conversation',
      difficulty: 4,
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
   * Returns the vocabulary guide for B2 level
   */
  getVocabularyGuide(): string {
    return `B2/UPPER-INTERMEDIATE VOCABULARY:
- Advanced phrasal verbs with multiple meanings
- Idiomatic expressions and collocations
- Nuanced vocabulary for opinions and arguments
- Abstract concepts and formal language
🎯 For professionals: Sophisticated field terminology
Example: "come across as", "in the long run", "food for thought", "a double-edged sword"`;
  }

  getVocabularyForLevel(words: string[]): string[] {
    // Dummy implementation: all words are treated as B2 for demonstration
    return words;
  }
}
