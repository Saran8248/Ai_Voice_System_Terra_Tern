import React, { useState, useEffect } from 'react';
import VoiceRecorder from '../components/VoiceRecorder';
import AudioPlayer from '../components/AudioPlayer';
import ChatWindow from '../components/ChatWindow';
import { apiFetch } from '../services/api';
import Navbar from '../components/Navbar';

const Home = () => {
  const [conversationId, setConversationId] = useState(null);
  const [messages, setMessages] = useState(() => {
    try {
      const saved = localStorage.getItem('terra_tern_messages');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);
  const [textInput, setTextInput] = useState('');
  const [selectedVoice, setSelectedVoice] = useState('echo');

  // Save messages to localStorage when updated
  useEffect(() => {
    if (messages) {
      localStorage.setItem('terra_tern_messages', JSON.stringify(messages));
    }
  }, [messages]);

  const [countdown, setCountdown] = useState(null);

  const checkEndConversation = (text) => {
    const textLower = text.toLowerCase();
    if (textLower.includes("thank you for contacting terra tern") || textLower.includes("have a great day") || textLower.includes("goodbye")) {
      setCountdown(5);
    }
  };

  const handleResetConversation = async () => {
    setCountdown(null);
    setMessages([]);
    localStorage.removeItem('terra_tern_messages');
    localStorage.removeItem('terra_tern_session_id');
    try {
      const session = await apiFetch('/chat/conversations', { method: 'POST' });
      setConversationId(session.id);
      localStorage.setItem('terra_tern_session_id', session.id);
    } catch (e) {
      setConversationId(9999);
      localStorage.setItem('terra_tern_session_id', '9999');
    }
  };

  // Handle auto-clear countdown
  useEffect(() => {
    if (countdown === null) return;
    if (countdown === 0) {
      handleResetConversation();
      return;
    }

    const timer = setTimeout(() => {
      setCountdown(prev => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [countdown]);

  // Initialize conversation session
  useEffect(() => {
    const initSession = async () => {
      const savedSessionId = localStorage.getItem('terra_tern_session_id');
      if (savedSessionId) {
        setConversationId(parseInt(savedSessionId));
        return;
      }
      try {
        const session = await apiFetch('/chat/conversations', { method: 'POST' });
        setConversationId(session.id);
        localStorage.setItem('terra_tern_session_id', session.id);
      } catch (e) {
        console.error('Failed to create conversation session', e);
        // Fallback mock session ID to keep the UI active even if database is offline
        setConversationId(9999);
        localStorage.setItem('terra_tern_session_id', '9999');
      }
    };
    initSession();
  }, []);

  const handleAudioSubmit = async (audioFile) => {
    if (!conversationId) return;
    setIsProcessing(true);
    setAudioUrl(null);

    const formData = new FormData();
    formData.append('conversation_id', conversationId);
    formData.append('file', audioFile);
    formData.append('voice', selectedVoice);

    try {
      const data = await apiFetch('/voice/interact', {
        method: 'POST',
        body: formData,
      });

      // Update message history
      setMessages((prev) => [
        ...prev,
        { sender: 'user', text_content: data.transcription },
        { sender: 'assistant', text_content: data.response, latency_ms: data.latency_ms }
      ]);

      if (data.response) {
        checkEndConversation(data.response);
      }

      // Set audio path to trigger autoplay
      if (data.audio_url) {
        setAudioUrl(data.audio_url);
      }
    } catch (e) {
      console.error('Error submitting audio', e);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSendMessage = async (text) => {
    if (!conversationId) return;
    setIsProcessing(true);
    setTextInput('');

    try {
      const data = await apiFetch(`/chat/message?conversation_id=${conversationId}&text_content=${encodeURIComponent(text)}`, {
        method: 'POST',
      });

      setMessages((prev) => [
        ...prev,
        data.user_message,
        data.assistant_message
      ]);

      if (data.assistant_message?.text_content) {
        checkEndConversation(data.assistant_message.text_content);
      }

      // Check if we should trigger TTS on manual text submit
      const ttsForm = new FormData();
      ttsForm.append('text', data.assistant_message.text_content);
      ttsForm.append('voice', selectedVoice);

      const ttsResponse = await fetch('http://localhost:8000/api/voice/text-to-speech', {
        method: 'POST',
        body: ttsForm
      });
      if (ttsResponse.ok) {
        const blob = await ttsResponse.blob();
        const url = URL.createObjectURL(blob);
        const contentDisp = ttsResponse.headers.get('content-disposition');
        const filename = contentDisp ? contentDisp.split('filename=')[1]?.replace(/['"]/g, '') : null;
        if (filename) {
          setAudioUrl(`/api/voice/audio/${filename}`);
        } else {
          setAudioUrl(url);
        }
      }
    } catch (e) {
      console.error('Error sending message', e);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Navbar title="AI Voice Agent - Live Console" />

      <div style={{
        padding: '32px',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '32px',
        flex: 1,
        overflow: 'hidden'
      }}>
        {/* Left Side: Recording Console */}
        <div className="glass-panel" style={{
          padding: '40px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '24px'
        }}>
          <div style={{ textAlign: 'center' }}>
            <h1 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '8px', background: 'var(--accent-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Interact with Agent
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
              Your audio response will stream automatically.
            </p>
          </div>

          <div style={{ width: '100%', maxWidth: '280px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>Select Voice Accent</label>
            <select
              value={selectedVoice}
              onChange={(e) => setSelectedVoice(e.target.value)}
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '8px',
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-primary)',
                outline: 'none'
              }}
            >
              <option value="echo">Male Voice</option>
              <option value="nova">Female Voice</option>
            </select>
          </div>

          <VoiceRecorder onAudioSubmit={handleAudioSubmit} isProcessing={isProcessing} />
          
          {audioUrl && (
            <div style={{ width: '100%' }}>
              <AudioPlayer 
                src={audioUrl} 
                text={messages.slice().reverse().find(m => m.sender === 'assistant' || m.sender === 'system')?.text_content} 
              />
            </div>
          )}

          {countdown !== null && (
            <div style={{
              background: 'rgba(239, 68, 68, 0.08)',
              border: '1px solid var(--error)',
              borderRadius: '12px',
              padding: '12px 20px',
              color: 'var(--error)',
              fontSize: '13px',
              fontWeight: 600,
              textAlign: 'center',
              width: '100%',
              maxWidth: '280px',
              marginTop: '10px',
              animation: 'pulse 1.5s infinite'
            }}>
              Call Completed. Resetting in {countdown}s...
            </div>
          )}

          {messages.length > 0 && (
            <button
              type="button"
              onClick={handleResetConversation}
              className="btn-secondary"
              style={{
                width: '100%',
                maxWidth: '280px',
                padding: '10px 20px',
                borderRadius: '10px',
                fontSize: '13px',
                fontWeight: 600,
                textAlign: 'center',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                marginTop: '10px'
              }}
            >
              Reset Conversation
            </button>
          )}
        </div>

        {/* Right Side: Chat and Logs Window */}
        <div style={{ height: '100%' }}>
          <ChatWindow
            messages={messages}
            currentInput={textInput}
            setCurrentInput={setTextInput}
            onSendMessage={handleSendMessage}
            isSending={isProcessing}
            onClear={handleResetConversation}
          />
        </div>
      </div>
    </div>
  );
};

export default Home;
