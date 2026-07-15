/**
 * @file App.tsx
 * @description YYC³ PortAISys 首页 — 全端智能AI系统门户
 * @author YanYuCloudCube Team <admin@0379.email>
 * @version v1.0.0
 * @created 2026-07-16
 * @status stable
 * @license MIT
 */

import React from 'react'

const App: React.FC = () => {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
      color: '#e0e0e0',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      padding: '2rem',
      textAlign: 'center',
    }}>
      <img
        src="/yyc3/Web App/apple-touch-icon.png"
        alt="YYC³ Logo"
        width={120}
        height={120}
        style={{ borderRadius: '24px', marginBottom: '2rem', boxShadow: '0 8px 32px rgba(0,0,0,0.3)' }}
      />
      <h1 style={{ fontSize: '2.5rem', fontWeight: 700, margin: '0 0 0.5rem', color: '#fff' }}>
        YYC³ PortAISys
      </h1>
      <p style={{ fontSize: '1.25rem', opacity: 0.85, margin: '0 0 0.25rem' }}>
        言启千行代码，语枢万物智能
      </p>
      <p style={{ fontSize: '1rem', opacity: 0.65, margin: '0 0 2rem' }}>
        Portable Intelligent AI System — 便携式智能AI系统
      </p>
      <div style={{
        display: 'flex',
        gap: '1rem',
        flexWrap: 'wrap',
        justifyContent: 'center',
      }}>
        <a
          href="https://github.com/YYC-Cube/YYC3-PortAISys"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            padding: '0.75rem 1.5rem',
            borderRadius: '8px',
            background: 'rgba(255,255,255,0.1)',
            color: '#fff',
            textDecoration: 'none',
            border: '1px solid rgba(255,255,255,0.2)',
            transition: 'background 0.2s',
          }}
        >
          GitHub
        </a>
        <a
          href="/api/health"
          style={{
            padding: '0.75rem 1.5rem',
            borderRadius: '8px',
            background: 'rgba(255,255,255,0.1)',
            color: '#fff',
            textDecoration: 'none',
            border: '1px solid rgba(255,255,255,0.2)',
            transition: 'background 0.2s',
          }}
        >
          API 状态
        </a>
      </div>
      <p style={{ fontSize: '0.8rem', opacity: 0.5, marginTop: '3rem' }}>
        &copy; {new Date().getFullYear()} YYC³ Team. All rights reserved.
      </p>
    </div>
  )
}

export default App