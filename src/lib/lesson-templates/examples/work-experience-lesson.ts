/**
 * Example Implementation: Under-18 Lesson
 * 
 * This file demonstrates how to use the Under-18 Lesson Template
 * to create a specific lesson. This is just an example - you would
 * create similar files for each actual lesson.
 * 
 * File structure:
 * src/lib/lesson-templates/
 *   ├── index.ts (main export)
 *   ├── under-18-template.ts (template definition)
 *   └── examples/
 *       ├── daily-routines-lesson.ts (this file - example)
 *       └── other-lessons...
 */

import { createUnder18Lesson } from '../under-18-template'

/**
 * Example Lesson: "Your Daily Routine"
 * Level: Intermediate
 * Age Group: Under 18
 * 
 * Age-appropriate lesson about daily routines that all students can relate to.
 * This demonstrates how to customize the template for a specific topic.
 */
export const dailyRoutinesLessonUnder18 = createUnder18Lesson({
  metadata: {
    title: 'Your Daily Routine',
    level: 'Intermediate',
    durationMinutes: 50,
    ageGroup: 'Under 18',
    lessonType: 'General English',
    topic: 'Daily Routines and Responsibilities',
  },
  learningObjectives: [
    {
      objective: 'Learn vocabulary related to daily activities and routines',
      skill: 'vocabulary',
    },
    {
      objective: 'Practice talking about what you do every day',
      skill: 'speaking',
    },
    {
      objective: 'Understand how to use "have to" and "don\'t have to" to express responsibilities',
      skill: 'grammar',
    },
  ],
  exercises: [
    // Exercise 1 stays mostly the same, just customize the questions
    {
      id: 'exercise-1-warmup',
      number: 1,
      type: 'warm-up',
      title: 'Warm-Up',
      description: 'Ice breaker and context setting',
      timeMinutes: 2,
      instructions: 'Have a short conversation based on these questions. This helps activate your prior knowledge and prepares you for the lesson.',
      content: {
        questions: [
          'What time do you usually wake up?',
          'What do you do after school?',
          'What time do you go to bed?',
          'Do you have any responsibilities at home?',
        ],
      },
    },
    // Exercise 2: Core Vocabulary customized for daily routines
    {
      id: 'exercise-2-vocabulary',
      number: 2,
      type: 'vocabulary',
      title: 'Core Vocabulary',
      description: 'Introduce key terms related to daily activities',
      timeMinutes: 4,
      instructions: 'Listen and repeat these words/phrases with your tutor. If you don\'t know a word, ask your tutor to read the definition and give an example sentence.',
      content: {
        items: [
          'wake up - To stop sleeping and get out of bed',
          'get ready - To prepare yourself (shower, dress, eat breakfast)',
          'go to school - To travel to your school',
          'have class - To attend lessons at school',
          'eat lunch - To have a meal in the middle of the day',
          'do homework - To complete assignments given by teachers',
          'play sports - To participate in physical activities or games',
          'go to bed - To lie down to sleep',
        ],
      },
      practice: {
        type: 'fill-blanks',
        instructions: 'Tell your tutor which daily activity matches each description.',
        content: [
          'When you stop sleeping and leave your bed, you __________ ',
          'When you attend your lessons at school, you __________',
          'When you finish classes and return home, you __________',
          'When you lie down to sleep at night, you __________',
        ],
        answerPool: ['wake up', 'have class', 'go home', 'go to bed'],
      },
    },
    // Exercise 3: Functional Language - expressions for talking about daily routines
    {
      id: 'exercise-3-expressions',
      number: 3,
      type: 'expressions',
      title: 'Functional Language',
      description: 'Learn common ways to talk about daily routines and responsibilities',
      timeMinutes: 3,
      instructions: 'Listen and repeat these phrases and expressions with your tutor. These are natural ways to talk about what you do every day.',
      content: {
        items: [
          'I have to / I don\'t have to - Example: I have to wake up early. I don\'t have to go to school on Sunday.',
          'I usually / I always have to - Example: I usually have to do homework after school.',
          'First, I... Then, I... - Example: First, I wake up. Then, I get ready for school.',
          'Before I..., I have to - Example: Before I go to school, I have to eat breakfast.',
          'After I..., I have to - Example: After I finish class, I have to do homework.',
          'My routine is to - Example: My routine is to go to bed at 10 PM.',
        ],
      },
      practice: {
        type: 'substitution',
        instructions: 'Rewrite these sentences using the expressions from above.',
        content: [
          'Sentence 1: It is necessary for me to [wake up at 6 AM]',
          'Sentence 2: It is required that I [finish my homework]',
          'Sentence 3: I am expected to [get home by 5 PM]',
        ],
      },
    },
    // Exercise 4: Dialogue - Teacher and student talking about daily routines
    {
      id: 'exercise-4-dialogue',
      number: 4,
      type: 'dialogue',
      title: 'Dialogue',
      description: 'Listen to a conversation about daily routines and responsibilities',
      timeMinutes: 5,
      instructions: 'Read the dialogue aloud with your tutor. Pay attention to how the vocabulary and expressions are used.',
      content: {
        dialogue: [
          { speaker: 'Tutor', text: 'Tell me about your typical school day, Maria.' },
          { speaker: 'Student', text: 'Well, I have to wake up at 6:30 every morning.' },
          { speaker: 'Tutor', text: 'That\'s early! What do you do after you wake up?' },
          { speaker: 'Student', text: 'First, I shower and get ready. Then I have breakfast.' },
          { speaker: 'Tutor', text: 'Do you have to go to school every day?' },
          { speaker: 'Student', text: 'Yes, I do. I have to be there by 8 AM. I have class all morning.' },
          { speaker: 'Tutor', text: 'What about after school?' },
          { speaker: 'Student', text: 'After school, I have to do my homework. On Mondays and Wednesdays, I play soccer.' },
          { speaker: 'Tutor', text: 'Do you have to help at home?' },
          { speaker: 'Student', text: 'Yes, I do. I have to help my mom with dinner. I also have to clean my room.' },
          { speaker: 'Tutor', text: 'When do you go to bed?' },
          { speaker: 'Student', text: 'I usually go to bed around 10 PM on school nights, but on weekends I can stay up later.' },
        ],
      },
      checkUnderstanding: [
        {
          question: 'What time does Maria have to wake up?',
          expectedAnswer: 'She has to wake up at 6:30.',
        },
        {
          question: 'Does Maria have to go to school every day?',
          expectedAnswer: 'Yes, she has to go to school every day.',
        },
        {
          question: 'What responsibilities does Maria have at home?',
          expectedAnswer: 'She has to help with dinner and clean her room.',
        },
      ],
    },
    // Exercise 5: Correct the Mistake - Grammar focus on "have to"
    {
      id: 'exercise-5-grammar',
      number: 5,
      type: 'grammar',
      title: 'Correct the Mistake',
      description: 'Find and correct errors with "have to" / "don\'t have to"',
      timeMinutes: 4,
      instructions: 'Find and correct the mistake in each sentence. Be careful — not all sentences have a mistake!',
      content: {
        sentences: [
          'I have to wake up early on school days.',
          'She don\'t have to do her homework on Saturday.',
          'Do you has to go to school every day?',
          'They don\'t has to clean their rooms.',
          'He has to finish his homework before dinner.',
          'We have to go to bed at a reasonable time.',
          'She doesn\'t have to go to school on Sunday.',
          'Do they have to play sports?',
        ],
      },
      practice: {
        type: 'multiple-choice',
        instructions: 'For each sentence, identify if it is correct or incorrect.',
        content: 'Practice identifying correct and incorrect usage of "have to"',
      },
    },
    // Exercise 6: Dialogue Completion
    {
      id: 'exercise-6-dialogue-completion',
      number: 6,
      type: 'fill-blanks',
      title: 'Dialogue Completion',
      description: 'Complete a dialogue about daily routines',
      timeMinutes: 5,
      instructions: 'Read the dialogue aloud with your tutor and fill in the blanks. You will be Alex, a high school student.',
      content: {
        dialogue: [
          { speaker: 'Tutor', text: 'Tell me about your typical day, Alex.' },
          { speaker: 'Student', text: 'Well, I (1) __________ wake up at 7 AM on school days.' },
          { speaker: 'Tutor', text: 'What do you do first?' },
          { speaker: 'Student', text: 'I (2) __________ shower and then I eat breakfast.' },
          { speaker: 'Tutor', text: 'What about school?' },
          { speaker: 'Student', text: 'I have to be there by 8 AM. I (3) __________ class all morning.' },
          { speaker: 'Tutor', text: 'Do you like your classes?' },
          { speaker: 'Student', text: 'Some of them. After school I (4) __________ do my homework. On Tuesdays I don\'t have to go home - I have (5) __________ play basketball.' },
          { speaker: 'Tutor', text: 'That sounds fun! Do you (6) __________ any responsibilities at home?' },
          { speaker: 'Student', text: 'Yes, I have to help my parents. I also have to keep my room clean. And I have to go to bed by 10:30 on school nights.' },
        ],
      },
      practice: {
        type: 'fill-blanks',
        instructions: 'Fill in blanks 1-6 using words/phrases from the answer pool below.',
        content: 'Complete the dialogue about Alex\'s daily routine',
        answerPool: ['have to', 'have to', 'have', 'have to', 'to', 'have'],
      },
    },
    // Exercise 7: Guided Speaking - Ask the tutor questions
    {
      id: 'exercise-7-guided-speaking',
      number: 7,
      type: 'speaking',
      title: 'Guided Speaking Practice',
      description: 'Ask your tutor about their daily routine',
      timeMinutes: 5,
      instructions: 'Ask your tutor these questions about their daily routine. Listen carefully to their responses.',
      content: {
        questions: [
          'What time do you wake up?',
          'What do you do in the morning?',
          'Do you have to work every day?',
          'What do you do after work?',
          'Do you have to cook dinner?',
          'What time do you go to bed?',
          'Do you have any hobbies or activities?',
        ],
      },
      practice: {
        type: 'q&a',
        instructions: 'Ask your tutor the questions above. Try to maintain a natural conversation and ask follow-up questions.',
        content: 'Speaking practice through question-asking',
      },
    },
    // Exercise 8: Free Conversation
    {
      id: 'exercise-8-conversation',
      number: 8,
      type: 'conversation',
      title: 'Free Conversation',
      description: 'Discuss daily routines and responsibilities',
      timeMinutes: 5,
      instructions: 'Have a conversation based on these questions. Don\'t forget to ask your tutor some questions too! Try to personalize your answers.',
      content: {
        questions: [
          'What is the most challenging part of your daily routine?',
          'What responsibilities do you enjoy the most?',
          'What would your ideal daily schedule look like?',
          'Do you think you have to do too much?',
          'What do you like to do in your free time?',
        ],
      },
      practice: {
        type: 'role-play',
        instructions: 'Have a free conversation about daily routines. Your tutor will guide you.',
        content: 'Fluency practice with personal expression about daily life',
      },
    },
    // Exercise 9: Challenge - Create your own dialogue
    {
      id: 'exercise-9-challenge',
      number: 9,
      type: 'challenge',
      title: 'Challenge Activity',
      description: 'Create a dialogue about a different person\'s daily routine',
      timeMinutes: 5,
      instructions: 'This is an optional challenge. Try to create a dialogue with your tutor about someone else\'s daily routine (a family member, friend, or famous person).',
      content: {
        text: 'Create a dialogue similar to Exercise 4, but about a different person\'s daily routine. Your tutor will ask you questions and you should answer using "have to / don\'t have to" and other expressions from this lesson.',
      },
      practice: {
        type: 'role-play',
        instructions: 'Challenge yourself by creating a dialogue with your tutor about someone else\'s daily routine, using all the language you learned today.',
        content: 'Advanced extension activity - create and perform original dialogue',
      },
    },
  ],
})

/**
 * To use this lesson:
 * 
 * 1. Import it in your lesson component:
 *    import { dailyRoutinesLessonUnder18 } from '@/lib/lesson-templates/examples/daily-routines-lesson'
 * 
 * 2. Pass it to your lesson renderer:
 *    <LessonRenderer lesson={dailyRoutinesLessonUnder18} />
 * 
 * 3. Or access specific properties:
 *    const title = dailyRoutinesLessonUnder18.metadata.title
 *    const objectives = dailyRoutinesLessonUnder18.learningObjectives
 *    const exercises = dailyRoutinesLessonUnder18.exercises
 */
