/**
 * Agent File System Tools
 *
 * Agents can read/write files directly
 * YouTube videos, Instagram creatives, research data, etc.
 */

import * as fs from "fs/promises";
import * as path from "path";

export interface FileOperation {
  type: "read" | "write" | "list" | "delete" | "create";
  path: string;
  content?: string;
  options?: Record<string, unknown>;
}

export interface FileResult {
  success: boolean;
  data?: unknown;
  error?: string;
  path: string;
}

export class AgentFileSystem {
  private workDir: string;

  constructor(workDir: string = process.env.AGENT_WORK_DIR || "./agent-data") {
    this.workDir = workDir;
  }

  /**
   * Normalize path - prevent directory traversal
   */
  private normalizePath(filePath: string): string {
    const fullPath = path.resolve(this.workDir, filePath);
    const normalized = path.normalize(fullPath);

    if (!normalized.startsWith(this.workDir)) {
      throw new Error(`Access denied: Path outside work directory`);
    }

    return normalized;
  }

  /**
   * Read file
   */
  async readFile(filePath: string): Promise<FileResult> {
    try {
      const normalizedPath = this.normalizePath(filePath);
      const content = await fs.readFile(normalizedPath, "utf-8");

      return {
        success: true,
        data: content,
        path: filePath,
      };
    } catch (error) {
      return {
        success: false,
        error: (error as Error).message,
        path: filePath,
      };
    }
  }

  /**
   * Write file
   */
  async writeFile(filePath: string, content: string): Promise<FileResult> {
    try {
      const normalizedPath = this.normalizePath(filePath);

      // Ensure directory exists
      await fs.mkdir(path.dirname(normalizedPath), { recursive: true });

      await fs.writeFile(normalizedPath, content, "utf-8");

      return {
        success: true,
        data: { written: content.length },
        path: filePath,
      };
    } catch (error) {
      return {
        success: false,
        error: (error as Error).message,
        path: filePath,
      };
    }
  }

  /**
   * List directory
   */
  async listDir(dirPath: string = "."): Promise<FileResult> {
    try {
      const normalizedPath = this.normalizePath(dirPath);
      const files = await fs.readdir(normalizedPath, { withFileTypes: true });

      const listing = files.map((f) => ({
        name: f.name,
        type: f.isDirectory() ? "dir" : "file",
        path: path.join(dirPath, f.name),
      }));

      return {
        success: true,
        data: listing,
        path: dirPath,
      };
    } catch (error) {
      return {
        success: false,
        error: (error as Error).message,
        path: dirPath,
      };
    }
  }

  /**
   * Append to file (for logs, research notes)
   */
  async appendFile(filePath: string, content: string): Promise<FileResult> {
    try {
      const normalizedPath = this.normalizePath(filePath);

      // Ensure directory exists
      await fs.mkdir(path.dirname(normalizedPath), { recursive: true });

      await fs.appendFile(normalizedPath, content + "\n", "utf-8");

      return {
        success: true,
        data: { appended: true },
        path: filePath,
      };
    } catch (error) {
      return {
        success: false,
        error: (error as Error).message,
        path: filePath,
      };
    }
  }

  /**
   * Create directory
   */
  async createDir(dirPath: string): Promise<FileResult> {
    try {
      const normalizedPath = this.normalizePath(dirPath);
      await fs.mkdir(normalizedPath, { recursive: true });

      return {
        success: true,
        data: { created: true },
        path: dirPath,
      };
    } catch (error) {
      return {
        success: false,
        error: (error as Error).message,
        path: dirPath,
      };
    }
  }

  /**
   * Delete file or empty directory
   */
  async deleteFile(filePath: string): Promise<FileResult> {
    try {
      const normalizedPath = this.normalizePath(filePath);
      await fs.unlink(normalizedPath);

      return {
        success: true,
        data: { deleted: true },
        path: filePath,
      };
    } catch (error) {
      return {
        success: false,
        error: (error as Error).message,
        path: filePath,
      };
    }
  }

  /**
   * Get file stats
   */
  async getFileStats(filePath: string): Promise<FileResult> {
    try {
      const normalizedPath = this.normalizePath(filePath);
      const stats = await fs.stat(normalizedPath);

      return {
        success: true,
        data: {
          size: stats.size,
          isDirectory: stats.isDirectory(),
          isFile: stats.isFile(),
          created: stats.birthtime,
          modified: stats.mtime,
        },
        path: filePath,
      };
    } catch (error) {
      return {
        success: false,
        error: (error as Error).message,
        path: filePath,
      };
    }
  }

  /**
   * Search for files by pattern
   */
  async searchFiles(
    pattern: string,
    dirPath: string = "."
  ): Promise<FileResult> {
    try {
      const normalizedPath = this.normalizePath(dirPath);
      const regex = new RegExp(pattern);
      const results: string[] = [];

      const search = async (dir: string) => {
        const entries = await fs.readdir(dir, { withFileTypes: true });

        for (const entry of entries) {
          const fullPath = path.join(dir, entry.name);
          const relativePath = path.relative(this.workDir, fullPath);

          if (regex.test(relativePath)) {
            results.push(relativePath);
          }

          if (entry.isDirectory()) {
            await search(fullPath);
          }
        }
      };

      await search(normalizedPath);

      return {
        success: true,
        data: results,
        path: dirPath,
      };
    } catch (error) {
      return {
        success: false,
        error: (error as Error).message,
        path: dirPath,
      };
    }
  }

  getWorkDir(): string {
    return this.workDir;
  }
}

let fsInstance: AgentFileSystem | null = null;

export function getAgentFileSystem(): AgentFileSystem {
  if (!fsInstance) {
    fsInstance = new AgentFileSystem();
  }
  return fsInstance;
}
