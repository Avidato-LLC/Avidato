// A2 CEFR lesson module
// Generates lessons and filters vocabulary for A2 level

import { CEFRLessonModule } from './CEFRLessonModule';
import { StudentProfile, LearningTopic, GeneratedLesson, VocabularyItem } from '../../types/lesson-template';

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
   * Generates level-appropriate A2 vocabulary items
   * A2: Simple professional vocabulary with common expressions
   */
  async generateVocabularyItems(): Promise<VocabularyItem[]> {
    const a2BaseVocabulary: VocabularyItem[] = [
      {
        word: 'appointment',
        partOfSpeech: 'Noun',
        phonetics: '/əˈpɔɪntmənt/',
        definition: 'a meeting that has been arranged for a particular time',
        example: 'I have a doctor\'s appointment at 3 PM.',
        synonym: 'meeting',
        expressions: ['doctor\'s appointment', 'schedule an appointment', 'appointment time']
      },
      {
        word: 'comfortable',
        partOfSpeech: 'Adjective',
        phonetics: '/ˈkʌmftəbəl/',
        definition: 'feeling relaxed and at ease',
        example: 'This chair is very comfortable.',
        synonym: 'cozy',
        expressions: ['feel comfortable', 'make yourself comfortable', 'comfortable with']
      },
      {
        word: 'arrive',
        partOfSpeech: 'Verb',
        phonetics: '/əˈraɪv/',
        definition: 'to reach or come to a place',
        example: 'I arrive at work at 8 AM.',
        synonym: 'come',
        expressions: ['arrive at', 'arrive on time', 'arrive early']
      },
    ];

    return a2BaseVocabulary.slice(0, 6);
  }

  /**
   * Returns the vocabulary guide for A2 level
   */
  getVocabularyGuide(): string {
    return `A2/ELEMENTARY VOCABULARY:
- Expanded everyday vocabulary
- Simple phrasal verbs (get up, go out)
- Basic collocations (make friends, take a shower)
- Past tense forms
⚠️ Still avoid advanced professional jargon
Example: "neighborhood", "get along with", "take care of"`;
  }

  /**
   * Gets the list of acceptable vocabulary words for A2 level (1000-2000 most common words)
   * Used to validate AI-generated vocabulary
   */
  getAcceptableVocabulary(): string[] {
    // A2: Basic professional + expanded everyday vocabulary (includes A1 + more)
    return [
      // A1 words (included here too)
      ...['hello', 'goodbye', 'please', 'thank', 'family', 'school', 'work', 'food', 'house', 'day'],
      // A2 additions: Simple professional terms, past tense
      'appointment', 'meeting', 'email', 'phone', 'computer', 'office', 'manager', 'team', 'project',
      'experience', 'skill', 'company', 'job', 'employee', 'customer', 'client', 'service', 'product',
      'decision', 'problem', 'solution', 'question', 'answer', 'information', 'document', 'report',
      'plan', 'schedule', 'deadline', 'budget', 'cost', 'price', 'money', 'payment', 'invoice',
      'transaction', 'account', 'balance', 'deposit', 'withdraw', 'transfer', 'fee', 'charge',
      'training', 'development', 'education', 'course', 'class', 'lesson', 'exam', 'test',
      'communication', 'discussion', 'feedback', 'suggestion', 'comment', 'opinion', 'agree', 'disagree',
      'visit', 'travel', 'journey', 'trip', 'destination', 'hotel', 'restaurant', 'shop', 'market',
      'transportation', 'car', 'bus', 'train', 'plane', 'ticket', 'reservation', 'booking',
      'weather', 'temperature', 'season', 'climate', 'environment', 'nature', 'animal', 'plant',
      'sport', 'exercise', 'activity', 'hobby', 'game', 'entertainment', 'movie', 'music', 'art',
      'health', 'medicine', 'doctor', 'hospital', 'nurse', 'patient', 'illness', 'disease', 'symptom',
      'treatment', 'medication', 'exercise', 'diet', 'lifestyle', 'stress', 'relax', 'sleep',
      'technology', 'software', 'hardware', 'internet', 'website', 'application', 'app', 'digital',
      'security', 'password', 'login', 'account', 'data', 'backup', 'file', 'folder', 'document',
      'started', 'ended', 'began', 'finished', 'completed', 'achieved', 'accomplished', 'succeeded',
      'failed', 'missed', 'delayed', 'early', 'late', 'on-time', 'progress', 'improvement',
    ];
  }

  /**
   * Validates if a word is appropriate for A2 level
   */
  isWordAcceptableForLevel(word: string): boolean {
    const normalized = word.toLowerCase().trim();
    // A2 should not have very advanced vocabulary
    const advancedWordsToReject = [
      'paradigm', 'juxtaposition', 'obfuscate', 'serendipitous', 'ubiquitous', 'quintessential',
      'ephemeral', 'esoteric', 'enigmatic', 'sagacious', 'perspicacious', 'ameliorate', 'exacerbate',
    ];

    if (advancedWordsToReject.some(w => w.includes(normalized) || normalized.includes(w))) {
      return false;
    }

    return this.getAcceptableVocabulary().some(w => w.includes(normalized) || normalized.includes(w));
  }

  getVocabularyForLevel(words: string[]): string[] {
    // Dummy implementation: all words are treated as A2 for demonstration
    return words;
  }
}

