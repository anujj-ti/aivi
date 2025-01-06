'use client';

import { useEffect, useRef, useState } from 'react';
import { Mic, MicOff, Camera, CameraOff } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

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

export default function InterviewPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [currentResponse, setCurrentResponse] = useState('');
  const [conversation, setConversation] = useState<Message[]>([]);

  useEffect(() => {
    // Load conversation from localStorage
    console.log("loading conversation");
    const savedConversation = localStorage.getItem('interviewConversation');
    if (savedConversation) {
      console.log("savedConversation", savedConversation);
      const parsedConversation = JSON.parse(savedConversation);
      console.log("parsedConversation", parsedConversation);
      setConversation(parsedConversation);
    } else {
      console.log("no saved conversation");
    }
  }, []);

  const handleSubmitResponse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (currentResponse.trim()) {
      const currentResponeReceived = currentResponse;
      setCurrentResponse('');
      await saveResponse(currentResponeReceived);
    }
  };

  const saveResponse = async (text: string) => {
    // Get the resume from localStorage
    const resume = localStorage.getItem('userResume') || '';

    const currentConversation = JSON.parse(localStorage.getItem('interviewConversation') || '[]');

    // Update conversation with user's response
    const updatedConversation: Message[] = [
      ...currentConversation,
      { role: 'user' as const, content: text }
    ];

    console.log("updatedConversation", updatedConversation);
    setConversation(updatedConversation);
    localStorage.setItem('interviewConversation', JSON.stringify(updatedConversation));

    try {
      // Make API call to get next question
      const response = await fetch('http://localhost:8000/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          resume,
          messages: updatedConversation
        })
      });

      const data = await response.json();
      
      // Add assistant's response to conversation
      const currentConversation = JSON.parse(localStorage.getItem('interviewConversation') || '[]');
      const newConversation: Message[] = [
        ...currentConversation,
        {
          role: 'assistant' as const,
          content: data.content
        }
      ];

      // Update state and localStorage
      setConversation(newConversation);
      localStorage.setItem('interviewConversation', JSON.stringify(newConversation));
      console.log("newConversation", newConversation);
    } catch (error) {
      console.error('Failed to get next question:', error);
    }
  };

  useEffect(() => {
    startVideo();
    return () => {
      const stream = videoRef.current?.srcObject as MediaStream;
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
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
              className="inset-0 w-full h-full object-cover"
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
      <div className="w-96 bg-white border-l border-gray-200 p-6 flex flex-col h-screen">
        {/* Chat Messages */}
        <div className="flex-1 bg-gray-50 rounded-lg p-4 mb-6 overflow-y-auto min-h-0">
          <div className="flex flex-col">
            {conversation.map((message, index) => (
              <div 
                key={index} 
                className="mb-4 last:mb-0"
              >
                <div className="flex flex-col gap-2">
                  {message.role === 'assistant' && (
                    <div className="bg-teal-100 rounded-lg p-3 max-w-[80%] self-start">
                      <p className="text-sm font-medium text-teal-800">Question:</p>
                      <p className="text-sm text-teal-900">{message.content}</p>
                    </div>
                  )}
                  {message.role === 'user' && (
                    <div className="bg-blue-100 rounded-lg p-3 max-w-[80%] self-end">
                      <p className="text-sm font-medium text-blue-800">Answer:</p>
                      <p className="text-sm text-blue-900">{message.content}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Response Input */}
        <form onSubmit={handleSubmitResponse} className="mb-6">
          <div className="flex gap-2">
            <textarea
              value={currentResponse}
              onChange={(e) => setCurrentResponse(e.target.value)}
              placeholder="Type your response..."
              className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-black"
            />
            <button
              type="submit"
              className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Send
            </button>
          </div>
        </form>

        {/* Timer */}
        <div className="text-center text-gray-600 mb-6 flex-shrink-0">
          Time Remaining: 14:35
        </div>

        {/* End Interview Button */}
        <button
          className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex-shrink-0"
          onClick={() => {
            const stream = videoRef.current?.srcObject as MediaStream;
            if (stream) {
              stream.getTracks().forEach(track => track.stop());
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