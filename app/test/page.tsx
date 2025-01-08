'use client';

import { useAudioRecorder } from '@/lib/hooks/useAudioRecorder';
import { Transcription } from '@/lib/types/audio';

export default function TestPage() {
  const {
    isRecording,
    error,
    currentText,
    transcriptions,
    startRecording,
    stopRecording
  } = useAudioRecorder();

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
                  {transcriptions.map((trans: Transcription, index: number) => (
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