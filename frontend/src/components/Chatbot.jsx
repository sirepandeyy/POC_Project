import React, { useEffect, useState, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useNavigate, useParams } from 'react-router-dom';
 
const ChatBox = () => {
  const navigate = useNavigate();
  const { chatId: chatIdFromUrl } = useParams();
  const [chatId, setChatId] = useState('');
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
 
  const inputRef = useRef(null);
  const messagesEndRef = useRef(null);
 
  useEffect(() => {
    const newChatId = chatIdFromUrl || uuidv4();
    if (chatIdFromUrl !== chatId) {
      sessionStorage.setItem('chatId', newChatId);
      setChatId(newChatId);
      setMessages([]);
      if (!chatIdFromUrl) {
        navigate(`/chat/${newChatId}`, { replace: true });
      }
    }
  }, [chatIdFromUrl, chatId, navigate]);
 
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    inputRef.current?.focus();
  }, [messages]);
 
  useEffect(() => {
    if (messages.length > 0) {
      setChatHistory(prev => {
        const existing = prev.find(chat => chat.id === chatId);
        if (existing) {
          return prev.map(chat => chat.id === chatId ? { ...chat, messages } : chat);
        } else {
          return [...prev, { id: chatId, messages }];
        }
      });
    }
  }, [messages, chatId]);
 
  const sendMessage = async () => {
    if (!input.trim() || !chatId) return;
 
    const newMessage = { sender: 'user', content: input, timestamp: new Date().toISOString() };
    setMessages(prev => [...prev, newMessage]);
    setInput('');
    setIsTyping(true);
 
    try {
      const res = await fetch('http://localhost:8080/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: input, chatId })
      });
 
      const botReply = await res.text();
      const assistantMessage = { sender: 'assistant', content: botReply, timestamp: new Date().toISOString() };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (err) {
      console.error('Error sending message:', err);
      setMessages(prev => [
        ...prev,
        { sender: 'assistant', content: '⚠️ Error contacting server.', timestamp: new Date().toISOString() }
      ]);
    }
 
    setIsTyping(false);
  };
 
  const handleNewChat = () => {
    const newId = uuidv4();
    navigate(`/chat/${newId}`);
  };
 
  const handleSelectChat = (id) => {
    navigate(`/chat/${id}`);
  };
 
  const formatTime = iso => new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
 
  return (
    <div style={styles.container}>
      <div style={{
        ...styles.sidebar,
        width: sidebarCollapsed ? '60px' : '250px',
        alignItems: sidebarCollapsed ? 'center' : 'flex-start',
        padding: sidebarCollapsed ? '10px' : '20px'
      }}>
        <div>
          {!sidebarCollapsed && (
            <h2 style={styles.sidebarTitle}>
              Deloitte<span style={styles.dot}>.</span>
            </h2>
          )}
        </div>
        <ul style={styles.sidebarMenu}>
          {!sidebarCollapsed && (
            <li onClick={handleNewChat} style={styles.sidebarMenuItem}>+ New Chat</li>
          )}
          {chatHistory.map(chat => (
            <li
              key={chat.id}
              onClick={() => handleSelectChat(chat.id)}
              style={styles.sidebarMenuItem}
              title={`Chat ${chat.id}`}
            >
              <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {sidebarCollapsed ? '💬' : `Chat ${chat.id}`}
              </div>
 
            </li>
          ))}
        </ul>
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          style={{
            ...styles.toggleButton,
            transform: sidebarCollapsed
              ? 'translateY(-50%) rotate(180deg)'
              : 'translateY(-50%) rotate(0deg)'
          }}
          title="Toggle Sidebar"
        >
          ⇤
        </button>
      </div>
 
      <div style={styles.chatContainer}>
        <div style={styles.header}>
          <h3 style={styles.title}>How can I help you today?</h3>
          <div style={styles.disclaimer}>
            <p>•Tax Genie and Genie’s outputs may contain errors or inaccuracies, so double-check all outputs before using them for any business activities.</p>
            <p>•Tax Genie and Genie work with publicly available data for company-related tasks and should not be used with confidential and/or sensitive Deloitte information.</p>
            <p>•Adhere to ethical standards and respect clients’ policies when using Tax Genie and Genie.</p>
            <p>•Usage of this tool is monitored. Please use it responsibly.</p>
          </div>
        </div>
 
        <div style={styles.chatWindow}>
          {messages.map((msg, idx) => (
            <div
              key={idx}
              style={{
                ...styles.messageBubble,
                ...(msg.sender === 'user' ? styles.userBubble : styles.botBubble)
              }}
            >
              <div>{msg.content}</div>
              <div style={styles.timestamp}>{formatTime(msg.timestamp)}</div>
            </div>
          ))}
 
          {isTyping && (
            <div style={{ ...styles.messageBubble, ...styles.botBubble, fontStyle: 'italic', opacity: 0.7 }}>
              Genie is typing...
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
 
        <div style={styles.inputBar}>
          <input
            ref={inputRef}
            style={styles.input}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && sendMessage()}
            placeholder="Type your message here..."
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || isTyping}
            style={{
              ...styles.sendButton,
              opacity: !input.trim() || isTyping ? 0.5 : 1,
              cursor: !input.trim() || isTyping ? 'not-allowed' : 'pointer'
            }}
            title="Send"
          >
            ▶
          </button>
        </div>
      </div>
    </div>
  );
};
 
