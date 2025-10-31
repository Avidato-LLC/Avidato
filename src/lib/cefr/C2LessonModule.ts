// C2 CEFR lesson module
// Generates lessons and filters vocabulary for C2 level

import { CEFRLessonModule } from './CEFRLessonModule';
import { StudentProfile, LearningTopic, GeneratedLesson } from '../../types/lesson-template';

export class C2LessonModule implements CEFRLessonModule {
  async generateLesson(student: StudentProfile, topic: LearningTopic, duration: number): Promise<GeneratedLesson> {
    // Generate a C2-level lesson, scaling exercises and vocabulary for C2
    // Integrate student profile data (age, occupation, interests, goals, weaknesses)

    // Filter vocabulary for C2 level
    const vocabulary = this.getVocabularyForLevel(topic.vocabulary);
  
    // Example grammar focus for C2
    const grammarFocus = topic.grammarFocus || 'Advanced Idioms & Nuanced Structures';

    // Example exercises for C2
    const exercises = [
      {
        type: 'vocabulary' as const,
        title: 'C2 Vocabulary Practice',
        description: `Practice highly advanced vocabulary for the topic '${topic.title}'.`,
        content: vocabulary,
        timeMinutes: 10,
      },
      {
        type: 'grammar' as const,
        title: 'Grammar Focus',
        description: `Explore: ${grammarFocus}.`,
        content: {
          focus: grammarFocus,
          explanation: 'Analyze idiomatic and nuanced structures in context.',
          examples: [
            'Were it not for his help, I would have failed.',
            'No sooner had she arrived than the meeting started.'
          ],
          practice: [
            { question: 'Rewrite: "As soon as he finished, he left." using "No sooner..."', answer: 'No sooner had he finished than he left.' }
          ]
        },
        timeMinutes: 12,
      },
      {
        type: 'dialogue' as const,
        title: 'C2 Dialogue',
        description: 'Engage in a sophisticated conversation using advanced vocabulary and idioms.',
        content: {
          context: topic.context,
          characters: [
            { name: student.name || 'Student', role: student.occupation || 'Professional' },
            { name: 'Expert', role: 'Expert' }
          ],
          dialogue: [
            { character: 'Expert', text: 'How do you perceive the impact of globalization on linguistic diversity?' },
            { character: student.name || 'Student', text: 'It is a double-edged sword, fostering communication but threatening minority languages.' }
          ],
          instructions: 'Analyze and discuss the dialogue in depth.'
        },
        timeMinutes: 12,
      },
      {
        type: 'discussion' as const,
        title: 'Discussion Questions',
        description: 'Debate and reflect on complex topics from the dialogue.',
        content: {
          questions: [
            'What are the pros and cons of globalization for language?',
            'How can minority languages be preserved in a globalized world?'
          ]
        },
        timeMinutes: 10,
      }
    ];

    // Compose lesson
    return {
      title: topic.title,
      lessonType: 'conversation',
      difficulty: 6,
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
   * Returns the vocabulary guide for C2 level
   */
  getVocabularyGuide(): string {
    return `C2/PROFICIENCY VOCABULARY:
- Highly sophisticated expressions and idioms
- Complex metaphorical language
- Specialized terminology across domains at expert level
- Subtle semantic distinctions
- Native-like expressions and cultural references
🚫 CRITICAL: NEVER use basic terms from student's profession
🎯 Focus on: Expert-level jargon, sophisticated communication, nuanced language
Example Professional Terms:
• Software: "abstraction layer", "design patterns", "scalability bottlenecks", "technical debt"
• Medical: "pathogenesis", "iatrogenic", "comorbidity", "nosocomial infection"
• Legal: "res judicata", "habeas corpus", "voir dire", "amicus curiae"
• Business: "value proposition canvas", "blue ocean strategy", "disruptive innovation"
Example: "jump the shark", "move the goalposts", "a Pyrrhic victory", "throw the baby out with the bathwater"`;
  }

  getVocabularyForLevel(words: string[]): string[] {
    // Dummy implementation: all words are treated as C2 for demonstration
    return words;
  }
}
