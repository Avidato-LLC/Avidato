// Test script to validate vocabulary generation improvements
const { PrismaClient } = require('@prisma/client');
const path = require('path');

// Mock student profile for testing
const testStudent = {
  id: 'test-student',
  name: 'Alex Johnson',
  level: 'C1 Advanced',
  occupation: 'Software Developer',
  endGoals: 'Improve business English for international meetings',
  targetLanguage: 'English',
  nativeLanguage: 'Spanish',
  ageGroup: '25-34',
  weaknesses: 'formal presentation skills',
  interests: 'technology trends, startup culture'
};

// Test topics that should generate sophisticated vocabulary
const testTopics = [
  {
    title: 'Advanced Business Communication',
    objective: 'Master sophisticated business vocabulary and formal expressions',
    context: 'International business meetings and negotiations',
    vocabulary: ['leverage', 'paradigm', 'synergy', 'stakeholder', 'initiative']
  },
  {
    title: 'Complex Problem-Solving Discussions',
    objective: 'Use advanced vocabulary for analytical thinking',
    context: 'Strategic planning and decision-making scenarios',
    vocabulary: ['ramifications', 'discrepancy', 'contingency', 'precedent', 'correlation']
  }
];

// Vocabulary that should be FORBIDDEN for software developers
const forbiddenBasicTerms = [
  'linkedin', 'programming', 'coding', 'computer', 'software', 
  'team', 'project', 'meeting', 'email', 'career growth',
  'professional development', 'networking', 'ai', 'blockchain'
];

// Expected sophisticated vocabulary for C1 software developers
const expectedSophisticatedTerms = [
  'deprecated', 'polymorphism', 'containerization', 'scalability',
  'paradigm shift', 'disruptive innovation', 'value proposition',
  'contraindication', 'pathophysiology', 'ramifications',
  'contingency planning', 'stakeholder alignment'
];

console.log('🧪 Testing Vocabulary Generation System');
console.log('=======================================');

console.log('\n📋 Test Student Profile:');
console.log(`- Name: ${testStudent.name}`);
console.log(`- Level: ${testStudent.level}`);
console.log(`- Occupation: ${testStudent.occupation}`);
console.log(`- Goals: ${testStudent.endGoals}`);

console.log('\n🚫 Forbidden Basic Terms (should NOT appear):');
forbiddenBasicTerms.forEach(term => console.log(`  - ${term}`));

console.log('\n✅ Expected Sophisticated Terms (should appear):');
expectedSophisticatedTerms.forEach(term => console.log(`  - ${term}`));

console.log('\n📝 Test Results:');
console.log('To test the updated vocabulary generation:');
console.log('1. Go to the dashboard');
console.log('2. Select a C1 software developer student');
console.log('3. Generate lessons on business communication topics');
console.log('4. Verify vocabulary contains sophisticated terms, not basic professional ones');

console.log('\n🎯 What to Look For:');
console.log('✅ GOOD: "leverage synergies", "paradigm shift", "disruptive innovation"');
console.log('❌ BAD: "LinkedIn", "programming", "team meeting", "email"');

console.log('\n🔧 System Updates Applied:');
console.log('- Added getOccupationExclusions() method');
console.log('- Enhanced getLevelVocabularyGuide() with specific examples');
console.log('- Updated all generation methods with strict exclusions');
console.log('- Added explicit forbidden terms for different professions');

console.log('\n✨ Ready for manual testing!');