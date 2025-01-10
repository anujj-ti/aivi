import { NextResponse } from 'next/server';

// Function to get audio duration
async function getAudioDuration(blob: Blob): Promise<number> {
  return new Promise((resolve, reject) => {
    const audioContext = new AudioContext();
    const reader = new FileReader();

    reader.onload = async () => {
      try {
        const arrayBuffer = reader.result as ArrayBuffer;
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
        resolve(audioBuffer.duration);
      } catch (error) {
        reject(error);
      } finally {
        audioContext.close();
      }
    };

    reader.onerror = () => reject(reader.error);
    reader.readAsArrayBuffer(blob);
  });
}

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

    // Check audio duration
    try {
      const duration = await getAudioDuration(audioBlob);
      console.log(`Audio duration: ${duration} seconds`);
      
      if (duration < 0.1) {
        return NextResponse.json(
          { error: 'Audio file is too short. Minimum audio length is 0.1 seconds.' },
          { status: 400 }
        );
      }
    } catch (error) {
      console.error('Error checking audio duration:', error);
      // Continue with the request even if duration check fails
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