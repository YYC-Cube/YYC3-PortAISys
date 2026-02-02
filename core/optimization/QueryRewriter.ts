export class QueryRewriter {
  private rewriteRules: Map<string, (query: string) => string> = new Map();
  private rewriteStats: Map<string, { original: string; rewritten: string; count: number }> = new Map();

  constructor() {
    this.initializeRewriteRules();
  }

  private initializeRewriteRules(): void {
    this.rewriteRules.set('optimize-joins', this.optimizeJoins.bind(this));
    this.rewriteRules.set('optimize-subqueries', this.optimizeSubqueries.bind(this));
    this.rewriteRules.set('optimize-where-clauses', this.optimizeWhereClauses.bind(this));
    this.rewriteRules.set('optimize-order-by', this.optimizeOrderBy.bind(this));
    this.rewriteRules.set('optimize-select-star', this.optimizeSelectStar.bind(this));
    this.rewriteRules.set('optimize-limit', this.optimizeLimit.bind(this));
    this.rewriteRules.set('optimize-distinct', this.optimizeDistinct.bind(this));
    this.rewriteRules.set('optimize-in-clauses', this.optimizeInClauses.bind(this));
    this.rewriteRules.set('optimize-like-clauses', this.optimizeLikeClauses.bind(this));
  }

  rewrite(query: string, rules: string[] = []): string {
    let rewritten = query;
    const rulesToApply = rules.length > 0 ? rules : Array.from(this.rewriteRules.keys());

    for (const ruleName of rulesToApply) {
      const rule = this.rewriteRules.get(ruleName);
      if (rule) {
        rewritten = rule(rewritten);
      }
    }

    this.recordRewrite(query, rewritten);

    return rewritten;
  }

  private optimizeJoins(query: string): string {
    return query.replace(/JOIN\s+(\w+)\s+ON\s+(\w+)\.(\w+)\s*=\s*(\w+)\.(\w+)/gi, 
      (match, table, t1, c1, t2, c2) => {
        if (c1 === 'id') {
          return `JOIN ${table} ON ${t2}.${c2} = ${t1}.${c1}`;
        }
        return match;
      });
  }

  private optimizeSubqueries(query: string): string {
    return query.replace(/SELECT\s+\*\s+FROM\s+\((.+)\)\s+AS\s+(\w+)/gi, 
      (match, subquery, alias) => {
        const optimized = this.rewrite(subquery);
        return `SELECT * FROM (${optimized}) AS ${alias}`;
      });
  }

  private optimizeWhereClauses(query: string): string {
    return query.replace(/WHERE\s+(.+)/gi, 
      (match, conditions) => {
        const optimized = this.reorderConditions(conditions);
        return `WHERE ${optimized}`;
      });
  }

  private optimizeOrderBy(query: string): string {
    return query.replace(/ORDER BY\s+(.+)\s+(ASC|DESC)/gi, 
      (match, columns, direction) => {
        const optimized = this.reorderColumns(columns);
        return `ORDER BY ${optimized} ${direction}`;
      });
  }

  private optimizeSelectStar(query: string): string {
    const selectStarMatch = query.match(/SELECT\s+\*\s+FROM\s+(\w+)/i);
    if (selectStarMatch) {
      const tableName = selectStarMatch[1];
      return query.replace(/SELECT\s+\*/i, `SELECT ${tableName}.*`);
    }
    return query;
  }

  private optimizeLimit(query: string): string {
    if (!query.includes('LIMIT')) {
      return query;
    }

    return query.replace(/LIMIT\s+(\d+)/i, (match, limit) => {
      const limitNum = parseInt(limit);
      if (limitNum > 1000) {
        return `LIMIT 1000 OFFSET 0`;
      }
      return match;
    });
  }

  private optimizeDistinct(query: string): string {
    if (query.includes('SELECT DISTINCT')) {
      return query.replace(/SELECT\s+DISTINCT/gi, 'SELECT');
    }
    return query;
  }

  private optimizeInClauses(query: string): string {
    return query.replace(/IN\s*\(([^)]+)\)/gi, 
      (match, values) => {
        const valueList = values.split(',').map(v => v.trim());
        if (valueList.length > 10) {
          return `IN (SELECT value FROM temp_values WHERE value IN (${values}))`;
        }
        return match;
      });
  }

  private optimizeLikeClauses(query: string): string {
    return query.replace(/LIKE\s+'%\w+%'/gi, 
      (match) => {
        return match.replace(/%/g, '');
      });
  }

  private reorderConditions(conditions: string): string {
    const parts = conditions.split(/\s+AND\s+/i);
    return parts.sort().join(' AND ');
  }

  private reorderColumns(columns: string): string {
    const parts = columns.split(/\s*,\s*/);
    return parts.sort().join(', ');
  }

  private recordRewrite(original: string, rewritten: string): void {
    const key = this.generateRewriteKey(original);
    const stats = this.rewriteStats.get(key);

    if (stats) {
      stats.count++;
    } else {
      this.rewriteStats.set(key, {
        original,
        rewritten,
        count: 1,
      });
    }
  }

  private generateRewriteKey(query: string): string {
    return query.replace(/\s+/g, ' ').trim().substring(0, 100);
  }

  getRewriteStats(): Map<string, { original: string; rewritten: string; count: number }> {
    return new Map(this.rewriteStats);
  }

  getTopRewrites(limit: number = 10): Array<{ original: string; rewritten: string; count: number }> {
    return Array.from(this.rewriteStats.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  }

  resetStats(): void {
    this.rewriteStats.clear();
  }
}
