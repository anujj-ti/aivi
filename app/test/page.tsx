'use client';

import { useState, useRef, useEffect, useCallback } from 'react';

interface Transcription {
  text: string;
  timestamp: number;
}

export default function TestPage() {
  const [isRecording, setIsRecording] = useState(false);
  const [transcriptions, setTranscriptions] = useState<Transcription[]>([]);
  const [currentText, setCurrentText] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [hasMicPermission, setHasMicPermission] = useState<boolean>(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const processingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Check microphone permission on component mount
  useEffect(() => {
    checkMicrophonePermission();
  }, []);

  const checkMicrophonePermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop()); // Stop the test stream
      setHasMicPermission(true);
      setError(null);
    } catch (err) {
      console.error('Microphone permission error:', err);
      setHasMicPermission(false);
      setError('Please grant microphone permission to use this feature.');
    }
  };

  const startRecording = async () => {
    try {
      if (!hasMicPermission) {
        await checkMicrophonePermission();
        if (!hasMicPermission) return;
      }

      console.log('Starting recording session...');
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });
      console.log('Microphone access granted');

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm'
      });
      console.log('MediaRecorder created with mimeType:', mediaRecorder.mimeType);
      
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          console.log('Data chunk received:', event.data.size, 'bytes');
          chunksRef.current.push(event.data);
        }
      };

      // Start recording immediately
      mediaRecorder.start(1000);
      setIsRecording(true);
      console.log('Recording started - collecting chunks every second');

      // Process chunks every 3 seconds
      processingIntervalRef.current = setInterval(async () => {
        if (chunksRef.current.length > 0) {
          console.log(`Processing ${chunksRef.current.length} chunks...`);
          const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
          console.log('Created audio blob:', audioBlob.size, 'bytes');
          
          // Clear chunks before sending to avoid duplicate processing
          const currentChunks = [...chunksRef.current];
          chunksRef.current = [];
          
          try {
            await sendAudioForTranscription(audioBlob);
          } catch (error) {
            console.error('Failed to process audio chunks:', error);
            // Put the chunks back if processing failed
            chunksRef.current = [...currentChunks, ...chunksRef.current];
          }
        }
      }, 3000);

    } catch (error) {
      console.error('Error in recording:', error);
      setError('Error accessing microphone. Please ensure you have granted permission.');
      setIsRecording(false);
    }
  };

  const stopRecording = useCallback(() => {
    console.log('Stopping recording...');
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => {
        track.stop();
        console.log('Stopped audio track:', track.kind);
      });
      
      // Process any remaining chunks
      if (chunksRef.current.length > 0) {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
        sendAudioForTranscription(audioBlob);
        chunksRef.current = [];
      }

      // Clear the processing interval
      if (processingIntervalRef.current) {
        clearInterval(processingIntervalRef.current);
        console.log('Cleared processing interval');
      }
      
      setIsRecording(false);
      console.log('Recording stopped');
    }
  }, [isRecording]);

  const sendAudioForTranscription = async (audioBlob: Blob) => {
    const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OpenAI API key is missing');
    }

    console.log('Preparing transcription request...');
    const formData = new FormData();
    formData.append('file', audioBlob, 'audio.webm');
    formData.append('model', 'whisper-1');
    formData.append('language', 'en');

    try {
      console.log('Sending request to Whisper API...');
      const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`
        },
        body: formData
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error:', response.status, errorText);
        throw new Error(`API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('Received transcription:', data);

      if (data.text?.trim()) {
        const newTranscription: Transcription = {
          text: data.text.trim(),
          timestamp: Date.now()
        };
        setTranscriptions(prev => [...prev, newTranscription]);
        setCurrentText(data.text.trim());
        console.log('Updated transcription state');
      }
    } catch (error) {
      console.error('Transcription error:', error);
      setError('Error transcribing audio. Please try again.');
      throw error; // Re-throw to handle in the calling function
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (processingIntervalRef.current) {
        clearInterval(processingIntervalRef.current);
      }
      if (mediaRecorderRef.current && isRecording) {
        stopRecording();
      }
    };
  }, [isRecording, stopRecording]);

  return (
    <main className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-3xl font-bold mb-6">Real-time Speech to Text</h1>
          
          <div className="space-y-6">
            <div className="flex justify-center">
              <button
                onClick={isRecording ? stopRecording : startRecording}
                className={`px-6 py-3 rounded-full text-white font-semibold transition-all ${
                  isRecording 
                    ? 'bg-red-500 hover:bg-red-600 animate-pulse'
                    : 'bg-blue-500 hover:bg-blue-600'
                }`}
              >
                {isRecording ? 'Stop Recording' : 'Start Recording'}
              </button>
            </div>

            {error && (
              <div className="text-red-500 text-sm p-3 bg-red-50 rounded-md">
                {error}
              </div>
            )}

            {/* Live transcription display */}
            <div className="border rounded-lg p-4 min-h-[100px] bg-gray-50">
              <h2 className="text-lg font-semibold mb-2">Current Transcription:</h2>
              <p className="text-gray-700">{currentText || 'Start speaking...'}</p>
            </div>

            {/* Transcription history */}
            {transcriptions.length > 0 && (
              <div className="border rounded-lg p-4">
                <h2 className="text-lg font-semibold mb-2">Transcription History:</h2>
                <div className="space-y-2">
                  {transcriptions.map((trans, index) => (
                    <div key={index} className="p-2 bg-gray-50 rounded">
                      <p className="text-gray-700">{trans.text}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(trans.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
} 