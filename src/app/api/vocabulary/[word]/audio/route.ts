import { NextRequest, NextResponse } from 'next/server';
import { generateVocabularyAudio, getVocabularyAudioUrl } from '@/lib/vocabulary-audio';
import { checkRateLimit, getClientIdentifier, RATE_LIMITS } from '@/lib/rate-limit';
import { stripHtml } from '@/lib/sanitize';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ word: string }> }
) {
  try {
    // Apply rate limiting
    const identifier = getClientIdentifier(request);
    const rateLimit = checkRateLimit(identifier, RATE_LIMITS.API_VOCABULARY_AUDIO);
    
    if (!rateLimit.success) {
      return NextResponse.json(
        { 
          error: 'Too many requests',
          message: 'Please wait before requesting more audio',
          retryAfter: Math.ceil((rateLimit.reset - Date.now()) / 1000)
        },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Limit': rateLimit.limit.toString(),
            'X-RateLimit-Remaining': rateLimit.remaining.toString(),
            'X-RateLimit-Reset': new Date(rateLimit.reset).toISOString(),
            'Retry-After': Math.ceil((rateLimit.reset - Date.now()) / 1000).toString(),
          }
        }
      );
    }

    const { word } = await params;

    if (!word || word.trim().length === 0) {
      return NextResponse.json(
        { error: 'Word parameter is required' },
        { status: 400 }
      );
    }

    // Decode URL-encoded characters (e.g., %20 -> space)
    const decodedWord = decodeURIComponent(word);
    
    // Sanitize input to prevent XSS and injection attacks
    const sanitizedWord = stripHtml(decodedWord.trim());
    
    // Validate word length and characters
    if (sanitizedWord.length > 100) {
      return NextResponse.json(
        { error: 'Word too long' },
        { status: 400 }
      );
    }
    
    // Only allow alphanumeric, spaces, and common punctuation
    if (!/^[a-zA-Z0-9\s\-',.!?]+$/.test(sanitizedWord)) {
      return NextResponse.json(
        { error: 'Invalid characters in word' },
        { status: 400 }
      );
    }

    // Check if audio already exists
    const existingUrl = await getVocabularyAudioUrl(sanitizedWord);
    if (existingUrl) {
      return NextResponse.json({
        audioUrl: existingUrl,
        cached: true
      }, {
        headers: {
          'X-RateLimit-Limit': rateLimit.limit.toString(),
          'X-RateLimit-Remaining': rateLimit.remaining.toString(),
          'X-RateLimit-Reset': new Date(rateLimit.reset).toISOString(),
        }
      });
    }

    // Generate new audio
    const result = await generateVocabularyAudio(sanitizedWord);

    return NextResponse.json(result, {
      headers: {
        'X-RateLimit-Limit': rateLimit.limit.toString(),
        'X-RateLimit-Remaining': rateLimit.remaining.toString(),
        'X-RateLimit-Reset': new Date(rateLimit.reset).toISOString(),
      }
    });
  } catch (error) {
    console.error('Vocabulary audio generation error:', error);
    
    // Check if it's an ElevenLabs API issue
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const isElevenLabsError = errorMessage.includes('ElevenLabs API error');
    
    return NextResponse.json(
      { 
        error: 'Failed to generate audio',
        message: isElevenLabsError 
          ? 'Audio generation service temporarily unavailable. Please try again later.' 
          : errorMessage,
        details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
      },
      { status: 503 } // Service Unavailable
    );
  }
}
