// B2 CEFR lesson module
// Generates lessons and filters vocabulary for B2 level

import { CEFRLessonModule } from './CEFRLessonModule';
import { StudentProfile, LearningTopic, GeneratedLesson, VocabularyItem } from '../../types/lesson-template';

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
   * Generates level-appropriate B2 vocabulary items
   */
  async generateVocabularyItems(): Promise<VocabularyItem[]> {
    const b2BaseVocabulary: VocabularyItem[] = [
      {
        word: 'ambiguous',
        partOfSpeech: 'Adjective',
        phonetics: '/æmˈbɪɡjuəs/',
        definition: 'having more than one possible interpretation or meaning',
        example: 'The statement was ambiguous and led to confusion.',
        synonym: 'unclear',
        expressions: ['ambiguous statement', 'ambiguous situation', 'highly ambiguous']
      },
      {
        word: 'facilitate',
        partOfSpeech: 'Verb',
        phonetics: '/fəˈsɪlɪteɪt/',
        definition: 'to make something easier or help something happen',
        example: 'The new software will facilitate our workflow.',
        synonym: 'enable',
        expressions: ['facilitate communication', 'facilitate growth', 'facilitate process']
      },
      {
        word: 'resilience',
        partOfSpeech: 'Noun',
        phonetics: '/rɪˈzɪliəns/',
        definition: 'the ability to recover quickly from difficulties',
        example: 'The company showed resilience during the crisis.',
        synonym: 'strength',
        expressions: ['demonstrate resilience', 'build resilience', 'organizational resilience']
      },
    ];

    return b2BaseVocabulary.slice(0, 6);
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

  /**
   * Gets the list of acceptable vocabulary words for B2 level (upper-intermediate)
   */
  getAcceptableVocabulary(): string[] {
    return [
      // Upper-intermediate professional vocabulary (includes B1 + more advanced)
      'ambiguous', 'facilitate', 'resilience', 'adversity', 'turbulence', 'volatility', 'uncertainty',
      'sophisticated', 'nuanced', 'elaborate', 'comprehensive', 'extensive', 'intricate', 'complex',
      'substantive', 'significant', 'considerable', 'substantial', 'profound', 'deep', 'meaningful',
      'dilemma', 'predicament', 'quandary', 'conundrum', 'paradox', 'contradiction', 'inconsistency',
      'leverage', 'capitalize', 'exploit', 'utilize', 'harness', 'mobilize', 'activate', 'stimulate',
      'perpetuate', 'sustain', 'maintain', 'preserve', 'conserve', 'retain', 'uphold', 'enforce',
      'synthesis', 'integration', 'consolidation', 'amalgamation', 'fusion', 'merger', 'combination',
      'trajectory', 'trajectory', 'progression', 'trajectory', 'momentum', 'velocity', 'acceleration',
      'divergence', 'convergence', 'alignment', 'synchronization', 'harmony', 'discord', 'tension',
      'amplify', 'magnify', 'enhance', 'intensify', 'escalate', 'exacerbate', 'aggravate',
      'mitigate', 'alleviate', 'allay', 'assuage', 'placate', 'appease', 'mollify', 'relieve',
      'dichotomy', 'binary', 'polarization', 'fragmentation', 'atomization', 'compartmentalization',
      'precedent', 'convention', 'protocol', 'procedure', 'mechanism', 'apparatus', 'infrastructure',
      'rationale', 'justification', 'reasoning', 'logic', 'premise', 'assumption', 'hypothesis',
      'empirical', 'theoretical', 'pragmatic', 'idealistic', 'realistic', 'practical', 'abstract',
      'epistemology', 'ontology', 'methodology', 'framework', 'paradigm', 'model', 'theory',
      'manifesto', 'proclamation', 'declaration', 'statement', 'assertion', 'claim', 'proposition',
      'scepticism', 'cynicism', 'idealism', 'pragmatism', 'realism', 'relativism', 'absolutism',
      'ambivalence', 'equivocation', 'vacillation', 'oscillation', 'fluctuation', 'volatility', 'inconsistency',
    ];
  }

  /**
   * Validates if a word is appropriate for B2 level
   */
  isWordAcceptableForLevel(word: string): boolean {
    const normalized = word.toLowerCase().trim();
    // B2 should not include very obscure C1/C2 words
    const advancedWordsToReject = [
      'perspicacious', 'sagacious', 'obfuscate', 'serendipitous', 'ubiquitous', 'quintessential',
      'ephemeral', 'esoteric', 'enigmatic', 'pellucid', 'insouciant', 'sesquipedalian',
    ];

    if (advancedWordsToReject.some(w => w.includes(normalized) || normalized.includes(w))) {
      return false;
    }

    return this.getAcceptableVocabulary().some(w => w.includes(normalized) || normalized.includes(w));
  }

  getVocabularyForLevel(words: string[]): string[] {
    // Dummy implementation: all words are treated as B2 for demonstration
    return words;
  }
}

