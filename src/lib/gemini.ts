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
5. Make content domain-specific to their occupation/interests when relevant
6. Progress logically from simpler to more complex topics
7. VOCABULARY MUST BE LEVEL-APPROPRIATE:
${this.getLevelVocabularyGuide(student.level)}

🚫 CRITICAL VOCABULARY EXCLUSIONS:
${this.getOccupationExclusions(student.occupation || '')}

🎯 FOCUS ON: Advanced expressions, sophisticated communication patterns, and nuanced language that challenges language skills rather than professional knowledge.

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
      const result = await this.retryWithBackoff(async () => {
        const response = await this.model.generateContent(prompt);
        return await response.response;
      });
      
      const text = result.text();
      
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

  /**
   * Get level-appropriate vocabulary guidelines
   */
  private getLevelVocabularyGuide(level: string): string {
    const levelLower = level.toLowerCase();
    
    if (levelLower.includes('a1') || levelLower.includes('beginner')) {
      return `A1/BEGINNER VOCABULARY:
- Basic everyday words they don't know yet (family, colors, numbers, food)
- Simple verbs (be, have, go, like)
- Common adjectives (big, small, good, bad)
- Present tense focus
⚠️ Only use basic professional terms if student is NEW to the profession
Example: "happy", "family", "eat", "work"`;
    }
    
    if (levelLower.includes('a2') || levelLower.includes('elementary')) {
      return `A2/ELEMENTARY VOCABULARY:
- Expanded everyday vocabulary
- Simple phrasal verbs (get up, go out)
- Basic collocations (make friends, take a shower)
- Past tense forms
⚠️ Still avoid advanced professional jargon
Example: "neighborhood", "get along with", "take care of"`;
    }
    
    if (levelLower.includes('b1') || levelLower.includes('intermediate')) {
      return `B1/INTERMEDIATE VOCABULARY:
- Common phrasal verbs and their meanings
- Basic idioms and expressions
- Professional vocabulary at intermediate level
- Complex sentence structures
🎯 For professionals: Field-specific but not too advanced
Example: "put up with", "break the ice", "time management", "constructive feedback"`;
    }
    
    if (levelLower.includes('b2') || levelLower.includes('upper')) {
      return `B2/UPPER-INTERMEDIATE VOCABULARY:
- Advanced phrasal verbs with multiple meanings
- Idiomatic expressions and collocations
- Nuanced vocabulary for opinions and arguments
- Abstract concepts and formal language
🎯 For professionals: Sophisticated field terminology
Example: "come across as", "in the long run", "food for thought", "a double-edged sword"`;
    }
    
    if (levelLower.includes('c1') || levelLower.includes('advanced')) {
      return `C1/ADVANCED VOCABULARY:
- Sophisticated idiomatic expressions
- Complex phrasal verbs and collocations
- Nuanced vocabulary for subtle distinctions
- Academic and professional register at expert level
- Metaphorical language and advanced concepts
🚫 CRITICAL: NO basic professional terms (computer, email, hospital, court, etc.)
🎯 Focus on: Specialized jargon, advanced concepts, nuanced communication
Example Professional Terms:
• Software: "deprecated", "polymorphism", "containerization", "idempotent"
• Medical: "contraindication", "pathophysiology", "differential diagnosis"
• Legal: "jurisprudence", "precedent", "tort", "adjudicate"
• Business: "synergistic", "paradigm shift", "stakeholder equity"
Example: "cut through the red tape", "a watershed moment", "read between the lines"`;
    }
    
    if (levelLower.includes('c2') || levelLower.includes('proficiency')) {
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
    
    // Default to intermediate if level unclear
    return `INTERMEDIATE VOCABULARY:
- Phrasal verbs and common idioms
- Professional and academic terms
- Abstract concepts
Example: "time management", "work-life balance", "put forward"`;
  }

  /**
   * Get occupation-specific advanced vocabulary exclusions
   */
  private getOccupationExclusions(occupation: string): string {
    const lowerOccupation = occupation.toLowerCase();
    
    if (lowerOccupation.includes('software') || lowerOccupation.includes('developer') || lowerOccupation.includes('programmer')) {
      return `🚫 STRICTLY FORBIDDEN: Basic professional terms like "LinkedIn", "networking", "programming", "coding", "computer", "software", "team", "project", "meeting", "email", "professional development", "career growth"`;
    }
    
    if (lowerOccupation.includes('doctor') || lowerOccupation.includes('physician') || lowerOccupation.includes('medical')) {
      return `🚫 STRICTLY FORBIDDEN: Basic medical terms like "hospital", "patient", "doctor", "medicine", "health", "treatment", "clinic", "nurse", "appointment", "medical practice"`;
    }
    
    if (lowerOccupation.includes('lawyer') || lowerOccupation.includes('attorney') || lowerOccupation.includes('legal')) {
      return `🚫 STRICTLY FORBIDDEN: Basic legal terms like "law", "court", "lawyer", "client", "case", "legal", "attorney", "office", "contract", "agreement"`;
    }
    
    if (lowerOccupation.includes('business') || lowerOccupation.includes('manager') || lowerOccupation.includes('executive')) {
      return `🚫 STRICTLY FORBIDDEN: Basic business terms like "business", "company", "manager", "meeting", "presentation", "email", "office", "team", "project", "strategy", "marketing"`;
    }
    
    return `🚫 STRICTLY FORBIDDEN: Basic professional terms that any working professional would know in their field`;
  }

  /**
   * Get level-specific content instructions
   */
  private getLevelSpecificInstructions(level: string): string {
    const levelLower = level.toLowerCase();
    
    if (levelLower.includes('a1') || levelLower.includes('beginner')) {
      return `
- NEVER use advanced vocabulary or complex structures
- Focus on simple, practical everyday language
- Use present tense and basic sentence patterns
- Create simple, clear dialogues about familiar topics
- Vocabulary: everyday objects, basic actions, simple descriptions`;
    }
    
    if (levelLower.includes('a2') || levelLower.includes('elementary')) {
      return `
- Avoid advanced vocabulary but introduce some intermediate words
- Use simple past and future tenses
- Dialogues about personal experiences and common situations
- Vocabulary: travel, work, family, hobbies, daily routines`;
    }
    
    if (levelLower.includes('b1') || levelLower.includes('intermediate')) {
      return `
- Balance simple and complex vocabulary appropriately
- Introduce abstract concepts and opinion language
- Use conditional structures and complex tenses
- Dialogues about opinions, plans, experiences, and problems
- Vocabulary: abstract concepts, workplace terms, expressing opinions`;
    }
    
    if (levelLower.includes('b2') || levelLower.includes('upper')) {
      return `
- Use sophisticated vocabulary and complex structures
- Include idiomatic expressions and professional language
- Advanced grammar with nuanced meanings
- Dialogues about complex topics, debates, professional situations
- Vocabulary: academic/business terms, nuanced expressions, specialized topics`;
    }
    
    if (levelLower.includes('c1') || levelLower.includes('advanced')) {
      return `
- NEVER use basic vocabulary like "good", "bad", "big", "small"
- NEVER use common professional terms they already know (e.g., for software developers: avoid "artificial intelligence", "machine learning", "blockchain", "cloud computing" unless teaching very specialized aspects)
- FOCUS on sophisticated expressions, idioms, and complex language
- USE advanced grammar structures naturally
- For professionals: focus on nuanced business language, advanced idiomatic expressions, subtle professional communication
- Create nuanced dialogues with subtle meanings and implications
- Vocabulary: sophisticated expressions, advanced idiomatic language, specialized professional communication, complex business terminology`;
    }
    
    if (levelLower.includes('c2') || levelLower.includes('proficient')) {
      return `
- Use native-level expressions and sophisticated vocabulary exclusively
- Include cultural references and complex idiomatic language
- Master-level grammar with subtle distinctions
- Dialogues with native-like fluency and cultural awareness
- Vocabulary: highly sophisticated, culturally-specific, professional expertise level`;
    }
    
    return `
- Match vocabulary and complexity exactly to the student's ${level} level
- Never mix levels - stay consistent with ${level} expectations
- Challenge appropriately without overwhelming or under-stimulating`;
  }

  /**
   * Retry mechanism for API calls with exponential backoff
   */
  private async retryWithBackoff<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    baseDelay: number = 1000
  ): Promise<T> {
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error: unknown) {
        const isLastAttempt = attempt === maxRetries - 1;
        const errorMessage = error instanceof Error ? error.message : String(error);
        const errorObj = error as { status?: number };
        const isRetryableError = errorObj.status === 503 || 
                               errorMessage.includes('overloaded') ||
                               errorMessage.includes('Service Unavailable');
        
        if (isLastAttempt || !isRetryableError) {
          throw error;
        }
        
        const delay = baseDelay * Math.pow(2, attempt) + Math.random() * 1000;
        console.log(`API call failed (attempt ${attempt + 1}/${maxRetries}), retrying in ${Math.round(delay)}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    throw new Error('Max retries exceeded');
  }

  // Generate individual lesson
  async generateLesson(
    student: StudentProfile, 
    topic: LearningTopic, 
    duration: 25 | 50 = 50
  ): Promise<GeneratedLesson> {
    const prompt = `You are an expert English teacher creating lessons in the Engoo format. Generate a comprehensive lesson following the EXACT Engoo structure.

STUDENT PROFILE:
- Name: ${student.name}
- Level: ${student.level} 
- Age Group: ${student.ageGroup}
- Native Language: ${student.nativeLanguage}
- Goals: ${student.endGoals}
- Occupation: ${student.occupation || 'General learner'}
- Weaknesses: ${student.weaknesses || 'General improvement'}
- Interests: ${student.interests || 'General topics'}

LESSON TOPIC: ${topic.title}
OBJECTIVE: ${topic.objective}
CONTEXT: ${topic.context}
VOCABULARY WORDS: ${topic.vocabulary.join(', ')}

LEVEL-APPROPRIATE VOCABULARY REQUIREMENTS:
${this.getLevelVocabularyGuide(student.level)}

CRITICAL REQUIREMENTS:
1. ALL vocabulary words MUST be used 2-3 times throughout the lesson
2. Follow EXACT Engoo format with proper vocabulary structure
3. Create realistic dialogue with multiple characters
4. All exercises must connect thematically
5. VOCABULARY MUST BE LEVEL-APPROPRIATE - avoid basic words for advanced students
6. SELECT VOCABULARY BASED ON:
   - Student's level (use guidelines above)
   - Student's occupation (${student.occupation || 'general'})
   - Student's goals (${student.endGoals})
   - Student's weaknesses (${student.weaknesses || 'general improvement'})
   - Lesson topic and context

🎯 FOR ${student.level.toUpperCase()} STUDENTS SPECIFICALLY:
${this.getLevelSpecificInstructions(student.level)}

🚫 CRITICAL VOCABULARY EXCLUSIONS:
${this.getOccupationExclusions(student.occupation || '')}

🎯 INSTEAD, FOR ${student.level.toUpperCase()} ${student.occupation || 'PROFESSIONALS'}:
- Use sophisticated vocabulary that challenges language skills, NOT professional knowledge
- Focus on advanced expressions, nuanced communication, complex linguistic structures
- Include advanced idioms, phrasal verbs, and sophisticated terminology from OTHER fields
- Challenge their English proficiency, not their domain expertise

ENGOO LESSON STRUCTURE:

**Exercise 1: Vocabulary**
Create 6-8 vocabulary items with this EXACT format (examples for different levels):

FOR BEGINNER/ELEMENTARY (A1-A2):
{
  "word": "appointment",
  "partOfSpeech": "Noun",
  "phonetics": "/əˈpɔɪntmənt/",
  "definition": "a meeting that has been arranged for a particular time",
  "example": "I have a doctor's appointment at 3 PM."
}

FOR INTERMEDIATE (B1-B2):
{
  "word": "streamline",
  "partOfSpeech": "Verb", 
  "phonetics": "/ˈstriːmlaɪn/",
  "definition": "to make a process more efficient by simplifying it",
  "example": "We need to streamline our approval process to reduce delays."
}

FOR ADVANCED (C1-C2):
{
  "word": "paradigm shift",
  "partOfSpeech": "Noun phrase",
  "phonetics": "/ˈpærədaɪm ʃɪft/",
  "definition": "a fundamental change in approach or underlying assumptions",
  "example": "The company underwent a paradigm shift, moving from traditional sales to digital-first strategies."
}

VOCABULARY FORMAT:
{
  "type": "vocabulary",
  "title": "Exercise 1: Vocabulary", 
  "description": "Learn and practice new vocabulary",
  "content": {
    "vocabulary": [/* 6-8 level-appropriate vocabulary items */]
  },
  "timeMinutes": 10
}

**Exercise 2: Warm-up**
2-3 discussion questions introducing the topic:
{
  "type": "warmup",
  "title": "Exercise 2: Warm-up",
  "description": "Discussion questions to introduce the topic",
  "content": {
    "questions": ["Question using vocabulary naturally", "Another question"],
    "instructions": "Discuss these questions with your teacher"
  },
  "timeMinutes": 8
}

**Exercise 3: Dialogue**
Realistic conversation between 3-4 characters using ALL vocabulary:
{
  "type": "dialogue",
  "title": "Exercise 3: Dialogue",
  "description": "Read the dialogue about [context]",
  "content": {
    "context": "Setting description",
    "characters": [
      {"name": "James", "role": "Employee", "avatar": "young professional man"},
      {"name": "Chairman", "role": "CEO", "avatar": "senior businessman"}
    ],
    "dialogue": [
      {"character": "James", "text": "Speech that uses vocabulary naturally"},
      {"character": "Chairman", "text": "Response using more vocabulary"}
    ],
    "instructions": "Read the dialogue aloud with your teacher"
  },
  "timeMinutes": 12
}

**Exercise 4: Dialogue Comprehension**
Questions about the dialogue:
{
  "type": "comprehension",
  "title": "Exercise 4: Dialogue Comprehension",
  "description": "Answer questions about the dialogue",
  "content": {
    "questions": [
      {
        "question": "What did James suggest?",
        "type": "multiple-choice",
        "options": ["A) Option 1", "B) Option 2", "C) Option 3"],
        "answer": "A"
      }
    ]
  },
  "timeMinutes": 8
}

**Exercise 5: Role Play (if appropriate)**
Scenario using vocabulary and context:
{
  "type": "roleplay",
  "title": "Exercise 5: Role Play",
  "description": "Practice the conversation in a new scenario",
  "content": {
    "scenario": "You and your partner are...",
    "roles": [
      {"name": "Student A", "description": "You are...", "keyPoints": ["Use vocabulary"]},
      {"name": "Student B", "description": "You are...", "keyPoints": ["Use vocabulary"]}
    ],
    "instructions": "Have a 5-minute conversation using the vocabulary",
    "timeMinutes": 10
  },
  "timeMinutes": 10
}

**Exercise 6: Discussion**
4-5 questions for free practice:
{
  "type": "discussion",
  "title": "Exercise 6: Discussion", 
  "description": "Discuss these questions using the vocabulary",
  "content": {
    "questions": [
      "Question encouraging vocabulary use",
      "Question about personal experience",
      "Question requiring opinion with vocabulary"
    ],
    "instructions": "Discuss these questions. Try to use the new vocabulary."
  },
  "timeMinutes": 12
}

VOCABULARY INTEGRATION RULES:
- Each vocabulary word must appear in the dialogue naturally
- Use vocabulary in warm-up questions and discussion
- Include vocabulary in role-play scenarios
- Reference vocabulary in comprehension questions
- Create natural, not forced usage

PHONETICS EXAMPLES BY LEVEL:

BEGINNER (A1-A2):
- appointment: /əˈpɔɪntmənt/
- comfortable: /ˈkʌmftəbəl/
- temperature: /ˈtempərətʃər/

INTERMEDIATE (B1-B2):
- streamline: /ˈstriːmlaɪn/
- overwhelmed: /ˌoʊvərˈwelmd/
- accommodate: /əˈkɑːmədeɪt/

ADVANCED (C1-C2):
- paradigm shift: /ˈpærədaɪm ʃɪft/
- serendipitous: /ˌserənˈdɪpɪtəs/
- ubiquitous: /juːˈbɪkwɪtəs/
- quintessential: /ˌkwɪntɪˈsenʃəl/
- entrepreneurial: /ˌɑːntrəprəˈnɜːriəl/

OUTPUT FORMAT (JSON):
{
  "title": "${topic.title}",
  "lessonType": "engoo",
  "difficulty": ${student.level === 'beginner' ? '3-4' : student.level === 'intermediate' ? '5-6' : '7-8'},
  "duration": ${duration},
  "objective": "${topic.objective}",
  "skills": ["Speaking", "Listening", "Reading", "Vocabulary"],
  "vocabulary": ${JSON.stringify(topic.vocabulary)},
  "context": "${topic.context}",
  "exercises": [array of exercises following exact format above],
  "homework": "Review vocabulary and practice dialogue with a friend",
  "materials": ["Vocabulary cards", "Audio recording of dialogue"],
  "teachingNotes": "Ensure all vocabulary appears multiple times. Focus on natural pronunciation."
}

FINAL REMINDER: For ${student.level.toUpperCase()} students, vocabulary MUST be challenging and sophisticated. Avoid elementary words. Focus on expressions that extend their current capabilities.

Generate a complete Engoo-style lesson with proper vocabulary integration. Return ONLY the JSON.`;

    try {
      const result = await this.retryWithBackoff(async () => {
        const response = await this.model.generateContent(prompt);
        return await response.response;
      });
      
      const text = result.text();
      
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

  // Generate instant lesson based on user prompt
  async generateInstantLesson(
    student: StudentProfile,
    prompt: string,
    focus: 'speaking' | 'vocabulary' | 'grammar' | 'listening' | 'mixed' = 'mixed',
    duration: 25 | 50 = 50
  ): Promise<GeneratedLesson> {
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
${this.getLevelVocabularyGuide(student.level)}

🚫 CRITICAL VOCABULARY EXCLUSIONS:
${this.getOccupationExclusions(student.occupation || '')}

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
      const result = await this.retryWithBackoff(async () => {
        const response = await this.model.generateContent(instantPrompt);
        return await response.response;
      });
      
      const text = result.text();
      
      // Extract JSON from response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No valid JSON found in AI response');
      }
      
      // Clean the JSON string
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
}

export const geminiService = new GeminiService();