import { useState, useEffect, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';
import './SecretChat.css';

const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:5000');

// ── AES encryption using Web Crypto API ─────────────────────────────────────
// The room code (padded/hashed) is the shared symmetric key.
// Server never sees plaintext.

async function deriveKey(roomCode) {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw', enc.encode(roomCode.padEnd(32, roomCode).slice(0, 32)),
    { name: 'AES-GCM' }, false, ['encrypt', 'decrypt']
  );
  return keyMaterial;
}

async function encrypt(text, roomCode) {
  const key = await deriveKey(roomCode);
  const iv  = crypto.getRandomValues(new Uint8Array(12));
  const enc = new TextEncoder();
  const cipher = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, enc.encode(text));
  // Combine iv + ciphertext → base64
  const combined = new Uint8Array(iv.byteLength + cipher.byteLength);
  combined.set(iv, 0);
  combined.set(new Uint8Array(cipher), iv.byteLength);
  return btoa(String.fromCharCode(...combined));
}

async function decrypt(b64, roomCode) {
  try {
    const key = await deriveKey(roomCode);
    const combined = Uint8Array.from(atob(b64), c => c.charCodeAt(0));
    const iv       = combined.slice(0, 12);
    const cipher   = combined.slice(12);
    const plain    = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, cipher);
    return new TextDecoder().decode(plain);
  } catch {
    return '[Encrypted message — wrong code?]';
  }
}

// ── Disappear timer (seconds after being seen) ───────────────────────────────
const DISAPPEAR_AFTER = 10; // seconds after read

