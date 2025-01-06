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

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: Error) => void;
  start: () => void;
  stop: () => void;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

export default function InterviewPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const questionIndexRef = useRef(0);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(questions[0]);
  const [transcript, setTranscript] = useState('');

  useEffect(() => {
    startVideo();
    startSpeechRecognition();
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const startSpeechRecognition = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
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

        setTranscript(finalTranscript + interimTranscript);
      };

      recognitionRef.current.onerror = (error: Error) => {
        console.error('Speech recognition error:', error);
      };

      recognitionRef.current.start();
    }
  };

  useEffect(() => {
    const timer = setInterval(() => {
      questionIndexRef.current = (questionIndexRef.current + 1) % questions.length;
      setCurrentQuestion(questions[questionIndexRef.current]);
      // Clear transcript for new question
      setTranscript('');
    }, 60000); // Change question every minute

    return () => clearInterval(timer);
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
                className={`p-3 rounded-full ${isMuted ? 'bg-red-500' : 'bg-gray-600'} hover:bg-opacity-80 transition-colors`}
              >
                {isMuted ? <MicOff className="text-white" /> : <Mic className="text-white" />}
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
      <div className="w-96 bg-white border-l border-gray-200 p-6 flex flex-col">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-[#1a365d] mb-2">Current Question</h2>
          <p className="text-gray-600">{currentQuestion}</p>
        </div>

        {/* Response Section */}
        <div className="flex-1 bg-gray-50 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <MessageCircle className="text-teal-600" />
            <h3 className="text-lg font-semibold text-[#1a365d]">Your Response</h3>
          </div>
          <div className="text-gray-600 whitespace-pre-wrap">
            {transcript || 'Start speaking to see your response...'}
          </div>
        </div>

        {/* Timer */}
        <div className="text-center text-gray-600 mb-6">
          Time Remaining: 14:35
        </div>

        {/* End Interview Button */}
        <button
          className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
          onClick={() => {
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