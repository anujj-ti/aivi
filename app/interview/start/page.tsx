'use client';

import { useEffect, useRef, useState } from 'react';
import { Mic, MicOff, Camera } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAudioRecorder } from '@/lib/hooks/useAudioRecorder';
import { Message } from '@/lib/types/chat';
import { interviewApi } from '@/lib/services/api';

export default function InterviewPage() {
  const router = useRouter();
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [conversation, setConversation] = useState<Message[]>([]);
  const [showEndModal, setShowEndModal] = useState(false);

  const {
    isRecording,
    error: micError,
    currentText,
    startRecording,
    stopRecording
  } = useAudioRecorder();

  useEffect(() => {
    // Load conversation from localStorage
    const savedConversation = localStorage.getItem('interviewConversation');
    if (savedConversation) {
      const parsedConversation = JSON.parse(savedConversation);
      setConversation(parsedConversation);
    }
  }, []);

  useEffect(() => {
    if (!isRecording && currentText) {
      saveResponse(currentText);
    }
  }, [isRecording, currentText]);

  const saveResponse = async (text: string) => {
    // Get the resume from localStorage
    const resume = localStorage.getItem('userResume') || '';
    const currentConversation = JSON.parse(localStorage.getItem('interviewConversation') || '[]');

    // Update conversation with user's response
    const updatedConversation: Message[] = [
      ...currentConversation,
      { role: 'user', content: text }
    ];

    setConversation(updatedConversation);
    localStorage.setItem('interviewConversation', JSON.stringify(updatedConversation));

    try {
      // Make API call to get next question using the API service
      const data = await interviewApi.getNextQuestion(resume, updatedConversation);
      
      // Add assistant's response to conversation
      const newConversation: Message[] = [
        ...updatedConversation,
        {
          role: 'assistant',
          content: data.content
        }
      ];

      // Update state and localStorage
      setConversation(newConversation);
      localStorage.setItem('interviewConversation', JSON.stringify(newConversation));

      // Check if the response contains [END OF INTERVIEW]
      if (data.content.includes('[END OF INTERVIEW]')) {
        setShowEndModal(true);
      }
    } catch (error) {
      console.error('Failed to get next question:', error);
    }
  };

  useEffect(() => {
    // Scroll to bottom whenever conversation updates
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [conversation]);

  return (
    <main className="flex min-h-screen bg-gray-100">
      {/* Video Section */}
      <div className="w-1/2 p-6">
        <div className="bg-white rounded-lg shadow-lg p-6 h-full flex flex-col">
          {/* Video Display */}
          <div className="relative flex-1 bg-gray-900 rounded-lg mb-6 overflow-hidden h-[600px] flex items-center justify-center">
            <div className="text-white text-center p-6">
              <h3 className="text-xl font-semibold mb-2">Video Interview Demo</h3>
              <p className="text-gray-300">Video functionality is disabled in this demo version.</p>
              <p className="text-gray-400 text-sm mt-2">In the full version, you would see your video feed here.</p>
            </div>
            
            {/* Controls Overlay */}
            <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex gap-4 bg-black/50 p-3 rounded-full">
              <button
                onClick={isRecording ? stopRecording : startRecording}
                className={`p-3 rounded-full ${isRecording ? 'bg-red-500' : 'bg-gray-600'} hover:bg-opacity-80 transition-colors`}
              >
                {isRecording ? <Mic className="text-white" /> : <MicOff className="text-white" />}
              </button>
              <button
                disabled
                className="p-3 rounded-full bg-gray-600 opacity-50 cursor-not-allowed"
              >
                <Camera className="text-white" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Interview Panel */}
      <div className="w-1/2 bg-white border-l border-gray-200 p-6 flex flex-col h-screen overflow-hidden">
        {/* Chat Messages */}
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Interview Conversation</h2>
        <div ref={chatContainerRef} className="flex-1 bg-gray-50 rounded-lg p-4 mb-6 overflow-y-auto min-h-0">
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
                      <p className="text-sm font-medium text-blue-800">Your Answer:</p>
                      <p className="text-sm text-blue-900">{message.content}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {/* Show current transcription */}
            {isRecording && currentText && (
              <div className="bg-gray-100 rounded-lg p-3 max-w-[80%] self-end mb-4">
                <p className="text-sm text-gray-600">{currentText}</p>
              </div>
            )}

            {/* Show mic error if any */}
            {micError && (
              <div className="bg-red-100 rounded-lg p-3 max-w-[80%] self-center mb-4">
                <p className="text-sm text-red-600">{micError}</p>
              </div>
            )}
          </div>
        </div>

        {/* Recording Controls */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={isRecording ? stopRecording : startRecording}
              className={`px-6 py-3 rounded-full text-white font-semibold transition-all flex items-center gap-2 ${
                isRecording 
                  ? 'bg-red-500 hover:bg-red-600 animate-pulse'
                  : 'bg-blue-500 hover:bg-blue-600'
              }`}
            >
              {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              {isRecording ? 'Stop Recording' : 'Start Recording'}
            </button>
          </div>
          {isRecording && (
            <p className="text-center text-sm text-gray-600 mt-2">
              Recording... Speak your answer
            </p>
          )}
        </div>
      </div>

      {/* End Interview Modal */}
      {showEndModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-md">
            <h3 className="text-xl font-semibold mb-4">Interview Complete</h3>
            <p className="text-gray-600 mb-6">
              The interview has concluded. Would you like to view your summary?
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => router.push('/interview/summary')}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                View Summary
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
} 