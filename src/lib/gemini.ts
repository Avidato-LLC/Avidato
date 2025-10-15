// src/lib/gemini.ts
import { GoogleGenerativeAI } from '@google/generative-ai';

if (!process.env.GOOGLE_API_KEY) {
  throw new Error('GOOGLE_API_KEY is not set');
}

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

// Types for our AI generation
export interface StudentProfile {
  name: string;
  targetLanguage: string;
  nativeLanguage: string;
  ageGroup: string;
  level: string;
  endGoals: string;
  occupation?: string;
  weaknesses?: string;
  interests?: string;
}

export interface LearningTopic {
  lessonNumber: number;
  title: string;
  objective: string;
  vocabulary: string[];
  grammarFocus?: string;
  skills: string[];
  context: string;
  methodology: 'CLT' | 'TBLT' | 'PPP' | 'TTT';
}

export interface LearningPlan {
  selectedMethodology: 'CLT' | 'TBLT' | 'PPP' | 'TTT';
  methodologyReasoning: string;
  topics: LearningTopic[];
}

export interface LessonExercise {
  type: 'vocabulary' | 'expressions' | 'dialogue' | 'roleplay' | 'discussion' | 'grammar' | 'article' | 'fill_blanks' | 'sentence_building' | 'pronunciation' | 'listening';
  title: string;
  description: string;
  content: string | string[] | object;
  timeMinutes: number;
}

export interface GeneratedLesson {
  title: string;
  lessonType: 'business' | 'grammar' | 'article' | 'conversation' | 'mixed';
  difficulty: number;
  duration: number;
  objective: string;
  skills: string[];
  vocabulary: string[];
  context: string;
  exercises: LessonExercise[];
  homework?: string;
  materials: string[];
  teachingNotes?: string;
}

class GeminiService {
  private model = genAI.getGenerativeModel({ 
    model: 'gemini-2.0-flash-exp',
    generationConfig: {
      temperature: 0.7,
      topK: 40,
      topP: 0.95,
      maxOutputTokens: 4096,
    },
  });

  // Methodology selection based on student profile
  private selectMethodology(student: StudentProfile): { methodology: 'CLT' | 'TBLT' | 'PPP' | 'TTT'; reasoning: string } {
    const { level, endGoals, occupation, weaknesses } = student;
    const goals = endGoals.toLowerCase();
    const weak = weaknesses?.toLowerCase() || '';
    
    // CLT for communication-focused students
    if (goals.includes('conversation') || goals.includes('speaking') || goals.includes('communication') || 
        goals.includes('travel') || goals.includes('social')) {
      return {
        methodology: 'CLT',
        reasoning: 'Selected CLT (Communicative Language Teaching) because the student\'s goals emphasize real-world communication, speaking practice, and interactive scenarios. This methodology prioritizes fluency and meaningful interaction.'
      };
    }
    
    // TBLT for practical, application-focused learners
    if (goals.includes('work') || goals.includes('business') || goals.includes('professional') || 
        goals.includes('job') || occupation) {
      return {
        methodology: 'TBLT',
        reasoning: 'Selected TBLT (Task-Based Language Teaching) because the student has professional/work-related goals. This methodology focuses on completing meaningful real-world tasks that directly apply to their professional context.'
      };
    }
    
    // PPP for beginners or grammar-focused students
    if (level === 'beginner' || weak.includes('grammar') || weak.includes('structure') || 
        goals.includes('exam') || goals.includes('academic')) {
      return {
        methodology: 'PPP',
        reasoning: 'Selected PPP (Presentation, Practice, Production) because the student is a beginner or has grammar weaknesses. This structured approach gradually builds accuracy before moving to free production.'
      };
    }
    
    // Default to CLT for most speaking-focused scenarios
    return {
      methodology: 'CLT',
      reasoning: 'Selected CLT (Communicative Language Teaching) as the default methodology, focusing on real-life communication and speaking practice, which benefits most language learners.'
    };
  }

