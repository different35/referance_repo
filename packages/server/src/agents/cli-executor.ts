import { execSync } from "child_process";

export interface CLIExecutionResult {
  command: string;
  stdout: string;
  stderr: string;
  exitCode: number;
  duration: number;
  success: boolean;
}

export class CLIExecutor {
  private whitelist = new Set([
    "gh", // GitHub CLI
    "psql", // PostgreSQL
    "sqlite3", // SQLite
    "curl", // HTTP requests
    "echo", // Output
    "jq", // JSON parsing
    "grep", // Search
    "sort", // Sort
    "cut", // Extract fields
    "wc", // Count lines
  ]);

  private blacklist = new Set([
    "rm", // Delete (dangerous)
    "mv", // Move (dangerous)
    "cp", // Copy (can be misused)
    "dd", // Disk operations
    "mkfs", // Format
    "shutdown", // System control
    "sudo", // Privilege escalation
    "chmod", // Permission changes (dangerous)
  ]);

  isCommandAllowed(command: string): boolean {
    const baseCommand = command.split(" ")[0];

    if (this.blacklist.has(baseCommand)) {
      return false;
    }

    return this.whitelist.has(baseCommand);
  }

  async execute(
    command: string,
    timeout: number = 30000
  ): Promise<CLIExecutionResult> {
    const startTime = Date.now();

    if (!this.isCommandAllowed(command)) {
      return {
        command,
        stdout: "",
        stderr: `Command not allowed: ${command}`,
        exitCode: 1,
        duration: 0,
        success: false,
      };
    }

    try {
      const stdout = execSync(command, {
        timeout,
        encoding: "utf-8",
        stdio: ["pipe", "pipe", "pipe"],
      }) as string;

      return {
        command,
        stdout: stdout || "",
        stderr: "",
        exitCode: 0,
        duration: Date.now() - startTime,
        success: true,
      };
    } catch (error: any) {
      return {
        command,
        stdout: (error.stdout as string) || "",
        stderr: (error.stderr as string) || (error.message as string) || "",
        exitCode: error.status || 1,
        duration: Date.now() - startTime,
        success: false,
      };
    }
  }

  async executeMultiple(
    commands: string[],
    timeout: number = 30000
  ): Promise<CLIExecutionResult[]> {
    const results: CLIExecutionResult[] = [];

    for (const command of commands) {
      const result = await this.execute(command, timeout);
      results.push(result);

      if (!result.success) {
        console.warn(`⚠️ Command failed: ${command}`, result.stderr);
        break;
      }
    }

    return results;
  }
}

export const cliExecutor = new CLIExecutor();
