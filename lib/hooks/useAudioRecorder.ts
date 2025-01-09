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
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const frameCountRef = useRef<number>(0);
  const silenceCountRef = useRef<number>(0);
  const isRecordingRef = useRef<boolean>(false);

  const reset = useCallback(() => {
    setCurrentText('');
    setTranscriptions([]);
    setIsSpeaking(false);
    setAudioLevel(0);
    frameCountRef.current = 0;
    silenceCountRef.current = 0;
    isRecordingRef.current = false;
  }, []);

  const detectSpeaking = useCallback((dataArray: Uint8Array) => {
    try {
      // Calculate RMS (Root Mean Square) value of the frequency data
      const rms = Math.sqrt(
        dataArray.reduce((acc, val) => acc + (val * val), 0) / dataArray.length
      );
      
      // Lower threshold and adjust silence detection
      const SPEAKING_THRESHOLD = 5;
      const MAX_SILENCE_FRAMES = 3;
      
      const isSpeakingNow = rms > SPEAKING_THRESHOLD;
      setAudioLevel(rms);
      
      // Log more frequently during initial setup (first 100 frames)
      if (frameCountRef.current < 100 || frameCountRef.current % 30 === 0) {
        console.log(
          `Audio Analysis [Frame ${frameCountRef.current}] - ` +
          `RMS: ${rms.toFixed(2)}, ` +
          `Threshold: ${SPEAKING_THRESHOLD}, ` +
          `Speaking: ${isSpeakingNow}, ` +
          `Silence Frames: ${silenceCountRef.current}, ` +
          `Max Value: ${Math.max(...dataArray)}, ` +
          `Is Recording: ${isRecordingRef.current}`
        );
      }
      frameCountRef.current++;

      if (isSpeakingNow) {
        silenceCountRef.current = 0;
        if (!isSpeaking) {
          console.log(`Speech detected - Starting speaking state (Level: ${rms.toFixed(2)}, Max: ${Math.max(...dataArray)})`);
          setIsSpeaking(true);
        }
      } else {
        silenceCountRef.current++;
        if (silenceCountRef.current >= MAX_SILENCE_FRAMES && isSpeaking) {
          console.log(`Silence detected - Ending speaking state (Level: ${rms.toFixed(2)}, Max: ${Math.max(...dataArray)})`);
          setIsSpeaking(false);
          silenceCountRef.current = 0;
        }
      }
    } catch (error) {
      console.error('Error in detectSpeaking:', error);
    }
  }, [isSpeaking]);

  const startRecording = async () => {
    try {
      if (!state.hasMicPermission) {
        await checkMicrophonePermission();
        if (!state.hasMicPermission) return;
      }

      console.log('Starting recording and audio analysis');
      const stream = await getMicrophoneStream();
      console.log('Got microphone stream successfully');
      
      const mediaRecorder = createMediaRecorder(stream);
      console.log('Created media recorder');
      
      // Set up audio analysis
      audioContextRef.current = new AudioContext();
      analyserRef.current = audioContextRef.current.createAnalyser();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);
      console.log('Audio analysis setup complete');
      
      // Configure analyser with more sensitive settings
      analyserRef.current.fftSize = 1024;
      analyserRef.current.smoothingTimeConstant = 0.3;
      analyserRef.current.minDecibels = -90;
      analyserRef.current.maxDecibels = -10;
      const bufferLength = analyserRef.current.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      console.log(`Analyzer configured: FFT size=${analyserRef.current.fftSize}, Buffer length=${bufferLength}`);

      // Reset counters and state
      frameCountRef.current = 0;
      silenceCountRef.current = 0;
      setAudioLevel(0);
      setIsSpeaking(false);
      isRecordingRef.current = true;

      // Start audio analysis loop
      const analyzeAudio = () => {
        if (!analyserRef.current) {
          console.log('Audio analysis stopped - no analyzer');
          return;
        }
        
        if (!isRecordingRef.current) {
          console.log('Audio analysis stopped - not recording');
          return;
        }

        try {
          analyserRef.current.getByteFrequencyData(dataArray);
          detectSpeaking(dataArray);
          
          // Continue the loop
          requestAnimationFrame(analyzeAudio);
        } catch (error) {
          console.error('Error in audio analysis:', error);
        }
      };
      
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
          console.log(`Recorded chunk: ${event.data.size} bytes`);
        }
      };

      // Start recording first
      mediaRecorder.start(1000);
      setState(prev => ({ ...prev, isRecording: true, error: null }));
      
      // Then start analysis loop
      console.log('Starting audio analysis loop');
      requestAnimationFrame(analyzeAudio);
      console.log('Recording and analysis started successfully');

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
      isRecordingRef.current = false;
      mediaRecorderRef.current.stop();
      stopMediaStream(mediaRecorderRef.current.stream);
      
      // Clean up audio analysis
      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
        analyserRef.current = null;
      }
      
      setIsSpeaking(false);
      setAudioLevel(0);
      
      if (chunksRef.current.length > 0) {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/mp4' });
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
    isSpeaking,
    audioLevel,
    startRecording,
    stopRecording,
    reset
  };
}; 