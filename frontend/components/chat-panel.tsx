'use client';

import { useState, ReactNode } from 'react';
import CloudChat, { Message } from './cloud-chat';

interface ChatPanelWrapperProps {
  children: ReactNode;
}

export default function ChatPanelWrapper({ children }: ChatPanelWrapperProps) {
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isUserChatOpen, setIsUserChatOpen] = useState(false);

  return (
    <>
      {/* Super Cute Cat-Themed Chat Panel */}
      <div style={{
        position: 'fixed',
        top: '80px',
        left: isPanelOpen ? '0' : '-650px',
        width: '650px',
        height: 'calc(100vh - 80px)',
        background: 'linear-gradient(145deg, #e9d5ff 0%, #ddd6fe 40%, #c4b5fd 100%)',
        border: 'none',
        borderRight: '3px solid rgba(139, 92, 246, 0.3)',
        borderRadius: '0 30px 30px 0',
        boxShadow: `
          20px 0 40px rgba(139, 92, 246, 0.2),
          inset -5px 0 15px rgba(167, 139, 250, 0.1)
        `,
        transition: 'left 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
        zIndex: 900,
        padding: '2rem',
        overflowY: 'auto'
      }}>
        {/* Cute Cat Header */}
        <div style={{
          background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
          padding: '1.5rem 2rem',
          borderRadius: '25px',
          marginBottom: '2rem',
          boxShadow: '0 8px 20px rgba(139, 92, 246, 0.4)',
          position: 'relative',
          overflow: 'hidden',
          border: '2px solid rgba(167, 139, 250, 0.3)'
        }}>
          {/* Cute floating paw prints */}
          <div style={{
            position: 'absolute',
            top: '10px',
            right: '20px',
            fontSize: '1.5rem',
            opacity: 0.4,
            animation: 'float 3s ease-in-out infinite'
          }}>🐾</div>
          
          <h2 style={{ 
            fontSize: '1.8rem', 
            fontWeight: '700', 
            margin: 0,
            color: '#fbbf24',
            letterSpacing: '0.5px',
            position: 'relative',
            zIndex: 1,
            textAlign: 'center'
          }}>
             Cat Chat Assistant
          </h2>
        </div>

        {/* Chat Interface */}
        <div style={{ marginTop: '1.5rem' }}>
          <CloudChat onMessagesUpdate={setMessages} />
        </div>

        {/* Adorable Floating Paw Print Decorations */}
        <div style={{
          position: 'absolute',
          bottom: '40px',
          left: '20px',
          fontSize: '2rem',
          opacity: 0.2,
          pointerEvents: 'none',
          transform: 'rotate(-15deg)'
        }}>🐾</div>
        <div style={{
          position: 'absolute',
          bottom: '100px',
          right: '30px',
          fontSize: '1.8rem',
          opacity: 0.2,
          pointerEvents: 'none',
          transform: 'rotate(25deg)'
        }}>🐾</div>
        <div style={{
          position: 'absolute',
          top: '150px',
          right: '50px',
          fontSize: '1.5rem',
          opacity: 0.15,
          pointerEvents: 'none',
          transform: 'rotate(-20deg)'
        }}>🐾</div>
        <div style={{
          position: 'absolute',
          top: '250px',
          left: '40px',
          fontSize: '1.6rem',
          opacity: 0.15,
          pointerEvents: 'none',
          transform: 'rotate(10deg)'
        }}>🐾</div>

        {/* Cute cat face decorations */}
        <div style={{
          position: 'absolute',
          bottom: '200px',
          right: '20px',
          fontSize: '3rem',
          opacity: 0.1,
          pointerEvents: 'none'
        }}>😺</div>
        <div style={{
          position: 'absolute',
          top: '350px',
          left: '30px',
          fontSize: '2.5rem',
          opacity: 0.1,
          pointerEvents: 'none'
        }}>😸</div>
      </div>

      {/* Adorable Cat Toggle Button */}
      <button
        onClick={() => setIsPanelOpen(!isPanelOpen)}
        style={{
          position: 'fixed',
          right: '2rem',
          top: '50%',
          transform: 'translateY(-50%)',
          width: '70px',
          height: '70px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
          color: '#fbbf24',
          border: '3px solid rgba(251, 191, 36, 0.6)',
          cursor: 'pointer',
          fontSize: '2rem',
          boxShadow: '0 6px 25px rgba(139, 92, 246, 0.6)',
          zIndex: 1000,
          transition: 'all 0.3s ease',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: '600'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-50%) scale(1.15) rotate(10deg)';
          e.currentTarget.style.boxShadow = '0 8px 30px rgba(139, 92, 246, 0.8)';
          e.currentTarget.style.background = 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(-50%) scale(1) rotate(0deg)';
          e.currentTarget.style.boxShadow = '0 6px 25px rgba(139, 92, 246, 0.6)';
          e.currentTarget.style.background = 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)';
        }}
      >
        {isPanelOpen ? '✕' : '🐱'}
      </button>

      {/* Right-Side User Chat Display Panel */}
      <div style={{
        position: 'fixed',
        top: '80px',
        right: isUserChatOpen ? '0' : '-500px',
        width: '500px',
        height: 'calc(100vh - 80px)',
        background: 'linear-gradient(145deg, #fef3c7 0%, #fde68a 40%, #fcd34d 100%)',
        border: 'none',
        borderLeft: '3px solid rgba(251, 191, 36, 0.4)',
        borderRadius: '30px 0 0 30px',
        boxShadow: `
          -20px 0 40px rgba(251, 191, 36, 0.2),
          inset 5px 0 15px rgba(252, 211, 77, 0.1)
        `,
        transition: 'right 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
        zIndex: 900,
        padding: '2rem',
        overflowY: 'auto'
      }}>
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
          padding: '1.5rem 2rem',
          borderRadius: '25px',
          marginBottom: '2rem',
          boxShadow: '0 8px 20px rgba(245, 158, 11, 0.4)',
          position: 'relative',
          overflow: 'hidden',
          border: '2px solid rgba(251, 191, 36, 0.3)'
        }}>
          <div style={{
            position: 'absolute',
            top: '10px',
            left: '20px',
            fontSize: '1.5rem',
            opacity: 0.4,
            animation: 'float 3s ease-in-out infinite'
          }}>💬</div>
          
          <h2 style={{ 
            fontSize: '1.8rem', 
            fontWeight: '700', 
            margin: 0,
            color: '#ffffff',
            letterSpacing: '0.5px',
            position: 'relative',
            zIndex: 1,
            textAlign: 'center'
          }}>
            📝 Your Messages
          </h2>
        </div>

        {/* User Messages Display */}
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '1rem',
          maxHeight: 'calc(100vh - 250px)',
          overflowY: 'auto',
          padding: '0.5rem'
        }}>
          {messages.filter(msg => msg.role === 'user').length === 0 ? (
            <div style={{
              textAlign: 'center',
              marginTop: '40px',
              color: '#92400e',
              fontSize: '0.95rem'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>💭</div>
              <p style={{ fontWeight: '600', marginBottom: '0.5rem' }}>No messages yet</p>
              <p style={{ fontSize: '0.85rem', opacity: 0.8 }}>Your chat messages will appear here</p>
            </div>
          ) : (
            messages
              .filter(msg => msg.role === 'user')
              .map((msg, index) => (
                <div key={msg.id} style={{
                  background: 'linear-gradient(135deg, #ffffff 0%, #fef3c7 100%)',
                  padding: '1rem 1.25rem',
                  borderRadius: '15px',
                  boxShadow: '0 2px 8px rgba(245, 158, 11, 0.15)',
                  border: '2px solid rgba(251, 191, 36, 0.2)',
                  position: 'relative',
                  animation: 'slideIn 0.3s ease-out'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    marginBottom: '0.5rem'
                  }}>
                    {/* User Icon */}
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.1rem',
                      boxShadow: '0 2px 8px rgba(245, 158, 11, 0.3)',
                      border: '2px solid rgba(251, 191, 36, 0.4)'
                    }}>
                      👤
                    </div>
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.1rem'
                    }}>
                      <div style={{
                        fontSize: '0.8rem',
                        color: '#92400e',
                        fontWeight: '600'
                      }}>
                        You
                      </div>
                      <div style={{
                        fontSize: '0.7rem',
                        color: '#92400e',
                        opacity: 0.7,
                        fontWeight: '500'
                      }}>
                        {new Date(msg.timestamp).toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </div>
                    </div>
                  </div>
                  <div style={{
                    color: '#78350f',
                    fontSize: '0.95rem',
                    lineHeight: '1.6',
                    whiteSpace: 'pre-wrap',
                    wordWrap: 'break-word'
                  }}>
                    {msg.content}
                  </div>
                </div>
              ))
          )}
        </div>

        {/* Decorative Elements */}
        <div style={{
          position: 'absolute',
          bottom: '40px',
          right: '20px',
          fontSize: '2rem',
          opacity: 0.15,
          pointerEvents: 'none',
          transform: 'rotate(15deg)'
        }}>💬</div>
        <div style={{
          position: 'absolute',
          top: '200px',
          left: '30px',
          fontSize: '1.5rem',
          opacity: 0.1,
          pointerEvents: 'none',
          transform: 'rotate(-20deg)'
        }}>📝</div>
      </div>


      {/* Main Content with Smooth Animation */}
      <div style={{ 
        width: '100vw', 
        height: '100vh',
        transform: `${isPanelOpen ? 'translateX(325px) scale(0.95)' : isUserChatOpen ? 'translateX(-250px) scale(0.95)' : 'translateX(0) scale(1)'}`,
        transition: 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
        transformOrigin: 'center center'
      }}>
        {children}
      </div>

      {/* Add keyframe animation for slide in */}
      <style jsx global>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes float {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }
      `}</style>
    </>
  );
}

