import type { BaseChatModel } from '@langchain/core/language_models/chat_models';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { ChatOllama } from '@langchain/ollama';
import { requireEnv } from '../../env';
import { MODEL_CONFIG, ModelProvider } from '../definitions';

function getGoogleModelConfig() {
  return {
    ...MODEL_CONFIG.google,
    apiKey: requireEnv('GOOGLE_API_KEY'),
  };
}

function getOllamaModelConfig() {
  return {
    baseUrl: process.env.OLLAMA_URL ?? MODEL_CONFIG.ollama.baseUrl,
    model: process.env.OLLAMA_CHAT_MODEL ?? MODEL_CONFIG.ollama.model,
    temperature: MODEL_CONFIG.ollama.temperature,
    numCtx: MODEL_CONFIG.ollama.numCtx,
  };
}

export function createChatModel(provider: ModelProvider): BaseChatModel {
  switch (provider) {
    case 'google':
      return new ChatGoogleGenerativeAI(getGoogleModelConfig());
    case 'ollama':
      return new ChatOllama(getOllamaModelConfig());
    default: {
      const unsupportedProvider: string = provider;
      throw new Error(`Unsupported provider: ${unsupportedProvider}`);
    }
  }
}
