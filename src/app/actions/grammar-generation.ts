'use server'

import { generateWithFailover } from '@/lib/geminiFailover'
import { getStudent } from './students'

/**
 * Grammar Lesson Generation
 * Generates focused grammar lessons using student profile for context
 */

interface GrammarLesson {
  title: string
  grammarTopic: string
  context: string
  explanation: {
    definition: string
    usage: string
    examples: string[]
  }
  exercises: {
    type: 'grammar-focus' | 'sentence-practice' | 'dialogue-practice' | 'fill-blanks' | 'multiple-choice' | 'sentence-building'
    title: string
    content: Record<string, unknown>
  }[]
}

export async function generateGrammarLesson(
  studentId: string,
  topic: string
): Promise<GrammarLesson> {
  try {
    // Fetch student profile
    const studentResponse = await getStudent(studentId)
    if (!studentResponse.success || !studentResponse.data) {
      throw new Error('Student not found')
    }

    const student = studentResponse.data

    const prompt = `Generate a comprehensive grammar lesson for a ${student.level} student learning ${student.targetLanguage}.

STUDENT PROFILE:
- Name: ${student.name}
- Target Language: ${student.targetLanguage}
- Native Language: ${student.nativeLanguage}
- Age Group: ${student.ageGroup}
- Current Level: ${student.level}
- Learning Goals: ${student.endGoals}
- Occupation: ${student.occupation || 'Not specified'}
- Weaknesses: ${student.weaknesses || 'Not specified'}
- Interests: ${student.interests || 'Not specified'}

GRAMMAR TOPIC REQUESTED: ${topic}

REQUIREMENTS:
1. The lesson must be about the grammar topic requested: "${topic}"
2. ALL explanations and examples must be contextualized to the student's profile, interests, and goals
3. If student's occupation/interests are relevant, weave them into examples naturally
4. Use vocabulary and complexity appropriate for ${student.level} level
5. Make examples relatable to the student's daily life and interests when possible
6. Provide practical, real-world usage of the grammar point
7. Include a clear progression from explanation to practice to application
8. Vivid explanation: clear, concise, engaging, with concrete examples. Prefer simple sentences and everyday scenarios. Do not copy external text verbatim.

LEVEL SCALING (tone, detail, counts):
- A1: one-clause, high-frequency words; very short sentences; minimal metalanguage; 2 simple examples per subsection; explanation ~60–100 words.
- A2: simple sentences; limited metalanguage (e.g., "form: subject + verb"); 3–4 everyday examples; explanation ~80–120 words.
- B1: mix simple/compound; highlight basic contrasts (e.g., during vs for vs while); add 1–2 common mistakes; explanation ~120–180 words.
- B2: richer contexts (work/study/news); include contrasts & edge cases; transformation hints; explanation ~180–240 words.
- C1/C2: nuanced usage; register/genre notes; exceptions; 3–5 common mistakes with rationales; explanation ~240–400 words.

MODELED SECTIONS (draw inspiration from: narrative tenses, time connectors, contrast conjunctions, possessives, relative clauses, passive voice, reported speech):
- Definition: one paragraph, level-scaled.
- Usage: bullet-style (each with a short example sentence).
- Examples: 3–5 mini examples personalized.
- Optional: Form, Contrasts, Time/Aspect notes, CommonMistakes (incorrect vs correct + why), MiniChart (pattern & example).

EXERCISE REQUIREMENTS:
1. Grammar Focus Exercise: Structured, vivid explanation.
  - Use keys when relevant and omit if not: explanation(string), form(string), structures(array of patterns), uses(array), contrasts(array), commonMistakes(array of {incorrect, correct, why}), miniChart(array of {label, example}), tips(array), registerNotes(string for C1/C2), examples(array).
  - For B2+: include at least 2 contrasts and 3 commonMistakes; for C1/C2: 3–5 commonMistakes with brief rationales + registerNotes.
2. Sentence Practice Exercise (reading-only):
  - Each item: {sentence, context}.
  - Item counts by level: A1 4–6; A2 6–8; B1 8–10; B2 10–12; C1/C2 12–15.
3. Dialogue Practice Exercise: Natural, short turns; recycle target structure.
  - Turns by level (number of lines): A1/A2 6–8; B1 8–10; B2/C1 10–14.
4. Fill In The Blanks: Vary surface forms; add hints.
  - Items by level: A1 4–6; A2/B1 6–8; B2/C1 8–10.
5. Multiple Choice: 4 options; 1 correct; explanation required.
  - Questions by level: A1 3–4; A2/B1 4–6; B2/C1 6–8.
6. Sentence Building: Mix ordering and transformation.
  - Shapes:
    • Ordering: {instruction, words(array), correct}
    • Transformation: {instruction, from, target}
  - Items by level: A1/A2 2–3; B1 3–4; B2/C1 4–5.

FORMAT YOUR RESPONSE AS VALID JSON ONLY:
{
  "title": "Lesson title about the grammar topic",
  "grammarTopic": "${topic}",
  "context": "Real-world context where this grammar is used",
  "explanation": {
    "definition": "Clear definition of the grammar rule",
    "usage": "When and how to use it in real contexts",
    "examples": [
      "Example sentence 1",
      "Example sentence 2",
      "Example sentence 3"
    ]
  },
  "exercises": [
    {
      "type": "grammar-focus",
      "title": "Understanding the Rule",
      "content": {
        "explanation": "Detailed explanation at ${student.level} level",
        "keyPoints": ["point1", "point2", "point3"],
        "examples": ["example1", "example2"]
      }
    },
    {
      "type": "sentence-practice",
      "title": "Model Sentences",
      "content": {
        "sentences": [
          {"sentence": "sentence 1", "context": "why this example"},
          {"sentence": "sentence 2", "context": "why this example"},
          {"sentence": "sentence 3", "context": "why this example"}
        ]
      }
    },
    {
      "type": "dialogue-practice",
      "title": "Conversation Practice",
      "content": {
        "character1": "Student Name",
        "character2": "Teacher/Friend/Other",
        "context": "Realistic scenario using grammar",
        "dialogue": [
          {"speaker": "character1", "text": "dialogue line"},
          {"speaker": "character2", "text": "dialogue line"}
        ]
      }
    },
    {
      "type": "fill-blanks",
      "title": "Fill in the Blanks",
      "content": {
        "sentences": [
          {"sentence": "sentence with _____ blank", "answer": "correct_word", "hint": "helpful hint"},
          {"sentence": "another sentence with _____ blank", "answer": "correct_word", "hint": "helpful hint"}
        ]
      }
    },
    {
      "type": "multiple-choice",
      "title": "Grammar Check",
      "content": {
        "questions": [
          {
            "question": "Which is correct?",
            "options": ["option1", "option2", "option3", "option4"],
            "correctAnswer": 0,
            "explanation": "why this is correct"
          }
        ]
      }
    },
    {
      "type": "sentence-building",
      "title": "Create Sentences",
      "content": {
        "exercises": [
          {
            "instruction": "Build a sentence using...",
            "words": ["word1", "word2", "word3"],
            "correct": "correct sentence order"
          }
        ]
      }
    }
  ]
}

CRITICAL:
- Return ONLY valid JSON, no markdown or explanations
- All examples must be contextual to the student profile
- Make the grammar practical and applicable to their interests/goals
-- Ensure vocabulary is appropriate for their level
-- All dialogue should feel natural and relatable`;

    const { rawText: text } = await generateWithFailover({
      prompt,
      generationConfig: {
        temperature: 0.1,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 8192,
      }
    })

    // Extract and parse JSON
    const startIdx = text.indexOf('{')
    const lastIdx = text.lastIndexOf('}')

    if (startIdx === -1 || lastIdx === -1 || startIdx >= lastIdx) {
      throw new Error('No valid JSON found in AI response')
    }

    const jsonStr = text.substring(startIdx, lastIdx + 1)

    // Clean JSON
    let cleanedJson = jsonStr
      .replace(/\r\n/g, '\n')
      .replace(/\n/g, ' ')
      .replace(/\t/g, ' ')
      .replace(/  +/g, ' ')
      .replace(/,\s*]/g, ']')
      .replace(/,\s*}/g, '}')

    let parsedResponse: GrammarLesson
    try {
      parsedResponse = JSON.parse(cleanedJson)
    } catch {
      // More aggressive cleanup
      cleanedJson = cleanedJson
        .replace(/[\x00-\x1F\x7F]/g, ' ')
        .replace(/\\+n/g, ' ')
        .replace(/\\+r/g, '')
        .replace(/\\+t/g, ' ')
        .replace(/  +/g, ' ')

      // Fix unescaped quotes
      const parts = cleanedJson.split('"')
      for (let i = 1; i < parts.length; i += 2) {
        parts[i] = parts[i]
          .replace(/\\"/g, '\\"')
          .replace(/(?<!\\)"/g, '\\"')
      }
      cleanedJson = parts.join('"')

      parsedResponse = JSON.parse(cleanedJson)
    }

    return parsedResponse
  } catch (error) {
    console.error('Error generating grammar lesson:', error)
    throw new Error('Failed to generate grammar lesson. Please try again.')
  }
}
