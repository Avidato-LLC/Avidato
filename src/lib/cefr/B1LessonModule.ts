// B1 CEFR lesson module
// Generates lessons and filters vocabulary for B1 level

import { CEFRLessonModule } from './CEFRLessonModule';
import { StudentProfile, LearningTopic, GeneratedLesson, VocabularyItem } from '../../types/lesson-template';

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
   * Generates level-appropriate B1 vocabulary items
   */
  async generateVocabularyItems(): Promise<VocabularyItem[]> {
    const b1BaseVocabulary: VocabularyItem[] = [
      {
        word: 'streamline',
        partOfSpeech: 'Verb',
        phonetics: '/ˈstriːmlaɪn/',
        definition: 'to make a process more efficient by simplifying it',
        example: 'We need to streamline our approval process to reduce delays.',
        synonym: 'simplify',
        expressions: ['streamline the process', 'streamline operations', 'streamline efficiency']
      },
      {
        word: 'implement',
        partOfSpeech: 'Verb',
        phonetics: '/ˈɪmpləment/',
        definition: 'to put a plan or system into action',
        example: 'The company will implement new policies next month.',
        synonym: 'apply',
        expressions: ['implement changes', 'implement a system', 'implement strategy']
      },
      {
        word: 'challenge',
        partOfSpeech: 'Noun',
        phonetics: '/ˈtʃælɪndʒ/',
        definition: 'a difficult task or problem to solve',
        example: 'The main challenge is managing the budget.',
        synonym: 'difficulty',
        expressions: ['face a challenge', 'overcome a challenge', 'main challenge']
      },
    ];

    return b1BaseVocabulary.slice(0, 6);
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

  /**
   * Gets the list of acceptable vocabulary words for B1 level (intermediate)
   */
  getAcceptableVocabulary(): string[] {
    return [
      // Intermediate professional vocabulary
      'streamline', 'implement', 'challenge', 'opportunity', 'strategy', 'approach', 'method',
      'facilitate', 'coordination', 'collaboration', 'teamwork', 'cooperation', 'partnership',
      'efficiency', 'effectiveness', 'productivity', 'performance', 'quality', 'improvement',
      'analysis', 'evaluation', 'assessment', 'review', 'feedback', 'recommendation', 'suggestion',
      'initiative', 'proposal', 'framework', 'structure', 'organization', 'management', 'administration',
      'resource', 'allocation', 'distribution', 'utilization', 'optimization', 'prioritization',
      'stakeholder', 'participant', 'contributor', 'member', 'colleague', 'associate', 'partner',
      'objective', 'goal', 'target', 'milestone', 'deadline', 'timeline', 'schedule',
      'risk', 'uncertainty', 'contingency', 'mitigation', 'prevention', 'precaution', 'safeguard',
      'regulation', 'compliance', 'requirement', 'standard', 'criterion', 'benchmark', 'measurement',
      'communication', 'dialogue', 'negotiation', 'discussion', 'consultation', 'presentation',
      'documentation', 'record', 'archive', 'repository', 'database', 'repository', 'system',
      'transition', 'change', 'transformation', 'evolution', 'development', 'progression', 'advancement',
      'constraint', 'limitation', 'barrier', 'obstacle', 'impediment', 'hindrance', 'difficulty',
      'resolution', 'solution', 'remedy', 'fix', 'correction', 'adjustment', 'modification',
      'acquisition', 'procurement', 'purchase', 'investment', 'expenditure', 'budget', 'cost',
      'revenue', 'income', 'profit', 'loss', 'margin', 'surplus', 'deficit', 'balance',
      'correlation', 'relationship', 'connection', 'association', 'linkage', 'dependency', 'interdependence',
      'simulation', 'model', 'prototype', 'scenario', 'case', 'example', 'illustration',
      'perspective', 'viewpoint', 'stance', 'position', 'angle', 'orientation', 'outlook',
    ];
  }

  /**
   * Validates if a word is appropriate for B1 level
   */
  isWordAcceptableForLevel(word: string): boolean {
    const normalized = word.toLowerCase().trim();
    // B1 should not have very advanced vocabulary (C1/C2 level)
    const advancedWordsToReject = [
      'paradigm', 'juxtaposition', 'obfuscate', 'serendipitous', 'ubiquitous', 'quintessential',
      'ephemeral', 'esoteric', 'enigmatic', 'perspicacious', 'sagacious',
    ];

    if (advancedWordsToReject.some(w => w.includes(normalized) || normalized.includes(w))) {
      return false;
    }

    return this.getAcceptableVocabulary().some(w => w.includes(normalized) || normalized.includes(w));
  }

  getVocabularyForLevel(words: string[]): string[] {
    // Dummy implementation: all words are treated as B1 for demonstration
    return words;
  }
}

