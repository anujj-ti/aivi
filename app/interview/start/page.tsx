'use client';

import { useEffect, useRef, useState } from 'react';
import { Mic, MicOff, Camera, CameraOff, MessageCircle } from 'lucide-react';

const questions = [
  "Tell me about your background and experience.",
  "What are your key strengths?",
  "Why are you interested in this position?",
  "Describe a challenging project you've worked on."
];

interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: {
    length: number;
    [index: number]: {
      isFinal: boolean;
      0: {
        transcript: string;
      };
    };
  };
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: SpeechRecognitionErrorEvent) => void;
  onend: () => void;
  start: () => void;
  stop: () => void;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

interface Response {
  id: string;
  question: string;
  answer: string;
  timestamp: number;
  isInterim?: boolean;
}

export default function InterviewPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const questionIndexRef = useRef(0);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(questions[0]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [responses, setResponses] = useState<Response[]>([]);
  const [currentResponse, setCurrentResponse] = useState('');

  useEffect(() => {
    // Load previous responses from localStorage
    const savedResponses = localStorage.getItem('interviewResponses');
    if (savedResponses) {
      setResponses(JSON.parse(savedResponses));
    }
  }, []);

  useEffect(() => {
    // Save responses to localStorage whenever they change
    localStorage.setItem('interviewResponses', JSON.stringify(responses));
  }, [responses]);

  const saveResponse = (text: string, isInterim = false) => {
    if (text.trim()) {
      const newResponse: Response = {
        id: Date.now().toString(),
        question: currentQuestion,
        answer: text,
        timestamp: Date.now(),
        isInterim
      };
      setResponses(prev => {
        // Remove previous interim message if it exists
        const filtered = prev.filter(r => !r.isInterim);
        return [...filtered, newResponse];
      });
    }
  };

  const startSpeechRecognition = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
        let interimTranscript = '';
        setIsSpeaking(true);

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            setIsSpeaking(false);
            // Save as final response
            saveResponse(transcript);
            setCurrentResponse('');
          } else {
            interimTranscript += transcript;
            setIsSpeaking(true);
            // Update current response
            setCurrentResponse(interimTranscript);
            // Save as interim response
            saveResponse(interimTranscript, true);
          }
        }
      };

      recognitionRef.current.onend = () => {
        setIsSpeaking(false);
      };

      recognitionRef.current.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error('Speech recognition error:', event.error, event.message);
        setIsSpeaking(false);

        // Automatically restart recognition for no-speech errors
        if (event.error === 'no-speech' && !isMuted) {
          setTimeout(() => {
            if (recognitionRef.current && !isMuted) {
              recognitionRef.current.stop();
              recognitionRef.current.start();
            }
          }, 1000);
        }
      };

      recognitionRef.current.start();
    }
  };

  useEffect(() => {
    const timer = setInterval(() => {
      questionIndexRef.current = (questionIndexRef.current + 1) % questions.length;
      setCurrentQuestion(questions[questionIndexRef.current]);
      setCurrentResponse(''); // Clear current response for new question
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    startVideo();
    startSpeechRecognition();
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const startVideo = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Error accessing media devices:", err);
    }
  };

  const toggleMic = () => {
    const stream = videoRef.current?.srcObject as MediaStream;
    if (stream) {
      stream.getAudioTracks().forEach(track => {
        track.enabled = isMuted;
      });
      setIsMuted(!isMuted);
      
      // Handle speech recognition
      if (isMuted) {
        recognitionRef.current?.start();
      } else {
        recognitionRef.current?.stop();
      }
    }
  };

  const toggleCamera = () => {
    const stream = videoRef.current?.srcObject as MediaStream;
    if (stream) {
      stream.getVideoTracks().forEach(track => {
        track.enabled = isCameraOff;
      });
      setIsCameraOff(!isCameraOff);
    }
  };

  return (
    <main className="flex min-h-screen bg-gray-100">
      {/* Video Call Section */}
      <div className="flex-1 p-6">
        <div className="bg-white rounded-lg shadow-lg p-6 h-full flex flex-col">
          {/* Video Display */}
          <div className="relative flex-1 bg-gray-900 rounded-lg mb-6 overflow-hidden h-[600px]">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="absolute inset-0 w-full h-full object-cover"
            />
            
            {/* Controls Overlay */}
            <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex gap-4 bg-black/50 p-3 rounded-full">
              <button
                onClick={toggleMic}
                className={`relative p-3 rounded-full ${isMuted ? 'bg-red-500' : 'bg-gray-600'} hover:bg-opacity-80 transition-colors`}
              >
                {isSpeaking && !isMuted && (
                  <span className="absolute inset-0 rounded-full animate-ping bg-teal-400 opacity-75"></span>
                )}
                {isMuted ? <MicOff className="text-white" /> : <Mic className="text-white relative z-10" />}
              </button>
              <button
                onClick={toggleCamera}
                className={`p-3 rounded-full ${isCameraOff ? 'bg-red-500' : 'bg-gray-600'} hover:bg-opacity-80 transition-colors`}
              >
                {isCameraOff ? <CameraOff className="text-white" /> : <Camera className="text-white" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Interview Panel */}
      <div className="w-96 bg-white border-l border-gray-200 p-6 flex flex-col h-screen">
        <div className="mb-6 flex-shrink-0">
          <h2 className="text-2xl font-bold text-[#1a365d] mb-2">Current Question</h2>
          <p className="text-gray-600">{currentQuestion}</p>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 bg-gray-50 rounded-lg p-4 mb-6 overflow-y-auto min-h-0">
          <div className="flex flex-col">
            {responses.map((response) => (
              <div 
                key={response.id} 
                className={`mb-4 last:mb-0 ${
                  response.isInterim ? 'opacity-50' : ''
                }`}
              >
                <div className="flex flex-col gap-2">
                  <div className="bg-teal-100 rounded-lg p-3 max-w-[80%] self-start">
                    <p className="text-sm font-medium text-teal-800">Question:</p>
                    <p className="text-sm text-teal-900">{response.question}</p>
                  </div>
                  <div className="bg-blue-100 rounded-lg p-3 max-w-[80%] self-end">
                    <p className="text-sm font-medium text-blue-800">Answer:</p>
                    <p className="text-sm text-blue-900">{response.answer}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Current Response */}
        {currentResponse && (
          <div className="bg-gray-50 rounded-lg p-4 mb-6 flex-shrink-0">
            <div className="flex items-center gap-2 mb-2">
              <MessageCircle className="text-teal-600" />
              <h3 className="text-sm font-semibold text-[#1a365d]">Currently Speaking:</h3>
            </div>
            <div className="text-gray-600 text-sm">
              {currentResponse}
            </div>
          </div>
        )}

        {/* Timer */}
        <div className="text-center text-gray-600 mb-6 flex-shrink-0">
          Time Remaining: 14:35
        </div>

        {/* End Interview Button */}
        <button
          className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex-shrink-0"
          onClick={() => {
            if (currentResponse.trim()) {
              saveResponse(currentResponse);
            }
            if (recognitionRef.current) {
              recognitionRef.current.stop();
            }
            console.log('Interview ended');
          }}
        >
          End Interview
        </button>
      </div>
    </main>
  );
} 