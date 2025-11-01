// A1 CEFR lesson module
// Generates lessons and filters vocabulary for A1 level

import { CEFRLessonModule } from './CEFRLessonModule';
import { StudentProfile, LearningTopic, GeneratedLesson, VocabularyItem } from '../../types/lesson-template';

export class A1LessonModule implements CEFRLessonModule {
  /**
   * Generates an A1-level lesson for the student
   */
  async generateLesson(student: StudentProfile, topic: LearningTopic, duration: number): Promise<GeneratedLesson> {
    // Example A1 lesson generation logic
    const vocabulary = this.getVocabularyForLevel(topic.vocabulary);
    const grammarFocus = topic.grammarFocus || 'Present Simple';
    const exercises = [
      {
        type: 'vocabulary' as const,
        title: 'A1 Vocabulary Practice',
        description: `Practice basic vocabulary for '${topic.title}'.`,
        content: vocabulary,
        timeMinutes: 7,
      },
      {
        type: 'grammar' as const,
        title: 'Grammar Focus',
        description: `Learn and practice: ${grammarFocus}.`,
        content: {
          focus: grammarFocus,
          explanation: 'Review the present simple tense.',
          examples: ['I eat.', 'She works.'],
          practice: [
            { question: 'He ___ (play) football.', answer: 'plays' }
          ]
        },
        timeMinutes: 8,
      },
      {
        type: 'dialogue' as const,
        title: 'A1 Dialogue',
        description: 'Practice a simple conversation.',
        content: {
          context: topic.context,
          characters: [
            { name: student.name || 'Student', role: student.occupation || 'Learner' },
            { name: 'Teacher', role: 'Teacher' }
          ],
          dialogue: [
            { character: 'Teacher', text: 'Hello! How are you?' },
            { character: student.name || 'Student', text: 'I am fine, thank you.' }
          ],
          instructions: 'Read and practice.'
        },
        timeMinutes: 8,
      },
      {
        type: 'discussion' as const,
        title: 'Discussion Questions',
        description: 'Answer simple questions about the dialogue.',
        content: {
          questions: [
            'How are you?',
            'What do you do every day?'
          ]
        },
        timeMinutes: 5,
      }
    ];
    return {
      title: topic.title,
      lessonType: 'conversation',
      difficulty: 1,
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
   * Generates level-appropriate A1 vocabulary items
   * A1: Simple everyday vocabulary with no expressions (just definitions)
   */
  async generateVocabularyItems(): Promise<VocabularyItem[]> {
    // For A1, provide a curated set of simple vocabulary
    // This is a base implementation that can be expanded with AI generation later
    const a1BaseVocabulary: VocabularyItem[] = [
      {
        word: 'hello',
        partOfSpeech: 'Interjection',
        phonetics: '/həˈloʊ/',
        definition: 'a word you say when you meet someone',
        example: 'Hello! My name is Sarah.',
        synonym: 'hi',
        expressions: [] // A1: no expressions
      },
      {
        word: 'happy',
        partOfSpeech: 'Adjective',
        phonetics: '/ˈhæpi/',
        definition: 'feeling or showing pleasure',
        example: 'I am happy today.',
        synonym: 'glad',
        expressions: [] // A1: no expressions
      },
      {
        word: 'family',
        partOfSpeech: 'Noun',
        phonetics: '/ˈfæməli/',
        definition: 'parents and children living together',
        example: 'My family is very big.',
        synonym: '',
        expressions: [] // A1: no expressions, no complex synonyms
      },
    ];

    return a1BaseVocabulary.slice(0, 6);
  }

  /**
   * Returns the vocabulary guide for A1 level
   */
  getVocabularyGuide(): string {
    return `A1/BEGINNER VOCABULARY:
   Basic everyday words they don't know yet (family, colors, numbers, food)
   Simple verbs (be, have, go, like)
   Common adjectives (big, small, good, bad)
   Present tense focus
   ⚠️ Only use basic professional terms if student is NEW to the profession
   Example: "happy", "family", "eat", "work". In the definition of the vocabulary, do not use any word an A1 student would not know`;
  }

  /**
   * Gets the list of acceptable vocabulary words for A1 level (first 1000 most common words)
   * Used to validate AI-generated vocabulary
   */
  getAcceptableVocabulary(): string[] {
    // A1: First 1000 most common English words (simplified subset)
    return [
      'hello', 'hi', 'goodbye', 'bye', 'please', 'thank', 'yes', 'no', 'okay', 'ok',
      'good', 'bad', 'happy', 'sad', 'tired', 'hungry', 'thirsty', 'cold', 'hot', 'big',
      'small', 'old', 'new', 'young', 'beautiful', 'ugly', 'clean', 'dirty', 'fast', 'slow',
      'easy', 'hard', 'difficult', 'simple', 'cheap', 'expensive', 'good', 'bad', 'better', 'worse',
      'family', 'mother', 'father', 'sister', 'brother', 'son', 'daughter', 'wife', 'husband', 'child',
      'man', 'woman', 'boy', 'girl', 'people', 'person', 'friend', 'teacher', 'student', 'doctor',
      'nurse', 'police', 'worker', 'farmer', 'cook', 'driver', 'pilot', 'engineer', 'artist', 'musician',
      'sport', 'play', 'game', 'ball', 'football', 'basketball', 'tennis', 'swimming', 'running', 'walking',
      'eat', 'drink', 'sleep', 'wake', 'work', 'study', 'read', 'write', 'speak', 'listen',
      'see', 'look', 'watch', 'hear', 'talk', 'walk', 'run', 'jump', 'sit', 'stand',
      'house', 'home', 'room', 'door', 'window', 'bed', 'table', 'chair', 'kitchen', 'bathroom',
      'school', 'office', 'hospital', 'shop', 'market', 'street', 'car', 'bus', 'train', 'plane',
      'book', 'pen', 'paper', 'pencil', 'desk', 'computer', 'phone', 'camera', 'watch', 'clock',
      'food', 'apple', 'banana', 'bread', 'rice', 'meat', 'fish', 'chicken', 'milk', 'cheese',
      'water', 'coffee', 'tea', 'juice', 'wine', 'beer', 'breakfast', 'lunch', 'dinner', 'restaurant',
      'color', 'red', 'blue', 'green', 'yellow', 'black', 'white', 'pink', 'purple', 'orange',
      'number', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten',
      'day', 'night', 'morning', 'afternoon', 'evening', 'week', 'month', 'year', 'time', 'hour',
      'minute', 'second', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday',
      'weather', 'sun', 'rain', 'snow', 'wind', 'cloud', 'temperature', 'warm', 'cool', 'dry',
      'money', 'dollar', 'euro', 'price', 'buy', 'sell', 'pay', 'cost', 'expensive', 'cheap',
      'country', 'city', 'town', 'village', 'mountain', 'river', 'sea', 'beach', 'park', 'nature',
      'animal', 'dog', 'cat', 'bird', 'fish', 'cow', 'horse', 'pig', 'sheep', 'chicken',
      'love', 'like', 'want', 'need', 'help', 'start', 'stop', 'begin', 'end', 'continue',
      'go', 'come', 'stay', 'leave', 'arrive', 'depart', 'return', 'travel', 'visit', 'explore',
      'weather', 'hot', 'cold', 'warm', 'cool', 'rainy', 'sunny', 'cloudy', 'stormy', 'windy',
    ];
  }

  /**
   * Validates if a word is appropriate for A1 level
   */
  isWordAcceptableForLevel(word: string): boolean {
    const normalized = word.toLowerCase().trim();
    return this.getAcceptableVocabulary().some(w => w.includes(normalized) || normalized.includes(w));
  }

  /**
   * Filters vocabulary for A1 level using CEFR word-level system
   */
  getVocabularyForLevel(words: string[]): string[] {
    // Example: filter words estimated as A1
    // Dummy implementation: all words are treated as A1 for demonstration
    return words;
  }
}

