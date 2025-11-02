'use client';

import { useState, FormEvent } from 'react';

interface ApiResponse {
  success: boolean;
  response?: string;
  humanizedResponse?: string;
  duration?: number;
  error?: string;
  initialResponses?: Record<string, string>;
}

type ModelType = 'all' | 'openai' | 'llama-8b' | 'llama-70b' | 'qwen';

export default function ModelTest() {
  const [selectedModel, setSelectedModel] = useState<ModelType>('all');
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<ApiResponse | null>(null);

  const models = [
    { id: 'all' as ModelType, label: '🤝 All Models (Discussion)' },
    { id: 'openai' as ModelType, label: 'OpenAI GPT-4' },
    { id: 'llama-8b' as ModelType, label: 'DeepSeek' },
    { id: 'llama-70b' as ModelType, label: 'Llama 70B' },
    { id: 'qwen' as ModelType, label: 'Qwen 32B' },
  ];

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!prompt.trim()) return;

    setIsLoading(true);
    setResponse(null);

    try {
      const res = await fetch('/api/modelTest', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: prompt.trim(),
          model: selectedModel,
        }),
      });

      const data: ApiResponse = await res.json();
      setResponse(data);
    } catch (error: any) {
      setResponse({
        success: false,
        error: error.message || 'Failed to fetch response',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <style jsx>{`
        .container {
          min-height: 100vh;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 20px;
        }

        .content-wrapper {
          max-width: 1400px;
          margin: 0 auto;
          background: white;
          border-radius: 16px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          overflow: hidden;
        }

        .header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 40px;
          text-align: center;
        }

        .header h1 {
          font-size: 32px;
          margin-bottom: 12px;
          font-weight: 700;
        }

        .header p {
          font-size: 16px;
          opacity: 0.9;
        }

        .content {
          padding: 40px;
        }

        .form-group {
          margin-bottom: 30px;
        }

        .form-label {
          display: block;
          margin-bottom: 8px;
          font-weight: 600;
          color: #333;
          font-size: 16px;
        }

        .model-select {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
          margin-bottom: 20px;
        }

        @media (max-width: 600px) {
          .model-select {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        .model-option {
          padding: 20px;
          border: 2px solid #e0e0e0;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s;
          text-align: center;
          background: white;
          font-size: 15px;
          font-weight: 600;
          color: #000;
        }

        .model-option:hover {
          border-color: #667eea;
          background: #f8f9ff;
          color: #000;
        }

        .model-option.active {
          border-color: #667eea;
          background: #667eea;
          color: white;
        }

        .textarea {
          width: 100%;
          min-height: 150px;
          padding: 16px;
          border: 2px solid #e0e0e0;
          border-radius: 8px;
          font-size: 16px;
          font-family: inherit;
          resize: vertical;
          transition: border-color 0.3s;
          color: #000;
        }

        .textarea::placeholder {
          color: #999;
        }

        .textarea:focus {
          outline: none;
          border-color: #667eea;
        }

        .submit-button {
          width: 100%;
          padding: 18px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 18px;
          font-weight: 600;
          cursor: pointer;
          transition: transform 0.2s, box-shadow 0.2s;
        }

        .submit-button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 10px 20px rgba(102, 126, 234, 0.4);
        }

        .submit-button:active {
          transform: translateY(0);
        }

        .submit-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }

        .loading {
          text-align: center;
          padding: 40px 20px;
          color: #667eea;
        }

        .spinner {
          border: 3px solid #f3f3f3;
          border-top: 3px solid #667eea;
          border-radius: 50%;
          width: 40px;
          height: 40px;
          animation: spin 1s linear infinite;
          margin: 0 auto 10px;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .response-container {
          margin-top: 30px;
          padding: 20px;
          background: #f8f9fa;
          border-radius: 8px;
          border-left: 4px solid #667eea;
        }

        .response-container.error {
          background: #fee;
          border-left-color: #f44336;
          color: #c62828;
        }

        .response-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 15px;
        }

        .response-header h3 {
          margin: 0;
          color: #333;
          font-size: 20px;
        }

        .response-meta {
          font-size: 12px;
          color: #666;
        }

        .comparison-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 30px;
          margin-bottom: 30px;
        }

        @media (max-width: 768px) {
          .comparison-grid {
            grid-template-columns: 1fr;
          }
        }

        .response-box {
          border: 2px solid #e0e0e0;
          border-radius: 12px;
          padding: 30px;
          background: #fafafa;
          min-height: 200px;
        }

        .response-box.humanized {
          border-color: #667eea;
          background: #f8f9ff;
        }

        .response-box h3 {
          margin: 0 0 20px 0;
          color: #333;
          font-size: 22px;
        }

        .response-box.humanized h3 {
          color: #667eea;
        }

        .response-content {
          color: #333;
          line-height: 1.8;
          white-space: pre-wrap;
          word-wrap: break-word;
          font-size: 15px;
        }

        .response-content.humanized {
          color: #555;
        }

        .initial-responses {
          margin-top: 25px;
          padding-top: 20px;
          border-top: 1px solid #e0e0e0;
        }

        .initial-responses h4 {
          margin-bottom: 15px;
          color: #667eea;
          font-size: 16px;
        }

        .initial-response-item {
          margin-bottom: 15px;
          padding: 12px;
          background: #f8f9fa;
          border-radius: 6px;
        }

        .initial-response-item strong {
          color: #667eea;
        }

        .initial-response-item p {
          margin: 8px 0 0 0;
          color: #555;
          line-height: 1.6;
        }
      `}</style>

      <div className="container">
        <div className="content-wrapper">
          <div className="header">
            <h1>🤖 AI Models Test</h1>
            <p>Test OpenAI, DeepSeek, and Qwen models</p>
          </div>

          <div className="content">
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Select Model:</label>
                <div className="model-select">
                  {models.map((model) => (
                    <div
                      key={model.id}
                      className={`model-option ${selectedModel === model.id ? 'active' : ''}`}
                      onClick={() => setSelectedModel(model.id)}
                    >
                      {model.label}
                    </div>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="prompt">
                  Enter your prompt:
                </label>
                <textarea
                  id="prompt"
                  className="textarea"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Type your message here..."
                  required
                />
              </div>

              <button type="submit" className="submit-button" disabled={isLoading}>
                {isLoading ? 'Processing...' : 'Send Message'}
              </button>
            </form>

            {isLoading && (
              <div className="loading">
                <div className="spinner"></div>
                <p>
                  {selectedModel === 'all'
                    ? '🤖 All models discussing... This may take a moment'
                    : 'Thinking...'}
                </p>
              </div>
            )}

            {response && !isLoading && (
              <div className={`response-container ${response.success ? '' : 'error'}`}>
                <div className="response-header">
                  <h3>Answers</h3>
                  {response.duration && (
                    <span className="response-meta">{response.duration}ms</span>
                  )}
                </div>

                {response.success ? (
                  <>
                    {response.humanizedResponse && selectedModel === 'all' ? (
                      <>
                        {/* Comparison View */}
                        <div className="comparison-grid">
                          <div className="response-box">
                            <h3>Final Answer</h3>
                            <div className="response-content">
                              {response.response || 'No response'}
                            </div>
                          </div>

                          <div className="response-box humanized">
                            <h3>❤️ Humanized Answer</h3>
                            <div className="response-content humanized">
                              {response.humanizedResponse
                                .split(/\n\n+/)
                                .filter((p) => p.trim())
                                .map((paragraph, index) => (
                                  <p
                                    key={index}
                                    style={{
                                      marginBottom: '1em',
                                      color: '#555',
                                      lineHeight: '1.8',
                                    }}
                                  >
                                    {paragraph.trim()}
                                  </p>
                                ))}
                            </div>
                          </div>
                        </div>

                        {/* Initial Responses */}
                        {response.initialResponses && (
                          <div className="initial-responses">
                            <h4>Initial Responses from Each Model:</h4>
                            {Object.entries(response.initialResponses).map(
                              ([modelName, modelResponse]) => (
                                <div key={modelName} className="initial-response-item">
                                  <strong>{modelName}:</strong>
                                  <p>{modelResponse}</p>
                                </div>
                              )
                            )}
                          </div>
                        )}
                      </>
                    ) : (
                      /* Single View */
                      <div className="response-content">
                        {response.response || 'No response'}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="response-content">
                    Error: {response.error || 'Unknown error occurred'}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

