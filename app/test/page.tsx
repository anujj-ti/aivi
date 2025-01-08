'use client';

import { useState, useEffect } from 'react';

interface Transcription {
  text: string;
  timestamp: number;
}

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export default function TestPage() {
  const [isListening, setIsListening] = useState(false);
  const [transcriptions, setTranscriptions] = useState<Transcription[]>([]);
  const [currentText, setCurrentText] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [recognition, setRecognition] = useState<any>(null);

  useEffect(() => {
    // Initialize speech recognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      // Handle recognition start
      recognition.onstart = () => {
        console.log('Speech recognition started');
        setIsListening(true);
      };

      // Handle recognition results
      recognition.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript + ' ';
          } else {
            interimTranscript += transcript;
          }
        }

        // Update current text with interim results
        setCurrentText(interimTranscript);

        // If we have a final transcript, add it to history
        if (finalTranscript) {
          console.log('Final transcript:', finalTranscript);
          const newTranscription: Transcription = {
            text: finalTranscript.trim(),
            timestamp: Date.now()
          };
          setTranscriptions(prev => [...prev, newTranscription]);
          setCurrentText('');
        }
      };

      // Handle errors
      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setError(`Recognition error: ${event.error}`);
        setIsListening(false);
      };

      // Handle recognition end
      recognition.onend = () => {
        console.log('Speech recognition ended');
        // Automatically restart if we're still supposed to be listening
        if (isListening) {
          recognition.start();
        }
      };

      setRecognition(recognition);
    } else {
      setError('Speech recognition is not supported in this browser.');
    }

    // Cleanup
    return () => {
      if (recognition) {
        recognition.stop();
      }
    };
  }, []);

  const toggleListening = () => {
    if (!recognition) {
      setError('Speech recognition is not supported.');
      return;
    }

    if (isListening) {
      recognition.stop();
      setIsListening(false);
    } else {
      recognition.start();
      setError(null);
    }
  };

  return (
    <main className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-3xl font-bold mb-6">Real-time Speech to Text</h1>
          
          <div className="space-y-6">
            <div className="flex flex-col items-center space-y-2">
              <button
                onClick={toggleListening}
                className={`px-6 py-3 rounded-full text-white font-semibold transition-all ${
                  isListening 
                    ? 'bg-red-500 hover:bg-red-600 animate-pulse'
                    : 'bg-blue-500 hover:bg-blue-600'
                }`}
              >
                {isListening ? 'Stop Listening' : 'Start Listening'}
              </button>
              
              {isListening && (
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
                  <span className="text-sm text-gray-600">Listening...</span>
                </div>
              )}
            </div>

            {error && (
              <div className="text-red-500 text-sm p-3 bg-red-50 rounded-md">
                {error}
              </div>
            )}

            {/* Live transcription display */}
            <div className="border rounded-lg p-4 min-h-[100px] bg-gray-50">
              <h2 className="text-lg font-semibold mb-2">Current Transcription:</h2>
              <p className="text-gray-700">
                {isListening 
                  ? (currentText || 'Listening...')
                  : 'Click Start Listening to begin'
                }
              </p>
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