import { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { io } from 'socket.io-client';
import { useAuth } from '../context/AuthContext';
import './Chat.css';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Format time: today → "3:45 PM", older → "Jun 5, 3:45 PM"
function fmtTime(dateStr) {
  const d = new Date(dateStr);
  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();
  const time = d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  return isToday ? time : `${d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}, ${time}`;
}

export default function Chat() {
  const { user }         = useAuth();
  const [searchParams]   = useSearchParams();
  const prefilledCode    = searchParams.get('room') || '';

  const [roomCode,      setRoomCode]      = useState(prefilledCode.toUpperCase());
  const [joined,        setJoined]        = useState(false);
  const [messages,      setMessages]      = useState([]);
  const [input,         setInput]         = useState('');
  const [onlineCount,   setOnlineCount]   = useState(0);
  const [typingUser,    setTypingUser]    = useState('');
  const [error,         setError]         = useState('');
  const [connecting,    setConnecting]    = useState(false);

  const socketRef   = useRef(null);
  const bottomRef   = useRef(null);
  const typingTimer = useRef(null);

  // Auto-join if room code is in URL
  useEffect(() => {
    if (prefilledCode && user) joinRoom(prefilledCode.toUpperCase());
  }, [prefilledCode, user]);

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typingUser]);

  const joinRoom = useCallback((code) => {
    if (!code.trim() || !user) return;
    setConnecting(true);
    setError('');

    const token = localStorage.getItem('token');
    const socket = io(API_BASE, {
      auth: { token },
      transports: ['websocket', 'polling'],
    });

    socket.on('connect', () => {
      socket.emit('joinRoom', { roomCode: code });
    });

    socket.on('connect_error', (err) => {
      setError(`Connection failed: ${err.message}`);
      setConnecting(false);
    });

    socket.on('chatHistory', (history) => {
      setMessages(history);
      setJoined(true);
      setConnecting(false);
    });

    socket.on('newMessage', (msg) => {
      setMessages(prev => [...prev, msg]);
      setTypingUser('');
    });

    socket.on('userJoined', ({ name }) => {
      setMessages(prev => [...prev, {
        _id: Date.now(), system: true,
        message: `${name} joined the room`,
        createdAt: new Date(),
      }]);
    });

    socket.on('roomUsers', (count) => setOnlineCount(count));

    socket.on('userTyping', ({ name, isTyping }) => {
      setTypingUser(isTyping ? name : '');
    });

    socketRef.current = socket;
  }, [user]);

  const handleJoin = (e) => {
    e.preventDefault();
    joinRoom(roomCode);
  };

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim() || !socketRef.current) return;
    socketRef.current.emit('sendMessage', { roomCode, message: input.trim() });
    setInput('');
    // Stop typing indicator
    socketRef.current.emit('typing', { roomCode, isTyping: false });
  };

  const handleTyping = (e) => {
    setInput(e.target.value);
    if (!socketRef.current) return;
    socketRef.current.emit('typing', { roomCode, isTyping: true });
    clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => {
      socketRef.current?.emit('typing', { roomCode, isTyping: false });
    }, 1500);
  };

  const handleLeave = () => {
    socketRef.current?.disconnect();
    socketRef.current = null;
    setJoined(false);
    setMessages([]);
    setRoomCode('');
    setOnlineCount(0);
  };

  // Not logged in
  if (!user) {
    return (
      <div className="chat-page">
        <div className="chat-auth-prompt">
          <div style={{ fontSize: 48, marginBottom: 16 }}>💬</div>
          <h2>Login to use Chat</h2>
          <p>You need to be logged in to join a chat room.</p>
          <Link to="/login" className="btn btn-primary">Login</Link>
        </div>
      </div>
    );
  }

  // Room join screen
  if (!joined) {
    return (
      <div className="chat-page">
        <div className="chat-join-card">
          <div className="chat-join-icon">💬</div>
          <h2 className="chat-join-title">Join Chat Room</h2>
          <p className="chat-join-sub">
            Enter the 6-character room code shared with you.<br />
            Both you and the other person need the same code.
          </p>

          {error && <div className="chat-error">{error}</div>}

          <form onSubmit={handleJoin} className="chat-join-form">
            <input
              type="text"
              className="chat-code-input"
              placeholder="e.g. ABC123"
              value={roomCode}
              onChange={e => setRoomCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6))}
              maxLength={6}
              autoFocus
              disabled={connecting}
            />
            <button type="submit" className="chat-join-btn" disabled={roomCode.length < 4 || connecting}>
              {connecting ? 'Connecting…' : 'Join Room →'}
            </button>
          </form>

          <p className="chat-join-hint">
            💡 Your booking ID last 6 chars can be your room code.<br />
            Find it in <Link to="/my-bookings">My Bookings</Link>.
          </p>
        </div>
      </div>
    );
  }

  // Chat room
  return (
    <div className="chat-page">
      <div className="chat-window">

        {/* Header */}
        <div className="chat-header">
          <div className="chat-header-left">
            <div className="chat-room-badge">#{roomCode}</div>
            <div className="chat-online">
              <span className="chat-online-dot" />
              {onlineCount} online
            </div>
          </div>
          <div className="chat-header-right">
            <span className="chat-logged-as">
              Logged in as <strong>{user.name}</strong>
              {user.role === 'admin' && <span className="chat-admin-tag">ADMIN</span>}
            </span>
            <button className="chat-leave-btn" onClick={handleLeave}>Leave</button>
          </div>
        </div>

        {/* Messages */}
        <div className="chat-messages">
          {messages.length === 0 && (
            <div className="chat-empty">
              <div style={{ fontSize: 40 }}>👋</div>
              <p>No messages yet. Say hello!</p>
            </div>
          )}

          {messages.map((msg, i) => {
            if (msg.system) {
              return (
                <div key={msg._id || i} className="chat-system-msg">
                  {msg.message}
                </div>
              );
            }

            const isMine = msg.senderName === user.name;
            const isAdmin = msg.senderRole === 'admin';
            const prevMsg = messages[i - 1];
            const showAvatar = !prevMsg || prevMsg.senderName !== msg.senderName || prevMsg.system;

            return (
              <div key={msg._id || i} className={`chat-msg-row ${isMine ? 'mine' : 'theirs'}`}>
                {!isMine && showAvatar && (
                  <div className={`chat-avatar ${isAdmin ? 'admin' : ''}`}>
                    {msg.senderName.charAt(0).toUpperCase()}
                  </div>
                )}
                {!isMine && !showAvatar && <div className="chat-avatar-spacer" />}

                <div className="chat-bubble-wrap">
                  {showAvatar && !isMine && (
                    <div className="chat-sender-name">
                      {msg.senderName}
                      {isAdmin && <span className="chat-admin-tag">ADMIN</span>}
                    </div>
                  )}
                  <div className={`chat-bubble ${isMine ? 'bubble-mine' : 'bubble-theirs'} ${isAdmin && !isMine ? 'bubble-admin' : ''}`}>
                    {msg.message}
                  </div>
                  <div className="chat-time">{fmtTime(msg.createdAt)}</div>
                </div>

                {isMine && showAvatar && (
                  <div className={`chat-avatar ${user.role === 'admin' ? 'admin' : ''}`}>
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                )}
                {isMine && !showAvatar && <div className="chat-avatar-spacer" />}
              </div>
            );
          })}

          {/* Typing indicator */}
          {typingUser && (
            <div className="chat-typing">
              <span className="chat-typing-dots"><span/><span/><span/></span>
              {typingUser} is typing…
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <form className="chat-input-row" onSubmit={handleSend}>
          <input
            type="text"
            className="chat-input"
            placeholder={`Message #${roomCode}…`}
            value={input}
            onChange={handleTyping}
            maxLength={1000}
            autoFocus
          />
          <button type="submit" className="chat-send-btn" disabled={!input.trim()}>
            Send ➤
          </button>
        </form>
      </div>
    </div>
  );
}
