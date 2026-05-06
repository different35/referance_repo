/**
 * NotebookLM Integration for Token-Optimized Research Storage
 *
 * Instead of storing large research data in state context,
 * we upload to NotebookLM and keep only the source ID reference.
 * This drastically reduces token usage for Claude API calls.
 */

export interface NotebookLMSource {
  id: string;
  name: string;
  type: "text" | "markdown" | "json";
  createdAt: number;
  size: number; // bytes
}

export class NotebookLMClient {
  private sources: Map<string, NotebookLMSource> = new Map();
  private sourceCounter = 0;

  /**
   * Upload research data to NotebookLM
   * Returns a source ID that can be referenced by Claude
   */
  async uploadResearchData(
    taskId: string,
    data: Record<string, unknown> | string
  ): Promise<NotebookLMSource> {
    const content = typeof data === "string" ? data : JSON.stringify(data, null, 2);

    // Simulate NotebookLM API call
    // In production, this would call: POST https://api.notebooklm.google.com/v1alpha/sources
    const source: NotebookLMSource = {
      id: `nb-source-${taskId}-${this.sourceCounter++}`,
      name: `Research Data for Task ${taskId}`,
      type: content.length > 5000 ? "json" : "text",
      createdAt: Date.now(),
      size: new TextEncoder().encode(content).length,
    };

    this.sources.set(source.id, source);

    console.log(
      `📚 Research data uploaded to NotebookLM: ${source.id} (${source.size} bytes)`
    );

    return source;
  }

  /**
   * Generate a reference prompt for Claude
   * Instead of passing large data, pass a reference
   */
  generateReferencePrompt(
    sourceId: string,
    query: string
  ): string {
    const source = this.sources.get(sourceId);
    if (!source) {
      return `[Source not found: ${sourceId}]`;
    }

    return `
Based on the research data stored in NotebookLM source "${source.id}" (uploaded at ${new Date(source.createdAt).toISOString()}):

${query}

You can reference this data in your analysis. The source contains detailed research that was too large to include directly.
    `.trim();
  }

  /**
   * Create a summary instruction for Claude
   * Tells Claude to use NotebookLM reference instead of raw data
   */
  createSummaryInstruction(sourceId: string): string {
    const source = this.sources.get(sourceId);
    if (!source) return "";

    return `
Reference NotebookLM Source: ${source.id}
This source contains researched data (${source.size} bytes).
In your response, cite specific findings from this source using [Source: ${source.id}] notation.
    `.trim();
  }

  getSource(sourceId: string): NotebookLMSource | undefined {
    return this.sources.get(sourceId);
  }

  listSources(): NotebookLMSource[] {
    return Array.from(this.sources.values());
  }

  clearSources(): void {
    this.sources.clear();
  }
}

export const notebookLMClient = new NotebookLMClient();
