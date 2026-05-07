import { describe, it, expect, vi, beforeEach } from 'vitest';
import { LocalAgentService } from './local-agent.service.js';

const mockChatCreate = vi.fn();
const mockModelsList = vi.fn();

vi.mock('openai', () => ({
  OpenAI: vi.fn().mockImplementation(() => ({
    chat: { completions: { create: mockChatCreate } },
    models: { list: mockModelsList },
  })),
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe('LocalAgentService — behavior tests', () => {
  const service = new LocalAgentService(
    'http://127.0.0.1:8080/v1',
    'test-model',
  );

  describe('isAvailable', () => {
    it('returns true when LM Studio responds with models', async () => {
      mockModelsList.mockResolvedValueOnce({ data: [{ id: 'model-1' }] });
      const result = await service.isAvailable();
      expect(result).toBe(true);
      expect(mockModelsList).toHaveBeenCalledOnce();
    });

    it('returns false when LM Studio is unreachable', async () => {
      mockModelsList.mockRejectedValueOnce(new Error('Connection refused'));
      const result = await service.isAvailable();
      expect(result).toBe(false);
    });
  });

  describe('getAvailableModels', () => {
    it('returns model IDs from LM Studio', async () => {
      mockModelsList.mockResolvedValueOnce({
        data: [{ id: 'llama-3.2-3b' }, { id: 'mistral-7b' }],
      });
      const models = await service.getAvailableModels();
      expect(models).toEqual(['llama-3.2-3b', 'mistral-7b']);
    });

    it('returns empty on error', async () => {
      mockModelsList.mockRejectedValueOnce(new Error('timeout'));
      const models = await service.getAvailableModels();
      expect(models).toEqual([]);
    });
  });

  describe('chat', () => {
    it('sends messages and returns content with duration', async () => {
      mockChatCreate.mockResolvedValueOnce({
        choices: [{ message: { content: 'Hello from LM Studio' } }],
        model: 'test-model',
      });

      const result = await service.chat([
        { role: 'system', content: 'You are a helpful assistant.' },
        { role: 'user', content: 'Say hello.' },
      ]);

      expect(result.content).toBe('Hello from LM Studio');
      expect(result.model).toBe('test-model');
      expect(result.duration).toBeGreaterThanOrEqual(0);
      expect(mockChatCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          model: 'test-model',
          messages: expect.arrayContaining([
            expect.objectContaining({ role: 'system' }),
            expect.objectContaining({ role: 'user' }),
          ]),
          stream: false,
        }),
      );
    });

    it('returns empty content on empty response', async () => {
      mockChatCreate.mockResolvedValueOnce({
        choices: [{}],
        model: 'test-model',
      });

      const result = await service.chat([
        { role: 'user', content: 'test' },
      ]);
      expect(result.content).toBe('');
    });

    it('passes temperature and maxTokens correctly', async () => {
      mockChatCreate.mockResolvedValueOnce({
        choices: [{ message: { content: 'ok' } }],
        model: 'test-model',
      });

      await service.chat(
        [{ role: 'user', content: 'hi' }],
        0.3,
        500,
      );

      expect(mockChatCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          temperature: 0.3,
          max_tokens: 500,
        }),
      );
    });
  });

  describe('executeTask', () => {
    it('streams chunks and returns full output on success', async () => {
      const chunks = [
        { choices: [{ delta: { content: 'Step 1' } }] },
        { choices: [{ delta: { content: ' complete.' } }] },
        { choices: [{ delta: { content: '' } }] },
      ];
      mockChatCreate.mockResolvedValueOnce(
        (async function* () {
          for (const c of chunks) yield c;
        })(),
      );

      const onOutput = vi.fn();
      const result = await service.executeTask(
        {
          activityId: 'act-1',
          agentId: 'agent-test',
          objective: 'Write analysis',
        },
        onOutput,
      );

      expect(result.success).toBe(true);
      expect(result.output).toBe('Step 1 complete.');
      expect(result.activityId).toBe('act-1');
      expect(result.duration).toBeGreaterThanOrEqual(0);
      expect(onOutput).toHaveBeenCalledTimes(2);
      expect(onOutput).toHaveBeenNthCalledWith(1, 'Step 1');
      expect(onOutput).toHaveBeenNthCalledWith(2, ' complete.');
    });

    it('returns error result when LM Studio call fails', async () => {
      mockChatCreate.mockRejectedValueOnce(new Error('Model overloaded'));

      const result = await service.executeTask(
        { activityId: 'act-2', agentId: 'agent-test', objective: 'fail' },
        vi.fn(),
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe('Model overloaded');
      expect(result.output).toBe('');
    });
  });
});