  // Generate learning plan (10 topics)
  async generateLearningPlan(student: StudentProfile): Promise<LearningPlan> {
    const { methodology, reasoning } = this.selectMethodology(student);
    
    const prompt = `Generate a 10-lesson learning plan for a ${student.level} ${student.targetLanguage} student.

STUDENT PROFILE:
- Name: ${student.name}
- Target Language: ${student.targetLanguage}
- Native Language: ${student.nativeLanguage}
- Age Group: ${student.ageGroup}
- Level: ${student.level}
- Goals: ${student.endGoals}
- Occupation: ${student.occupation || 'Not specified'}
- Weaknesses: ${student.weaknesses || 'Not specified'}
- Interests: ${student.interests || 'Not specified'}

SELECTED METHODOLOGY: ${methodology}
${reasoning}

REQUIREMENTS:
1. Create exactly 10 learning topics
2. Each topic should be relevant to the student's goals and context
3. Focus on speaking-based materials as most students prefer this
4. Use ${methodology} methodology principles:
   ${methodology === 'CLT' ? '- Emphasize real-life communication, dialogues, role-plays, discussions' : ''}
   ${methodology === 'TBLT' ? '- Focus on meaningful tasks and practical applications' : ''}
   ${methodology === 'PPP' ? '- Structure with clear presentation, controlled practice, then production' : ''}
   ${methodology === 'TTT' ? '- Balance teacher input with guided student discovery' : ''}

4. Make content domain-specific to their occupation/interests when relevant
5. Progress logically from simpler to more complex topics

FORMAT YOUR RESPONSE AS VALID JSON ONLY (no markdown, no explanations):
{
  "topics": [
    {
      "lessonNumber": 1,
      "title": "Topic title",
      "objective": "What the student will learn/achieve",
      "vocabulary": ["word1", "word2", "phrase1"],
      "grammarFocus": "Grammar point if applicable",
      "skills": ["speaking", "listening", "reading", "writing"],
      "context": "Real-world scenario or domain context",
      "methodology": "${methodology}"
    }
  ]
}

IMPORTANT: Return ONLY the JSON object. No additional text, markdown formatting, or explanations.`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Extract JSON from response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No valid JSON found in AI response');
      }
      
      // Clean the JSON string of control characters
      const cleanedJson = jsonMatch[0]
        .replace(/[\x00-\x1F\x7F]/g, '') // Remove control characters
        .replace(/\n/g, '\\n') // Escape newlines
        .replace(/\r/g, '\\r') // Escape carriage returns
        .replace(/\t/g, '\\t'); // Escape tabs
      
      const parsedResponse = JSON.parse(cleanedJson);
      
