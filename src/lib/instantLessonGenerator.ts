// instantLessonGenerator.ts
// Standalone instant lesson generator using GeminiService

import { StudentProfile, GeneratedLesson } from '../types/lesson-template';
import geminiService from './gemini';

/**
 * Generate an instant lesson for a student based on a prompt and focus
 * @param student StudentProfile
 * @param prompt Situation or need for the lesson
 * @param focus Main skill focus (speaking, vocabulary, grammar, listening, mixed)
 * @param duration Lesson duration (25 or 50 minutes)
 */
export async function generateInstantLesson(
  student: StudentProfile,
  prompt: string,
  focus: 'speaking' | 'vocabulary' | 'grammar' | 'listening' | 'mixed' = 'mixed',
  duration: 25 | 50 = 50
): Promise<GeneratedLesson> {
  // Re-implement instant lesson generation logic here, since geminiService no longer has generateInstantLesson
  // This mirrors the previous implementation from gemini.ts
  const instantPrompt = `You are an expert English teacher creating an INSTANT lesson in Engoo format based on a specific student need.

STUDENT PROFILE:
- Name: ${student.name}
- Level: ${student.level}
- Goals: ${student.endGoals}
- Occupation: ${student.occupation || 'General learner'}
- Weaknesses: ${student.weaknesses || 'General improvement'}

INSTANT LESSON REQUEST: "${prompt}"
PRIMARY FOCUS: ${focus}
DURATION: ${duration} minutes

LEVEL-APPROPRIATE VOCABULARY REQUIREMENTS:
${geminiService.getLevelVocabularyGuide(student.level)}

🚫 CRITICAL VOCABULARY EXCLUSIONS:
${geminiService.getOccupationExclusions(student.occupation || '')}

CRITICAL REQUIREMENTS FOR INSTANT LESSONS:
1. Address the SPECIFIC situation mentioned in the prompt
2. Create immediately applicable vocabulary and phrases
3. Include realistic scenarios that prepare the student for their exact need
4. Focus on ${focus} skills while maintaining lesson balance
5. Generate vocabulary that will be IMMEDIATELY useful for their situation
6. Use ${student.level.toUpperCase()}-level complexity

INSTANT LESSON STRUCTURE:

**Exercise 1: Situation-Specific Vocabulary**
Create vocabulary directly related to their need:
{
  "type": "vocabulary",
  "title": "Essential Vocabulary for Your Situation",
  "description": "Key words and phrases you'll need",
  "content": {
    "vocabulary": [/* 6-8 situation-specific vocabulary items with phonetics */]
  },
  "timeMinutes": 8
}

**Exercise 2: Quick Preparation**
Immediate preparation questions:
{
  "type": "preparation",
  "title": "Situation Preparation",
  "description": "Quick questions to prepare for your specific need",
  "content": {
    "questions": ["Situation-specific preparation questions"],
    "tips": ["Practical advice for their situation"]
  },
  "timeMinutes": 7
}

**Exercise 3: Realistic Dialogue/Role-Play**
Create dialogue that mirrors their exact situation:
{
  "type": "dialogue",
  "title": "Practice Scenario",
  "description": "Practice the exact situation you described",
  "content": {
    "setting": "Specific setting for their need",
    "dialogue": [/* Realistic conversation for their situation */],
    "roleplay": "Instructions for practicing the scenario"
  },
  "timeMinutes": ${Math.floor(duration * 0.5)}
}

**Exercise 4: Final Preparation**
Last-minute preparation activities:
{
  "type": "finalprep",
  "title": "Ready to Go",
  "description": "Final preparation and confidence building",
  "content": {
    "checklist": ["Things to remember"],
    "phrases": ["Key phrases to use"],
    "confidence": ["Confidence-building tips"]
  },
  "timeMinutes": ${Math.floor(duration * 0.3)}
}

EXAMPLES OF INSTANT LESSON ADAPTATION:

For "Job Interview Tomorrow":
- Vocabulary: "highlight achievements", "elaborate on experience", "demonstrate competency"
- Dialogue: Interviewer asking about experience, candidate responding confidently
- Focus: Professional communication and confidence

For "Business Presentation":
- Vocabulary: "executive summary", "key takeaways", "actionable insights"
- Dialogue: Presenter introducing slides, handling Q&A
- Focus: Presentation skills and audience engagement

OUTPUT FORMAT (JSON):
{
  "title": "Instant Lesson: [Brief description of their need]",
  "lessonType": "instant",
  "difficulty": ${student.level === 'beginner' ? '3-4' : student.level === 'intermediate' ? '5-6' : '7-8'},
  "duration": ${duration},
  "objective": "Prepare for: ${prompt}",
  "skills": ["${focus === 'mixed' ? 'Speaking", "Listening", "Vocabulary' : focus}"],
  "vocabulary": [/* situational vocabulary */],
  "context": "Immediate preparation for: ${prompt}",
  "exercises": [/* 4 exercises following exact format above */],
  "homework": "Review key phrases and practice the scenario",
  "materials": ["Situation-specific vocabulary cards", "Practice scenarios"],
  "teachingNotes": "Focus on immediate practical application. Build confidence for the specific situation."
}

Generate an instant lesson that directly prepares the student for their specific need. Return ONLY the JSON.`;

  try {
    const result = await geminiService.retryWithBackoff(async () => {
      const response = await geminiService.model.generateContent(instantPrompt);
      return await response.response;
    });
    const text = result.text();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No valid JSON found in AI response');
    }
    const cleanedJson = jsonMatch[0]
      .replace(/[\x00-\x1F\x7F]/g, '')
      .replace(/\n/g, '\\n')
      .replace(/\r/g, '\\r')
      .replace(/\t/g, '\\t');
    return JSON.parse(cleanedJson);
  } catch (error) {
    console.error('Error generating instant lesson:', error);
    throw new Error('Failed to generate instant lesson. Please try again.');
  }
}
