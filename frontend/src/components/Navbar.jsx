import React from 'react';

const Navbar = ({ title }) => {
  return (
    <header style={{
      height: '70px',
      background: 'var(--bg-secondary)',
      borderBottom: '1px solid var(--border-color)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 32px'
    }}>
      <h2 style={{ fontSize: '18px', fontWeight: 600 }}>{title}</h2>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: 'var(--success)',
            display: 'inline-block'
          }}></span>
          <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>System Active</span>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
