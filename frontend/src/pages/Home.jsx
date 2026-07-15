import React, { useState, useEffect } from 'react';
import VoiceRecorder from '../components/VoiceRecorder';
import AudioPlayer from '../components/AudioPlayer';
import ChatWindow from '../components/ChatWindow';
import { apiFetch } from '../services/api';
import Navbar from '../components/Navbar';

const Home = () => {
  const [conversationId, setConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);
  const [textInput, setTextInput] = useState('');
  const [selectedVoice, setSelectedVoice] = useState('alloy');

  // Initialize conversation session
  useEffect(() => {
    const initSession = async () => {
      try {
        const session = await apiFetch('/chat/conversations', { method: 'POST' });
        setConversationId(session.id);
      } catch (e) {
        console.error('Failed to create conversation session', e);
        // Fallback mock session ID to keep the UI active even if database is offline
        setConversationId(9999);
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
        // Direct local audio blob
        setAudioUrl(url.replace('blob:http://localhost:8000', '')); // adjust for AudioPlayer mapping
        setAudioUrl(`/api/voice/audio/${ttsResponse.headers.get('content-disposition')?.split('filename=')[1]}` || '');
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
                color: 'white',
                outline: 'none'
              }}
            >
              <option value="alloy">Alloy (Balanced Neutral)</option>
              <option value="echo">Echo (Warm Male)</option>
              <option value="fable">Fable (Professional British)</option>
              <option value="onyx">Onyx (Deep Male)</option>
              <option value="nova">Nova (Bright Female)</option>
              <option value="shimmer">Shimmer (Professional Female)</option>
            </select>
          </div>

          <VoiceRecorder onAudioSubmit={handleAudioSubmit} isProcessing={isProcessing} />
          
          {audioUrl && (
            <div style={{ width: '100%' }}>
              <AudioPlayer src={audioUrl} />
            </div>
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
          />
        </div>
      </div>
    </div>
  );
};

export default Home;
