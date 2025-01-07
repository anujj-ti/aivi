'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function SummaryPage() {
  const [conversation, setConversation] = useState<Message[]>([]);

  useEffect(() => {
    const savedConversation = localStorage.getItem('interviewConversation');
    if (savedConversation) {
      setConversation(JSON.parse(savedConversation));
    }
  }, []);

  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-bold text-gray-800">Interview Transcript</h1>
            <Link 
              href="/interview/upload" 
              className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Start New Interview
            </Link>
          </div>
          
          <div className="space-y-6">
            {conversation.map((message, index) => (
              <div key={index} className="border-b border-gray-200 pb-6 last:border-0">
                <div className="flex flex-col gap-2">
                  {message.role === 'assistant' && (
                    <div>
                      <p className="text-sm font-medium text-teal-800 mb-2">Question:</p>
                      <p className="text-lg text-gray-800 bg-teal-50 p-4 rounded-lg">{message.content}</p>
                    </div>
                  )}
                  {message.role === 'user' && (
                    <div>
                      <p className="text-sm font-medium text-blue-800 mb-2">Answer:</p>
                      <p className="text-lg text-gray-800 bg-blue-50 p-4 rounded-lg">{message.content}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
} 