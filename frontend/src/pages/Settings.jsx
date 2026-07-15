import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import { Save, ShieldAlert, Sliders, Volume2, KeyRound } from 'lucide-react';

const Settings = () => {
  const [apiKey, setApiKey] = useState('');
  const [systemPrompt, setSystemPrompt] = useState(
    "You are a helpful AI Voice Agent representing our company. Use the following document context to answer the user's questions truthfully and concisely."
  );
  const [voiceModel, setVoiceModel] = useState('tts-1');
  const [temperature, setTemperature] = useState(0.7);

  const handleSave = (e) => {
    e.preventDefault();
    alert('Settings successfully updated! (System parameters saved locally)');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Navbar title="AI Voice Agent - System & API Settings" />

      <form onSubmit={handleSave} style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '32px', maxWidth: '800px' }}>
        
        {/* API keys section */}
        <div className="glass-panel" style={{ padding: '30px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <KeyRound size={18} style={{ color: 'var(--accent-color)' }} /> API Integrations
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 550 }}>OpenAI API Key</label>
            <input
              type="password"
              placeholder="sk-..."
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              style={{
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                padding: '12px',
                color: 'white',
                outline: 'none',
                fontSize: '14px'
              }}
            />
            <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              Provide your API key to activate production-grade speech-to-text, text-to-speech, and vector embedding.
            </p>
          </div>
        </div>

        {/* Prompt Settings */}
        <div className="glass-panel" style={{ padding: '30px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sliders size={18} style={{ color: 'var(--accent-color)' }} /> LLM & RAG Agent Prompt
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 550 }}>System Instruction Message</label>
            <textarea
              rows={4}
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              style={{
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                padding: '12px',
                color: 'white',
                outline: 'none',
                fontSize: '14px',
                lineHeight: 1.4,
                resize: 'none'
              }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 550 }}>Voice Synthesis Engine</label>
              <select
                value={voiceModel}
                onChange={(e) => setVoiceModel(e.target.value)}
                style={{
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  padding: '12px',
                  color: 'white',
                  outline: 'none'
                }}
              >
                <option value="tts-1">OpenAI TTS-1 (Standard)</option>
                <option value="tts-1-hd">OpenAI TTS-1-HD (High Fidelity)</option>
              </select>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 550 }}>LLM Temperature ({temperature})</label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={temperature}
                onChange={(e) => setTemperature(parseFloat(e.target.value))}
                style={{ height: '38px', accentColor: 'var(--accent-color)' }}
              />
            </div>
          </div>
        </div>

        <button type="submit" className="btn-primary" style={{ alignSelf: 'flex-start' }}>
          <Save size={18} /> Save Settings
        </button>

      </form>
    </div>
  );
};

export default Settings;
