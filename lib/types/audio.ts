export interface Transcription {
  text: string;
  timestamp: number;
}

export interface AudioRecorderState {
  isRecording: boolean;
  error: string | null;
  hasMicPermission: boolean;
}

export interface TranscriptionResponse {
  text: string;
  error?: string;
} 