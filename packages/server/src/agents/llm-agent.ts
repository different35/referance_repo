import { Anthropic } from "@anthropic-ai/sdk";
import { cliExecutor } from "./cli-executor.js";
import { notebookLMClient } from "./notebook-lm.js";

export interface AgentTool {
  name: string;
  description: string;
  execute: (params: Record<string, unknown>) => Promise<unknown>;
}

export class SwarmAgent {
  private client: Anthropic;
  private model = "claude-3-5-sonnet-20241022";
  private tools: Map<string, AgentTool> = new Map();
  private conversationHistory: Array<{
    role: "user" | "assistant";
    content: string;
  }> = [];

  constructor() {
    this.client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    this.registerDefaultTools();
  }

  private registerDefaultTools() {
    this.registerTool({
      name: "query_github",
      description: "Query GitHub using gh CLI (e.g., get issues, PRs)",
      execute: async (params: any) => {
        const cmd = params.command as string;
        const result = await cliExecutor.execute(`gh ${cmd}`);
        return {
          success: result.success,
          output: result.stdout,
          error: result.stderr,
        };
      },
    });

    this.registerTool({
      name: "query_database",
      description: "Query PostgreSQL using psql",
      execute: async (params: any) => {
        const query = params.query as string;
        const result = await cliExecutor.execute(`psql -c "${query}"`);
        return {
          success: result.success,
          output: result.stdout,
          error: result.stderr,
        };
      },
    });

    this.registerTool({
      name: "analyze_json",
      description: "Parse and analyze JSON using jq",
      execute: async (params: any) => {
        const data = params.data as string;
        const filter = params.filter as string;
        const result = await cliExecutor.execute(
          `echo '${data}' | jq '${filter}'`
        );
        return {
          success: result.success,
          output: result.stdout,
          error: result.stderr,
        };
      },
    });
  }

  registerTool(tool: AgentTool) {
    this.tools.set(tool.name, tool);
  }

  async executeTask(
    taskInput: string,
    agentId: string,
    taskId: string
  ): Promise<{
    thoughts: string[];
    researchSummary: string;
    notebookSourceId: string | undefined;
    output: string;
  }> {
    this.conversationHistory = [];
    const thoughts: string[] = [];
    let researchSummary = "";
    let notebookSourceId: string | undefined;

    thoughts.push(`[${agentId}] Processing task: ${taskInput}`);

    const systemPrompt = `You are ${agentId}, an AI agent in a swarm management system.
Your role is to think step-by-step about marketing and advertising tasks.

When solving a problem:
1. Analyze the request carefully
2. Identify what CLI commands or tools you need
3. Execute them to gather data
4. Synthesize findings into actionable recommendations
5. Return structured JSON with your final answer

Available tools: ${Array.from(this.tools.keys()).join(", ")}`;

    this.conversationHistory.push({
      role: "user",
      content: taskInput,
    });

    // Phase 1: Thinking
    const thinkingPrompt = `${systemPrompt}

TASK: ${taskInput}

Think aloud about your approach. What CLI commands or data do you need?`;

    const thinkingResponse = await this.client.messages.create({
      model: this.model,
      max_tokens: 500,
      messages: [
        {
          role: "user",
          content: thinkingPrompt,
        },
      ],
    });

    const thinkingText =
      thinkingResponse.content[0].type === "text"
        ? thinkingResponse.content[0].text
        : "";

    thoughts.push(thinkingText);
    this.conversationHistory.push({
      role: "assistant",
      content: thinkingText,
    });

    // Phase 2: Research & CLI Execution (Token-Optimized)
    const researchPrompt = `Based on your thinking, execute necessary CLI commands.

Respond with a JSON object containing:
{
  "commands_needed": ["command1", "command2"],
  "analysis": "Brief analysis of what data you need"
}`;

    this.conversationHistory.push({
      role: "user",
      content: researchPrompt,
    });

    const researchResponse = await this.client.messages.create({
      model: this.model,
      max_tokens: 300,
      messages: this.conversationHistory,
    });

    const researchText =
      researchResponse.content[0].type === "text"
        ? researchResponse.content[0].text
        : "";

    // Parse and execute CLI commands
    let cliResults: Record<string, unknown> = {};
    try {
      const parsed = JSON.parse(researchText);
      const commands = parsed.commands_needed || [];

      for (const cmd of commands) {
        const result = await cliExecutor.execute(cmd);
        cliResults[cmd] = {
          success: result.success,
          output: result.stdout.substring(0, 1000), // Limit output size
          duration: result.duration,
        };
      }

      // Upload large research data to NotebookLM (token optimization)
      if (Object.keys(cliResults).length > 0) {
        const source = await notebookLMClient.uploadResearchData(
          taskId,
          cliResults
        );
        notebookSourceId = source.id;
        researchSummary = `CLI research completed. Source: ${source.id}. ${parsed.analysis || ""}`;
      } else {
        researchSummary = parsed.analysis || "Research analysis complete";
      }
    } catch (e) {
      researchSummary = "Research phase completed";
    }

    this.conversationHistory.push({
      role: "assistant",
      content: researchText,
    });

    // Phase 3: Final Output (Using NotebookLM reference if available)
    const finalPromptBase = `Based on your analysis${notebookSourceId ? `, referencing NotebookLM source ${notebookSourceId},` : ""} synthesize a final response:

{
  "recommendation": "Your main recommendation",
  "action_items": ["item1", "item2"],
  "risk_assessment": "Any risks to consider",
  "estimated_impact": "Expected outcome"
}`;

    this.conversationHistory.push({
      role: "user",
      content: finalPromptBase,
    });

    const finalResponse = await this.client.messages.create({
      model: this.model,
      max_tokens: 1000,
      messages: this.conversationHistory,
    });

    const outputText =
      finalResponse.content[0].type === "text"
        ? finalResponse.content[0].text
        : "";

    this.conversationHistory.push({
      role: "assistant",
      content: outputText,
    });

    return {
      thoughts,
      researchSummary,
      notebookSourceId,
      output: outputText,
    };
  }

  getConversationHistory() {
    return this.conversationHistory;
  }

  clearHistory() {
    this.conversationHistory = [];
  }
}

let agentInstance: SwarmAgent | null = null;

export function getSwarmAgent(): SwarmAgent {
  if (!agentInstance) {
    agentInstance = new SwarmAgent();
  }
  return agentInstance;
}
