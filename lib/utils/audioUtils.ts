export const getMicrophoneStream = async () => {
  return navigator.mediaDevices.getUserMedia({
    audio: {
      echoCancellation: true,
      noiseSuppression: true,
      autoGainControl: true
    }
  });
};

// Get the most suitable MIME type for audio recording
const getSupportedMimeType = (): string => {
  const types = [
    'audio/webm;codecs=opus',
    'audio/webm',
    'audio/ogg;codecs=opus',
    'audio/ogg',
    'audio/mp4'
  ];
  
  for (const type of types) {
    if (MediaRecorder.isTypeSupported(type)) {
      console.log(`Using MIME type: ${type}`);
      return type;
    }
  }
  
  console.warn('No preferred MIME types supported, falling back to default');
  return '';  // Let the browser choose its default
};

export const createMediaRecorder = (stream: MediaStream): MediaRecorder => {
  const mimeType = getSupportedMimeType();
  const options: MediaRecorderOptions = {
    mimeType,
    audioBitsPerSecond: 128000  // 128 kbps for good quality
  };
  
  const recorder = new MediaRecorder(stream, options);
  console.log(`Created MediaRecorder with options:`, options);
  return recorder;
};

export const stopMediaStream = (stream: MediaStream) => {
  stream.getTracks().forEach(track => track.stop());
};

export const sendAudioForTranscription = async (audioBlob: Blob): Promise<{ text: string }> => {
  try {
    // Get the file extension based on the blob type
    let fileExtension = 'webm';
    if (audioBlob.type.includes('mp4')) {
      fileExtension = 'mp4';
    } else if (audioBlob.type.includes('ogg')) {
      fileExtension = 'ogg';
    }

    const formData = new FormData();
    formData.append('file', audioBlob, `audio.${fileExtension}`);
    console.log(`Sending audio file with type: ${audioBlob.type} as ${fileExtension}`);

    const response = await fetch('/api/transcribe', {
      method: 'POST',
      body: formData
    });

    const responseData = await response.text();
    
    if (!response.ok) {
      console.log("Transcription error details:", {
        status: response.status,
        responseText: responseData,
        audioType: audioBlob.type,
        audioSize: audioBlob.size
      });
      // Return empty text instead of throwing
      return { text: '' };
    }

    const parsedData = JSON.parse(responseData);
    return parsedData;
  } catch (error) {
    console.log("Transcription processing error:", error);
    // Return empty text for any errors
    return { text: '' };
  }
}; 