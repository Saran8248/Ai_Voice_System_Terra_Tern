import React, { useState, useRef } from 'react';
import { Mic, Square, Volume2 } from 'lucide-react';

const VoiceRecorder = ({ onAudioSubmit, isProcessing }) => {
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const startRecording = async () => {
    try {
      audioChunksRef.current = [];
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const audioFile = new File([audioBlob], 'recording.wav', { type: 'audio/wav' });
        onAudioSubmit(audioFile);
        
        // Stop all tracks on the stream to release mic
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (e) {
      console.error('Error opening microphone:', e);
      alert('Could not access microphone. Please verify permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '20px',
      padding: '30px',
      borderRadius: '20px',
      background: 'rgba(255, 255, 255, 0.02)',
      border: '1px solid var(--border-color)',
      maxWidth: '400px',
      margin: '0 auto',
      width: '100%'
    }}>
      <div style={{ fontSize: '15px', fontWeight: 550, color: 'var(--text-secondary)' }}>
        {isRecording ? 'Listening...' : isProcessing ? 'AI Agent is thinking...' : 'Press Mic to speak to Agent'}
      </div>

      <div style={{
        height: '60px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '6px'
      }}>
        {isRecording ? (
          <>
            <div className="voice-wave-bar"></div>
            <div className="voice-wave-bar"></div>
            <div className="voice-wave-bar"></div>
            <div className="voice-wave-bar"></div>
            <div className="voice-wave-bar"></div>
            <div className="voice-wave-bar"></div>
            <div className="voice-wave-bar"></div>
          </>
        ) : isProcessing ? (
          <div style={{ color: 'var(--accent-color)', fontSize: '14px' }}>Processing voice inputs...</div>
        ) : (
          <Volume2 size={24} style={{ color: 'var(--text-muted)' }} />
        )}
      </div>

      <button
        onClick={isRecording ? stopRecording : startRecording}
        disabled={isProcessing}
        style={{
          width: '74px',
          height: '74px',
          borderRadius: '50%',
          border: 'none',
          background: isRecording ? 'var(--error)' : 'var(--accent-gradient)',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: isProcessing ? 'not-allowed' : 'pointer',
          transition: 'var(--transition-smooth)',
          boxShadow: isRecording ? '0 0 20px rgba(239, 68, 68, 0.4)' : '0 4px 15px rgba(99, 102, 241, 0.3)'
        }}
        className={isRecording ? 'pulsing-record' : ''}
      >
        {isRecording ? <Square size={28} /> : <Mic size={28} />}
      </button>
    </div>
  );
};

export default VoiceRecorder;
