export const getMicrophoneStream = async () => {
  return navigator.mediaDevices.getUserMedia({
    audio: {
      echoCancellation: true,
      noiseSuppression: true,
      autoGainControl: true
    }
  });
};

export const createMediaRecorder = (stream: MediaStream): MediaRecorder => {
  return new MediaRecorder(stream, {
    mimeType: 'audio/webm'
  });
};

export const stopMediaStream = (stream: MediaStream) => {
  stream.getTracks().forEach(track => track.stop());
};

export const sendAudioForTranscription = async (audioBlob: Blob): Promise<{ text: string }> => {
  const formData = new FormData();
  formData.append('file', audioBlob, 'audio.webm');

  const response = await fetch('/api/transcribe', {
    method: 'POST',
    body: formData
  });

  if (!response.ok) {
    const error = await response.text();
    console.log("Transcription Failed", error);
  }

  return response.json();
}; 