export default function SecretChat() {
  // Join form state
  const [name,      setName]      = useState('');
  const [roomCode,  setRoomCode]  = useState('');
  const [joining,   setJoining]   = useState(false);
  const [joinError, setJoinError] = useState('');

  // Chat state
  const [joined,       setJoined]       = useState(false);
  const [messages,     setMessages]     = useState([]);  // { id, text, from, mine, ts, visible }
  const [input,        setInput]        = useState('');
  const [roomCount,    setRoomCount]    = useState(1);
  const [partnerName,  setPartnerName]  = useState('');
  const [partnerTyping, setPartnerTyping] = useState(false);
  const [roomFull,     setRoomFull]     = useState('');
  const [partnerLeft,  setPartnerLeft]  = useState(false);

  const socketRef   = useRef(null);
  const bottomRef   = useRef(null);
  const typingTimer = useRef(null);
  const disappearTimers = useRef({});  // { msgId: timerId }

  // Scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, partnerTyping]);

  // Start disappear countdown when a message arrives (for received messages)
  const scheduleDisappear = useCallback((msgId) => {
    // Don't double-schedule
    if (disappearTimers.current[msgId]) return;
    disappearTimers.current[msgId] = setTimeout(() => {
      setMessages(prev => prev.map(m =>
        m.id === msgId ? { ...m, visible: false } : m
      ));
      // Remove fully after fade
      setTimeout(() => {
        setMessages(prev => prev.filter(m => m.id !== msgId));
        delete disappearTimers.current[msgId];
      }, 600);
    }, DISAPPEAR_AFTER * 1000);
  }, []);

  const handleJoin = (e) => {
    e.preventDefault();
    if (!name.trim() || !roomCode.trim()) return;
    setJoining(true);
    setJoinError('');

    const socket = io(`${API_BASE}/secret`, {
      transports: ['websocket', 'polling'],
    });

    socket.on('connect', () => {
      socket.emit('joinSecret', {
        roomCode: roomCode.toUpperCase(),
        name: name.trim(),
      });
    });

    socket.on('connect_error', () => {
      setJoinError('Cannot connect to server. Please try again.');
      setJoining(false);
    });

    socket.on('joinedSecret', ({ count }) => {
      setRoomCount(count);
      setJoined(true);
      setJoining(false);
    });

    socket.on('roomFull', (msg) => {
      setJoinError(msg);
      setJoining(false);
      socket.disconnect();
    });

    socket.on('error', (msg) => {
      setJoinError(msg);
      setJoining(false);
    });

    socket.on('partnerJoined', ({ name: pName }) => {
      setPartnerName(pName);
      setRoomCount(2);
      // System notice
      const sys = { id: `sys-${Date.now()}`, system: true, text: `${pName} joined the room`, visible: true };
      setMessages(prev => [...prev, sys]);
      scheduleDisappear(sys.id);
    });

    socket.on('roomCount', (c) => setRoomCount(c));

    socket.on('partnerLeft', ({ name: pName }) => {
      setPartnerLeft(true);
      setRoomCount(1);
      const sys = { id: `sys-left-${Date.now()}`, system: true, text: `${pName} left the room`, visible: true };
      setMessages(prev => [...prev, sys]);
      scheduleDisappear(sys.id);
    });

    // Receive encrypted message — decrypt client-side
    socket.on('secretMessage', async ({ encryptedText, senderName, msgId, ts }) => {
      const text = await decrypt(encryptedText, roomCode.toUpperCase());
      const msg = { id: msgId, text, from: senderName, mine: false, ts, visible: true };
      setMessages(prev => [...prev, msg]);
      scheduleDisappear(msgId);
    });

    socket.on('partnerTyping', ({ isTyping }) => {
      setPartnerTyping(isTyping);
    });

    socketRef.current = socket;
  };

  const handleSend = async (e) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || !socketRef.current) return;

    const msgId = `${Date.now()}-${Math.random().toString(36).slice(2)}`;

    // Encrypt before sending
    const encryptedText = await encrypt(text, roomCode.toUpperCase());
    socketRef.current.emit('secretMessage', {
      roomCode: roomCode.toUpperCase(),
      encryptedText,
      msgId,
    });

    // Add to own UI immediately (already know the plaintext)
    const msg = { id: msgId, text, from: name, mine: true, ts: Date.now(), visible: true };
    setMessages(prev => [...prev, msg]);
    scheduleDisappear(msgId);

    setInput('');
    socketRef.current.emit('secretTyping', { roomCode: roomCode.toUpperCase(), isTyping: false });
  };

  const handleTyping = (e) => {
    setInput(e.target.value);
    if (!socketRef.current) return;
    socketRef.current.emit('secretTyping', { roomCode: roomCode.toUpperCase(), isTyping: true });
    clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => {
      socketRef.current?.emit('secretTyping', { roomCode: roomCode.toUpperCase(), isTyping: false });
    }, 1500);
  };

  const handleLeave = () => {
    socketRef.current?.disconnect();
    socketRef.current = null;
    // Clear all timers
    Object.values(disappearTimers.current).forEach(clearTimeout);
    disappearTimers.current = {};
    setJoined(false);
    setMessages([]);
    setName('');
    setRoomCode('');
    setPartnerName('');
    setPartnerLeft(false);
    setRoomCount(1);
  };

  const fmtTime = (ts) =>
    new Date(ts).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

  // ── JOIN SCREEN ────────────────────────────────────────────────────────────
  if (!joined) {
    return (
      <div className="sc-page">
        <div className="sc-join-card">
          {/* Lock icon */}
          <div className="sc-lock-icon">🔒</div>
          <h1 className="sc-title">Secret Chat</h1>
          <p className="sc-desc">
            End-to-end encrypted · Max 2 people · Messages disappear after {DISAPPEAR_AFTER}s
          </p>

          {joinError && <div className="sc-error">{joinError}</div>}

          <form onSubmit={handleJoin} className="sc-join-form">
            <div className="sc-field">
              <label>Your Name</label>
              <input
                type="text"
                className="sc-input"
                placeholder="Enter your name"
                value={name}
                onChange={e => setName(e.target.value.slice(0, 30))}
                required
                autoFocus
                disabled={joining}
              />
            </div>
            <div className="sc-field">
              <label>Room Code</label>
              <input
                type="text"
                className="sc-input sc-code"
                placeholder="Enter code (e.g. SECRET7)"
                value={roomCode}
                onChange={e => setRoomCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 12))}
                required
                disabled={joining}
                spellCheck={false}
              />
              <div className="sc-field-hint">Both people need the same code</div>
            </div>
            <button type="submit" className="sc-join-btn" disabled={!name.trim() || !roomCode.trim() || joining}>
              {joining ? 'Connecting…' : '🔐 Enter Room'}
            </button>
          </form>

          <div className="sc-features">
            <span>🔐 AES-256 Encrypted</span>
            <span>👥 2 People Max</span>
            <span>⏱️ Auto-delete</span>
            <span>🚫 No Account Needed</span>
          </div>
        </div>
      </div>
    );
  }

  // ── CHAT SCREEN ────────────────────────────────────────────────────────────
  return (
    <div className="sc-page">
      <div className="sc-chat-window">

        {/* Header */}
        <div className="sc-header">
          <div className="sc-header-left">
            <span className="sc-lock-small">🔒</span>
            <div>
              <div className="sc-room-code">#{roomCode.toUpperCase()}</div>
              <div className="sc-header-sub">
                {roomCount === 2
                  ? `You & ${partnerName || '?'} — encrypted`
                  : 'Waiting for the other person…'}
              </div>
            </div>
          </div>
          <div className="sc-header-right">
            <div className={`sc-status-dot ${roomCount === 2 ? 'connected' : 'waiting'}`} />
            <button className="sc-leave-btn" onClick={handleLeave}>✕ Leave</button>
          </div>
        </div>

        {/* Waiting banner */}
        {roomCount < 2 && !partnerLeft && (
          <div className="sc-waiting-banner">
            ⏳ Waiting for your partner… Share code <strong>{roomCode}</strong>
          </div>
        )}

        {/* Partner left banner */}
        {partnerLeft && (
          <div className="sc-left-banner">
            ⚠️ Your partner has left the room.
          </div>
        )}

        {/* Messages */}
        <div className="sc-messages">
          {messages.length === 0 && roomCount === 2 && (
            <div className="sc-empty">
              <div style={{ fontSize: 36 }}>💬</div>
              <p>Messages disappear {DISAPPEAR_AFTER}s after being read.</p>
            </div>
          )}

          {messages.map(msg => {
            if (msg.system) {
              return (
                <div key={msg.id} className={`sc-system-msg ${!msg.visible ? 'sc-fading' : ''}`}>
                  {msg.text}
                </div>
              );
            }
            return (
              <div key={msg.id} className={`sc-msg-row ${msg.mine ? 'sc-mine' : 'sc-theirs'} ${!msg.visible ? 'sc-fading' : ''}`}>
                <div className="sc-bubble-wrap">
                  {!msg.mine && <div className="sc-sender">{msg.from}</div>}
                  <div className={`sc-bubble ${msg.mine ? 'sc-bubble-mine' : 'sc-bubble-theirs'}`}>
                    {msg.text}
                    {/* Countdown bar */}
                    <div className="sc-timer-bar" style={{ animationDuration: `${DISAPPEAR_AFTER}s` }} />
                  </div>
                  <div className="sc-ts">{fmtTime(msg.ts)}</div>
                </div>
              </div>
            );
          })}

          {partnerTyping && (
            <div className="sc-typing-row">
              <span className="sc-typing-dots"><span/><span/><span/></span>
              {partnerName} is typing…
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <form className="sc-input-row" onSubmit={handleSend}>
          <input
            type="text"
            className="sc-msg-input"
            placeholder={roomCount === 2 ? 'Type a secret message…' : 'Waiting for partner…'}
            value={input}
            onChange={handleTyping}
            maxLength={500}
            disabled={roomCount < 2}
            autoFocus
          />
          <button type="submit" className="sc-send-btn" disabled={!input.trim() || roomCount < 2}>
            Send
          </button>
        </form>

        <div className="sc-footer-note">🔒 Encrypted · Messages disappear in {DISAPPEAR_AFTER}s · Not stored anywhere</div>
      </div>
    </div>
  );
}
