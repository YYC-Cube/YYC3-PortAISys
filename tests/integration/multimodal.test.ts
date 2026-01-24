import { describe, it, expect, beforeEach } from 'vitest';
import { MultiModalProcessor } from '../../core/multimodal/MultiModalProcessor';

describe('多模态处理集成测试', () => {
  let processor: MultiModalProcessor;

  beforeEach(() => {
    processor = new MultiModalProcessor({
      textModel: 'gpt-4',
      visionModel: 'gpt-4-vision',
    });
  });

  describe('文本处理', () => {
    it('应该处理文本输入', async () => {
      const result = await processor.processModality('text', 'Hello world');
      expect(result).toBeDefined();
      expect(result.type).toBe('text');
    });
  });

  describe('多模态融合', () => {
    it('应该融合多种模态', async () => {
      const inputs = [
        { type: 'text' as const, data: 'Test text' },
        { type: 'text' as const, data: 'More text' },
      ];

      const fused = await processor.fuse(inputs, 'early');
      expect(fused).toBeDefined();
    });
  });
});