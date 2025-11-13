// src/lib/gemini.ts
import { GoogleGenerativeAI } from '@google/generative-ai';
import { generateWithFailover } from './geminiFailover';
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
// NEVER EDIT THIS MODEL WITHOUT APPROVAL FROM THE OWNER
class GeminiService {
  public model = genAI.getGenerativeModel({ 
    model: 'gemini-2.5-pro',
    generationConfig: {
      temperature: 0.1, // Lower temperature for consistent JSON output
      topK: 40,
      topP: 0.95,
      maxOutputTokens: 8192, // Increased for comprehensive lessons
    },
  });

  /**
   * Suggest realistic workplace roles and scenario examples based on occupation.
   * Used to steer dialogue/role-play toward actual conversations aligned with student goals.
   */
  private getSuggestedRolesAndScenarios(occupationRaw: string | undefined): { roles: string[]; examples: string[] } {
    const occupation = (occupationRaw || '').toLowerCase();
    // Software/Engineering
    if (/(software|developer|engineer|engineering|programmer)/.test(occupation)) {
      return {
        roles: ['Tech Lead', 'Product Manager', 'QA Engineer', 'Colleague'],
        examples: ['Daily standup', 'Code review feedback session', 'Sprint planning', 'Incident postmortem']
      };
    }
    // Customer Success / Account Management
    if (/(customer success|cs|account manager|customer support|success manager)/.test(occupation)) {
      return {
        roles: ['Client (Director level)', 'Account Manager', 'Project Manager'],
        examples: ['Client kickoff call', 'QBR alignment', 'Renewal negotiation']
      };
    }
    // Sales / Business Development
    if (/(sales|account executive|business development|bd)/.test(occupation)) {
      return {
        roles: ['Prospect', 'Sales Manager', 'Account Executive'],
        examples: ['Discovery call', 'Objection handling', 'Pricing discussion']
      };
    }
    // Healthcare
    if (/(doctor|physician|nurse|medical|healthcare)/.test(occupation)) {
      return {
        roles: ['Patient', 'Nurse', 'Consultant Physician'],
        examples: ['Patient intake', 'Follow-up consultation', 'Care plan briefing']
      };
    }
    // Legal
    if (/(lawyer|attorney|legal)/.test(occupation)) {
      return {
        roles: ['Client', 'Senior Partner', 'Associate'],
        examples: ['Client consultation', 'Contract review', 'Case strategy meeting']
      };
    }
    // Education
    if (/(teacher|professor|education|lecturer)/.test(occupation)) {
      return {
        roles: ['Student', 'Colleague', 'Department Chair'],
        examples: ['Parent-teacher conference', 'Curriculum planning', 'Department meeting']
      };
    }
    // Finance / Operations / General Business
    if (/(finance|analyst|operations|manager|executive|business)/.test(occupation)) {
      return {
        roles: ['Manager', 'Director', 'Colleague'],
        examples: ['Quarterly results briefing', 'Project update', 'Stakeholder check-in']
      };
    }
    // Default generic
    return {
      roles: ['Manager', 'Colleague', 'Client'],
      examples: ['Team sync', 'Project update', 'Stakeholder check-in']
    };
  }

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
    const { roles, examples } = this.getSuggestedRolesAndScenarios(student.occupation);
    const rolesList = roles.join(', ');
    const exampleList = examples.join('; ');
    
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
2. Each topic should be relevant to the student's goals and context and MUST be a concrete, real interaction (meeting/call/review/briefing) aligned with the student's occupation and goals — NOT abstract skills
  - Roles should reflect the student's world. Suggested roles: ${rolesList}
  - Scenario examples (adapt as appropriate): ${exampleList}
3. Do NOT create topics about "speaking skills" or "confidence" or "presentation delivery" as abstract abilities. If the student's goal hints at delivery/confidence, convert it into a real event (e.g., QBR with client director, design review, code review, stakeholder update) and focus on the content of that interaction.
4. Focus on speaking-based materials as most students prefer this
5. Use ${methodology} methodology principles:
   ${methodology === 'CLT' ? '- Emphasize real-life communication, dialogues, role-plays, discussions' : ''}
   ${methodology === 'TBLT' ? '- Focus on meaningful tasks and practical applications' : ''}
   ${methodology === 'PPP' ? '- Structure with clear presentation, controlled practice, then production' : ''}
   ${methodology === 'TTT' ? '- Balance teacher input with guided student discovery' : ''}
6. Make content domain-specific to their occupation/interests when relevant
7. Progress logically from simpler to more complex topics
8. VOCABULARY inside each topic MUST be scenario-based and domain-relevant for the student's occupation. STRICTLY FORBIDDEN vocabulary/themes: "exude confidence", "convey gravitas", "articulate clearly", "come across as", "hold one's own", "without reservation", "speak volumes", "project gravitas", "assertively", or any meta-communication coaching terms.
${this.getLevelVocabularyGuide(student.level)}

🚫 CRITICAL VOCABULARY EXCLUSIONS:
${this.getOccupationExclusions(student.occupation || '')}

🎯 FOCUS ON: Natural workplace language, domain-relevant phrases, and nuanced communication that challenges language skills (not lecturing professional knowledge). Avoid meta-teaching/coaching in dialogues and topics; make it a real conversation.

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
      const { rawText: text } = await generateWithFailover({
        prompt,
        generationConfig: {
          temperature: 0.1,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 8192,
        },
      });
      
