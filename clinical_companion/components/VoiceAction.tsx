import React, { useState, useRef, useEffect } from 'react';

interface VoiceActionProps {
  onVoiceCapture: (audioBase64: string, transcript: string) => void;
  isProcessing: boolean;
  activeColor?: string;
}

const VoiceAction: React.FC<VoiceActionProps> = ({ onVoiceCapture, isProcessing, activeColor = 'bg-primary' }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState('');
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recognitionRef = useRef<any>(null);
  const isRecognitionActive = useRef(false);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;

      recognitionRef.current.onstart = () => {
        isRecognitionActive.current = true;
      };

      recognitionRef.current.onend = () => {
        isRecognitionActive.current = false;
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error("Speech Recognition Error", event.error);
        isRecognitionActive.current = false;
      };

      recognitionRef.current.onresult = (event: any) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            setInterimTranscript(event.results[i][0].transcript);
          }
        }
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const startRecording = async () => {
    if (isProcessing || isRecording) return;
    audioChunksRef.current = [];
    setInterimTranscript('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = () => {
          const base64Audio = (reader.result as string).split(',')[1];
          onVoiceCapture(base64Audio, interimTranscript);
        };
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);

      if (recognitionRef.current && !isRecognitionActive.current) {
        try {
          recognitionRef.current.start();
        } catch (e) {
          console.warn("SpeechRecognition start failed:", e);
        }
      }
    } catch (err) {
      console.error("Failed to start recording", err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }

    setIsRecording(false);

    if (recognitionRef.current && isRecognitionActive.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        console.warn("SpeechRecognition stop failed:", e);
      }
    }
  };

  const handleMouseLeave = () => {
    if (isRecording) stopRecording();
  };

  return (
    <div className="relative flex items-center">
      {isRecording && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 w-[92%] max-w-lg bg-surface/95 backdrop-blur-2xl rounded-2xl shadow-2xl border border-danger/20 p-6 animate-in fade-in zoom-in-95 slide-in-from-bottom-6 duration-300 z-50">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex gap-1.5 items-center">
              <span className="w-1.5 h-4 bg-danger rounded-full animate-[pulse_1.5s_ease-in-out_infinite]"></span>
              <span className="w-1.5 h-6 bg-danger/80 rounded-full animate-[pulse_1.5s_ease-in-out_infinite_0.2s]"></span>
              <span className="w-1.5 h-4 bg-danger/60 rounded-full animate-[pulse_1.5s_ease-in-out_infinite_0.4s]"></span>
            </div>
            <span className="text-[10px] font-black text-danger uppercase tracking-[0.2em]">Voice Mode Active</span>
          </div>
          <p className="text-text-primary text-xl font-bold leading-tight tracking-tight">
            {interimTranscript || "Speak naturally now..."}
          </p>
        </div>
      )}

      <button
        disabled={isProcessing}
        onMouseDown={startRecording}
        onMouseUp={stopRecording}
        onMouseLeave={handleMouseLeave}
        onTouchStart={startRecording}
        onTouchEnd={stopRecording}
        className={`
          w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 transform active:scale-90
          ${isProcessing ? 'bg-black/5 dark:bg-white/5 border border-border cursor-not-allowed text-text-secondary/50' : isRecording ? 'bg-danger text-white scale-125 ring-8 ring-danger/20' : `${activeColor} text-white shadow-[0_4px_15px_rgba(59,130,246,0.3)] hover:brightness-110 active:brightness-90`}
        `}
      >
        {isProcessing ? (
          <i className="fa-solid fa-spinner fa-spin text-xs"></i>
        ) : isRecording ? (
          <i className="fa-solid fa-stop text-xs"></i>
        ) : (
          <i className="fa-solid fa-microphone text-xs"></i>
        )}
      </button>
    </div>
  );
};

export default VoiceAction;
