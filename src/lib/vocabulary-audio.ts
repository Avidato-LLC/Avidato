/**
 * Vocabulary Audio Service
 * Handles TTS generation via ElevenLabs and storage in Supabase Storage
 */

import { createClient } from '@supabase/supabase-js';
import { prisma } from './prisma';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
const ELEVENLABS_VOICE_ID = process.env.ELEVENLABS_VOICE_ID || 'EXAVITQu4vr4xnSDxMaL'; // Default voice

const BUCKET_NAME = 'vocabulary-audio';

interface GenerateAudioResult {
  audioUrl: string;
  cached: boolean;
}

/**
 * Initialize Supabase Storage bucket for vocabulary audio
 * Run this once during setup
 */
export async function initializeAudioStorage() {
  const { data: buckets } = await supabase.storage.listBuckets();
  const bucketExists = buckets?.some(b => b.name === BUCKET_NAME);

  if (!bucketExists) {
    const { error } = await supabase.storage.createBucket(BUCKET_NAME, {
      public: true,
      fileSizeLimit: 1024 * 1024, // 1MB limit per file
    });

    if (error) {
      console.error('Failed to create bucket:', error);
      throw error;
    }
  }
}

/**
 * Generate or retrieve cached audio for a vocabulary word
 */
export async function generateVocabularyAudio(
  word: string,
  language: string = 'en'
): Promise<GenerateAudioResult> {
  // Normalize word for consistent storage
  const normalizedWord = word.toLowerCase().trim();

  // Check if audio already exists in database
  const existing = await prisma.vocabularyAudio.findUnique({
    where: { word: normalizedWord }
  });

  if (existing) {
    return {
      audioUrl: existing.audioUrl,
      cached: true
    };
  }

  // Generate new audio via ElevenLabs
  if (!ELEVENLABS_API_KEY) {
    throw new Error('ElevenLabs API key not configured');
  }

  const response = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${ELEVENLABS_VOICE_ID}`,
    {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': ELEVENLABS_API_KEY
      },
      body: JSON.stringify({
        text: word,
        model_id: 'eleven_turbo_v2_5',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.5
        }
      })
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    console.error('ElevenLabs API error:', response.status, errorText);
    throw new Error(`ElevenLabs API error: ${response.statusText} - ${errorText}`);
  }

  const audioBuffer = await response.arrayBuffer();
  const audioBlob = new Blob([audioBuffer], { type: 'audio/mpeg' });

  // Ensure bucket exists
  await initializeAudioStorage();

  // Upload to Supabase Storage
  const storageKey = `${language}/${normalizedWord}.mp3`;
  const { error: uploadError } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(storageKey, audioBlob, {
      contentType: 'audio/mpeg',
      upsert: false
    });

  if (uploadError) {
    throw new Error(`Failed to upload audio: ${uploadError.message}`);
  }

  // Get public URL
  const { data: urlData } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(storageKey);

  const audioUrl = urlData.publicUrl;

  // Save to database
  await prisma.vocabularyAudio.create({
    data: {
      word: normalizedWord,
      audioUrl,
      storageKey,
      language
    }
  });

  return {
    audioUrl,
    cached: false
  };
}

/**
 * Batch generate audio for multiple vocabulary words
 * Includes rate limiting to respect ElevenLabs quotas
 */
export async function batchGenerateVocabularyAudio(
  words: string[],
  language: string = 'en'
): Promise<Map<string, string>> {
  const results = new Map<string, string>();
  
  for (const word of words) {
    try {
      const { audioUrl } = await generateVocabularyAudio(word, language);
      results.set(word, audioUrl);
      
      // Rate limit: 250ms delay between requests
      await new Promise(resolve => setTimeout(resolve, 250));
    } catch (error) {
      console.error(`Failed to generate audio for "${word}":`, error);
      // Continue with other words even if one fails
    }
  }

  return results;
}

/**
 * Get audio URL for a word if it exists, otherwise return null
 */
export async function getVocabularyAudioUrl(word: string): Promise<string | null> {
  const normalizedWord = word.toLowerCase().trim();
  
  const audio = await prisma.vocabularyAudio.findUnique({
    where: { word: normalizedWord }
  });

  return audio?.audioUrl || null;
}
