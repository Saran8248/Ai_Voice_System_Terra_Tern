import React, { useEffect, useRef, useState } from 'react';
import { Play, Pause, VolumeX, Volume2 } from 'lucide-react';

const AudioPlayer = ({ src }) => {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    if (src) {
      setIsPlaying(true);
      // Auto-play when a new source arrives
      if (audioRef.current) {
        audioRef.current.load();
        audioRef.current.play().catch(e => {
          console.log('Autoplay blocked or failed:', e);
          setIsPlaying(false);
        });
      }
    }
  }, [src]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    audioRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  if (!src) return null;

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '12px 20px',
      background: 'rgba(99, 102, 241, 0.08)',
      border: '1px solid rgba(99, 102, 241, 0.2)',
      borderRadius: '12px',
      width: '100%',
      maxWidth: '400px',
      margin: '10px auto'
    }}>
      <audio
        ref={audioRef}
        src={`http://localhost:8000${src}`}
        onEnded={() => setIsPlaying(false)}
        onError={() => setIsPlaying(false)}
      />

      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <button
          onClick={togglePlay}
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            border: 'none',
            background: 'var(--accent-color)',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer'
          }}
        >
          {isPlaying ? <Pause size={14} /> : <Play size={14} />}
        </button>
        <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
          {isPlaying ? 'Playing AI Response' : 'Audio Response Loaded'}
        </span>
      </div>

      <button
        onClick={toggleMute}
        style={{
          background: 'transparent',
          border: 'none',
          color: 'var(--text-secondary)',
          cursor: 'pointer'
        }}
      >
        {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
      </button>
    </div>
  );
};

export default AudioPlayer;
