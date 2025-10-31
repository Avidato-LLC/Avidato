import geminiService from '../src/lib/gemini';

async function runDemo() {
  const studentProfile = {
    name: 'Demo Student',
    targetLanguage: 'English',
    nativeLanguage: 'Spanish',
    ageGroup: 'adult',
    level: 'B1',
    endGoals: 'Improve business English vocabulary',
    occupation: 'Business Analyst',
    weaknesses: 'Vocabulary',
    interests: 'Finance, technology'
  };

  const learningTopic = {
    lessonNumber: 1,
    title: 'Business Communication',
    objective: 'Learn key business vocabulary',
    vocabulary: [],
    grammarFocus: 'Present Simple',
    skills: ['speaking', 'listening'],
    context: 'Office meeting',
    methodology: 'TBLT' as const
  };

  console.log('Generating vocabulary for student learning goal...');
  const lesson = await geminiService.generateLesson(studentProfile, learningTopic, 25);
  console.log('Generated Vocabulary:', lesson.vocabulary);
}

runDemo().catch(console.error);
