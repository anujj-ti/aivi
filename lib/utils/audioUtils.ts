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

  const responseData = await response.text();
  
  if (!response.ok) {
    console.log("Transcription Failed", responseData);
    // throw new Error(`Transcription failed: ${responseData}`);
  }

  try {
    return JSON.parse(responseData);
  } catch (error) {
    console.error("Failed to parse response as JSON:", error);
    throw new Error("Invalid response format from transcription service");
  }
}; 