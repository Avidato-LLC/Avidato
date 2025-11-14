import { NextRequest, NextResponse } from 'next/server';
import { generateVocabularyAudio, getVocabularyAudioUrl } from '@/lib/vocabulary-audio';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ word: string }> }
) {
  try {
    const { word } = await params;

    if (!word || word.trim().length === 0) {
      return NextResponse.json(
        { error: 'Word parameter is required' },
        { status: 400 }
      );
    }

    // Check if audio already exists
    const existingUrl = await getVocabularyAudioUrl(word);
    if (existingUrl) {
      return NextResponse.json({
        audioUrl: existingUrl,
        cached: true
      });
    }

    // Generate new audio
    const result = await generateVocabularyAudio(word);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Vocabulary audio generation error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to generate audio',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
