import axios from 'axios';
import { BASE_URL } from '@/lib/constants';
import { Message } from '@/lib/types/chat';

// Create axios instance with default config
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

interface ChatResponse {
  content: string;
}

export const interviewApi = {
  // Get next interview question
  getNextQuestion: async (resume: string, messages: Message[]): Promise<ChatResponse> => {
    try {
      const response = await api.post<ChatResponse>('/chat', {
        resume,
        messages,
      });
      return response.data;
    } catch (error) {
      console.error('Failed to get next question:', error);
      throw error;
    }
  },

  // Convert text to speech
  textToSpeech: async (text: string, voice: string = 'alloy', speed: number = 1.0): Promise<ArrayBuffer> => {
    try {
      const response = await fetch('/api/speech', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          voice,
          speed,
        }),
      });

      if (!response.ok) {
        throw new Error('TTS request failed');
      }

      return await response.arrayBuffer();
    } catch (error) {
      console.error('Failed to convert text to speech:', error);
      throw error;
    }
  },
}; 