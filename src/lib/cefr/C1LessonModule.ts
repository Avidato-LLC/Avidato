// C1 CEFR lesson module
// Generates lessons and filters vocabulary for C1 level

import { CEFRLessonModule } from './CEFRLessonModule';
import { StudentProfile, LearningTopic, GeneratedLesson, VocabularyItem } from '../../types/lesson-template';

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
   * Generates level-appropriate C1 vocabulary items
   * C1: ONLY advanced specialized vocabulary, NEVER basic professional terms
   */
  async generateVocabularyItems(): Promise<VocabularyItem[]> {
    const c1BaseVocabulary: VocabularyItem[] = [
      {
        word: 'paradigm shift',
        partOfSpeech: 'Noun',
        phonetics: '/ˈpærədaɪm ʃɪft/',
        definition: 'a fundamental change in approach or underlying assumptions within a field or discipline',
        example: 'The cloud adoption represented a paradigm shift in enterprise infrastructure.',
        synonym: 'major change',
        expressions: ['paradigm shift in', 'represent a paradigm shift', 'drive a paradigm shift']
      },
      {
        word: 'juxtaposition',
        partOfSpeech: 'Noun',
        phonetics: '/ˌdʒʌktəpəˈzɪʃən/',
        definition: 'the fact of two things being seen or placed together for contrasting effect',
        example: 'The juxtaposition of old traditions and modern innovation created tension.',
        synonym: 'contrast',
        expressions: ['juxtaposition of', 'striking juxtaposition', 'creative juxtaposition']
      },
      {
        word: 'obfuscate',
        partOfSpeech: 'Verb',
        phonetics: '/əbˈfʌskeɪt/',
        definition: 'to deliberately make something unclear or obscure in order to conceal the truth',
        example: 'The report attempted to obfuscate the real issues with technical jargon.',
        synonym: 'obscure',
        expressions: ['obfuscate the truth', 'obfuscate reality', 'deliberately obfuscate']
      },
    ];

    return c1BaseVocabulary.slice(0, 6);
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
Example Professional Terms:
• Software: "deprecated", "polymorphism", "containerization", "idempotent"
• Medical: "contraindication", "pathophysiology", "differential diagnosis"
• Legal: "jurisprudence", "precedent", "tort", "adjudicate"
• Business: "synergistic", "paradigm shift", "stakeholder equity"
Example: "cut through the red tape", "a watershed moment", "read between the lines"`;
  }

  getVocabularyForLevel(words: string[]): string[] {
    // Dummy implementation: all words are treated as C1 for demonstration
    return words;
  }
}

