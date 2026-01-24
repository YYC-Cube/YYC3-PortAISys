/**
 * @file 高性能算法测试
 * @description 测试HighPerformanceAlgorithms的核心算法实现
 * @module tests/unit/algorithms
 * @author YYC³
 * @version 1.0.0
 * @created 2026-01-21
 */

import { describe, it, expect } from 'vitest';
import { HighPerformanceAlgorithms } from '../../../core/algorithms/HighPerformanceAlgorithms';

describe('HighPerformanceAlgorithms', () => {
  let algorithms: HighPerformanceAlgorithms;

  beforeEach(() => {
    algorithms = new HighPerformanceAlgorithms();
  });

  describe('排序算法', () => {
    describe('mergeSort', () => {
      it('应该正确排序数字数组', () => {
        const arr = [64, 34, 25, 12, 22, 11, 90];
        const sorted = algorithms.mergeSort(arr);
        expect(sorted).toEqual([11, 12, 22, 25, 34, 64, 90]);
      });

      it('应该处理空数组', () => {
        const arr: number[] = [];
        const sorted = algorithms.mergeSort(arr);
        expect(sorted).toEqual([]);
      });

      it('应该处理单元素数组', () => {
        const arr = [42];
        const sorted = algorithms.mergeSort(arr);
        expect(sorted).toEqual([42]);
      });

      it('应该处理已排序数组', () => {
        const arr = [1, 2, 3, 4, 5];
        const sorted = algorithms.mergeSort(arr);
        expect(sorted).toEqual([1, 2, 3, 4, 5]);
      });

      it('应该处理反向排序数组', () => {
        const arr = [5, 4, 3, 2, 1];
        const sorted = algorithms.mergeSort(arr);
        expect(sorted).toEqual([1, 2, 3, 4, 5]);
      });

      it('应该支持自定义比较函数', () => {
        const arr = ['banana', 'apple', 'cherry', 'date'];
        const sorted = algorithms.mergeSort(arr, (a, b) => a.localeCompare(b));
        expect(sorted).toEqual(['apple', 'banana', 'cherry', 'date']);
      });

      it('应该支持降序排序', () => {
        const arr = [3, 1, 4, 1, 5, 9, 2, 6];
        const sorted = algorithms.mergeSort(arr, (a, b) => b - a);
        expect(sorted).toEqual([9, 6, 5, 4, 3, 2, 1, 1]);
      });

      it('应该处理重复元素', () => {
        const arr = [3, 1, 4, 1, 5, 9, 2, 6, 5, 3];
        const sorted = algorithms.mergeSort(arr);
        expect(sorted).toEqual([1, 1, 2, 3, 3, 4, 5, 5, 6, 9]);
      });

      it('应该处理大型数组', () => {
        const arr = Array.from({ length: 1000 }, () => Math.floor(Math.random() * 1000));
        const sorted = algorithms.mergeSort(arr);
        
        for (let i = 1; i < sorted.length; i++) {
          expect(sorted[i]).toBeGreaterThanOrEqual(sorted[i - 1]);
        }
      });
    });

    describe('quickSort', () => {
      it('应该正确排序数字数组', () => {
        const arr = [64, 34, 25, 12, 22, 11, 90];
        const sorted = algorithms.quickSort(arr);
        expect(sorted).toEqual([11, 12, 22, 25, 34, 64, 90]);
      });

      it('应该处理空数组', () => {
        const arr: number[] = [];
        const sorted = algorithms.quickSort(arr);
        expect(sorted).toEqual([]);
      });

      it('应该处理单元素数组', () => {
        const arr = [42];
        const sorted = algorithms.quickSort(arr);
        expect(sorted).toEqual([42]);
      });

      it('应该支持自定义比较函数', () => {
        const arr = [
          { id: 3, name: 'Charlie' },
          { id: 1, name: 'Alice' },
          { id: 2, name: 'Bob' }
        ];
        const sorted = algorithms.quickSort(arr, (a, b) => a.id - b.id);
        expect(sorted.map(x => x.id)).toEqual([1, 2, 3]);
      });

      it('应该处理重复元素', () => {
        const arr = [5, 2, 8, 2, 9, 1, 5, 5];
        const sorted = algorithms.quickSort(arr);
        expect(sorted).toEqual([1, 2, 2, 5, 5, 5, 8, 9]);
      });

      it('应该处理大型数组', () => {
        const arr = Array.from({ length: 1000 }, () => Math.floor(Math.random() * 1000));
        const sorted = algorithms.quickSort(arr);
        
        for (let i = 1; i < sorted.length; i++) {
          expect(sorted[i]).toBeGreaterThanOrEqual(sorted[i - 1]);
        }
      });
    });
  });

  describe('搜索算法', () => {
    describe('binarySearch', () => {
      it('应该找到存在的元素', () => {
        const arr = [1, 3, 5, 7, 9, 11, 13, 15];
        const index = algorithms.binarySearch(arr, 7);
        expect(index).toBe(3);
      });

      it('应该返回-1对于不存在的元素', () => {
        const arr = [1, 3, 5, 7, 9, 11, 13, 15];
        const index = algorithms.binarySearch(arr, 8);
        expect(index).toBe(-1);
      });

      it('应该找到第一个元素', () => {
        const arr = [1, 3, 5, 7, 9];
        const index = algorithms.binarySearch(arr, 1);
        expect(index).toBe(0);
      });

      it('应该找到最后一个元素', () => {
        const arr = [1, 3, 5, 7, 9];
        const index = algorithms.binarySearch(arr, 9);
        expect(index).toBe(4);
      });

      it('应该处理单元素数组', () => {
        const arr = [42];
        expect(algorithms.binarySearch(arr, 42)).toBe(0);
        expect(algorithms.binarySearch(arr, 43)).toBe(-1);
      });

      it('应该支持自定义比较函数', () => {
        const arr = ['alice', 'bob', 'charlie', 'david'];
        const index = algorithms.binarySearch(arr, 'charlie', (a, b) => a.localeCompare(b));
        expect(index).toBe(2);
      });
    });

    describe('levenshteinDistance', () => {
      it('应该计算相同字符串的距离为0', () => {
        const distance = algorithms.levenshteinDistance('hello', 'hello');
        expect(distance).toBe(0);
      });

      it('应该计算单个字符替换', () => {
        const distance = algorithms.levenshteinDistance('hello', 'hallo');
        expect(distance).toBe(1);
      });

      it('应该计算单个字符插入', () => {
        const distance = algorithms.levenshteinDistance('hello', 'helllo');
        expect(distance).toBe(1);
      });

      it('应该计算单个字符删除', () => {
        const distance = algorithms.levenshteinDistance('hello', 'helo');
        expect(distance).toBe(1);
      });

      it('应该计算完全不同的字符串', () => {
        const distance = algorithms.levenshteinDistance('abc', 'xyz');
        expect(distance).toBe(3);
      });

      it('应该处理空字符串', () => {
        expect(algorithms.levenshteinDistance('', 'hello')).toBe(5);
        expect(algorithms.levenshteinDistance('hello', '')).toBe(5);
        expect(algorithms.levenshteinDistance('', '')).toBe(0);
      });

      it('应该处理复杂案例', () => {
        const distance = algorithms.levenshteinDistance('kitten', 'sitting');
        expect(distance).toBe(3);
      });
    });

    describe('fuzzySearch', () => {
      it('应该找到精确匹配', () => {
        const items = ['apple', 'banana', 'cherry'];
        const results = algorithms.fuzzySearch(items, 'apple', (item) => item, 0.8);
        
        expect(results.length).toBeGreaterThan(0);
        expect(results[0].item).toBe('apple');
        expect(results[0].similarity).toBe(1);
      });

      it('应该找到近似匹配', () => {
        const items = ['hello', 'world', 'help'];
        const results = algorithms.fuzzySearch(items, 'helo', (item) => item, 0.7);
        
        expect(results.length).toBeGreaterThan(0);
        expect(results[0].item).toBe('hello');
      });

      it('应该按相似度排序结果', () => {
        const items = ['test', 'testing', 'tester', 'best'];
        const results = algorithms.fuzzySearch(items, 'test', (item) => item, 0.5);
        
        expect(results[0].item).toBe('test');
        expect(results[0].similarity).toBe(1);
        expect(results[1].similarity).toBeLessThan(1);
      });

      it('应该过滤低于阈值的结果', () => {
        const items = ['apple', 'banana', 'cherry'];
        const results = algorithms.fuzzySearch(items, 'xyz', (item) => item, 0.9);
        
        expect(results.length).toBe(0);
      });

      it('应该支持对象数组搜索', () => {
        const items = [
          { id: 1, name: 'John Doe' },
          { id: 2, name: 'Jane Smith' },
          { id: 3, name: 'John Smith' }
        ];
        const results = algorithms.fuzzySearch(items, 'john', (item) => item.name, 0.5);
        
        expect(results.length).toBeGreaterThan(0);
        expect(results[0].item.name).toContain('John');
      });

      it('应该不区分大小写', () => {
        const items = ['Apple', 'BANANA', 'cherry'];
        const results = algorithms.fuzzySearch(items, 'apple', (item) => item, 0.9);
        
        expect(results.length).toBeGreaterThan(0);
        expect(results[0].item).toBe('Apple');
      });
    });
  });

  describe('机器学习算法', () => {
    describe('kMeans', () => {
      it('应该正确聚类简单数据', () => {
        const data = [
          [1, 1], [1, 2], [2, 1],
          [8, 8], [8, 9], [9, 8]
        ];
        const k = 2;
        
        const result = algorithms.kMeans(data, k, 100);
        
        expect(result.clusters).toHaveLength(2);
        expect(result.centroids).toHaveLength(2);
        
        // 检查聚类结果的合理性
        const cluster1Points = result.clusters[0].map(idx => data[idx]);
        const cluster2Points = result.clusters[1].map(idx => data[idx]);
        
        // 两个聚类应该都有数据点
        expect(cluster1Points.length).toBeGreaterThan(0);
        expect(cluster2Points.length).toBeGreaterThan(0);
      });

      it('应该处理单个聚类', () => {
        const data = [[1, 1], [2, 2], [3, 3]];
        const k = 1;
        
        const result = algorithms.kMeans(data, k);
        
        expect(result.clusters).toHaveLength(1);
        expect(result.clusters[0]).toHaveLength(3);
      });

      it('应该收敛到稳定状态', () => {
        const data = [
          [0, 0], [1, 1], [0, 1], [1, 0],
          [10, 10], [11, 11], [10, 11], [11, 10]
        ];
        const k = 2;
        
        const result = algorithms.kMeans(data, k, 100);
        
        // 运行两次应该得到相似的结果（可能顺序不同）
        const result2 = algorithms.kMeans(data, k, 100);
        
        expect(result.clusters).toHaveLength(2);
        expect(result2.clusters).toHaveLength(2);
      });

      it('应该处理高维数据', () => {
        const data = [
          [1, 2, 3, 4],
          [2, 3, 4, 5],
          [10, 11, 12, 13],
          [11, 12, 13, 14]
        ];
        const k = 2;
        
        const result = algorithms.kMeans(data, k);
        
        expect(result.centroids).toHaveLength(2);
        expect(result.centroids[0]).toHaveLength(4);
      });
    });

    describe('linearRegression', () => {
      it('应该拟合简单线性关系', () => {
        const x = [1, 2, 3, 4, 5];
        const y = [2, 4, 6, 8, 10]; // y = 2x
        
        const model = algorithms.linearRegression(x, y);
        
        expect(model.slope).toBeCloseTo(2, 1);
        expect(model.intercept).toBeCloseTo(0, 1);
      });

      it('应该正确预测值', () => {
        const x = [1, 2, 3, 4, 5];
        const y = [3, 5, 7, 9, 11]; // y = 2x + 1
        
        const model = algorithms.linearRegression(x, y);
        
        expect(model.predict(6)).toBeCloseTo(13, 0);
        expect(model.predict(0)).toBeCloseTo(1, 0);
      });

      it('应该处理带截距的线性关系', () => {
        const x = [0, 1, 2, 3, 4];
        const y = [5, 8, 11, 14, 17]; // y = 3x + 5
        
        const model = algorithms.linearRegression(x, y);
        
        expect(model.slope).toBeCloseTo(3, 1);
        expect(model.intercept).toBeCloseTo(5, 1);
      });

      it('应该处理负斜率', () => {
        const x = [1, 2, 3, 4, 5];
        const y = [10, 8, 6, 4, 2]; // y = -2x + 12
        
        const model = algorithms.linearRegression(x, y);
        
        expect(model.slope).toBeLessThan(0);
        expect(model.predict(6)).toBeCloseTo(0, 0);
      });

      it('应该处理单点数据', () => {
        const x = [5];
        const y = [10];
        
        // 单点无法确定唯一直线，但不应该崩溃
        expect(() => algorithms.linearRegression(x, y)).not.toThrow();
      });
    });
  });

  describe('性能测试', () => {
    it('mergeSort应该在合理时间内处理大数据', () => {
      const largeArray = Array.from({ length: 10000 }, () => Math.random());
      const startTime = Date.now();
      
      const sorted = algorithms.mergeSort(largeArray);
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      expect(sorted).toHaveLength(10000);
      expect(duration).toBeLessThan(1000); // 应该在1秒内完成
    });

    it('quickSort应该在合理时间内处理大数据', () => {
      const largeArray = Array.from({ length: 10000 }, () => Math.random());
      const startTime = Date.now();
      
      const sorted = algorithms.quickSort(largeArray);
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      expect(sorted).toHaveLength(10000);
      expect(duration).toBeLessThan(1000);
    });

    it('binarySearch应该在合理时间内搜索大数组', () => {
      const largeArray = Array.from({ length: 100000 }, (_, i) => i);
      const startTime = Date.now();
      
      const index = algorithms.binarySearch(largeArray, 50000);
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      expect(index).toBe(50000);
      expect(duration).toBeLessThan(100); // 应该非常快
    });

    it('kMeans应该在合理时间内聚类中等规模数据', () => {
      const data = Array.from({ length: 1000 }, () => [
        Math.random() * 100,
        Math.random() * 100
      ]);
      const startTime = Date.now();
      
      const result = algorithms.kMeans(data, 5, 50);
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      expect(result.clusters).toHaveLength(5);
      expect(duration).toBeLessThan(5000); // 应该在5秒内完成
    });
  });

  describe('边界情况', () => {
    it('所有算法应该处理空输入', () => {
      expect(() => algorithms.mergeSort([])).not.toThrow();
      expect(() => algorithms.quickSort([])).not.toThrow();
      expect(() => algorithms.binarySearch([], 1)).not.toThrow();
      expect(() => algorithms.linearRegression([], [])).not.toThrow();
    });

    it('应该处理极端值', () => {
      const extremeArray = [Number.MAX_VALUE, Number.MIN_VALUE, 0, -Infinity, Infinity];
      
      expect(() => algorithms.mergeSort(extremeArray)).not.toThrow();
      expect(() => algorithms.quickSort(extremeArray)).not.toThrow();
    });

    it('应该处理相同元素数组', () => {
      const sameArray = new Array(100).fill(42);
      
      const sorted = algorithms.mergeSort(sameArray);
      expect(sorted).toEqual(sameArray);
      
      const quickSorted = algorithms.quickSort(sameArray);
      expect(quickSorted).toEqual(sameArray);
    });
  });
});
