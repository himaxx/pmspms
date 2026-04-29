import React, { useRef, useState } from 'react';
import { useLanguage } from '../i18n/LanguageContext';

/* ─────────────────────────────────────────────────────────────────────────────
   LanguageSwitcher — Minimalist & Premium EN / HI toggle
   Features:
   • Glassmorphism base (no harsh borders)
   • Liquid-spring thumb physics
   • Dynamic color transition (indigo ↔ violet)
   • Elegant label cross-scaling
   • Interactive ripple & glow pulse
───────────────────────────────────────────────────────────────────────────── */

const SPRING = 'cubic-bezier(0.34, 1.56, 0.64, 1)';

export default function LanguageSwitcher() {
  const { language, toggleLanguage } = useLanguage();
  const isHi = language === 'hi';

  const [ripple, setRipple] = useState(null);
  const btnRef = useRef(null);

  function handleClick(e) {
    const rect = btnRef.current.getBoundingClientRect();
    setRipple({ x: e.clientX - rect.left, y: e.clientY - rect.top, id: Date.now() });
    setTimeout(() => setRipple(null), 600);
    toggleLanguage();
  }

  return (
    <>
      <style>{`
        @keyframes ls-ripple {
          0%   { transform: scale(0);   opacity: 0.3; }
          100% { transform: scale(4);   opacity: 0;   }
        }
        @keyframes ls-thumb-glow {
          0%, 100% { filter: drop-shadow(0 0 4px rgba(99,102,241,0.4)); }
          50%      { filter: drop-shadow(0 0 10px rgba(139,92,246,0.6)); }
        }
      `}</style>

      <button
        ref={btnRef}
        onClick={handleClick}
        title={isHi ? 'Switch to English' : 'Switch to Hindi'}
        style={{
          position: 'relative',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '4px 12px',
          borderRadius: '999px',
          border: 'none',
          background: 'rgba(255, 255, 255, 0.7)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          boxShadow: '0 4px 15px rgba(0,0,0,0.05), inset 0 0 0 1px rgba(255,255,255,0.4)',
          cursor: 'pointer',
          overflow: 'hidden',
          transition: 'all 300ms ease',
          userSelect: 'none',
          WebkitTapHighlightColor: 'transparent',
        }}
        onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
        onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
      >
        {/* Ripple Effect */}
        {ripple && (
          <span style={{
            position: 'absolute',
            left: ripple.x, top: ripple.y,
            width: 20, height: 20,
            marginLeft: -10, marginTop: -10,
            borderRadius: '50%',
            background: isHi ? 'rgba(139,92,246,0.2)' : 'rgba(99,102,241,0.2)',
            animation: 'ls-ripple 600ms ease-out forwards',
            pointerEvents: 'none',
          }} key={ripple.id} />
        )}

        {/* EN Label */}
        <span style={{
          fontSize: '10px',
          fontWeight: 900,
          color: !isHi ? '#4f46e5' : '#9ca3af',
          transform: !isHi ? 'scale(1.1)' : 'scale(1)',
          transition: `all 300ms ${SPRING}`,
          position: 'relative',
          zIndex: 2,
        }}>EN</span>

        {/* The Track */}
        <div style={{
          position: 'relative',
          width: '36px',
          height: '20px',
          borderRadius: '999px',
          background: isHi ? 'rgba(139,92,246,0.1)' : 'rgba(99,102,241,0.1)',
          transition: 'background 500ms ease',
          boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.05)',
        }}>
          {/* Moving Active Background Overlay */}
          <div style={{
            position: 'absolute',
            top: 2, bottom: 2,
            left: isHi ? '18px' : '2px',
            width: '16px',
            borderRadius: '999px',
            background: isHi ? '#8b5cf6' : '#6366f1',
            transition: `all 450ms ${SPRING}`,
            boxShadow: isHi ? '0 2px 8px rgba(139,92,246,0.4)' : '0 2px 8px rgba(99,102,241,0.4)',
            animation: 'ls-thumb-glow 2s infinite',
          }} />

          {/* Thumb Circle */}
          <div style={{
            position: 'absolute',
            top: '4px',
            left: isHi ? '22px' : '6px',
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: 'white',
            transition: `left 450ms ${SPRING}`,
            zIndex: 3,
          }} />
        </div>

        {/* HI Label */}
        <span style={{
          fontSize: '10px',
          fontWeight: 900,
          color: isHi ? '#7c3aed' : '#9ca3af',
          transform: isHi ? 'scale(1.1)' : 'scale(1)',
          transition: `all 300ms ${SPRING}`,
          position: 'relative',
          zIndex: 2,
        }}>HI</span>
      </button>
    </>
  );
}
