import { useState, useRef, useEffect, useCallback } from 'react';
import { Transcription, AudioRecorderState } from '../types/audio';
import { getMicrophoneStream, createMediaRecorder, stopMediaStream, sendAudioForTranscription } from '../utils/audioUtils';

export const useAudioRecorder = () => {
  // Constants for audio analysis
  const START_SPEAKING_THRESHOLD = 15;
  const STOP_SPEAKING_THRESHOLD = 9;
  const MAX_SILENCE_FRAMES = 10;

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
  const activeRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const frameCountRef = useRef<number>(0);
  const silenceCountRef = useRef<number>(0);
  const isRecordingRef = useRef<boolean>(false);
  const isSpeakingRef = useRef<boolean>(false);
  const streamRef = useRef<MediaStream | null>(null);

  // Update ref when state changes
  useEffect(() => {
    isSpeakingRef.current = isSpeaking;
  }, [isSpeaking]);

  const reset = useCallback(() => {
    setCurrentText('');
    setTranscriptions([]);
    setIsSpeaking(false);
    isSpeakingRef.current = false;
    setAudioLevel(0);
    frameCountRef.current = 0;
    silenceCountRef.current = MAX_SILENCE_FRAMES;
    isRecordingRef.current = false;
  }, []);

  const startSegmentRecording = useCallback(() => {
    if (!streamRef.current || !isRecordingRef.current) return;
    
    const recorder = createMediaRecorder(streamRef.current);
    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        chunksRef.current.push(event.data);
        console.log(`Recorded chunk: ${event.data.size} bytes`);
      }
    };
    
    activeRecorderRef.current = recorder;
    recorder.start(1000);
    console.log('Started segment recording');
  }, []);

  const stopSegmentRecording = useCallback(async () => {
    if (!activeRecorderRef.current) return;
    
    const currentRecorder = activeRecorderRef.current;
    activeRecorderRef.current = null;

    return new Promise<void>((resolve) => {
      currentRecorder.onstop = async () => {
        try {
          if (chunksRef.current.length > 0) {
            // Validate chunks before creating blob
            const validChunks = chunksRef.current.filter(chunk => 
              chunk instanceof Blob && chunk.size > 0 && chunk.type.includes('webm')
            );

            if (validChunks.length === 0) {
              console.log('No valid audio chunks found, skipping transcription');
              chunksRef.current = [];
              resolve();
              return;
            }

            // Calculate total audio size
            const totalSize = validChunks.reduce((sum, chunk) => sum + chunk.size, 0);
            
            // Minimum size threshold (approximately 0.2 seconds of audio)
            // WebM opus typically uses ~32kbps, so 0.2s ≈ 800 bytes
            const MIN_AUDIO_SIZE = 800;

            if (totalSize < MIN_AUDIO_SIZE) {
              console.log(`Audio too short (${totalSize} bytes), skipping transcription`);
              chunksRef.current = [];
              resolve();
              return;
            }

            // Create blob with explicit MIME type
            const audioBlob = new Blob(validChunks, { 
              type: 'audio/webm;codecs=opus'
            });
            
            // Verify the blob
            if (!audioBlob || audioBlob.size === 0) {
              console.log('Created blob is invalid, skipping transcription');
              chunksRef.current = [];
              resolve();
              return;
            }

            // Process audio if it meets all criteria
            await processTranscription(audioBlob);
          }
        } catch (error) {
          console.error('Error processing audio segment:', error);
        } finally {
          chunksRef.current = [];
          resolve();
        }
      };

      try {
        currentRecorder.stop();
      } catch (error) {
        console.error('Error stopping recorder:', error);
        resolve();
      }
    });
  }, []);

  const detectSpeaking = useCallback((dataArray: Uint8Array) => {
    try {
      // Calculate RMS (Root Mean Square) value of the frequency data
      const rms = Math.sqrt(
        dataArray.reduce((acc, val) => acc + (val * val), 0) / dataArray.length
      );
      
      // Update silence counter based on current level
      if (rms <= STOP_SPEAKING_THRESHOLD) {
        silenceCountRef.current = Math.min(silenceCountRef.current + 1, MAX_SILENCE_FRAMES);
      } else {
        silenceCountRef.current = Math.max(silenceCountRef.current - 2, 0); // Faster decrease when sound detected
      }

      // Determine speaking state with hysteresis
      const shouldBeginSpeaking = rms > START_SPEAKING_THRESHOLD;
      const shouldContinueSpeaking = rms > STOP_SPEAKING_THRESHOLD;
      
      // Update speaking state using ref for current state
      if (!isSpeakingRef.current && shouldBeginSpeaking) {
        // Start speaking when volume is high enough
        console.log(`Speech detected - Starting speaking state (Level: ${rms.toFixed(2)}, Max: ${Math.max(...dataArray)})`);
        setIsSpeaking(true);
        isSpeakingRef.current = true;
        silenceCountRef.current = 0;
        // Start new recording segment when speech begins
        if (isRecordingRef.current && !activeRecorderRef.current) {
          startSegmentRecording();
        }
      } 
      else if (isSpeakingRef.current && !shouldContinueSpeaking) {
        // Increment silence counter when volume drops
        if (silenceCountRef.current >= MAX_SILENCE_FRAMES) {
          // Stop speaking after enough silence frames
          console.log(
            `Silence detected - Ending speaking state ` +
            `(Level: ${rms.toFixed(2)}, ` +
            `Max: ${Math.max(...dataArray)}, ` +
            `Silence Frames: ${silenceCountRef.current}/${MAX_SILENCE_FRAMES})`
          );
          setIsSpeaking(false);
          isSpeakingRef.current = false;
          // Stop and process current recording segment
          if (activeRecorderRef.current) {
            stopSegmentRecording();
          }
        } else {
          // Log potential silence
          console.log(
            `Potential silence while speaking - ` +
            `Frame ${silenceCountRef.current}/${MAX_SILENCE_FRAMES} ` +
            `(Level: ${rms.toFixed(2)})`
          );
        }
      }
      else if (isSpeakingRef.current && shouldContinueSpeaking) {
        // Reset silence counter when speaking continues
        silenceCountRef.current = 0;
      }

      setAudioLevel(rms);
      
      // Log more frequently during initial setup (first 100 frames)
      if (frameCountRef.current < 100 || frameCountRef.current % 30 === 0) {
        console.log(
          `Audio Analysis [Frame ${frameCountRef.current}] - ` +
          `RMS: ${rms.toFixed(2)}, ` +
          `Start Threshold: ${START_SPEAKING_THRESHOLD}, ` +
          `Stop Threshold: ${STOP_SPEAKING_THRESHOLD}, ` +
          `Should Begin: ${shouldBeginSpeaking}, ` +
          `Should Continue: ${shouldContinueSpeaking}, ` +
          `Current State: ${isSpeakingRef.current}, ` +
          `Silence Frames: ${silenceCountRef.current}/${MAX_SILENCE_FRAMES}, ` +
          `Max Value: ${Math.max(...dataArray)}`
        );
      }
      frameCountRef.current++;

    } catch (error) {
      console.error('Error in detectSpeaking:', error);
    }
  }, [startSegmentRecording, stopSegmentRecording]);

  const startRecording = async () => {
    try {
      if (!state.hasMicPermission) {
        await checkMicrophonePermission();
        if (!state.hasMicPermission) return;
      }

      console.log('Starting recording and audio analysis');
      const stream = await getMicrophoneStream();
      streamRef.current = stream;
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
      silenceCountRef.current = MAX_SILENCE_FRAMES;
      setAudioLevel(0);
      setIsSpeaking(false);
      isRecordingRef.current = true;
      
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

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

  const stopRecording = useCallback(async () => {
    if (mediaRecorderRef.current && state.isRecording) {
      isRecordingRef.current = false;
      
      // Stop current segment if any
      if (activeRecorderRef.current) {
        await stopSegmentRecording();
      }
      
      stopMediaStream(mediaRecorderRef.current.stream);
      
      // Clean up audio analysis
      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
        analyserRef.current = null;
      }
      
      setIsSpeaking(false);
      setAudioLevel(0);
      
      setState(prev => ({ ...prev, isRecording: false }));
    }
  }, [state.isRecording, stopSegmentRecording]);

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
  }, [state.isRecording, stopRecording]);

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