import { APIGatewayProxyHandler } from 'aws-lambda';
import { ChatRequest, ChatResponse, ChatMessage } from '../types/chat';
import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();

const apiKey = process.env.MISTRAL_API_KEY;
const modelName = process.env.MODEL_NAME || 'mistral-medium';
const maxTokens = parseInt(process.env.MAX_TOKENS || '1000', 10);

const SYSTEM_PROMPT = `You are a helpful AI assistant specialized in answering technical questions about programming, software development, and technology. 
Your responses should be:
- Clear and concise
- Include code examples when relevant
- Explain complex concepts in simple terms
- Focus on best practices and modern approaches
Please provide accurate, up-to-date information and acknowledge if you're unsure about something.`;

async function callMistralAPI(userMessage: string, history: ChatMessage[] = []) {
  try {
    const messages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...history,
      { role: 'user', content: userMessage }
    ];

    const response = await axios.post(
      'https://api.mistral.ai/v1/chat/completions',
      {
        model: modelName,
        messages,
        max_tokens: maxTokens,
        temperature: 0.7,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        }
      }
    );
    
    return response.data.choices[0].message.content;
  } catch (error) {
    console.error('Error calling Mistral API:', error);
    throw new Error('Failed to generate response');
  }
}

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    if (!event.body) {
      throw new Error('Missing request body');
    }

    const { message, history = [] } = JSON.parse(event.body) as ChatRequest;
    
    const response = await callMistralAPI(message, history);
    
    const newHistory: ChatMessage[] = [
      ...history,
      { role: 'user', content: message },
      { role: 'assistant', content: response }
    ];

    const chatResponse: ChatResponse = {
      message: response,
      history: newHistory
    };

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
      },
      body: JSON.stringify(chatResponse),
    };
  } catch (error) {
    console.error('Error processing chat request:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
      },
      body: JSON.stringify({
        error: 'Failed to process chat request',
        message: error instanceof Error ? error.message : 'Unknown error'
      }),
    };
  }
}; 