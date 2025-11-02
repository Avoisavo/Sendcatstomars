'use client';

import { useState, useRef } from 'react';
import CloudChat, { Message } from '@/components/cloud-chat';
import Header from '@/components/header';

interface UploadedFile {
  name: string;
  path: string;
  size: number;
  type: string;
  content?: string;
}

export default function ChatMePage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [showFiles, setShowFiles] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFolderUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const fileArray: UploadedFile[] = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const fileData: UploadedFile = {
        name: file.name,
        path: file.webkitRelativePath || file.name,
        size: file.size,
        type: file.type || 'unknown',
      };

      // Read text files content
      if (file.type.startsWith('text/') || 
          file.name.endsWith('.txt') || 
          file.name.endsWith('.md') ||
          file.name.endsWith('.json') ||
          file.name.endsWith('.js') ||
          file.name.endsWith('.ts') ||
          file.name.endsWith('.tsx') ||
          file.name.endsWith('.jsx')) {
        try {
          const content = await file.text();
          fileData.content = content;
        } catch (err) {
          console.error('Error reading file:', err);
        }
      }

      fileArray.push(fileData);
    }

    setUploadedFiles(prev => [...prev, ...fileArray]);
    setShowFiles(true);
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

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

        /* Folder Upload Button */
        .folder-upload-button {
          position: fixed;
          bottom: 100px;
          right: 40px;
          width: 60px;
          height: 60px;
          background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          box-shadow: 0 4px 20px rgba(99, 102, 241, 0.4);
          transition: all 0.3s ease;
          z-index: 1000;
          border: 3px solid rgba(255, 255, 255, 0.3);
        }

        .folder-upload-button:hover {
          transform: scale(1.1) translateY(-2px);
          box-shadow: 0 6px 30px rgba(99, 102, 241, 0.6);
        }

        .folder-upload-button:active {
          transform: scale(0.95);
        }

        .folder-upload-button svg {
          width: 28px;
          height: 28px;
          color: white;
        }

        .files-badge {
          position: absolute;
          top: -5px;
          right: -5px;
          background: linear-gradient(135deg, #ec4899 0%, #db2777 100%);
          color: white;
          border-radius: 50%;
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 11px;
          font-weight: bold;
          border: 2px solid white;
        }

        /* Files Panel */
        .files-panel {
          position: fixed;
          right: 0;
          top: 80px;
          bottom: 0;
          width: 400px;
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.95) 100%);
          backdrop-filter: blur(10px);
          border-left: 2px solid rgba(99, 102, 241, 0.2);
          box-shadow: -4px 0 20px rgba(0, 0, 0, 0.1);
          z-index: 999;
          transform: translateX(100%);
          transition: transform 0.3s ease;
          overflow-y: auto;
        }

        .files-panel.show {
          transform: translateX(0);
        }

        .files-panel-header {
          position: sticky;
          top: 0;
          background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
          color: white;
          padding: 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 2px solid rgba(255, 255, 255, 0.2);
          z-index: 10;
        }

        .files-panel-header h3 {
          margin: 0;
          font-size: 16px;
          font-weight: 700;
          font-family: var(--font-press-start), monospace;
        }

        .close-panel-button {
          background: rgba(255, 255, 255, 0.2);
          border: none;
          color: white;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .close-panel-button:hover {
          background: rgba(255, 255, 255, 0.3);
          transform: rotate(90deg);
        }

        .files-list {
          padding: 20px;
        }

        .file-item {
          background: white;
          border: 2px solid rgba(99, 102, 241, 0.2);
          border-radius: 12px;
          padding: 12px 16px;
          margin-bottom: 12px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          transition: all 0.2s ease;
          clip-path: polygon(0% 0%, calc(100% - 10px) 0%, 100% 10px, 100% 100%, 0% 100%);
        }

        .file-item:hover {
          border-color: #6366f1;
          box-shadow: 0 4px 12px rgba(99, 102, 241, 0.2);
          transform: translateX(-4px);
        }

        .file-info {
          flex: 1;
          min-width: 0;
        }

        .file-name {
          font-size: 12px;
          font-weight: 600;
          color: #1e293b;
          margin-bottom: 4px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .file-path {
          font-size: 10px;
          color: #64748b;
          margin-bottom: 4px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .file-meta {
          font-size: 10px;
          color: #94a3b8;
        }

        .remove-file-button {
          background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
          border: none;
          color: white;
          width: 28px;
          height: 28px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
          flex-shrink: 0;
          margin-left: 12px;
        }

        .remove-file-button:hover {
          transform: scale(1.1);
          box-shadow: 0 2px 8px rgba(239, 68, 68, 0.4);
        }

        .empty-files-state {
          text-align: center;
          padding: 60px 20px;
          color: #94a3b8;
        }

        .empty-files-state svg {
          width: 80px;
          height: 80px;
          margin-bottom: 20px;
          opacity: 0.3;
        }

        .empty-files-state p {
          font-size: 12px;
          line-height: 1.8;
        }

        @media (max-width: 768px) {
          .files-panel {
            width: 100%;
          }
          
          .folder-upload-button {
            bottom: 80px;
            right: 20px;
            width: 50px;
            height: 50px;
          }

          .folder-upload-button svg {
            width: 24px;
            height: 24px;
          }
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

        {/* Hidden File Input for Folder Upload */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          // @ts-ignore - webkitdirectory is not in the type definition
          webkitdirectory=""
          directory=""
          onChange={handleFolderUpload}
          style={{ display: 'none' }}
        />

        {/* Folder Upload Floating Button */}
        <div 
          className="folder-upload-button"
          onClick={() => fileInputRef.current?.click()}
          title="Upload Files"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            fill="none" 
            viewBox="0 0 24 24" 
            strokeWidth={2.5} 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              d="M18.375 12.739l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94A3 3 0 1119.5 7.372L8.552 18.32m.009-.01l-.01.01m5.699-9.941l-7.81 7.81a1.5 1.5 0 002.112 2.13" 
            />
          </svg>
          {uploadedFiles.length > 0 && (
            <div className="files-badge">
              {uploadedFiles.length}
            </div>
          )}
        </div>

        {/* Files Panel (Sidebar) */}
        <div className={`files-panel ${showFiles ? 'show' : ''}`}>
          <div className="files-panel-header">
            <h3>📁 Uploaded Files</h3>
            <button 
              className="close-panel-button"
              onClick={() => setShowFiles(false)}
              title="Close"
            >
              ✕
            </button>
          </div>
          
          <div className="files-list">
            {uploadedFiles.length === 0 ? (
              <div className="empty-files-state">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  strokeWidth={1.5} 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" 
                  />
                </svg>
                <p>
                  No files uploaded yet.<br />
                  Click the upload button to add files<br />
                  for RAG context.
                </p>
              </div>
            ) : (
              uploadedFiles.map((file, index) => (
                <div key={index} className="file-item">
                  <div className="file-info">
                    <div className="file-name" title={file.name}>
                      📄 {file.name}
                    </div>
                    <div className="file-path" title={file.path}>
                      {file.path}
                    </div>
                    <div className="file-meta">
                      {formatFileSize(file.size)} • {file.type}
                      {file.content && ` • ${file.content.length} chars`}
                    </div>
                  </div>
                  <button
                    className="remove-file-button"
                    onClick={() => removeFile(index)}
                    title="Remove file"
                  >
                    ✕
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  );
}

