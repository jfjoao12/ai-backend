import { MemorySaver } from '@langchain/langgraph';
import { Injectable } from '@nestjs/common';
import { createAgent, SystemMessage } from 'langchain';
import { createChatModel } from './model';
import { prompts } from './prompts';
import { AGENT_CONFIG, RunAgentOptions } from '../definitions';
import { AgentToolsService } from './agent-tools.service';

@Injectable()
export class AgentService {
  private readonly graph: ReturnType<typeof createAgent>;

  constructor(private readonly agentToolService: AgentToolsService) {
    this.graph = createAgent({
      model: createChatModel(AGENT_CONFIG.provider),
      tools: this.agentToolService.getTools(),
      systemPrompt: new SystemMessage(prompts.house),
      checkpointer: new MemorySaver(),
    });
  }

  runAgent(options: RunAgentOptions) {
    return this.graph.stream(options.input, {
      ...options.config,
      encoding: AGENT_CONFIG.encoding,
      streamMode: [...AGENT_CONFIG.streamMode],
      recursionLimit: AGENT_CONFIG.recursionLimit,
    });
  }
}
