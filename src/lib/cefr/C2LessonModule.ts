// C2 CEFR lesson module
// Generates lessons and filters vocabulary for C2 level

import { CEFRLessonModule } from './CEFRLessonModule';
import { StudentProfile, LearningTopic, GeneratedLesson, VocabularyItem } from '../../types/lesson-template';

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
   * Generates level-appropriate C2 vocabulary items
   * C2: ONLY expert-level vocabulary, sophisticated expressions
   */
  async generateVocabularyItems(): Promise<VocabularyItem[]> {
    const c2BaseVocabulary: VocabularyItem[] = [
      {
        word: 'serendipitous',
        partOfSpeech: 'Adjective',
        phonetics: '/ˌserənˈdɪpɪtəs/',
        definition: 'occurring by chance in a happy or beneficial way; fortunate and unexpected',
        example: 'The serendipitous meeting with the investor changed the trajectory of the startup.',
        synonym: 'fortuitous',
        expressions: ['serendipitous encounter', 'serendipitous discovery', 'serendipitous outcome']
      },
      {
        word: 'ubiquitous',
        partOfSpeech: 'Adjective',
        phonetics: '/juːˈbɪkwɪtəs/',
        definition: 'present, appearing, or found everywhere, especially without being noticed',
        example: 'Smartphones have become ubiquitous in modern society.',
        synonym: 'pervasive',
        expressions: ['ubiquitous presence', 'ubiquitous in', 'ubiquitous technology']
      },
      {
        word: 'quintessential',
        partOfSpeech: 'Adjective',
        phonetics: '/ˌkwɪntɪˈsenʃəl/',
        definition: 'representing the most perfect or typical example of something',
        example: 'Jazz is considered the quintessential American art form.',
        synonym: 'archetypal',
        expressions: ['quintessential example', 'quintessential feature', 'quintessential representation']
      },
    ];

    return c2BaseVocabulary.slice(0, 6);
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

  /**
   * Gets the list of acceptable vocabulary words for C2 level (proficiency/native-like)
   * Used to validate AI-generated vocabulary matches the level
   */
  getAcceptableVocabulary(): string[] {
    // C2: ONLY expert-level, native-like vocabulary
    return [
      // Sophisticated synonyms and alternatives (same as C1, but enforced strictly)
      'paradigm', 'juxtaposition', 'obfuscate', 'obfuscation', 'serendipitous', 'ubiquitous', 'quintessential',
      'ephemeral', 'esoteric', 'enigmatic', 'perspicacious', 'sagacious', 'propitious', 'auspicious',
      'mellifluous', 'sonorous', 'dulcet', 'euphonious', 'cacophony', 'discordant', 'dissonant',
      'antithesis', 'anathema', 'apotheosis', 'catharsis', 'nemesis', 'epitome', 'paragon',
      'anomaly', 'conundrum', 'paradox', 'dichotomy', 'dichotomous', 'polemic', 'contentious',
      'obsequious', 'servile', 'sycophantic', 'oleaginous', 'unctuous', 'mendacious', 'veracious',
      'perspicacity', 'acumen', 'erudition', 'pedantic', 'scholastic', 'didactic', 'heuristic',
      'ameliorate', 'exacerbate', 'mitigate', 'alleviate', 'palliate', 'assuage', 'placate',
      'obfuscatory', 'elucidating', 'pellucid', 'opaque', 'translucent', 'lucent', 'luminous',
      'pernicious', 'noxious', 'deleterious', 'baneful', 'inimical', 'virulent', 'vitriolic',
      'magnanimous', 'pusillanimous', 'perspicacious', 'verbose', 'loquacious', 'taciturn', 'laconic',
      'solipsistic', 'egocentric', 'altruistic', 'philanthropic', 'misanthropic', 'xenophobic', 'cosmopolitan',
      'perspicuous', 'insipid', 'vapid', 'jejune', 'banal', 'quotidian', 'prosaic', 'mundane',
      'inchoate', 'amorphous', 'incipient', 'proto', 'primordial', 'embryonic', 'nascent',
      'fortuitous', 'synchronicity', 'serendipity', 'providence', 'kismet', 'fate', 'destiny',
      'sesquipedalian', 'verbose', 'prolix', 'grandiose', 'bombastic', 'pompous', 'ostentatious',
      'pellucid', 'perspicuous', 'limpid', 'luculent', 'luminous', 'crystalline', 'transparent',
      'mercurial', 'capricious', 'inconstant', 'fickle', 'volatile', 'ephemeral', 'evanescent',
      'hegemony', 'supremacy', 'dominion', 'sovereignty', 'ascendancy', 'preponderance', 'prevalence',
      'insouciant', 'nonchalant', 'cavalier', 'offhand', 'perfunctory', 'cursory', 'desultory',
      'sagacious', 'judicious', 'prudent', 'discerning', 'perspicacious', 'astute', 'penetrating',
      'amelioration', 'aggrandizement', 'magnification', 'amplification', 'augmentation', 'proliferation',
      // Rare, expert-level business terms (NOT basic terms)
      'fiduciary', 'fungible', 'tranche', 'securitization', 'arbitrage', 'collateral', 'covenant',
      'leverage', 'amortization', 'accrual', 'depreciation', 'impairment', 'provisioning', 'hedging',
      'derivative', 'forward', 'futures', 'option', 'call', 'put', 'strike', 'volatility',
    ];
  }

  /**
   * Validates if a word is appropriate for C2 level
   * STRICTLY REJECTS basic terms
   */
  isWordAcceptableForLevel(word: string): boolean {
    const normalized = word.toLowerCase().trim();
    const basicWordsToReject = [
      'compliance', 'fraudulent', 'verification', 'email', 'meeting', 'appointment', 'doctor',
      'hospital', 'patient', 'computer', 'project', 'team', 'manager', 'employee', 'company',
      'business', 'work', 'office', 'report', 'memo', 'procedure', 'process', 'system',
      'customer', 'client', 'service', 'product', 'sale', 'marketing', 'budget', 'plan',
      'goal', 'objective', 'strategy', 'approach', 'method', 'implement', 'streamline',
      'challenge', 'opportunity', 'risk', 'benefit', 'advantage', 'disadvantage', 'solution',
      'problem', 'issue', 'concern', 'feedback', 'communication', 'conference', 'workshop',
    ];

    // STRICTLY REJECT basic words
    if (basicWordsToReject.some(w => w.includes(normalized) || normalized.includes(w))) {
      return false;
    }

    // ACCEPT only if in C2 vocabulary list
    return this.getAcceptableVocabulary().some(w => w.includes(normalized) || normalized.includes(w));
  }

  getVocabularyForLevel(words: string[]): string[] {
    // Dummy implementation: all words are treated as C2 for demonstration
    return words;
  }
}

