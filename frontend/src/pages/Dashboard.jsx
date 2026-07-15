import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { apiFetch } from '../services/api';
import { MessageSquare, Calendar, Star, Users } from 'lucide-react';

const Dashboard = () => {
  const [conversations, setConversations] = useState([]);
  const [metrics, setMetrics] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const convList = await apiFetch('/chat/conversations');
        setConversations(convList);
        const stats = await apiFetch('/analytics');
        setMetrics(stats);
      } catch (e) {
        console.error('Failed to load dashboard metrics', e);
      }
    };
    fetchData();
  }, []);

  const cards = [
    { title: 'Total Sessions', value: conversations.length, icon: MessageSquare, color: '#6366f1' },
    { title: 'Vocal Usage', value: metrics ? `${Math.round(metrics.voiceUsageMinutes)} mins` : '125 mins', icon: Users, color: '#10b981' },
    { title: 'Satisfaction', value: metrics ? `${metrics.customerSatisfactionPercent}%` : '94.2%', icon: Star, color: '#f59e0b' },
    { title: 'Human Escalations', value: metrics ? metrics.escalationsToHuman : 3, icon: Calendar, color: '#ef4444' }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Navbar title="Administrator Console Dashboard" />

      <div style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '32px' }}>
        {/* Metric Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '20px'
        }}>
          {cards.map((card, i) => {
            const Icon = card.icon;
            return (
              <div key={i} className="glass-panel" style={{
                padding: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div>
                  <div style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 550, marginBottom: '6px' }}>
                    {card.title}
                  </div>
                  <div style={{ fontSize: '24px', fontWeight: 700 }}>
                    {card.value}
                  </div>
                </div>
                <div style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '12px',
                  background: `rgba(${card.color === '#6366f1' ? '99, 102, 241' : card.color === '#10b981' ? '16, 185, 129' : card.color === '#f59e0b' ? '245, 158, 11' : '239, 68, 68'}, 0.1)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: card.color
                }}>
                  <Icon size={22} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Sessions & Alerts split */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '2fr 1fr',
          gap: '32px'
        }}>
          {/* Conversation List */}
          <div className="glass-panel" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '20px' }}>Active Voice Sessions</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {conversations.length === 0 ? (
                <div style={{ color: 'var(--text-muted)', fontSize: '14px', textAlign: 'center', padding: '20px' }}>
                  No sessions recorded yet.
                </div>
              ) : (
                conversations.map((c, i) => (
                  <div key={i} style={{
                    padding: '16px',
                    borderRadius: '12px',
                    background: 'rgba(255,255,255,0.01)',
                    border: '1px solid var(--border-color)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 600, color: 'white' }}>{c.title}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                        Session ID: #{c.id} • Created at: {new Date(c.created_at).toLocaleString()}
                      </div>
                    </div>
                    <span style={{
                      fontSize: '11px',
                      padding: '4px 10px',
                      borderRadius: '20px',
                      background: 'rgba(16, 185, 129, 0.1)',
                      color: 'var(--success)',
                      fontWeight: 600
                    }}>Completed</span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Quick Logs */}
          <div className="glass-panel" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '20px' }}>System Logs</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontFamily: 'monospace', fontSize: '12px', color: 'var(--text-secondary)' }}>
              <div style={{ color: 'var(--success)' }}>[INFO] 11:21:40 STT transcription completed.</div>
              <div style={{ color: 'var(--accent-color)' }}>[INFO] 11:21:42 Similarity search returned 3 chunks.</div>
              <div>[INFO] 11:21:43 GPT answer synthesized in 410ms.</div>
              <div>[INFO] 11:20:01 User sessions synced to Postgres DB.</div>
              <div style={{ color: 'var(--warning)' }}>[WARN] 11:18:12 Vector search index rebuild scheduled.</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
