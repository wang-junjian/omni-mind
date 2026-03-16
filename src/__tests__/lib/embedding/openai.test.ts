import { splitTextIntoChunks } from '@/lib/embedding/openai';

describe('embedding utils', () => {
  describe('splitTextIntoChunks', () => {
    it('should split short text into single chunk', () => {
      const text = '这是一段短文本。';
      const chunks = splitTextIntoChunks(text, 100);
      expect(chunks.length).toBe(1);
      expect(chunks[0]).toBe(text);
    });

    it('should split long text into multiple chunks', () => {
      const text = '这是第一句话。'.repeat(100);
      const chunks = splitTextIntoChunks(text, 50);
      expect(chunks.length).toBeGreaterThan(1);
      // 检查所有块拼接起来和原文一致
      const joined = chunks.join('').replace(/\s+/g, '');
      expect(joined).toBe(text.replace(/\s+/g, ''));
    });

    it('should split by sentences', () => {
      const text = '第一句话。第二句话？第三句话！第四句话。';
      const chunks = splitTextIntoChunks(text, 10);
      expect(chunks.length).toBeGreaterThan(1);
      // 确保句子不会被截断
      chunks.forEach(chunk => {
        expect(chunk).toMatch(/[。！？.!?]$/);
      });
    });

    it('should handle empty text', () => {
      expect(splitTextIntoChunks('')).toEqual([]);
      expect(splitTextIntoChunks('   ')).toEqual([]);
    });

    it('should handle very long text with multiple sentences', () => {
      const longSentence = '这是第一句话。'.repeat(20);
      const chunks = splitTextIntoChunks(longSentence, 20);
      expect(chunks.length).toBeGreaterThan(1);
    });

    it('should respect max tokens limit', () => {
      const text = '测试句子。'.repeat(50);
      const maxTokens = 20;
      const chunks = splitTextIntoChunks(text, maxTokens);
      chunks.forEach(chunk => {
        // 简单估算token数
        const tokenCount = chunk.length + (chunk.match(/\s+/g)?.length || 0);
        expect(tokenCount).toBeLessThanOrEqual(maxTokens + 10); // 允许一些误差
      });
    });
  });
});
