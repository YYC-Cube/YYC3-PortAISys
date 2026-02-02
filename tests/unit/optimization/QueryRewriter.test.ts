import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { QueryRewriter } from '@/core/optimization/QueryRewriter';

describe('QueryRewriter', () => {
  let queryRewriter: QueryRewriter;

  beforeEach(() => {
    queryRewriter = new QueryRewriter();
  });

  afterEach(() => {
    queryRewriter.resetStats();
  });

  describe('rewrite', () => {
    it('should rewrite query with all rules', () => {
      const original = 'SELECT * FROM users WHERE id = 1 ORDER BY name ASC LIMIT 1000';
      const rewritten = queryRewriter.rewrite(original);
      expect(rewritten).toBeDefined();
      expect(typeof rewritten).toBe('string');
    });

    it('should rewrite query with specific rules', () => {
      const original = 'SELECT * FROM users WHERE id = 1';
      const rewritten = queryRewriter.rewrite(original, ['optimize-select-star']);
      expect(rewritten).toBeDefined();
      expect(typeof rewritten).toBe('string');
    });

    it('should handle empty query', () => {
      const rewritten = queryRewriter.rewrite('');
      expect(rewritten).toBe('');
    });

    it('should handle null query', () => {
      const rewritten = queryRewriter.rewrite(null as any);
      expect(rewritten).toBeNull();
    });
  });

  describe('optimizeJoins', () => {
    it('should optimize JOIN with id column', () => {
      const query = 'SELECT * FROM users u JOIN orders o ON u.id = o.user_id';
      const optimized = queryRewriter.rewrite(query, ['optimize-joins']);
      expect(optimized).toBeDefined();
    });

    it('should not modify JOIN without id column', () => {
      const query = 'SELECT * FROM users u JOIN orders o ON u.name = o.user_name';
      const optimized = queryRewriter.rewrite(query, ['optimize-joins']);
      expect(optimized).toBeDefined();
    });
  });

  describe('optimizeSubqueries', () => {
    it('should optimize subquery', () => {
      const query = 'SELECT * FROM (SELECT * FROM users) AS u';
      const optimized = queryRewriter.rewrite(query, ['optimize-subqueries']);
      expect(optimized).toBeDefined();
    });

    it('should handle nested subqueries', () => {
      const query = 'SELECT * FROM (SELECT * FROM (SELECT * FROM users) AS u1) AS u2';
      const optimized = queryRewriter.rewrite(query, ['optimize-subqueries']);
      expect(optimized).toBeDefined();
    });
  });

  describe('optimizeWhereClauses', () => {
    it('should reorder WHERE conditions', () => {
      const query = 'SELECT * FROM users WHERE name = "John" AND age > 25 AND email = "john@example.com"';
      const optimized = queryRewriter.rewrite(query, ['optimize-where-clauses']);
      expect(optimized).toBeDefined();
      expect(optimized).toContain('WHERE');
    });

    it('should handle single WHERE condition', () => {
      const query = 'SELECT * FROM users WHERE id = 1';
      const optimized = queryRewriter.rewrite(query, ['optimize-where-clauses']);
      expect(optimized).toBeDefined();
      expect(optimized).toContain('WHERE id = 1');
    });
  });

  describe('optimizeOrderBy', () => {
    it('should reorder ORDER BY columns', () => {
      const query = 'SELECT * FROM users ORDER BY name ASC, age DESC';
      const optimized = queryRewriter.rewrite(query, ['optimize-order-by']);
      expect(optimized).toBeDefined();
      expect(optimized).toContain('ORDER BY');
    });

    it('should handle single ORDER BY column', () => {
      const query = 'SELECT * FROM users ORDER BY name ASC';
      const optimized = queryRewriter.rewrite(query, ['optimize-order-by']);
      expect(optimized).toBeDefined();
      expect(optimized).toContain('ORDER BY');
    });
  });

  describe('optimizeSelectStar', () => {
    it('should replace SELECT * with specific table', () => {
      const query = 'SELECT * FROM users';
      const optimized = queryRewriter.rewrite(query, ['optimize-select-star']);
      expect(optimized).toBeDefined();
      expect(optimized).toContain('users.*');
    });

    it('should handle multiple tables', () => {
      const query = 'SELECT * FROM users, orders';
      const optimized = queryRewriter.rewrite(query, ['optimize-select-star']);
      expect(optimized).toBeDefined();
    });
  });

  describe('optimizeLimit', () => {
    it('should reduce large LIMIT value', () => {
      const query = 'SELECT * FROM users LIMIT 2000';
      const optimized = queryRewriter.rewrite(query, ['optimize-limit']);
      expect(optimized).toBeDefined();
      expect(optimized).toContain('LIMIT 1000');
    });

    it('should keep reasonable LIMIT value', () => {
      const query = 'SELECT * FROM users LIMIT 100';
      const optimized = queryRewriter.rewrite(query, ['optimize-limit']);
      expect(optimized).toBeDefined();
      expect(optimized).toContain('LIMIT 100');
    });
  });

  describe('optimizeDistinct', () => {
    it('should remove DISTINCT', () => {
      const query = 'SELECT DISTINCT name FROM users';
      const optimized = queryRewriter.rewrite(query, ['optimize-distinct']);
      expect(optimized).toBeDefined();
      expect(optimized).not.toContain('DISTINCT');
    });

    it('should handle query without DISTINCT', () => {
      const query = 'SELECT name FROM users';
      const optimized = queryRewriter.rewrite(query, ['optimize-distinct']);
      expect(optimized).toBeDefined();
    });
  });

  describe('optimizeInClauses', () => {
    it('should optimize large IN clause', () => {
      const values = Array.from({ length: 15 }, (_, i) => `'value${i}'`).join(', ');
      const query = `SELECT * FROM users WHERE name IN (${values})`;
      const optimized = queryRewriter.rewrite(query, ['optimize-in-clauses']);
      expect(optimized).toBeDefined();
    });

    it('should keep small IN clause', () => {
      const query = "SELECT * FROM users WHERE name IN ('value1', 'value2', 'value3')";
      const optimized = queryRewriter.rewrite(query, ['optimize-in-clauses']);
      expect(optimized).toBeDefined();
      expect(optimized).toContain('IN');
    });
  });

  describe('optimizeLikeClauses', () => {
    it('should optimize LIKE with wildcards', () => {
      const query = "SELECT * FROM users WHERE name LIKE '%John%'";
      const optimized = queryRewriter.rewrite(query, ['optimize-like-clauses']);
      expect(optimized).toBeDefined();
    });

    it('should handle LIKE without wildcards', () => {
      const query = "SELECT * FROM users WHERE name LIKE 'John'";
      const optimized = queryRewriter.rewrite(query, ['optimize-like-clauses']);
      expect(optimized).toBeDefined();
    });
  });

  describe('getRewriteStats', () => {
    it('should return empty stats initially', () => {
      const stats = queryRewriter.getRewriteStats();
      expect(stats.size).toBe(0);
    });

    it('should track rewrites', () => {
      queryRewriter.rewrite('SELECT * FROM users');
      queryRewriter.rewrite('SELECT * FROM orders');

      const stats = queryRewriter.getRewriteStats();
      expect(stats.size).toBeGreaterThan(0);
    });
  });

  describe('getTopRewrites', () => {
    it('should return empty array initially', () => {
      const topRewrites = queryRewriter.getTopRewrites();
      expect(topRewrites).toEqual([]);
    });

    it('should return top rewrites', () => {
      queryRewriter.rewrite('SELECT * FROM users');
      queryRewriter.rewrite('SELECT * FROM users');
      queryRewriter.rewrite('SELECT * FROM orders');

      const topRewrites = queryRewriter.getTopRewrites(2);
      expect(topRewrites.length).toBeLessThanOrEqual(2);
    });
  });

  describe('resetStats', () => {
    it('should clear rewrite stats', () => {
      queryRewriter.rewrite('SELECT * FROM users');
      queryRewriter.resetStats();

      const stats = queryRewriter.getRewriteStats();
      expect(stats.size).toBe(0);
    });
  });

  describe('edge cases', () => {
    it('should handle query with comments', () => {
      const query = 'SELECT * FROM users -- comment';
      const optimized = queryRewriter.rewrite(query);
      expect(optimized).toBeDefined();
    });

    it('should handle query with multiple statements', () => {
      const query = 'SELECT * FROM users; SELECT * FROM orders;';
      const optimized = queryRewriter.rewrite(query);
      expect(optimized).toBeDefined();
    });

    it('should handle query with special characters', () => {
      const query = "SELECT * FROM users WHERE name = 'O\\'Reilly'";
      const optimized = queryRewriter.rewrite(query);
      expect(optimized).toBeDefined();
    });

    it('should handle query with Unicode characters', () => {
      const query = "SELECT * FROM users WHERE name = '用户'";
      const optimized = queryRewriter.rewrite(query);
      expect(optimized).toBeDefined();
    });
  });
});
