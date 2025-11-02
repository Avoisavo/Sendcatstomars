'use client';

import { useState } from 'react';
import CloudChat, { Message } from '@/components/cloud-chat';
import Header from '@/components/header';

export default function ChatMePage() {
  const [messages, setMessages] = useState<Message[]>([]);

  return (
    <>
      <style jsx global>{`
        /* Low Poly Background Pattern */
        .chatme-page {
          position: relative;
          overflow: hidden;
        }

        .chatme-page::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-image: 
            linear-gradient(120deg, rgba(147, 197, 253, 0.1) 0%, transparent 50%),
            linear-gradient(240deg, rgba(196, 181, 253, 0.1) 0%, transparent 50%),
            linear-gradient(60deg, rgba(251, 191, 36, 0.05) 0%, transparent 50%);
          background-size: 200% 200%;
          animation: polyGradient 20s ease infinite;
          pointer-events: none;
          z-index: 0;
        }

        @keyframes polyGradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }

        /* Low Poly Geometric Shapes */
        .poly-shape {
          position: absolute;
          opacity: 0.1;
          pointer-events: none;
        }

        /* Avatar Styles - Round Shape */
        .chatme-page .avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          font-size: 0;
          position: relative;
          overflow: hidden;
          transition: transform 0.3s ease;
        }

        .chatme-page .avatar:hover {
          transform: scale(1.1);
        }

        /* AI Avatar - Round with Image */
        .chatme-page .avatar-assistant {
          background: linear-gradient(135deg, #f9a8d4 0%, #ec4899 50%, #db2777 100%);
          color: white;
        }

        .chatme-page .avatar-assistant img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          border-radius: 50%;
        }

        /* User Avatar - Round with Image */
        .chatme-page .avatar-user {
          background: linear-gradient(135deg, #a5b4fc 0%, #818cf8 50%, #6366f1 100%);
          color: white;
        }

        .chatme-page .avatar-user img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          border-radius: 50%;
        }

        /* Message Container */
        .chatme-page .message-assistant,
        .chatme-page .message-user {
          display: flex;
          gap: 12px;
          align-items: flex-start;
          margin-bottom: 20px;
        }

        .chatme-page .message-assistant {
          justify-content: flex-start;
        }

        .chatme-page .message-user {
          justify-content: flex-end;
        }

        /* Low Poly Message Bubbles */
        .chatme-page .message-content {
          max-width: 75%;
          padding: 14px 18px;
          clip-path: polygon(
            0% 0%, 
            calc(100% - 12px) 0%, 
            100% 12px, 
            100% 100%, 
            0% 100%
          );
          line-height: 1.8;
          font-size: 12px;
          white-space: pre-wrap;
          word-wrap: break-word;
          position: relative;
          transition: all 0.3s ease;
          font-family: var(--font-press-start), monospace;
          letter-spacing: 0.02em;
        }

        .chatme-page .message-user .message-content {
          background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
          color: white;
          clip-path: polygon(
            0% 0%, 
            100% 0%, 
            100% 100%, 
            12px 100%, 
            0% calc(100% - 12px)
          );
          box-shadow: 0 4px 12px rgba(99, 102, 241, 0.25);
        }

        .chatme-page .message-assistant .message-content {
          background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
          color: #1e293b;
          clip-path: polygon(
            12px 0%, 
            100% 0%, 
            100% 100%, 
            0% 100%, 
            0% 12px
          );
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
          border: 1px solid rgba(148, 163, 184, 0.2);
        }

        /* Chat Container Background */
        .chatme-page .messages-container {
          background: transparent;
          position: relative;
          z-index: 1;
        }

        /* Side by Side Response Selection */
        .chatme-page .response-selection-container {
          display: flex;
          gap: 20px;
          width: 100%;
          align-items: flex-start;
        }

        .chatme-page .response-column {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .chatme-page .response-label-header {
          font-size: 11px;
          font-weight: 700;
          color: #6366f1;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          text-align: center;
          padding: 10px 16px;
          background: linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%);
          border-radius: 12px;
          border: 2px solid rgba(99, 102, 241, 0.3);
          font-family: var(--font-press-start), monospace;
        }

        .chatme-page .style-response-bubble-left,
        .chatme-page .style-response-bubble-right {
          margin-bottom: 0;
          transition: all 0.3s ease;
          cursor: pointer;
        }

        .chatme-page .style-response-bubble-left:hover,
        .chatme-page .style-response-bubble-right:hover {
          transform: scale(1.02);
        }

        .chatme-page .style-response-bubble-left:hover .message-content,
        .chatme-page .style-response-bubble-right:hover .message-content {
          box-shadow: 0 6px 20px rgba(99, 102, 241, 0.3);
          border-color: #818cf8;
        }

        .chatme-page .style-response-bubble-left .message-content,
        .chatme-page .style-response-bubble-right .message-content {
          border: 2px solid transparent;
          transition: all 0.3s ease;
        }

        @media (max-width: 768px) {
          .chatme-page .response-selection-container {
            flex-direction: column;
          }
        }

        /* Low Poly Header */
        .low-poly-header {
          clip-path: polygon(0% 0%, 100% 0%, 100% calc(100% - 20px), 0% 100%);
        }
      `}</style>

      <div className="chatme-page" style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f0f9ff 0%, #faf5ff 50%, #fffbeb 100%)',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
      }}>
        {/* Low Poly Decorative Elements */}
        <div className="poly-shape" style={{
          top: '10%',
          right: '5%',
          width: '200px',
          height: '200px',
          clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)',
          background: 'linear-gradient(135deg, rgba(147, 197, 253, 0.3), rgba(196, 181, 253, 0.3))',
        }} />
        <div className="poly-shape" style={{
          bottom: '15%',
          left: '3%',
          width: '150px',
          height: '150px',
          clipPath: 'polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)',
          background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.2), rgba(251, 146, 60, 0.2))',
        }} />
        <div className="poly-shape" style={{
          top: '50%',
          right: '10%',
          width: '100px',
          height: '100px',
          clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
          background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.2), rgba(219, 39, 119, 0.2))',
        }} />

        {/* Header Component */}
        <Header />

        {/* Chat Container */}
        <div style={{
          flex: 1,
          width: '100%',
          maxWidth: '1200px',
          margin: '0 auto',
          background: 'transparent',
          display: 'flex',
          flexDirection: 'column',
          height: 'calc(100vh - 80px)',
          position: 'relative',
          zIndex: 1,
          padding: '2rem',
          marginTop: '80px',
        }}>
          <CloudChat onMessagesUpdate={setMessages} />
        </div>
      </div>
    </>
  );
}

