// src/lib/gemini.ts
import { GoogleGenerativeAI } from '@google/generative-ai';
import { A1LessonModule } from './cefr/A1LessonModule';
import { A2LessonModule } from './cefr/A2LessonModule';
import { B1LessonModule } from './cefr/B1LessonModule';
import { B2LessonModule } from './cefr/B2LessonModule';
import { C1LessonModule } from './cefr/C1LessonModule';
import { C2LessonModule } from './cefr/C2LessonModule';

if (!process.env.GOOGLE_API_KEY) {
  throw new Error('GOOGLE_API_KEY is not set');
}

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

import {
  StudentProfile,
  LearningTopic,
  LearningPlan,
  GeneratedLesson
} from '../types/lesson-template';

class GeminiService {
  public model = genAI.getGenerativeModel({ 
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
   * Get occupation-specific advanced vocabulary exclusions
   */
  public getOccupationExclusions(occupation: string): string {
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
   * Retry mechanism for API calls with exponential backoff
   */
  public async retryWithBackoff<T>(
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
  // Issue #37: Build vocabulary context section
  let vocabularyContextSection = '';
  if (topic.shouldReuseVocabularyInDialogue && topic.previousVocabulary && topic.previousVocabulary.length > 0) {
    const prevVocabList = topic.previousVocabulary.map(v => `- "${v.word}": ${v.definition}`).join('\n');
    vocabularyContextSection = `

ISSUE #37 - VOCABULARY CONTINUITY:
The student has just completed: "${topic.previousLessonTitle}"
From that lesson, they learned these vocabulary words:
${prevVocabList}

CRITICAL INSTRUCTION FOR DIALOGUE EXERCISE (Exercise 3):
- In the dialogue exercise ONLY, naturally incorporate 2-3 of these previously learned words
- Do NOT re-teach them or explain them in Exercise 1 (Vocabulary exercise)
- Use them only if contextually appropriate to the current lesson topic
- Example: If previous lesson was "Business Meetings" with "agenda", and this lesson is "Presentations", 
  you could naturally use "agenda" in dialogue like: "How will this fit with the meeting agenda?"
- This reinforces learning through natural context, not explicit re-teaching
- If these words don't fit naturally into the current lesson's dialogue, OMIT them entirely`;
  }

  // Special instructions for under-18 students: Add grammar exercise
  let under18Section = '';
  if (student.ageGroup === 'child' || student.ageGroup === 'teenager') {
    under18Section = `

UNDER-18 STUDENT - GRAMMAR EXERCISE REQUIREMENT:
This is a student under 18 years old. You MUST include Exercise 5 with the "Find the Mistake" grammar exercise.

**Exercise 5: Find the Mistake (MANDATORY FOR UNDER-18)**
This exercise focuses on correcting common grammar errors in sentences DIRECTLY RELATED TO THE LESSON TOPIC: "${topic.title}"

IMPORTANT RULES:
- Create 6-8 sentences ALL ABOUT THE LESSON TOPIC: "${topic.title}"
- Sentences should use the lesson vocabulary: ${topic.vocabulary.join(', ')}
- Errors should focus on verb tenses, verb forms, and subject-verb agreement
- Sentences may contain common errors like:
  * Missing prepositions in phrasal verbs
  * Incorrect verb tenses (e.g., present simple vs present perfect)
  * Wrong verb forms (e.g., base form vs past participle)
  * Subject-verb agreement errors (e.g., singular/plural mismatch)
  * Incorrect auxiliary verbs (e.g., "are" vs "have" with participles)
  * Word order issues
- Do NOT make the same type of error twice - vary the error types
- Include 2-3 sentences that are grammatically correct (to make it more challenging)
- ALL sentences must relate to the lesson context: "${topic.context}"

RESPONSE FORMAT FOR EXERCISE 5:
{
  "type": "grammar",
  "title": "Exercise 5: Find the Mistake",
  "description": "Find and correct the mistake in each sentence. Be careful — not all sentences have a mistake!",
  "instructions": "Find and correct the mistake in each sentence. Remember to check verb tenses, verb forms, and word order.",
  "content": {
    "sentences": [
      {
        "incorrect": "A sentence about ${topic.title} with or without a grammar error",
        "correct": "The same sentence corrected, OR if already correct: 'This is already correct'"
      },
      ... (6-8 total items, ALL using vocabulary from: ${topic.vocabulary.join(', ')})
    ]
  },
  "timeMinutes": 5
}

CRITICAL: This exercise must appear as Exercise 5 in the exercises array. ALL sentences must be thematically related to the lesson topic and use the vocabulary being taught.`;
  }

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
VOCABULARY WORDS: ${topic.vocabulary.join(', ')}${vocabularyContextSection}${under18Section}

LEVEL-APPROPRIATE VOCABULARY REQUIREMENTS:
${this.getLevelVocabularyGuide(student.level)}

CRITICAL SYNONYM RULES FOR ${student.level.toUpperCase()} STUDENTS:
- Synonyms MUST be appropriate for level ${student.level}
- BEGINNER (A1/A2): Synonyms should be equally simple or LEAVE BLANK if no simple synonym exists
- INTERMEDIATE (B1/B2): Synonyms should be intermediate-level
- ADVANCED (C1/C2): Synonyms can be more sophisticated

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
${this.getCEFRModule(student.level).getVocabularyGuide()}

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
  "example": "I have a doctor's appointment at 3 PM.",
  "synonym": "meeting",
  "expressions": []
}

FOR INTERMEDIATE (B1-B2):
{
  "word": "streamline",
  "partOfSpeech": "Verb", 
  "phonetics": "/ˈstriːmlaɪn/",
  "definition": "to make a process more efficient by simplifying it",
  "example": "We need to streamline our approval process to reduce delays.",
  "synonym": "simplify",
  "expressions": ["streamline the process", "streamline operations"]
}

FOR ADVANCED (C1-C2):
{
  "word": "paradigm shift",
  "partOfSpeech": "Noun phrase",
  "phonetics": "/ˈpærədaɪm ʃɪft/",
  "definition": "a fundamental change in approach or underlying assumptions",
  "example": "The company underwent a paradigm shift, moving from traditional sales to digital-first strategies.",
  "synonym": "major change",
  "expressions": ["paradigm shift in", "represent a paradigm shift", "drive a paradigm shift"]
}

VOCABULARY FORMAT:
{
  "type": "vocabulary",
  "title": "Exercise 1: Vocabulary", 
  "description": "Learn and practice new vocabulary",
  "content": {
    "vocabulary": [/* 6-8 level-appropriate vocabulary items WITH synonyms */]
  },
  "timeMinutes": 10
}

SYNONYM RULES (Issue #36):
- Add a "synonym" field to EACH vocabulary item
- Synonym MUST be appropriate for the SAME level as the vocabulary word being taught
- CRITICAL: DO NOT use complex synonyms for basic level students
- ONLY include synonym if it's simpler or equally simple at that level (leave empty string "" if none exists)
- Level-specific rules:
  * A1/A2 (Beginner): Use ONLY very common, everyday words OR LEAVE BLANK
    - "sing" → "" (no simpler word, leave blank)
    - "happy" → "glad" (both simple)
    - "appointment" → "meeting" (both common)
  * B1/B2 (Intermediate): Use intermediate-level synonyms
    - "streamline" → "simplify" (both intermediate)
    - "vocalize" → "sing" (more common synonym)
  * C1/C2 (Advanced): Use advanced synonyms
    - "paradigm shift" → "major change" or "" (depends on context)
    - "ameliorate" → "improve" or "" (improve is simpler, so OK or leave blank)
- Examples of WRONG synonyms:
  * "sing" → "vocalize" (for A1 - vocalize is TOO COMPLEX)
  * "run" → "perambulate" (for A1 - way too complex)

EXPRESSIONS/COLLOCATIONS RULES (Issue #42):
- Add an "expressions" array to EACH vocabulary item (can be empty for A1)
- Expressions provide practical phrase patterns showing how the word is used in context
- Level-specific rules:
  * A1 (Beginner): Leave expressions empty [] - focus on word definitions only
  * A2+ (Elementary and above): Include 2-3 common collocations/phrases using the word
    - Examples for "compliance": ["demonstrate compliance", "ensure compliance", "compliance with"]
    - Examples for "streamline": ["streamline the process", "streamline operations"]
  * B1-C2: Include sophisticated, natural phrase patterns
    - Examples for "paradigm shift": ["paradigm shift in", "represent a paradigm shift", "drive a paradigm shift"]
- Expressions should be natural, commonly-used phrases that learners can memorize and reuse
- Each expression should be 2-4 words (not full sentences)
- Expressions help students understand how professional words are actually used in context

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

⚠️ CRITICAL DIALOGUE RULES - ISSUE #37 & STUDENT PRACTICE:
- The FIRST character in dialogue MUST be the student (${student.name})
- The student MUST speak after EVERY other character speaks
- This ensures the student practices responding to all roles while the teacher reads other parts
- Student dialogue MUST naturally use 2-3 of the new vocabulary words being taught
- Teacher can easily see which lines to read (all non-student characters) and which the student reads
- NEVER have characters introduce themselves unnecessarily (e.g., after being introduced, don't say "I'm James")
- ALWAYS write NATURAL dialogue as people actually speak, not mechanical/stilted
- Characters should build on previous context, not repeat it
- DIALOGUE MUST HAVE A CONCLUSIVE ENDING: The conversation should reach a natural conclusion/resolution:
  * Agreement on a point
  * A decision made
  * A plan established
  * A question answered satisfactorily
  * NEVER end with a hanging question or unfinished thought
- GOOD DIALOGUE PATTERN:
  * Student speaks first (introduces topic or asks question using new vocabulary)
  * Character 2 responds
  * Student responds to Character 2 (uses more new vocabulary)
  * Character 3 responds  
  * Student responds to Character 3 (uses new vocabulary)
  * Final speaker (ideally student) concludes the conversation with resolution
- Each character should speak naturally, using the vocabulary in context, not forcing it
- CRITICAL: Do NOT have non-student characters speak consecutively - student MUST interject after each
- CONTEXT/SETTING: Generate a unique, descriptive context that explains WHO is talking, WHERE they are, and WHAT they're discussing. Example: "Sarah, Mike, and Jessica are having a meeting in their office about streamlining an approval process. This is a professional discussion where they're brainstorming solutions." NOT just "A conversation" or "In an office".

EXAMPLE OF CORRECT DIALOGUE (Student practices with 3 roles + conclusive ending):
{
  "character": "${student.name}",
  "text": "I've been thinking about how to streamline our approval process. What are your thoughts on this approach?"
},
{
  "character": "Manager",
  "text": "That's interesting. Could you elaborate on what you mean by 'streamline'?"
},
{
  "character": "${student.name}",
  "text": "I mean we should identify the bottlenecks and see if we can reduce unnecessary steps. This would help us implement changes faster."
},
{
  "character": "Director",
  "text": "I see your point. How would you approach identifying these bottlenecks?"
},
{
  "character": "${student.name}",
  "text": "We could start by analyzing the current workflow and gathering feedback from the team. The data would show us where delays occur. I think this is a solid plan we should move forward with."
}

{
  "type": "dialogue",
  "title": "Exercise 3: Dialogue",
  "description": "Practice your reading and speaking skills with a real scenario",
  "content": {
    "setting": "Generate a rich, detailed context describing WHO is talking, WHERE, WHEN, and WHAT about. Include character names and the topic being discussed. Example: 'Alex, Jordan, and Casey are discussing a challenging project deadline at their tech startup office on Monday morning.'",
    "characters": [
      {"name": "${student.name}", "role": "Facilitator", "avatar": "You are the student - read your lines aloud"},
      {"name": "Manager", "role": "Manager", "avatar": "professional"},
      {"name": "Director", "role": "Director", "avatar": "senior professional"}
    ],
    "dialogue": [
      {"character": "${student.name}", "text": "Speech that uses vocabulary naturally - student speaks FIRST"},
      {"character": "Manager", "text": "Response"},
      {"character": "${student.name}", "text": "Student responds using new vocabulary"},
      {"character": "Director", "text": "Response"},
      {"character": "${student.name}", "text": "Student responds again using new vocabulary"}
    ],
    "instructions": "Read the dialogue. You are ${student.name}."
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
  "lessonType": "${(student.ageGroup === 'child' || student.ageGroup === 'teenager') ? 'Under-18' : 'interactive'}",
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
      
      const parsedResponse = JSON.parse(cleanedJson);

      // Sanitize and enforce synonym rules based on CEFR level before returning
      try {
        this.enforceSynonymConstraints(parsedResponse, student.level);
      } catch (err) {
        // If sanitization fails, log and continue returning raw parsed response
        console.warn('Failed to sanitize synonyms:', err);
      }

      // Validate and fix dialogue structure (student speaks after every speaker)
      try {
        this.enforceDialogueStructure(parsedResponse, student.name || 'Student');
      } catch (err) {
        // If dialogue validation fails, log and continue
        console.warn('Failed to validate dialogue structure:', err);
      }

      return parsedResponse;
    } catch (error) {
      console.error('Error generating lesson:', error);
      throw new Error('Failed to generate lesson. Please try again.');
    }
  }

  public getLevelVocabularyGuide(level: string): string {
    const levelLower = level.toLowerCase();
    if (levelLower.includes('a1')) {
      return new A1LessonModule().getVocabularyGuide();
    }
    if (levelLower.includes('a2') || levelLower.includes('elementary')) {
      return new A2LessonModule().getVocabularyGuide();
    }
    if (levelLower.includes('b1') || levelLower.includes('intermediate')) {
      return new B1LessonModule().getVocabularyGuide();
    }
    if (levelLower.includes('b2') || levelLower.includes('upper')) {
      return new B2LessonModule().getVocabularyGuide();
    }
    if (levelLower.includes('c1') || levelLower.includes('advanced')) {
      return new C1LessonModule().getVocabularyGuide();
    }
    if (levelLower.includes('c2') || levelLower.includes('proficiency')) {
      return new C2LessonModule().getVocabularyGuide();
    }
    // Default to intermediate if level unclear
    return new B1LessonModule().getVocabularyGuide();
  }

  /**
   * Get the appropriate CEFR module instance for the given level
   */
  private getCEFRModule(level: string) {
    const levelLower = level.toLowerCase();
    if (levelLower.includes('a1')) return new A1LessonModule();
    if (levelLower.includes('a2') || levelLower.includes('elementary')) return new A2LessonModule();
    if (levelLower.includes('b1') || levelLower.includes('intermediate')) return new B1LessonModule();
    if (levelLower.includes('b2') || levelLower.includes('upper')) return new B2LessonModule();
    if (levelLower.includes('c1') || levelLower.includes('advanced')) return new C1LessonModule();
    if (levelLower.includes('c2') || levelLower.includes('proficiency')) return new C2LessonModule();
    return new B1LessonModule(); // Default
  }

  /**
   * Generate vocabulary items using the appropriate CEFR module
   * This replaces the AI-generated vocabulary with level-specific curated vocabulary
   */
  public async generateVocabularyForLevel(level: string): Promise<import('../types/lesson-template').VocabularyItem[]> {
    const cefrModule = this.getCEFRModule(level);
    return cefrModule.generateVocabularyItems();
  }



  /**
   * Enforce synonym constraints on the parsed AI response. This mutates parsedResponse in-place.
   * For beginner levels (A1/A2) we aggressively filter out synonyms that look complex (multi-word,
   * many syllables, or containing advanced suffixes like -ize, -tion).
   */
  private enforceSynonymConstraints(parsedResponse: unknown, level: string) {
    if (typeof parsedResponse !== 'object' || parsedResponse === null) return;
    const resp = parsedResponse as { exercises?: unknown[] };
    if (!resp.exercises || !Array.isArray(resp.exercises)) return;
    const lvl = level.toLowerCase();

    type Exercise = { type?: string; content?: { vocabulary?: unknown[] } };
    for (const ex of resp.exercises as Exercise[]) {
      if (!ex || ex.type !== 'vocabulary' || !ex.content || !Array.isArray(ex.content.vocabulary)) continue;

      for (const item of ex.content.vocabulary as unknown[]) {
        if (!item || typeof item !== 'object' || item === null) continue;
        const obj = item as { synonym?: unknown; [k: string]: unknown };
        const syn = (obj.synonym ?? '')?.toString().trim();

        if (!syn) continue; // empty string is allowed

        if (!this.isSynonymAcceptableForLevel(syn, lvl)) {
          // Replace with empty string to force blank synonym when not appropriate
          obj.synonym = '';
        }
      }
    }
  }

  private isSynonymAcceptableForLevel(synonym: string, levelLower: string): boolean {
    const s = synonym.toLowerCase().trim();
    // Allow empty
    if (!s) return true;
    // Basic checks: single word for lower levels
    const isMultiWord = s.split(/\s+/).length > 1;

    // crude syllable estimate: count vowel groups
    const syllables = this.estimateSyllables(s);
    const len = s.length;

    // Reject obvious advanced morphological forms for low levels
    const advancedMarkers = ['ize', 'ise', 'tion', 'ify', 'ate', 'perambulate', 'vocalize'];
    const containsAdvancedMarker = advancedMarkers.some(m => s.includes(m));

    // Level-specific heuristics
    if (levelLower.includes('a1') || levelLower.includes('beginner')) {
      // A1: single-word, very short, <=2 syllables, length <= 8, no advanced markers
      if (isMultiWord) return false;
      if (syllables > 2) return false;
      if (len > 8) return false;
      if (containsAdvancedMarker) return false;
      return true;
    }
    if (levelLower.includes('a2') || levelLower.includes('elementary')) {
      // A2: single-word preferred, <=3 syllables, len <= 10
      if (isMultiWord) return false;
      if (syllables > 3) return false;
      if (len > 10) return false;
      if (containsAdvancedMarker) return false;
      return true;
    }
    if (levelLower.includes('b1') || levelLower.includes('intermediate')) {
      // B1: multi-word allowed, <=4 syllables
      if (syllables > 4) return false;
      return true;
    }
    if (levelLower.includes('b2') || levelLower.includes('upper')) {
      // B2: allow more complex synonyms
      if (syllables > 6) return false;
      return true;
    }
    // C1/C2: accept most synonyms
    return true;
  }

  private estimateSyllables(word: string): number {
    if (!word) return 0;
    const w = word.toLowerCase().replace(/[^a-z]/g, '');
    if (!w) return 0;
    // Count vowel groups as a heuristic
    const matches = w.match(/[aeiouy]{1,2}/g);
    const count = matches ? matches.length : 0;
    // adjust common silent e
    if (w.endsWith('e')) return Math.max(1, count - 1);
    return Math.max(1, count);
  }

  /**
   * Validates dialogue structure to ensure student speaks after every non-student speaker.
   * Issue #37 & Student Practice: Student must speak after each other character for practice opportunity.
   * This validation runs silently on the parsed response (no error thrown to user).
   */
  private enforceDialogueStructure(parsedResponse: unknown, studentName: string): void {
    if (typeof parsedResponse !== 'object' || parsedResponse === null) return;
    const resp = parsedResponse as { exercises?: unknown[] };
    if (!resp.exercises || !Array.isArray(resp.exercises)) return;

    for (const ex of resp.exercises as unknown[]) {
      if (!ex || typeof ex !== 'object') continue;
      const exercise = ex as { type?: string; content?: { dialogue?: unknown[] } };
      
      if (exercise.type !== 'dialogue' || !exercise.content || !Array.isArray(exercise.content.dialogue)) {
        continue;
      }

      const dialogue = exercise.content.dialogue as Array<{ character?: string; text?: string }>;
      if (dialogue.length < 2) continue; // Skip if not enough lines

      // Validate dialogue structure per Issue #37 requirements:
      // 1. Student should speak FIRST (facilitate the conversation)
      // 2. Student should speak AFTER each non-student character (practice all roles)
      // 3. No two non-student characters should speak consecutively
      
      let consecutiveNonStudentCount = 0;
      let lastWasStudent = true; // Expect student to speak first
      
      for (let i = 0; i < dialogue.length; i++) {
        const isStudent = dialogue[i].character === studentName;
        
        // Track non-student consecutive speakers
        if (!isStudent) {
          if (!lastWasStudent) {
            consecutiveNonStudentCount++;
          } else {
            consecutiveNonStudentCount = 0;
          }
        }
        
        // Log issues for debugging
        if (!isStudent && !lastWasStudent && i > 0) {
          console.warn(
            `⚠️ Dialogue Issue: Non-student speakers '${dialogue[i - 1].character}' and '${dialogue[i].character}' speak consecutively. Student should interject after each character.`
          );
        }
        
        if (i === 0 && !isStudent) {
          console.warn(
            `⚠️ Dialogue Issue: Dialogue should start with ${studentName} (the student). Currently starts with '${dialogue[i].character}'.`
          );
        }
        
        lastWasStudent = isStudent;
      }
      
      if (consecutiveNonStudentCount > 0) {
        console.warn(
          `⚠️ Dialogue Issue: Student does not speak after every character. This reduces practice opportunities. Pattern should be: Student → Others → Student → Others → etc.`
        );
      }
    }
  }
}

const geminiService = new GeminiService();
export default geminiService;
