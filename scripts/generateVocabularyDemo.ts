import geminiService from '../src/lib/gemini';

async function runDemo() {
  // Test with C1 Advanced Accountant - should NOT include basic accounting terms!
  const studentProfile = {
    name: 'Advanced Accountant',
    targetLanguage: 'English',
    nativeLanguage: 'Spanish',
    ageGroup: 'adult',
    level: 'C1',
    endGoals: 'Advanced professional English for auditing',
    occupation: 'Senior Auditor',
    weaknesses: 'Advanced financial reporting terminology',
    interests: 'Auditing, risk management, compliance frameworks'
  };

  const learningTopic = {
    lessonNumber: 1,
    title: 'Advanced Auditing Concepts',
    objective: 'Learn sophisticated vocabulary for auditing and financial reporting',
    vocabulary: [],
    grammarFocus: 'Complex structures',
    skills: ['speaking', 'listening', 'reading'],
    context: 'Audit committee meeting discussing complex accounting standards',
    methodology: 'TBLT' as const
  };

  console.log('🎯 Testing C1 Advanced Accountant (Should NOT include basic words like "compliance", "fraudulent", "verification")');
  console.log('Generating advanced vocabulary for professional context...\n');
  
  try {
    const lesson = await geminiService.generateLesson(studentProfile, learningTopic, 50);
    
    // Display results
    console.log('📚 Generated Lesson Title:', lesson.title);
    console.log('📋 Difficulty Level:', lesson.difficulty);
    console.log('⏱️ Duration:', lesson.duration, 'minutes');
    console.log('🎓 Objective:', lesson.objective);
    
    // Find the vocabulary exercise
    const vocabExercise = lesson.exercises.find(ex => ex.type === 'vocabulary');
    if (vocabExercise && vocabExercise.content && typeof vocabExercise.content === 'object') {
      const content = vocabExercise.content as { vocabulary?: unknown[] };
      if (content.vocabulary && Array.isArray(content.vocabulary)) {
        console.log('\n✅ VOCABULARY ITEMS:');
        console.log('─'.repeat(100));
        
        for (let i = 0; i < content.vocabulary.length; i++) {
          const vocab = content.vocabulary[i] as { 
            word?: string; 
            partOfSpeech?: string; 
            phonetics?: string; 
            definition?: string; 
            example?: string; 
            synonym?: string; 
            expressions?: string[] 
          };
          console.log(`\n${i + 1}. ${vocab.word} (${vocab.partOfSpeech})`);
          console.log(`   Pronunciation: ${vocab.phonetics}`);
          console.log(`   Definition: ${vocab.definition}`);
          console.log(`   Example: ${vocab.example}`);
          if (vocab.synonym) {
            console.log(`   Synonym: ${vocab.synonym}`);
          }
          if (vocab.expressions && vocab.expressions.length > 0) {
            console.log(`   Expressions: ${vocab.expressions.join(', ')}`);
          }
        }
        
        // Check for problematic basic vocabulary
        console.log('\n─'.repeat(100));
        const basicTerms = ['compliance', 'fraudulent', 'verification', 'doctor', 'hospital', 'patient', 'meeting', 'email', 'project', 'computer'];
        const foundBasicTerms = content.vocabulary.filter((v: unknown) => {
          if (typeof v !== 'object' || v === null) return false;
          const vocab = v as { word?: string };
          return basicTerms.some(bt => vocab.word?.toLowerCase().includes(bt));
        });
        
        if (foundBasicTerms.length > 0) {
          console.log('⚠️ WARNING: Found basic terms that should NOT be in C1 lessons:');
          foundBasicTerms.forEach((v: unknown) => {
            if (typeof v === 'object' && v !== null) {
              const vocab = v as { word?: string };
              console.log(`   - ${vocab.word}`);
            }
          });
        } else {
          console.log('✅ SUCCESS: No basic vocabulary found. All vocabulary is appropriately advanced for C1 level!');
        }
        
        console.log(`\n✅ Total vocabulary items: ${content.vocabulary.length}`);
      }
    }
  } catch (error) {
    console.error('❌ Error generating lesson:', error);
  }
}

runDemo().catch(console.error);
