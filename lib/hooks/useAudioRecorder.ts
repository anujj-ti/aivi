import { useState, useRef, useEffect, useCallback } from 'react';
import { Transcription, AudioRecorderState } from '../types/audio';
import { getMicrophoneStream, createMediaRecorder, stopMediaStream, sendAudioForTranscription } from '../utils/audioUtils';

export const useAudioRecorder = () => {
  const [state, setState] = useState<AudioRecorderState>({
    isRecording: false,
    error: null,
    hasMicPermission: false
  });
  const [transcriptions, setTranscriptions] = useState<Transcription[]>([]);
  const [currentText, setCurrentText] = useState<string>('');
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const reset = useCallback(() => {
    setCurrentText('');
    setTranscriptions([]);
  }, []);

  const checkMicrophonePermission = async () => {
    try {
      const stream = await getMicrophoneStream();
      stopMediaStream(stream);
      setState(prev => ({ ...prev, hasMicPermission: true, error: null }));
    } catch (err) {
      console.error('Microphone permission error:', err);
      setState(prev => ({
        ...prev,
        hasMicPermission: false,
        error: 'Please grant microphone permission to use this feature.'
      }));
    }
  };

  const startRecording = async () => {
    try {
      if (!state.hasMicPermission) {
        await checkMicrophonePermission();
        if (!state.hasMicPermission) return;
      }

      const stream = await getMicrophoneStream();
      const mediaRecorder = createMediaRecorder(stream);
      
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.start(1000);
      setState(prev => ({ ...prev, isRecording: true, error: null }));

    } catch (error) {
      console.error('Error in recording:', error);
      setState(prev => ({
        ...prev,
        isRecording: false,
        error: 'Error accessing microphone. Please ensure you have granted permission.'
      }));
    }
  };

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && state.isRecording) {
      mediaRecorderRef.current.stop();
      stopMediaStream(mediaRecorderRef.current.stream);
      
      if (chunksRef.current.length > 0) {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
        processTranscription(audioBlob);
        chunksRef.current = [];
      }
      
      setState(prev => ({ ...prev, isRecording: false }));
    }
  }, [state.isRecording]);

  const processTranscription = async (audioBlob: Blob) => {
    try {
      const { text } = await sendAudioForTranscription(audioBlob);
      
      if (text?.trim()) {
        const newTranscription: Transcription = {
          text: text.trim(),
          timestamp: Date.now()
        };
        setTranscriptions(prev => [...prev, newTranscription]);
        setCurrentText(text.trim());
      }
    } catch (error) {
      console.error('Transcription error:', error);
      setState(prev => ({
        ...prev,
        error: 'Error transcribing audio. Please try again.'
      }));
    }
  };

  useEffect(() => {
    checkMicrophonePermission();
    return () => {
      if (mediaRecorderRef.current && state.isRecording) {
        stopRecording();
      }
    };
  }, []);

  return {
    isRecording: state.isRecording,
    error: state.error,
    hasMicPermission: state.hasMicPermission,
    currentText,
    transcriptions,
    startRecording,
    stopRecording,
    reset
  };
}; 