const styles = {
  container: {
    height: '100vh',
    display: 'flex',
    fontFamily: '"Segoe UI", sans-serif'
  },
  sidebar: {
    backgroundColor: '#1e1e1e',
    color: '#ffffff',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    transition: 'width 0.3s ease',
    position: 'relative'
  },
  toggleButton: {
    position: 'absolute',
    top: '50%',
    right: '-12px',
    transform: 'translateY(-50%)',
    background: '#4caf50',
    border: 'none',
    color: '#fff',
    fontSize: '16px',
    cursor: 'pointer',
    padding: '6px 10px',
    borderRadius: '0 6px 6px 0',
    zIndex: 1
  },
  sidebarTitle: {
    fontSize: '26px',
    fontWeight: 700,
    paddingTop: '-40px'
  },
  dot: {
    color: 'green'
  },
  sidebarMenu: {
    listStyle: 'none',
    padding: 0,
    marginTop: '20px',
    width: '100%'
  },
  sidebarMenuItem: {
    cursor: 'pointer',
    padding: '12px',
    borderRadius: '6px',
    color: '#fff',
    transition: 'background 0.2s',
    borderBottom: '1px solid #444',
    textAlign: 'left',
    width: '100%'
  },
  chatContainer: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#121212',
    color: '#fff',
    padding: '20px'
  },
  header: {
    borderBottom: '1px solid #444',
    marginBottom: '16px',
    paddingBottom: '12px'
  },
  title: {
    margin: 0,
    fontSize: '20px',
    fontWeight: 600
  },
  disclaimer: {
    marginTop: '10px',
    backgroundColor: '#388e3c',
    padding: '12px',
    borderRadius: '8px',
    fontSize: '14px',
    color: '#fff'
  },
  chatWindow: {
    flex: 1,
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    padding: '10px 0'
  },
  messageBubble: {
    maxWidth: '70%',
    padding: '12px',
    borderRadius: '16px',
    lineHeight: 1.5,
    whiteSpace: 'pre-wrap',
    position: 'relative',
    fontSize: '15px'
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: '#1e88e5',
    color: '#fff',
    borderTopRightRadius: 0
  },
  botBubble: {
    alignSelf: 'flex-start',
    backgroundColor: '#333',
    color: '#fff',
    borderTopLeftRadius: 0
  },
  timestamp: {
    fontSize: '10px',
    color: '#ccc',
    marginTop: '6px',
    textAlign: 'right'
  },
  inputBar: {
    display: 'flex',
    padding: '12px',
    backgroundColor: '#2c2c2c',
    borderTop: '1px solid #333',
    alignItems: 'center'
  },
  input: {
    flex: 1,
    padding: '10px 15px',
    fontSize: '16px',
    backgroundColor: '#1e1e1e',
    color: '#fff',
    border: '1px solid #555',
    borderRadius: '25px',
    outline: 'none'
  },
  sendButton: {
    marginLeft: '10px',
    padding: '10px 16px',
    backgroundColor: '#4caf50',
    border: 'none',
    color: '#fff',
    borderRadius: '50%',
    fontSize: '18px'
  }
};
 
export default ChatBox;