import { NextRequest, NextResponse } from 'next/server';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { messages, action } = body;

    // Validate messages
    if (!messages || !Array.isArray(messages)) {
      console.error('Invalid request: messages is missing or not an array');
      return NextResponse.json(
        { success: false, error: 'Invalid request: messages array is required' },
        { status: 400 }
      );
    }

    // Get API key from environment
    const apiKey = process.env.PHALA_API_KEY || process.env.PHALA_AI_API_KEY;
    
    if (!apiKey) {
      console.error('PHALA_API_KEY or PHALA_AI_API_KEY not found in environment variables');
      return NextResponse.json(
        { success: false, error: 'API key not configured. Please add PHALA_API_KEY to .env.local' },
        { status: 500 }
      );
    }

    // Handle summary generation
    if (action === 'generate_summary') {
      const conversationText = messages
        .map((msg: Message) => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`)
        .join('\n\n');

      const summaryPrompt = `Please provide a comprehensive conclusion summarizing the user's situation, concerns, feelings, and the key points discussed in the conversation. Focus on understanding the user's complete situation - what they're experiencing, their challenges, the insights gained, and the overall context. Write this as a conclusive statement that wraps up the entire conversation. Keep it concise (around 100-150 words). 

CRITICAL REQUIREMENTS:
- Write ONLY statements and conclusions
- DO NOT include any questions (no question marks)
- DO NOT ask "what", "which", "how", "why", "when", "where", "who", "would", "could", "should", "can", "will", "do", "did", "does", "are", "is", "was", "were" in question form
- End with a conclusive statement, NOT a question
- Focus on concluding the user's situation

Conversation:
${conversationText}

Conclusive Summary (statements only, no questions):`;

      const summary = await callPhalaAPI(apiKey, [
        { role: 'user', content: summaryPrompt }
      ]);

      // Clean up any questions that might have slipped through
      let cleanedSummary = summary.replace(/[^.!]*\?[^.!]*/g, '').trim();
      cleanedSummary = cleanedSummary.replace(/\s+(what|which|how|why|when|where|who|would|could|should|can|will|do|did|does|are|is|was|were)\s+[^.!?]*\?/gi, '').trim();
      cleanedSummary = cleanedSummary.replace(/\?/g, '.').trim();
      cleanedSummary = cleanedSummary.replace(/\s+/g, ' ').trim();

      return NextResponse.json({
        success: true,
        response: cleanedSummary
      });
    }

    // Determine if this is the first user message (only user messages, no assistant responses yet)
    const userMessages = messages.filter((m: Message) => m.role === 'user');
    const assistantMessages = messages.filter((m: Message) => m.role === 'assistant');
    const isFirstMessage = userMessages.length === 1 && assistantMessages.length === 0;

    // Handle first message - generate dual responses
    if (isFirstMessage) {
      const userPrompt = messages[0].content;

      // Get rational response (humanized, logical style)
      const rationalPrompt = `${userPrompt}\n\nPlease respond in a rational, logical, and analytical manner. Focus on facts, reasoning, and practical solutions.`;
      const rationalResponse = await callPhalaAPI(apiKey, [
        { role: 'user', content: rationalPrompt }
      ]);

      // Get emotional response (humanized, empathetic style)
      const emotionalPrompt = `${userPrompt}\n\nPlease respond in a warm, empathetic, and emotionally supportive manner. Focus on feelings, understanding, and emotional comfort.`;
      const emotionalResponse = await callPhalaAPI(apiKey, [
        { role: 'user', content: emotionalPrompt }
      ]);

      return NextResponse.json({
        success: true,
        isFirstMessage: true,
        rationalResponse,
        emotionalResponse
      });
    }

    // Handle subsequent messages - detect preferred style from conversation
    let preferredStyle: 'rational' | 'emotional' | null = null;
    
    // Look for style indicators in the conversation metadata or user's first choice
    // For now, we'll infer from the pattern - if there are assistant messages, continue the style
    if (assistantMessages.length > 0) {
      // Check the tone of previous assistant messages to maintain consistency
      const lastAssistantMessage = assistantMessages[assistantMessages.length - 1].content;
      
      // Simple heuristic: if the message has empathy keywords, it's emotional
      const emotionalKeywords = ['feel', 'understand', 'support', 'care', 'empathy', 'emotion', 'heart'];
      const rationalKeywords = ['analyze', 'logical', 'practical', 'solution', 'fact', 'reason', 'objective'];
      
      const emotionalScore = emotionalKeywords.filter(kw => 
        lastAssistantMessage.toLowerCase().includes(kw)
      ).length;
      const rationalScore = rationalKeywords.filter(kw => 
        lastAssistantMessage.toLowerCase().includes(kw)
      ).length;
      
      preferredStyle = emotionalScore > rationalScore ? 'emotional' : 'rational';
    }

    // Add style guidance to the latest message
    const conversationMessages = [...messages];
    if (preferredStyle) {
      const lastMessage = conversationMessages[conversationMessages.length - 1];
      if (lastMessage.role === 'user') {
        const stylePrompt = preferredStyle === 'rational'
          ? '\n\n[Respond in a rational, logical manner focusing on facts and reasoning.]'
          : '\n\n[Respond in a warm, empathetic manner focusing on feelings and emotional support.]';
        lastMessage.content += stylePrompt;
      }
    }

    const response = await callPhalaAPI(apiKey, conversationMessages);

    return NextResponse.json({
      success: true,
      response
    });

  } catch (error: any) {
    console.error('Chat API Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to process request' },
      { status: 500 }
    );
  }
}

async function callPhalaAPI(apiKey: string, messages: Message[]): Promise<string> {
  try {
    const response = await fetch('https://api.redpill.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'openai/gpt-oss-20b',
        messages: messages
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Phala API Error Response:', errorText);
      throw new Error(`Phala API Error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || 'No response received';
  } catch (error: any) {
    console.error('Error calling Phala API:', error);
    throw error;
  }
}

