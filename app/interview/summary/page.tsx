'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { BASE_URL } from '@/lib/constants';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function SummaryPage() {
  const [conversation, setConversation] = useState<Message[]>([]);
  const [assessment, setAssessment] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchAssessment = async () => {
      try {
        const savedConversation = localStorage.getItem('interviewConversation');
        const savedResume = localStorage.getItem('userResume');
        const savedAssessment = localStorage.getItem('interviewAssessment');
        
        if (!savedConversation || !savedResume) {
          setError('No interview data found. Please start a new interview.');
          setIsLoading(false);
          return;
        }

        const parsedConversation = JSON.parse(savedConversation);
        setConversation(parsedConversation);
        
        if (parsedConversation.length === 0) {
          setError('No interview questions found. Please start a new interview.');
          setIsLoading(false);
          return;
        }

        // If we have a saved assessment, use it
        if (savedAssessment) {
          setAssessment(savedAssessment);
          setIsLoading(false);
          return;
        }

        // Convert conversation format for API
        const apiMessages = parsedConversation.map((msg: Message) => ({
          role: msg.role === 'assistant' ? 'interviewer' : 'candidate',
          content: msg.content
        }));

        const response = await fetch(`${BASE_URL}/feedback`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            resume: savedResume,
            messages: apiMessages
          })
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch assessment: ${response.statusText}`);
        }

        const data = await response.json();
        localStorage.setItem('interviewAssessment', data.content);
        setAssessment(data.content);
      } catch (error) {
        console.error('Error fetching assessment:', error);
        setError('Failed to generate assessment. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAssessment();
  }, []);

  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-bold text-gray-800">Interview Summary</h1>
            <Link 
              href="/interview/upload" 
              className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Start New Interview
            </Link>
          </div>

          {error ? (
            <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-8">
              {error}
            </div>
          ) : (
            <>
              <div className="mb-8">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Assessment</h2>
                {isLoading ? (
                  <div className="flex justify-center items-center py-12 bg-teal-50 rounded-lg">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
                  </div>
                ) : assessment && (
                  <div className="bg-teal-50 p-6 rounded-lg">
                    <p className="text-gray-800 whitespace-pre-wrap">{assessment}</p>
                  </div>
                )}
              </div>
              
              <h2 className="text-xl font-bold text-gray-800 mb-4">Interview Transcript</h2>
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
            </>
          )}
        </div>
      </div>
    </main>
  );
} 