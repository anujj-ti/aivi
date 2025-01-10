'use client';

import { useAudioRecorder } from '@/lib/hooks/useAudioRecorder';
import { Transcription } from '@/lib/types/audio';

export default function TestPage() {
  const {
    isRecording,
    error,
    currentText,
    transcriptions,
    isSpeaking,
    audioLevel,
    startRecording,
    stopRecording
  } = useAudioRecorder();

  return (
    <main className="min-h-screen p-8 bg-gray-900">
      {/* Recording/Speaking Indicator */}
      {isRecording && (
        <div className={`fixed top-0 left-0 right-0 text-white text-center py-2 transition-colors duration-300 ${
          isSpeaking ? 'bg-green-500' : 'bg-yellow-500'
        }`}>
          <div className="flex items-center justify-center gap-2">
            <div className={`w-2 h-2 rounded-full ${
              isSpeaking ? 'bg-white animate-ping' : 'bg-white'
            }`}/>
            <span>
              {isSpeaking ? 'Speaking' : 'Waiting for speech'} 
              {audioLevel > 0 && ` (Level: ${audioLevel.toFixed(1)})`}
            </span>
          </div>
          {/* Audio level bar */}
          <div className="w-full h-1 bg-black/20 mt-1">
            <div 
              className="h-full bg-white transition-all duration-100"
              style={{ 
                width: `${Math.min((audioLevel / 30) * 100, 100)}%`,
                opacity: isSpeaking ? 1 : 0.5
              }}
            />
          </div>
        </div>
      )}
      
      <div className="max-w-3xl mx-auto">
        <div className="bg-gray-800 rounded-lg shadow-lg p-6">
          <h1 className="text-3xl font-bold mb-6 text-white">Real-time Speech to Text</h1>
          
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
              <div className="text-red-400 text-sm p-3 bg-red-900/50 rounded-md">
                {error}
              </div>
            )}

            {/* Live transcription display */}
            <div className="border border-gray-700 rounded-lg p-4 min-h-[100px] bg-gray-700">
              <h2 className="text-lg font-semibold mb-2 text-white">Current Transcription:</h2>
              <p className="text-gray-300">{currentText || 'Start speaking...'}</p>
            </div>

            {/* Transcription history */}
            {transcriptions.length > 0 && (
              <div className="border border-gray-700 rounded-lg p-4">
                <h2 className="text-lg font-semibold mb-2 text-white">Transcription History:</h2>
                <div className="space-y-2">
                  {transcriptions.map((trans: Transcription, index: number) => (
                    <div key={index} className="p-2 bg-gray-700 rounded">
                      <p className="text-gray-300">{trans.text}</p>
                      <p className="text-xs text-gray-400">
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