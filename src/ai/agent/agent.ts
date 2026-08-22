import { SystemMessage, type BaseMessage } from '@langchain/core/messages';
import {
  MemorySaver,
  type LangGraphRunnableConfig,
  type StreamMode,
} from '@langchain/langgraph';
import { createAgent } from 'langchain';

import { createChatModel } from './model';
import { AGENT_CONFIG, RunAgentOptions, type ModelProvider } from '../definitions';
import { prompts } from './prompts';
import { getTools } from './tools-definitions';

const checkpointer = new MemorySaver();

export async function createAgentGraph() {
  const tools = await getTools();
  const systemPrompt = new SystemMessage(
    `
            ${prompts.house}\n
        `,
  );

  return createAgent({
    model: createChatModel(AGENT_CONFIG.provider),
    tools,
    systemPrompt,
    checkpointer,
  });
}

export async function runAgent(options: RunAgentOptions) {
  const agent = await createAgentGraph();

  return agent.stream(options.input, {
    encoding: AGENT_CONFIG.encoding,
    streamMode: [...AGENT_CONFIG.streamMode],
    configurable: options.config.configurable,
    recursionLimit: AGENT_CONFIG.recursionLimit,
  });
}
