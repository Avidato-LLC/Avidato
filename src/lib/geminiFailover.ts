// src/lib/geminiFailover.ts
// Lightweight model failover helper for generative calls.
// Tries models in order until one succeeds. If all fail, throws aggregated error info.
// This keeps it isolated from the heavier geminiService logic.

import { GoogleGenerativeAI, type GenerationConfig } from '@google/generative-ai'

if (!process.env.GOOGLE_API_KEY) {
  throw new Error('GOOGLE_API_KEY is not set')
}

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY)

// Ordered by preference / capability (adjust as needed)
// Provided by user: want to switch to "any other" on error.
// We'll attempt higher capability / freshness first, then lighter / experimental.
export const MODEL_FALLBACK_CHAIN: string[] = [
  'gemini-2.5-flash',
  'gemini-2.5-pro',
  'gemini-2.0-flash',
  'gemini-2.0-flash-lite',
  'gemini-2.5-flash-lite',
  'earnlm-2.0-flash-experimental'
]

export interface FailoverResult {
  modelUsed: string
  rawText: string
}

interface GenerateOptions {
  prompt: string
  generationConfig?: GenerationConfig
  models?: string[] // optional custom chain
  signal?: AbortSignal
}

export async function generateWithFailover({
  prompt,
  generationConfig = {
    temperature: 0.1,
    topK: 40,
    topP: 0.95,
    maxOutputTokens: 8192,
  },
  models = MODEL_FALLBACK_CHAIN,
}: GenerateOptions): Promise<FailoverResult> {
  const errors: { model: string; error: unknown }[] = []

  for (const modelName of models) {
    try {
    const model = genAI.getGenerativeModel({ model: modelName, generationConfig })
    // Note: current SDK generateContent signature doesn't accept AbortSignal directly; omit if unsupported
    const result = await model.generateContent({ contents: [{ role: 'user', parts: [{ text: prompt }] }], safetySettings: [], generationConfig })
      const text = result.response.text()
      if (!text || text.trim().length === 0) {
        throw new Error('Empty response text')
      }
      return { modelUsed: modelName, rawText: text }
    } catch (err) {
      errors.push({ model: modelName, error: err })
      // Continue to next model.
    }
  }

  const summary = errors.map(e => {
    const msg = (e.error instanceof Error) ? e.error.message : String(e.error)
    return `${e.model}: ${msg}`
  }).join('\n')
  throw new Error(`All fallback models failed. Details:\n${summary}`)
}
