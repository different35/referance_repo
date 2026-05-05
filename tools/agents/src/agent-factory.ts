import Anthropic from "@anthropic-ai/sdk";

export interface AgentConfig {
  name: string;
  role: string;
  tools: Anthropic.Tool[];
  systemPrompt?: string;
}

export interface AgentResult {
  success: boolean;
  output: string;
  errors?: string[];
}

export class Agent {
  private client: Anthropic;
  private config: AgentConfig;
  private conversationHistory: Anthropic.MessageParam[] = [];

  constructor(config: AgentConfig) {
    this.client = new Anthropic();
    this.config = config;
  }

  async execute(task: string): Promise<AgentResult> {
    try {
      this.conversationHistory.push({
        role: "user",
        content: task,
      });

      const response = await this.client.messages.create({
        model: "claude-opus-4-7",
        max_tokens: 4096,
        system: this.config.systemPrompt || `You are ${this.config.role}. Execute tasks efficiently and provide clear output.`,
        tools: this.config.tools,
        messages: this.conversationHistory,
      });

      let toolUseBlocks: Anthropic.ToolUseBlock[] = [];
      let textOutput = "";

      for (const block of response.content) {
        if (block.type === "text") {
          textOutput += block.text;
        } else if (block.type === "tool_use") {
          toolUseBlocks.push(block);
        }
      }

      if (toolUseBlocks.length > 0) {
        this.conversationHistory.push({
          role: "assistant",
          content: response.content,
        });

        const toolResults: Anthropic.ToolResultBlockParam[] = [];
        for (const toolUse of toolUseBlocks) {
          const result = await this.executeToolCall(toolUse);
          toolResults.push({
            type: "tool_result",
            tool_use_id: toolUse.id,
            content: result,
          });
        }

        this.conversationHistory.push({
          role: "user",
          content: toolResults,
        });

        const finalResponse = await this.client.messages.create({
          model: "claude-opus-4-7",
          max_tokens: 4096,
          system: this.config.systemPrompt || "",
          tools: this.config.tools,
          messages: this.conversationHistory,
        });

        for (const block of finalResponse.content) {
          if (block.type === "text") {
            textOutput += block.text;
          }
        }
      }

      return {
        success: true,
        output: textOutput,
      };
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      return {
        success: false,
        output: "",
        errors: [errorMsg],
      };
    }
  }

  private async executeToolCall(toolUse: Anthropic.ToolUseBlock): Promise<string> {
    // Will be overridden in subclasses
    return JSON.stringify({ status: "tool called", toolName: toolUse.name });
  }

  addToolResult(toolName: string, result: unknown): void {
    // Helper for multi-turn conversations
  }
}
