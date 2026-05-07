import { spawn, ChildProcess } from "child_process";
import { existsSync, writeFileSync, unlinkSync, mkdirSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";
import { emitOutput, emitStateChange } from "../ws/activity-events.js";
import type { ActivityState } from "../state-machines/activity.fsm.js";

export interface ClaudeAgentDefinition {
  name: string;
  description: string;
  model: string;
  system: string;
}

export interface ClaudeSessionConfig {
  activityId: string;
  agentDef: ClaudeAgentDefinition;
  objective: string;
}

interface StreamJsonEvent {
  type: "assistant" | "user" | "result" | "system";
  message?: {
    content?: Array<{ type: string; text?: string }>;
  };
  result?: string;
  subtype?: string;
}

class ClaudeCodeSessionManager {
  private sessions = new Map<string, ChildProcess>();
  private tempFiles = new Map<string, string>();

  async start(config: ClaudeSessionConfig): Promise<void> {
    const { activityId, agentDef, objective } = config;

    if (this.sessions.has(activityId)) {
      throw new Error(`Session ${activityId} zaten çalışıyor`);
    }

    const tmpDir = join(tmpdir(), "swarm-claude-sessions");
    if (!existsSync(tmpDir)) mkdirSync(tmpDir, { recursive: true });

    const promptFile = join(tmpDir, `${activityId}-system-prompt.txt`);
    writeFileSync(promptFile, agentDef.system, "utf-8");
    this.tempFiles.set(activityId, promptFile);

    const args = [
      "--print",
      "-p",
      objective,
      "--output-format", "stream-json",
      "--permission-mode", "bypassPermissions",
      "--system-prompt-file", promptFile,
    ];

    if (agentDef.model) {
      args.push("--model", agentDef.model);
    }

    emitOutput(activityId, `▸ claude --model ${agentDef.model} --system-prompt-file ... -p "${objective.substring(0, 80)}..."\n\n`);

    const proc = spawn("claude", args, {
      stdio: ["pipe", "pipe", "pipe"],
      env: { ...process.env, CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS: "1" },
    });

    this.sessions.set(activityId, proc);

    let buffer = "";

    proc.stdout?.on("data", (data: Buffer) => {
      buffer += data.toString();

      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;

        try {
          const event: StreamJsonEvent = JSON.parse(trimmed);

          if (event.type === "assistant" && event.message?.content) {
            for (const block of event.message.content) {
              if (block.type === "text" && block.text) {
                emitOutput(activityId, block.text);
              }
            }
          } else if (event.type === "result") {
            emitOutput(activityId, `\n\n✅ ${event.result ?? "Tamamlandı"}\n`);
          } else if (event.type === "system" && event.subtype === "init") {
            emitOutput(activityId, "⚡ Claude Code başlatılıyor...\n");
          }
        } catch {
          emitOutput(activityId, trimmed + "\n");
        }
      }
    });

    proc.stderr?.on("data", (data: Buffer) => {
      emitOutput(activityId, `[stderr] ${data.toString()}`);
    });

    proc.on("error", (err) => {
      emitOutput(activityId, `\n❌ Process hatası: ${err.message}\n`);
      this.cleanupSession(activityId);
    });

    proc.on("close", (code) => {
      emitOutput(activityId, `\n▸ Claude Code çıkış kodu: ${code}\n`);

      if (code === 0) {
        emitStateChange(activityId, "running" as ActivityState, "stopped" as ActivityState);
      } else {
        emitStateChange(activityId, "running" as ActivityState, "error" as ActivityState, `Çıkış kodu: ${code}`);
      }

      this.cleanupSession(activityId);
    });

    emitStateChange(activityId, "starting" as ActivityState, "running" as ActivityState);
  }

  async stop(activityId: string): Promise<void> {
    const proc = this.sessions.get(activityId);
    if (!proc) {
      emitOutput(activityId, "▸ Aktif Claude Code session bulunamadı\n");
      emitStateChange(activityId, "running" as ActivityState, "stopped" as ActivityState);
      return;
    }

    emitOutput(activityId, "\n▸ Claude Code durduruluyor...\n");
    emitStateChange(activityId, "running" as ActivityState, "stopping" as ActivityState);

    proc.kill("SIGTERM");

    setTimeout(() => {
      if (this.sessions.has(activityId)) {
        try { proc.kill("SIGKILL"); } catch {}
        this.cleanupSession(activityId);
        emitStateChange(activityId, "stopping" as ActivityState, "stopped" as ActivityState);
      }
    }, 5000);
  }

  isRunning(activityId: string): boolean {
    return this.sessions.has(activityId);
  }

  private cleanupSession(activityId: string): void {
    this.sessions.delete(activityId);

    const tmpFile = this.tempFiles.get(activityId);
    if (tmpFile && existsSync(tmpFile)) {
      try { unlinkSync(tmpFile); } catch {}
      this.tempFiles.delete(activityId);
    }
  }
}

export const claudeSessionManager = new ClaudeCodeSessionManager();