      return {
        selectedMethodology: methodology,
        methodologyReasoning: reasoning,
        topics: parsedResponse.topics
      };
    } catch (error) {
      console.error('Error generating learning plan:', error);
      throw new Error('Failed to generate learning plan. Please try again.');
    }
  }

  // Generate individual lesson
  async generateLesson(
    student: StudentProfile, 
    topic: LearningTopic, 
    duration: 25 | 50 = 50
  ): Promise<GeneratedLesson> {
    const prompt = `You are an expert ESL curriculum designer. Generate a ${duration}-minute lesson plan based on the student profile and topic, automatically selecting the most appropriate lesson format and structure.

STUDENT PROFILE:
- Name: ${student.name}
- Level: ${student.level} 
- Age Group: ${student.ageGroup}
- Native Language: ${student.nativeLanguage}
- End Goals: ${student.endGoals}
- Occupation: ${student.occupation || 'General learner'}
- Weaknesses: ${student.weaknesses || 'Not specified'}
- Interests: ${student.interests || 'Not specified'}

LESSON TOPIC: ${topic.title}
OBJECTIVE: ${topic.objective}
CONTEXT: ${topic.context}

REQUIRED VOCABULARY (MUST ALL BE USED IN LESSON): ${topic.vocabulary.join(', ')}

CRITICAL REQUIREMENT: Every single vocabulary word from the list above MUST be actively used and practiced throughout the lesson exercises. Do not just list them - integrate them naturally into dialogues, reading passages, fill-in-the-blank exercises, discussion questions, and role-play scenarios.

LESSON FORMAT SELECTION RULES:
1. BUSINESS FORMAT: Use when student has business occupation/goals (meetings, emails, presentations, negotiations)
   - Useful Expressions → Dialogue Practice → Role Play → Discussion
   
2. GRAMMAR FORMAT: Use when topic focuses on specific grammar points or student has grammar weaknesses
   - Sentence Practice → Grammar Focus/Explanation → Fill in Blanks → Sentence Building
   
3. ARTICLE FORMAT: Use for advanced students or when building reading/discussion skills
   - Vocabulary → Article Reading → Discussion → Further Discussion
   
4. CONVERSATION FORMAT: Use for speaking practice, travel English, casual communication
   - Vocabulary → Useful Expressions → Dialogue Practice → Role Play → Discussion

5. MIXED FORMAT: Adapt based on specific needs (pronunciation, cultural topics, etc.)

CONTENT ADAPTATION RULES:
- BEGINNER: Simple vocabulary, basic grammar, short dialogues, visual aids
- INTERMEDIATE: Moderate complexity, practical situations, longer conversations
- ADVANCED: Complex topics, nuanced discussions, professional contexts, critical thinking

- CHILD: Playful activities, simple language, games, visual elements
- TEEN: Relevant topics (social media, school, hobbies), interactive exercises
- ADULT: Professional contexts, real-world applications, practical skills

- BUSINESS CONTEXT: Work scenarios, professional language, industry-specific vocabulary
- ACADEMIC: Formal language, research skills, presentation techniques
- CASUAL: Everyday situations, informal language, social interactions

NATIVE LANGUAGE CONSIDERATIONS:
- Spanish speakers: Focus on pronunciation (b/v, ch/sh), article usage, false friends
- Chinese speakers: Focus on pronunciation (l/r, th), verb tenses, plural forms
- Arabic speakers: Focus on vowel sounds, word order, prepositions
- Adjust accordingly for other native languages

VOCABULARY INTEGRATION REQUIREMENTS:
1. Every vocabulary word must appear at least 2-3 times throughout the lesson
2. Use vocabulary in multiple contexts (definitions, examples, dialogues, exercises)
3. Create natural usage scenarios that help students understand meaning and usage
4. Include vocabulary in role-play situations and discussion questions
5. Ensure vocabulary appears in different exercise types for reinforcement

AUTOMATICALLY SELECT THE BEST FORMAT AND GENERATE CONTENT.

OUTPUT FORMAT (JSON):
{
  "title": "${topic.title}",
  "lessonType": "business|grammar|article|conversation|mixed",
  "difficulty": 1-10,
  "duration": ${duration},
  "objective": "${topic.objective}",
  "skills": ${JSON.stringify(topic.skills)},
  "vocabulary": ${JSON.stringify(topic.vocabulary)},
  "context": "${topic.context}",
  "exercises": [
    {
      "type": "vocabulary|expressions|dialogue|roleplay|discussion|grammar|article|fill_blanks|sentence_building",
      "title": "Exercise 1: [Title]",
      "description": "Brief description",
      "content": "Exercise content using ALL vocabulary words naturally",
      "timeMinutes": number
    }
  ],
  "homework": "Optional homework assignment using vocabulary",
  "materials": ["suggested materials", "resources"],
  "teachingNotes": "Notes highlighting how vocabulary is integrated throughout"
}

CONTENT EXAMPLES BY TYPE:

EXPRESSIONS: Include vocabulary words in useful phrases
VOCABULARY: Define each word with examples and context  
DIALOGUE: Create conversations naturally incorporating ALL vocabulary words
ROLEPLAY: Design scenarios where vocabulary words are essential for communication
DISCUSSION: Frame questions that require using the vocabulary words
GRAMMAR: Use vocabulary words in grammar examples and practice sentences
ARTICLE: Write passages that naturally include all vocabulary words
FILL_BLANKS: Create exercises where vocabulary words are the missing items
SENTENCE_BUILDING: Provide vocabulary words as building blocks for sentences

Generate a complete, engaging lesson where every vocabulary word is meaningfully integrated and reinforced throughout all exercises. Return ONLY the JSON.`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Extract JSON from response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No valid JSON found in AI response');
      }
      
      // Clean the JSON string of control characters
      const cleanedJson = jsonMatch[0]
        .replace(/[\x00-\x1F\x7F]/g, '') // Remove control characters
        .replace(/\n/g, '\\n') // Escape newlines
        .replace(/\r/g, '\\r') // Escape carriage returns
        .replace(/\t/g, '\\t'); // Escape tabs
      
      return JSON.parse(cleanedJson);
    } catch (error) {
      console.error('Error generating lesson:', error);
      throw new Error('Failed to generate lesson. Please try again.');
    }
  }
}

export const geminiService = new GeminiService();