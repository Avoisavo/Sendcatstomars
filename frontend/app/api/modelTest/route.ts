import { NextRequest, NextResponse } from 'next/server';

interface ModelConfig {
  name: string;
  endpoint: string;
  model: string;
}

// Configuration for different AI models - all routed through Phala API
const MODEL_CONFIGS: Record<string, ModelConfig> = {
  'openai': {
    name: 'OpenAI GPT-4',
    endpoint: 'https://api.redpill.ai/v1/chat/completions',
    model: 'openai/gpt-4'
  },
  'llama-8b': {
    name: 'DeepSeek',
    endpoint: 'https://api.redpill.ai/v1/chat/completions',
    model: 'deepseek/deepseek-chat'
  },
  'llama-70b': {
    name: 'Llama 70B (via GPT-OSS)',
    endpoint: 'https://api.redpill.ai/v1/chat/completions',
    model: 'openai/gpt-oss-20b' // Using GPT-OSS as Llama model not available on Phala
  },
  'qwen': {
    name: 'Qwen (via GPT-OSS)',
    endpoint: 'https://api.redpill.ai/v1/chat/completions',
    model: 'openai/gpt-oss-20b' // Using GPT-OSS as Qwen model not available on Phala
  }
};

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    const body = await request.json();
    const { prompt, model } = body;

    // Validate input
    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Prompt is required' },
        { status: 400 }
      );
    }

    if (!model || typeof model !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Model selection is required' },
        { status: 400 }
      );
    }

    // Handle "all models" discussion mode
    if (model === 'all') {
      const result = await handleAllModelsDiscussion(prompt);
      const duration = Date.now() - startTime;
      return NextResponse.json({
        ...result,
        duration
      });
    }

    // Handle single model request
    if (!MODEL_CONFIGS[model]) {
      return NextResponse.json(
        { success: false, error: `Unknown model: ${model}` },
        { status: 400 }
      );
    }

    const response = await callModel(model, prompt);
    const duration = Date.now() - startTime;

    return NextResponse.json({
      success: true,
      response,
      duration
    });

  } catch (error: any) {
    console.error('ModelTest API Error:', error);
    const duration = Date.now() - startTime;
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to process request',
        duration
      },
      { status: 500 }
    );
  }
}

async function callModel(modelKey: string, prompt: string): Promise<string> {
  const config = MODEL_CONFIGS[modelKey];
  
  // All models now use Phala API key
  const apiKey = process.env.PHALA_API_KEY || process.env.PHALA_AI_API_KEY;

  if (!apiKey) {
    throw new Error(`PHALA_API_KEY not configured. Please add PHALA_API_KEY to .env.local`);
  }

    // Create AbortController for timeout handling
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 45000); // 45 second timeout for Phala API

  try {
    const response = await fetch(config.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: config.model,
        messages: [
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 500 // Reduced from 1000 to speed up response
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId); // Clear timeout on success

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`${config.name} API Error (${response.status}):`, errorText.substring(0, 200));
      
      // Handle specific error codes
      if (response.status === 504 || response.status === 408) {
        throw new Error(`${config.name} timeout - service temporarily unavailable`);
      } else if (response.status === 429) {
        throw new Error(`${config.name} rate limited - please try again later`);
      } else {
        throw new Error(`${config.name} API Error: ${response.status}`);
      }
    }

    const data = await response.json();
    clearTimeout(timeoutId); // Ensure timeout is cleared
    return data.choices[0]?.message?.content || 'No response received';
  } catch (error: any) {
    clearTimeout(timeoutId); // Clear timeout on error
    // Handle AbortError (timeout)
    if (error.name === 'AbortError' || error.name === 'TimeoutError' || error.message?.includes('aborted')) {
      console.error(`Timeout calling ${config.name} - request took longer than 45 seconds`);
      throw new Error(`${config.name} timeout - request took too long`);
    }
    
    // Handle network errors
    if (error instanceof TypeError && error.message.includes('fetch')) {
      console.error(`Network error calling ${config.name}:`, error.message);
      throw new Error(`${config.name} network error - please check your connection`);
    }
    
    console.error(`Error calling ${config.name}:`, error);
    throw new Error(`Failed to get response from ${config.name}: ${error.message}`);
  }
}

