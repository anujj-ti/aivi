import { NextResponse } from 'next/server';

// Minimum size threshold (approximately 0.1 seconds of audio)
// WebM opus typically uses ~32kbps, so 0.1s ≈ 400 bytes
const MIN_AUDIO_SIZE = 400;

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const audioBlob = formData.get('file') as Blob;
    
    if (!audioBlob) {
      return NextResponse.json(
        { error: 'No audio file provided' },
        { status: 400 }
      );
    }

    // Check audio size
    if (audioBlob.size < MIN_AUDIO_SIZE) {
      return NextResponse.json(
        { error: 'Audio file is too short. Minimum audio length is 0.1 seconds.' },
        { status: 400 }
      );
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    const whisperFormData = new FormData();
    whisperFormData.append('file', audioBlob, 'audio.webm');
    whisperFormData.append('model', 'whisper-1');
    whisperFormData.append('language', 'en');

    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`
      },
      body: whisperFormData
    });

    if (!response.ok) {
      const error = await response.text();
      return NextResponse.json(
        { error: `Whisper API error: ${error}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
    
  } catch (error) {
    console.error('Transcription error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 