      // Extract JSON - more robust parsing for gemini-2.5-flash
      const startIdx = text.indexOf('{');
      const lastIdx = text.lastIndexOf('}');
      
      if (startIdx === -1 || lastIdx === -1 || startIdx >= lastIdx) {
        console.error('No JSON found in response:', text.substring(0, 200));
        throw new Error('No valid JSON found in AI response');
      }
      
      const jsonStr = text.substring(startIdx, lastIdx + 1);
      
      // Carefully clean the JSON
      let cleanedJson = jsonStr
        .replace(/\r\n/g, '\n') // Normalize line endings
        .replace(/\n/g, ' ') // Replace newlines with space
        .replace(/\t/g, ' ') // Replace tabs with space
        .replace(/  +/g, ' ') // Collapse multiple spaces
        .replace(/,\s*]/g, ']') // Remove trailing commas in arrays
        .replace(/,\s*}/g, '}'); // Remove trailing commas in objects
      
      // Try parsing
      let parsedResponse;
      try {
        parsedResponse = JSON.parse(cleanedJson);
      } catch (firstError) {
        // Log the problematic JSON segment around error position
        const syntaxError = firstError as SyntaxError;
        const positionMatch = syntaxError.message.match(/position (\d+)/);
        const errorPos = positionMatch ? parseInt(positionMatch[1]) : -1;
        
        if (errorPos > 0) {
          const start = Math.max(0, errorPos - 100);
          const end = Math.min(cleanedJson.length, errorPos + 100);
          console.error(
            `JSON syntax error at position ${errorPos}:`,
            cleanedJson.substring(start, end)
          );
        }

        // Try more aggressive cleanup
        cleanedJson = cleanedJson
          .replace(/[\x00-\x1F\x7F]/g, ' ') // Replace control chars with spaces
          .replace(/\\+n/g, ' ') // Fix double-escaped newlines
          .replace(/\\+r/g, '') // Remove escaped carriage returns
          .replace(/\\+t/g, ' ') // Fix escaped tabs
          .replace(/  +/g, ' '); // Collapse multiple spaces again

        // Fix unescaped quotes within string values
        const parts = cleanedJson.split('"');
        for (let i = 1; i < parts.length; i += 2) {
          // Odd indices are content within quotes - escape any unescaped quotes
          parts[i] = parts[i].replace(/\\"/g, '\\"').replace(/"/g, '\\"');
        }
        cleanedJson = parts.join('"');

        // Fix common JSON structural issues
        cleanedJson = cleanedJson
          .replace(/}\s+{/g, '},{') // Fix missing commas between objects
          .replace(/]\s+{/g, '],[') // Fix missing commas between array and object
          .replace(/}\s+\[/g, '},[') // Fix missing commas between object and array
          .replace(/]\s+[{[\d"]/g, (match) => '],' + match.slice(1)) // Fix missing commas after arrays
          .replace(/}\s+[{[\d"]/g, (match) => '},' + match.slice(1)); // Fix missing commas after objects
        
        console.error('JSON parse error:', syntaxError.message);
        parsedResponse = JSON.parse(cleanedJson);
      }
      
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

  const { roles, examples } = this.getSuggestedRolesAndScenarios(student.occupation);
  const primaryRoleA = roles[0] || 'Manager';
  const scenarioHints = examples.join('; ');

  const prompt = `You are an expert language instructor crafting Engoo-format lessons focused on authentic, role-based workplace interactions. Generate a comprehensive lesson following the EXACT Engoo structure.

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

🎯 CRITICAL ENGOO-STYLE REQUIREMENT:
The lesson topic "${topic.title}" must be ENACTED in the dialogue, NOT discussed as an abstract skill.

EXAMPLES OF CORRECT INTERPRETATION:
- "Delivering a Presentation" → Dialogue is ${student.name} ACTUALLY delivering a presentation to stakeholders/investors
- "Client QBR Review" → Dialogue is ${student.name} ACTUALLY conducting the QBR with the client
- "Processing an Order" → Dialogue is ${student.name} ACTUALLY processing a customer order
- "Code Review Session" → Dialogue is ${student.name} ACTUALLY reviewing code with teammates
- "Negotiating Contract Terms" → Dialogue is ${student.name} ACTUALLY negotiating terms with counterparty
- "Triaging Production Incident" → Dialogue is ${student.name} ACTUALLY triaging the incident with team

❌ STRICTLY FORBIDDEN:
- Meta-discussions where colleagues coach ${student.name} on "how to present" or "how to articulate"
- Pre-meeting prep conversations about delivery techniques
- Post-meeting debriefs analyzing communication style
- Any vocabulary about presentation skills, confidence, gravitas, articulation, etc.

✅ VOCABULARY MUST BE:
- Domain-specific and naturally occurring in the ACTUAL scenario
- Used functionally within the event itself (presentation terms in a presentation, negotiation terms in a negotiation, technical terms in a code review)
- Level-appropriate for ${student.level}
- Composed per VOCABULARY COMPOSITION RULES below (max 3 noun phrases, include verbs/idioms/collocations)

LEVEL-APPROPRIATE VOCABULARY REQUIREMENTS:
${this.getLevelVocabularyGuide(student.level)}

CRITICAL SYNONYM RULES FOR ${student.level.toUpperCase()} STUDENTS:
- Synonyms MUST be appropriate for level ${student.level}
- BEGINNER (A1/A2): Synonyms should be equally simple or LEAVE BLANK if no simple synonym exists
- INTERMEDIATE (B1/B2): Synonyms should be intermediate-level
- ADVANCED (C1/C2): Synonyms can be more sophisticated

VOCABULARY COMPOSITION RULES (CRITICAL):
- Total vocabulary items: 6-8
- **PRIMARILY SINGLE-WORD VOCABULARY** (4-8 items): verbs, adjectives, nouns, adverbs appropriate for ${student.level}
  * Examples of structure (NOT words to copy): single words like "fatigue", "tolerance", "adverse", "iteration", "asymmetrical", "proprietary"
  * Choose words CONTEXTUALLY RELEVANT to this specific lesson topic: "${topic.title}"
  * DO NOT use these example words unless they genuinely fit the lesson context
- **Maximum 0-2 multi-word phrases** (prefer 0-1):
  * ONLY idioms or phrasal verbs (e.g., structure like "food for thought", "get bogged down", "allay concerns")
  * Choose phrases CONTEXTUALLY RELEVANT to this lesson topic
  * DO NOT use these example phrases unless they genuinely fit the lesson context
- **STRICTLY AVOID COMPOUND NOUN PHRASES**:
  * ❌ WRONG: "stress concentration", "fatigue life", "material compatibility", "design iteration", "manufacturing tolerances", "cost-effectiveness"
  * ✅ CORRECT: Use the core single word instead: "fatigue" (not "fatigue life"), "tolerance" (not "manufacturing tolerances"), "iteration" (not "design iteration"), "concentration" (not "stress concentration")
- **UNIQUENESS RULE**: Do NOT repeat vocabulary from previous lessons. Each lesson should have contextually specific, unique vocabulary.
- **EXCEPTION**: If the lesson specifically focuses on teaching idioms or phrasal verbs as its main objective, you may use more multi-word items (but they must be idioms/phrasal verbs, NOT noun phrases)
- Level adaptation:
  * A1-A2: Simple single-word verbs, nouns, adjectives (e.g., "happy", "run", "big"), 0-1 basic phrasal verb (e.g., "pick up", "look for")
  * B1-B2: Intermediate single words (e.g., "analyze", "efficient", "comprehensive"), 0-1 common idiom/phrasal verb
  * C1-C2: Advanced single words (e.g., "mitigate", "leverage", "nuanced"), 0-2 sophisticated idioms/collocations

CRITICAL REQUIREMENTS:
1. EVERY vocabulary item MUST appear naturally in the Exercise 3 dialogue. ALL vocabulary words MUST be used 2-3 times throughout the lesson.
2. Follow EXACT Engoo format with proper vocabulary structure
3. The dialogue MUST BE the actual event described in the lesson title. Examples:
   - "Delivering Quarterly Results" → ${student.name} delivers actual presentation with Q&A, NOT colleagues coaching ${student.name} on how to present
   - "Negotiating Contract Terms" → ${student.name} negotiates with client, NOT team discussing negotiation strategy
   - "Code Review Meeting" → ${student.name} reviews actual code with team, NOT discussing how to give feedback
   - "Processing Customer Order" → ${student.name} processes actual order with customer, NOT training scenario
   The dialogue participants are colleagues/clients/managers engaging with ${student.name} about the work content itself.
4. All exercises must connect thematically to the ACTUAL event
5. VOCABULARY MUST BE LEVEL-APPROPRIATE - avoid basic words for advanced students
6. SELECT VOCABULARY BASED ON:
   - What would naturally be said DURING this specific event (presentation, meeting, call, review, negotiation, etc.)
   - Student's level (use guidelines above)
   - Student's occupation (${student.occupation || 'general'})
   - The functional language needed to execute this task
7. DOMAIN TERMS: Naturally include 2-4 domain-specific terms that would be used in this actual scenario

🎯 FOR ${student.level.toUpperCase()} STUDENTS SPECIFICALLY:
${this.getCEFRModule(student.level).getVocabularyGuide()}

🎯 VOCABULARY PRIORITY FOR ${student.level.toUpperCase()} ${student.occupation || 'PROFESSIONALS'}:
- Prioritize natural workplace phrases,idioms, collocations, and domain-relevant terminology used in context
- Challenge English proficiency while keeping domain terms realistic for the role; do not define domain terms
- Include advanced idioms and phrasal verbs where natural

ENGOO LESSON STRUCTURE:

**Exercise 1: Vocabulary**
Create 6-8 vocabulary items with this EXACT format (examples for different levels):

FOR BEGINNER/ELEMENTARY (A1-A2):
{
  "word": "comfortable",
  "partOfSpeech": "Adjective",
  "phonetics": "/ˈkʌmftəbəl/",
  "definition": "feeling physically relaxed and free from pain or constraint",
  "example": "This chair is very comfortable.",
  "synonym": "cozy",
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
  "word": "asymmetrical",
  "partOfSpeech": "Adjective",
  "phonetics": "/ˌeɪsɪˈmetrɪkəl/",
  "definition": "having parts that fail to correspond to one another in shape, size, or arrangement; lacking symmetry",
  "example": "The building features an asymmetrical design that challenges conventional architecture.",
  "synonym": "uneven",
  "expressions": ["asymmetrical design", "asymmetrical distribution", "asymmetrical approach"]
}

IDIOM/PHRASAL VERB EXAMPLE (any level):
{
  "word": "get bogged down",
  "partOfSpeech": "Phrasal verb",
  "phonetics": "/ɡet bɒɡd daʊn/",
  "definition": "to become so involved in details or difficulties that you cannot make progress",
  "example": "Let's not get bogged down in minor details; we need to focus on the big picture.",
  "synonym": "get stuck",
  "expressions": ["get bogged down in details", "get bogged down by bureaucracy"]
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
  2-3 discussion prompts that prepare for the ACTUAL scenario:
{
  "type": "warmup",
  "title": "Exercise 2: Warm-up",
  "description": "Discussion questions to introduce the topic",
  "content": {
    "questions": ["Question about prior experience with this type of scenario", "Question about challenges in this context", "Question about best practices in this situation"],
    "instructions": "Try responding as naturally as possible, using any vocabulary you know related to the topic."
  },
  "timeMinutes": 8
}**Exercise 3: Dialogue**
${student.name} performs the ACTUAL task/event described in the lesson title:

  ⚠️ CRITICAL DIALOGUE RULES - THE DIALOGUE MUST BE THE ACTUAL EVENT:
  - ${student.name} is PERFORMING the task in the title (presenting, negotiating, processing order, reviewing code, conducting QBR, etc.)
  - Other characters are the AUDIENCE/PARTICIPANTS in this event (investors, clients, customers, teammates, manager, etc.)
  - The FIRST character speaking MUST be ${student.name}
  - ${student.name} MUST speak after EVERY other character speaks
  - ABSOLUTELY NO consecutive speeches by non-student characters (e.g., Character A then Character B without student between them)
  - This is a 1-on-1 lesson format: the teacher reads one role, the student reads ${student.name}'s role, and they alternate strictly
  - If multiple participants are present in the scenario, they should speak one at a time with ${student.name} responding to each in turn
  - The conversation is about the ACTUAL CONTENT of the event (project details, product specs, code logic, contract terms, etc.) - NOT about how to communicate
  - Vocabulary words are used FUNCTIONALLY within the event (e.g., "projected sales" used when presenting sales data, "expedited shipping" used when processing an order, "merge conflict" used during code review)
  - NEVER have characters introduce themselves unnecessarily
  - ALWAYS write NATURAL dialogue as people actually speak
  - DIALOGUE MUST HAVE A CONCLUSIVE ENDING with a decision/agreement/resolution
  
EXAMPLE PATTERNS:
  * "Delivering Presentation" → ${student.name} presents to stakeholders, they ask questions about content
  * "Client QBR" → ${student.name} reviews quarterly metrics with client, discusses next steps
  * "Processing Order" → ${student.name} takes customer order, confirms details, arranges shipping
  * "Code Review" → ${student.name} walks through code changes, teammates ask technical questions
  * "Contract Negotiation" → ${student.name} proposes terms, counterparty responds, they negotiate

- CONTEXT/SETTING: Generate a descriptive context explaining WHO is participating, WHERE, and WHAT the event is about. Choose roles aligned with the student's occupation. Suggested roles include: ${roles.join(', ')}. Scenario hints: ${scenarioHints}. The setting describes the ACTUAL event being performed.

EXAMPLE OF CORRECT DIALOGUE (${student.name} ACTUALLY performing the task):
If lesson is "Delivering a Presentation":
{
  "character": "${student.name}",
  "text": "Good afternoon everyone. Today I'm here to present our Q3 results and projections for Q4. Let me start with our revenue figures..."
},
{
  "character": "Investor",
  "text": "Before you continue, could you clarify what factors contributed to the 15% increase?"
},
{
  "character": "${student.name}",
  "text": "Absolutely. The increase was primarily driven by our expansion into the Asian market and improved customer retention rates..."
}

If lesson is "Processing an Order":
{
  "character": "${student.name}",
  "text": "Thank you for calling. How may I help you today?"
},
{
  "character": "Customer",
  "text": "Hi, I'd like to place an order for the Model X laptop."
},
{
  "character": "${student.name}",
  "text": "Excellent choice. Let me check our inventory... Yes, we have that in stock. Would you prefer standard or expedited shipping?"
}

{
  "type": "dialogue",
  "title": "Exercise 3: Dialogue",
  "description": "Practice your reading and speaking skills with a real scenario",
  "content": {
    "setting": "Detailed description of the ACTUAL event: ${student.name} is [performing the task from lesson title]. WHO is the audience/participants, WHERE is this happening, WHAT is the specific situation. Example: '${student.name} is delivering a quarterly presentation to the board of directors in the main conference room, presenting Q3 sales results and Q4 projections.'",
    "characters": [
      {"name": "${student.name}", "role": "${student.occupation || 'Professional'} performing the task", "avatar": "You are ${student.name}"},
      {"name": "${primaryRoleA}", "role": "${primaryRoleA}", "avatar": "participant"}
    ],
    "dialogue": [
      {"character": "${student.name}", "text": "${student.name} PERFORMS the task - opens the presentation/takes the order/begins the review/etc."},
      {"character": "Participant", "text": "Response/question about the CONTENT"},
      {"character": "${student.name}", "text": "${student.name} responds about the CONTENT using vocabulary"},
      {"character": "Participant", "text": "Follow-up about CONTENT"},
      {"character": "${student.name}", "text": "${student.name} addresses it, concludes"}
    ],
    "instructions": "Read the dialogue. You are ${student.name}."
  },
  "timeMinutes": 12
}

**Exercise 4: Dialogue Comprehension**
Create 4-5 questions testing dialogue understanding. Use ONLY these two question types:
- 2-3 multiple-choice questions (MCQ)
- 1-2 open-ended questions requiring full sentence answers (e.g., "What was the main concern raised?", "Why did [character] suggest...?")

CRITICAL MCQ RULES:
- Randomize which option (A/B/C/D) contains the correct answer
- DO NOT consistently place correct answers in position B
- Distribute correct answers across all positions naturally

{
  "type": "comprehension",
  "title": "Exercise 4: Dialogue Comprehension",
  "description": "Answer questions about the dialogue",
  "content": {
    "questions": [
      {
        "question": "What did James suggest?",
        "type": "multiple-choice",
        "options": ["A) Option 1", "B) Option 2", "C) Option 3", "D) Option 4"],
        "answer": "C"
      },
      {
        "question": "Why did Sarah recommend the new approach?",
        "type": "open-ended",
        "answer": "Sarah recommended it because it would reduce costs and improve efficiency."
      }
    ]
  },
  "timeMinutes": 8
}

**Exercise 5: Role Play (if appropriate)**
Create a 2-PERSON role-play scenario where the student PERFORMS the same task as in the dialogue.
CRITICAL: The roleplay is strictly between TWO people:
1. ${student.name} (the student)
2. ONE counterpart role (assumed by the teacher)

DO NOT create scenarios with 3 or more participants. The teacher will read the counterpart's lines, and the student reads their own lines in alternating fashion.

{
  "type": "roleplay",
  "title": "Exercise 5: Role Play",
  "description": "Perform the task in a new situation",
  "content": {
    "scenario": "The ACTUAL event happening: ${student.name} is [doing the task from lesson title]. WHO is the ONE other person they're with, WHERE is it, WHAT specifically is happening. Example: '${student.name} is delivering a product demo to a potential client in the sales conference room.'",
    "roles": [
      {"name": "${student.name}", "description": "${student.occupation || 'professional'} performing [the task from lesson title]", "keyPoints": ["PERFORM the task completely", "Use vocabulary naturally within the content", "Act as the actual performer/deliverer/executor"]},
      {"name": "${primaryRoleA}", "description": "The ONE counterpart: the audience member/participant/recipient of the task. Example: 'A potential client asking questions during the demo' or 'A customer placing an order'", "keyPoints": ["Respond naturally as the participant", "Ask content-related questions", "React to what ${student.name} is doing"]}
    ],
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
- comfortable: /ˈkʌmftəbəl/
- happy: /ˈhæpi/
- temperature: /ˈtempərətʃər/

INTERMEDIATE (B1-B2):
- streamline: /ˈstriːmlaɪn/
- overwhelmed: /ˌoʊvərˈwelmd/
- accommodate: /əˈkɑːmədeɪt/

ADVANCED (C1-C2):
- asymmetrical: /ˌeɪsɪˈmetrɪkəl/
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
      const { rawText: text } = await generateWithFailover({
        prompt,
        generationConfig: {
          temperature: 0.1,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 8192,
        },
      });

      console.log('Lesson generation response (first 200 chars):', text.substring(0, 200));

      // Extract JSON using index-based approach (more reliable than regex)
      const startIdx = text.indexOf('{');
      const lastIdx = text.lastIndexOf('}');

      if (startIdx === -1 || lastIdx === -1 || startIdx >= lastIdx) {
        throw new Error('No valid JSON found in AI response');
      }

      const jsonStr = text.substring(startIdx, lastIdx + 1);

      // Clean the JSON string intelligently
      let cleanedJson = jsonStr
        .replace(/\r\n/g, '\n') // Normalize line endings
        .replace(/[\r\t]/g, ' ') // Replace tabs and remaining carriage returns with spaces
        .replace(/,(\s*[}\]])/g, '$1') // Remove trailing commas
        .replace(/  +/g, ' '); // Collapse multiple spaces to one

      let parsedResponse: GeneratedLesson;
      try {
        parsedResponse = JSON.parse(cleanedJson) as GeneratedLesson;
      } catch (firstError) {
        // Log the problematic JSON segment around error position
        const syntaxError = firstError as SyntaxError;
        const positionMatch = syntaxError.message.match(/position (\d+)/);
        const errorPos = positionMatch ? parseInt(positionMatch[1]) : -1;
        
        if (errorPos > 0) {
          const start = Math.max(0, errorPos - 100);
          const end = Math.min(cleanedJson.length, errorPos + 100);
          console.error(
            `JSON syntax error at position ${errorPos}:`,
            cleanedJson.substring(start, end)
          );
        }

        // Second attempt with more aggressive cleanup
        cleanedJson = cleanedJson
          .replace(/[\x00-\x1F\x7F]/g, ' ') // Replace control characters with spaces
          .replace(/\\\\n/g, ' ') // Fix double-escaped newlines
          .replace(/\\\\t/g, ' ') // Fix double-escaped tabs
          .replace(/  +/g, ' ') // Collapse spaces again
          .replace(/,\s*]/g, ']') // Remove trailing commas in arrays
          .replace(/,\s*}/g, '}'); // Remove trailing commas in objects

        // Fix unescaped quotes within string values by properly escaping them
        // Split by quote boundaries and fix quotes only within string values
        const parts = cleanedJson.split('"');
        for (let i = 1; i < parts.length; i += 2) {
          // Odd indices are content within quotes - escape any unescaped quotes
          parts[i] = parts[i].replace(/\\"/g, '\\"').replace(/"/g, '\\"');
        }
        cleanedJson = parts.join('"');

        // Third pass: fix common JSON structural issues
        cleanedJson = cleanedJson
          .replace(/}\s+{/g, '},{') // Fix missing commas between objects
          .replace(/]\s+{/g, '],[') // Fix missing commas between array and object
          .replace(/}\s+\[/g, '},[') // Fix missing commas between object and array
          .replace(/]\s+[{[\d"]/g, (match) => '],' + match.slice(1)) // Fix missing commas after arrays
          .replace(/}\s+[{[\d"]/g, (match) => '},' + match.slice(1)); // Fix missing commas after objects

        console.error(
          'JSON parse failed on first attempt. Error:',
          syntaxError.message
        );

        parsedResponse = JSON.parse(cleanedJson) as GeneratedLesson;
      }

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