async function handleAllModelsDiscussion(prompt: string): Promise<{
  success: boolean;
  response?: string;
  humanizedResponse?: string;
  initialResponses?: Record<string, string>;
  error?: string;
}> {
  try {
    // Step 1: Get initial responses from all models in parallel (excluding llama-70b)
    const modelKeys = Object.keys(MODEL_CONFIGS).filter(key => key !== 'llama-70b');
    const initialPromises = modelKeys.map(async (key) => {
      try {
        const response = await callModel(key, prompt);
        return { key, response };
      } catch (error: any) {
        console.error(`Error from ${key}:`, error);
        return { key, response: `Error: ${error.message}` };
      }
    });

    const results = await Promise.all(initialPromises);
    const initialResponses: Record<string, string> = {};
    
    // Separate successful responses from errors
    const successfulResults = results.filter(({ response }) => !response.startsWith('Error:'));
    const errorResults = results.filter(({ response }) => response.startsWith('Error:'));
    
    // Only include successful responses in the discussion
    successfulResults.forEach(({ key, response }) => {
      initialResponses[MODEL_CONFIGS[key].name] = response;
    });
    
    // Include error info separately (optional, for transparency)
    errorResults.forEach(({ key, response }) => {
      initialResponses[MODEL_CONFIGS[key].name] = `${response} (This model was unavailable)`;
    });

    // Check if we have at least one successful response
    if (successfulResults.length === 0) {
      return {
        success: false,
        error: 'All models failed to respond. Please try again later.'
      };
    }

    // Step 2: Create a discussion summary combining all responses (including successful ones)
    const discussionText = successfulResults.length > 0
      ? successfulResults
          .map(({ key, response }) => `${MODEL_CONFIGS[key].name}:\n${response}`)
          .join('\n\n---\n\n')
      : results
          .map(({ key, response }) => `${MODEL_CONFIGS[key].name}:\n${response}`)
          .join('\n\n---\n\n');

    const synthesisPrompt = `You are a synthesis assistant. Multiple AI models have responded to the following question:

"${prompt}"

Here are their responses:

${discussionText}

Please synthesize these responses into a comprehensive, coherent answer that:
1. Identifies common themes and agreements
2. Highlights unique insights from each model
3. Resolves any contradictions
4. Provides a balanced, well-rounded conclusion

Keep your synthesis clear, concise, and informative.`;

    // Use OpenAI to synthesize (or fallback to first available successful model)
    let finalResponse: string;
    try {
      finalResponse = await callModel('openai', synthesisPrompt);
    } catch (error) {
      // Fallback to first available successful model
      const availableModel = successfulResults.find(({ key }) => key !== 'openai')?.key;
      if (availableModel) {
        try {
          finalResponse = await callModel(availableModel, synthesisPrompt);
        } catch (fallbackError) {
          // If all synthesis fails, just use the first successful response
          finalResponse = successfulResults[0]?.response || discussionText;
        }
      } else {
        // If no other models available, use the discussion text or first response
        finalResponse = successfulResults[0]?.response || discussionText;
      }
    }

    // Step 3: Create a humanized version (100 words max, paragraph form, heartfelt, with engaging question)
    const humanizePrompt = `Take this technical AI synthesis and rewrite it as a heartfelt, warm paragraph with smooth, flowing sentences. Make it feel like genuine advice from a caring friend:

${finalResponse}

Rewrite this as a single, smooth paragraph that:
- Flows naturally with connected, heartfelt sentences
- Speaks from the heart with genuine warmth and empathy
- Uses smooth transitions between ideas
- Is written in paragraph form (not bullet points or list)
- Feels personal and deeply caring
- Removes all technical jargon
- Ends with an engaging, thoughtful question to encourage the user to continue the conversation (the question should feel natural and related to what was discussed)
- Is EXACTLY 100 words or less (count your words carefully - the question at the end counts toward the word limit)

Write a heartfelt, smooth paragraph ending with an engaging question (100 words max total, including the question):`;

    let humanizedResponse: string;
    try {
      humanizedResponse = await callModel('openai', humanizePrompt);
      
      // Ensure response is exactly 100 words or less, preserving question if possible
      const words = humanizedResponse.trim().split(/\s+/);
      if (words.length > 100) {
        // Try to keep the question mark if it exists near the end
        const truncated = words.slice(0, 100);
        const lastWord = truncated[truncated.length - 1];
        let foundQuestion = false;
        
        // If the original had a question mark and we're cutting it off, try to preserve it
        if (humanizedResponse.includes('?') && !lastWord.includes('?')) {
          // Look back up to 15 words to find the question
          const searchBack = Math.min(15, truncated.length);
          for (let i = truncated.length - 1; i >= truncated.length - searchBack; i--) {
            if (truncated[i] && truncated[i].includes('?')) {
              humanizedResponse = truncated.slice(0, i + 1).join(' ');
              foundQuestion = true;
              break;
            }
          }
        }
        
        // If no question found in truncated portion, just add period
        if (!foundQuestion) {
          humanizedResponse = truncated.join(' ') + '.';
        }
      }
    } catch (error) {
      // If humanization fails, use the original synthesis (also limit to 100 words)
      const words = finalResponse.trim().split(/\s+/);
      humanizedResponse = words.length > 100 
        ? words.slice(0, 100).join(' ') + '.' 
        : finalResponse;
    }

    return {
      success: true,
      response: finalResponse,
      humanizedResponse,
      initialResponses
    };

  } catch (error: any) {
    console.error('Error in all models discussion:', error);
    return {
      success: false,
      error: error.message || 'Failed to process multi-model discussion'
    };
  }
}

