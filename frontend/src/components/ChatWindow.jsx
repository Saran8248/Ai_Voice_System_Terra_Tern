import React, { useRef, useEffect } from 'react';
import { Send, Cpu } from 'lucide-react';

const ChatWindow = ({ messages, currentInput, setCurrentInput, onSendMessage, isSending }) => {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (currentInput.trim()) {
      onSendMessage(currentInput);
    }
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      background: 'rgba(255, 255, 255, 0.01)',
      borderRadius: '16px',
      border: '1px solid var(--border-color)',
      overflow: 'hidden'
    }}>
      {/* Messages Header */}
      <div style={{
        padding: '16px 20px',
        borderBottom: '1px solid var(--border-color)',
        fontSize: '14px',
        color: 'var(--text-secondary)',
        fontWeight: 550,
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}>
        <Cpu size={16} /> Conversation Logs
      </div>

      {/* Messages List */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px'
      }}>
        {messages.length === 0 ? (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            color: 'var(--text-muted)',
            fontSize: '14px'
          }}>
            No conversation logs yet. Speak or type to start.
          </div>
        ) : (
          messages.map((msg, i) => (
            <div
              key={i}
              style={{
                alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                maxWidth: '80%',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px'
              }}
            >
              <div style={{
                background: msg.sender === 'user' ? 'var(--accent-color)' : 'var(--bg-tertiary)',
                color: 'white',
                padding: '12px 16px',
                borderRadius: msg.sender === 'user' ? '16px 16px 2px 16px' : '16px 16px 16px 2px',
                fontSize: '14px',
                lineHeight: 1.5,
                border: msg.sender === 'assistant' ? '1px solid var(--border-color)' : 'none'
              }}>
                {msg.text_content}
              </div>
              <div style={{
                fontSize: '10px',
                color: 'var(--text-muted)',
                alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                display: 'flex',
                gap: '8px'
              }}>
                <span>{msg.sender === 'user' ? 'You' : 'AI'}</span>
                {msg.latency_ms && (
                  <span style={{ color: 'var(--success)' }}>({msg.latency_ms}ms latency)</span>
                )}
              </div>
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input Box */}
      <form 
        onSubmit={handleSubmit}
        style={{
          padding: '16px',
          borderTop: '1px solid var(--border-color)',
          display: 'flex',
          gap: '10px'
        }}
      >
        <input
          type="text"
          value={currentInput}
          onChange={(e) => setCurrentInput(e.target.value)}
          placeholder="Type your message..."
          disabled={isSending}
          style={{
            flex: 1,
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
            borderRadius: '10px',
            color: 'white',
            padding: '12px 16px',
            fontSize: '14px',
            outline: 'none',
            transition: 'var(--transition-smooth)'
          }}
        />
        <button
          type="submit"
          disabled={isSending || !currentInput.trim()}
          style={{
            background: 'var(--accent-color)',
            color: 'white',
            border: 'none',
            width: '44px',
            height: '44px',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            opacity: (!currentInput.trim() || isSending) ? 0.5 : 1
          }}
        >
          <Send size={18} />
        </button>
      </form>
    </div>
  );
};

export default ChatWindow;
