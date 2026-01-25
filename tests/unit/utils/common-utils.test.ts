/**
 * @file 公共工具函数库测试
 * @description 测试公共工具函数库的各项功能
 * @author YYC³ Team
 * @version 1.0.0
 * @created 2026-01-25
 */

import { describe, it, expect } from 'vitest';
import {
  StringUtils,
  NumberUtils,
  ArrayUtils,
  ObjectUtils,
  DateUtils,
  ValidationUtils,
  FormatUtils,
  ErrorUtils,
  DebounceThrottleUtils,
  TypeUtils
} from '../../../core/utils/common-utils';

describe('StringUtils', () => {
  describe('isEmpty', () => {
    it('应该正确判断空字符串', () => {
      expect(StringUtils.isEmpty('')).toBe(true);
      expect(StringUtils.isEmpty('   ')).toBe(true);
      expect(StringUtils.isEmpty(null)).toBe(true);
      expect(StringUtils.isEmpty(undefined)).toBe(true);
    });

    it('应该正确判断非空字符串', () => {
      expect(StringUtils.isEmpty('hello')).toBe(false);
      expect(StringUtils.isEmpty('  hello  ')).toBe(false);
    });
  });

  describe('isNotEmpty', () => {
    it('应该正确判断非空字符串', () => {
      expect(StringUtils.isNotEmpty('hello')).toBe(true);
      expect(StringUtils.isNotEmpty('  hello  ')).toBe(true);
    });

    it('应该正确判断空字符串', () => {
      expect(StringUtils.isNotEmpty('')).toBe(false);
      expect(StringUtils.isNotEmpty(null)).toBe(false);
      expect(StringUtils.isNotEmpty(undefined)).toBe(false);
    });
  });

  describe('truncate', () => {
    it('应该正确截断字符串', () => {
      expect(StringUtils.truncate('Hello World', 8)).toBe('Hello...');
      expect(StringUtils.truncate('Hello World', 11)).toBe('Hello World');
      expect(StringUtils.truncate('Hello World', 5, '***')).toBe('He***');
    });
  });

  describe('capitalize', () => {
    it('应该正确首字母大写', () => {
      expect(StringUtils.capitalize('hello')).toBe('Hello');
      expect(StringUtils.capitalize('HELLO')).toBe('HELLO');
      expect(StringUtils.capitalize('')).toBe('');
    });
  });

  describe('camelCase', () => {
    it('应该正确转换为驼峰命名', () => {
      expect(StringUtils.camelCase('hello-world')).toBe('helloWorld');
      expect(StringUtils.camelCase('hello_world')).toBe('helloWorld');
      expect(StringUtils.camelCase('hello world')).toBe('helloWorld');
    });
  });

  describe('kebabCase', () => {
    it('应该正确转换为短横线命名', () => {
      expect(StringUtils.kebabCase('helloWorld')).toBe('hello-world');
      expect(StringUtils.kebabCase('HelloWorld')).toBe('hello-world');
    });
  });

  describe('snakeCase', () => {
    it('应该正确转换为下划线命名', () => {
      expect(StringUtils.snakeCase('helloWorld')).toBe('hello_world');
      expect(StringUtils.snakeCase('HelloWorld')).toBe('hello_world');
    });
  });

  describe('generateId', () => {
    it('应该生成唯一ID', () => {
      const id1 = StringUtils.generateId();
      const id2 = StringUtils.generateId();
      expect(id1).not.toBe(id2);
      expect(id1).toMatch(/^id-\d+-[a-z0-9]+$/);
    });

    it('应该支持自定义前缀', () => {
      const id = StringUtils.generateId('custom');
      expect(id).toMatch(/^custom-\d+-[a-z0-9]+$/);
    });
  });

  describe('formatBytes', () => {
    it('应该正确格式化字节数', () => {
      expect(StringUtils.formatBytes(0)).toBe('0 Bytes');
      expect(StringUtils.formatBytes(1024)).toBe('1 KB');
      expect(StringUtils.formatBytes(1048576)).toBe('1 MB');
      expect(StringUtils.formatBytes(1073741824)).toBe('1 GB');
    });
  });

  describe('formatDuration', () => {
    it('应该正确格式化持续时间', () => {
      expect(StringUtils.formatDuration(1000)).toBe('1s');
      expect(StringUtils.formatDuration(60000)).toBe('1m 0s');
      expect(StringUtils.formatDuration(3600000)).toBe('1h 0m');
      expect(StringUtils.formatDuration(86400000)).toBe('1d 0h');
    });
  });
});

describe('NumberUtils', () => {
  describe('isNumber', () => {
    it('应该正确判断数字', () => {
      expect(NumberUtils.isNumber(123)).toBe(true);
      expect(NumberUtils.isNumber(12.34)).toBe(true);
      expect(NumberUtils.isNumber(NaN)).toBe(false);
      expect(NumberUtils.isNumber('123')).toBe(false);
    });
  });

  describe('isInteger', () => {
    it('应该正确判断整数', () => {
      expect(NumberUtils.isInteger(123)).toBe(true);
      expect(NumberUtils.isInteger(12.34)).toBe(false);
      expect(NumberUtils.isInteger('123')).toBe(false);
    });
  });

  describe('clamp', () => {
    it('应该正确限制数值范围', () => {
      expect(NumberUtils.clamp(5, 0, 10)).toBe(5);
      expect(NumberUtils.clamp(-5, 0, 10)).toBe(0);
      expect(NumberUtils.clamp(15, 0, 10)).toBe(10);
    });
  });

  describe('round', () => {
    it('应该正确四舍五入', () => {
      expect(NumberUtils.round(12.345, 2)).toBe(12.35);
      expect(NumberUtils.round(12.344, 2)).toBe(12.34);
    });
  });

  describe('percentage', () => {
    it('应该正确计算百分比', () => {
      expect(NumberUtils.percentage(50, 100)).toBe(50);
      expect(NumberUtils.percentage(25, 200)).toBe(12.5);
      expect(NumberUtils.percentage(50, 0)).toBe(0);
    });
  });

  describe('average', () => {
    it('应该正确计算平均值', () => {
      expect(NumberUtils.average([1, 2, 3, 4, 5])).toBe(3);
      expect(NumberUtils.average([])).toBe(0);
    });
  });

  describe('sum', () => {
    it('应该正确计算总和', () => {
      expect(NumberUtils.sum([1, 2, 3, 4, 5])).toBe(15);
      expect(NumberUtils.sum([])).toBe(0);
    });
  });

  describe('min', () => {
    it('应该正确找到最小值', () => {
      expect(NumberUtils.min([1, 2, 3, 4, 5])).toBe(1);
      expect(NumberUtils.min([])).toBe(0);
    });
  });

  describe('max', () => {
    it('应该正确找到最大值', () => {
      expect(NumberUtils.max([1, 2, 3, 4, 5])).toBe(5);
      expect(NumberUtils.max([])).toBe(0);
    });
  });

  describe('median', () => {
    it('应该正确计算中位数', () => {
      expect(NumberUtils.median([1, 2, 3, 4, 5])).toBe(3);
      expect(NumberUtils.median([1, 2, 3, 4])).toBe(2.5);
      expect(NumberUtils.median([])).toBe(0);
    });
  });

  describe('standardDeviation', () => {
    it('应该正确计算标准差', () => {
      const result = NumberUtils.standardDeviation([1, 2, 3, 4, 5]);
      expect(result).toBeCloseTo(1.414, 3);
      expect(NumberUtils.standardDeviation([])).toBe(0);
    });
  });
});

describe('ArrayUtils', () => {
  describe('isEmpty', () => {
    it('应该正确判断空数组', () => {
      expect(ArrayUtils.isEmpty([])).toBe(true);
      expect(ArrayUtils.isEmpty(null)).toBe(true);
      expect(ArrayUtils.isEmpty(undefined)).toBe(true);
    });

    it('应该正确判断非空数组', () => {
      expect(ArrayUtils.isEmpty([1, 2, 3])).toBe(false);
    });
  });

  describe('unique', () => {
    it('应该正确去重', () => {
      expect(ArrayUtils.unique([1, 2, 2, 3, 3, 3])).toEqual([1, 2, 3]);
      expect(ArrayUtils.unique(['a', 'b', 'b', 'c'])).toEqual(['a', 'b', 'c']);
    });
  });

  describe('chunk', () => {
    it('应该正确分块', () => {
      expect(ArrayUtils.chunk([1, 2, 3, 4, 5], 2)).toEqual([[1, 2], [3, 4], [5]]);
      expect(ArrayUtils.chunk([1, 2, 3, 4, 5], 3)).toEqual([[1, 2, 3], [4, 5]]);
    });
  });

  describe('flatten', () => {
    it('应该正确展平数组', () => {
      expect(ArrayUtils.flatten([[1, 2], [3, 4], [5]])).toEqual([1, 2, 3, 4, 5]);
    });
  });

  describe('groupBy', () => {
    it('应该正确分组', () => {
      const items = [
        { id: 1, category: 'A' },
        { id: 2, category: 'B' },
        { id: 3, category: 'A' }
      ];
      const result = ArrayUtils.groupBy(items, 'category');
      expect(result.get('A')).toEqual([{ id: 1, category: 'A' }, { id: 3, category: 'A' }]);
      expect(result.get('B')).toEqual([{ id: 2, category: 'B' }]);
    });
  });

  describe('sortBy', () => {
    it('应该正确排序', () => {
      const items = [
        { id: 3, name: 'C' },
        { id: 1, name: 'A' },
        { id: 2, name: 'B' }
      ];
      expect(ArrayUtils.sortBy(items, 'id')).toEqual([
        { id: 1, name: 'A' },
        { id: 2, name: 'B' },
        { id: 3, name: 'C' }
      ]);
      expect(ArrayUtils.sortBy(items, 'id', 'desc')).toEqual([
        { id: 3, name: 'C' },
        { id: 2, name: 'B' },
        { id: 1, name: 'A' }
      ]);
    });
  });

  describe('shuffle', () => {
    it('应该正确打乱数组', () => {
      const arr = [1, 2, 3, 4, 5];
      const shuffled = ArrayUtils.shuffle(arr);
      expect(shuffled).toHaveLength(5);
      expect(shuffled).toEqual(expect.arrayContaining(arr));
    });
  });

  describe('sample', () => {
    it('应该正确采样', () => {
      const arr = [1, 2, 3, 4, 5];
      const sampled = ArrayUtils.sample(arr, 3);
      expect(sampled).toHaveLength(3);
      expect(arr).toEqual(expect.arrayContaining(sampled));
    });
  });

  describe('difference', () => {
    it('应该正确计算差集', () => {
      expect(ArrayUtils.difference([1, 2, 3], [2, 3, 4])).toEqual([1]);
    });
  });

  describe('intersection', () => {
    it('应该正确计算交集', () => {
      expect(ArrayUtils.intersection([1, 2, 3], [2, 3, 4])).toEqual([2, 3]);
    });
  });

  describe('union', () => {
    it('应该正确计算并集', () => {
      expect(ArrayUtils.union([1, 2, 3], [3, 4, 5])).toEqual([1, 2, 3, 4, 5]);
    });
  });
});

describe('ObjectUtils', () => {
  describe('isEmpty', () => {
    it('应该正确判断空对象', () => {
      expect(ObjectUtils.isEmpty({})).toBe(true);
      expect(ObjectUtils.isEmpty(null)).toBe(true);
      expect(ObjectUtils.isEmpty(undefined)).toBe(true);
      expect(ObjectUtils.isEmpty([])).toBe(true);
    });

    it('应该正确判断非空对象', () => {
      expect(ObjectUtils.isEmpty({ a: 1 })).toBe(false);
    });
  });

  describe('deepClone', () => {
    it('应该正确深拷贝对象', () => {
      const obj = { a: 1, b: { c: 2 } };
      const cloned = ObjectUtils.deepClone(obj);
      expect(cloned).toEqual(obj);
      expect(cloned).not.toBe(obj);
      expect(cloned.b).not.toBe(obj.b);
    });
  });

  describe('merge', () => {
    it('应该正确合并对象', () => {
      const target = { a: 1, b: 2 };
      const source = { b: 3, c: 4 };
      const result = ObjectUtils.merge(target, source);
      expect(result).toEqual({ a: 1, b: 3, c: 4 });
    });
  });

  describe('deepMerge', () => {
    it('应该正确深度合并对象', () => {
      const target = { a: 1, b: { c: 2 } };
      const source = { b: { d: 3 }, e: 4 };
      const result = ObjectUtils.deepMerge(target, source);
      expect(result).toEqual({ a: 1, b: { c: 2, d: 3 }, e: 4 });
    });
  });

  describe('pick', () => {
    it('应该正确选择属性', () => {
      const obj = { a: 1, b: 2, c: 3 };
      const result = ObjectUtils.pick(obj, ['a', 'c'] as const);
      expect(result).toEqual({ a: 1, c: 3 });
    });
  });

  describe('omit', () => {
    it('应该正确排除属性', () => {
      const obj = { a: 1, b: 2, c: 3 };
      const result = ObjectUtils.omit(obj, ['b'] as const);
      expect(result).toEqual({ a: 1, c: 3 });
    });
  });

  describe('get', () => {
    it('应该正确获取嵌套属性', () => {
      const obj = { a: { b: { c: 1 } } };
      expect(ObjectUtils.get(obj, 'a.b.c')).toBe(1);
      expect(ObjectUtils.get(obj, 'a.b.d')).toBeUndefined();
      expect(ObjectUtils.get(obj, 'a.b.d', 'default')).toBe('default');
    });
  });

  describe('set', () => {
    it('应该正确设置嵌套属性', () => {
      const obj = { a: { b: {} } };
      ObjectUtils.set(obj, 'a.b.c', 1);
      expect(obj.a.b.c).toBe(1);
    });
  });
});

describe('DateUtils', () => {
  describe('now', () => {
    it('应该返回当前时间', () => {
      const now = DateUtils.now();
      expect(now).toBeInstanceOf(Date);
    });
  });

  describe('nowTimestamp', () => {
    it('应该返回当前时间戳', () => {
      const timestamp = DateUtils.nowTimestamp();
      expect(typeof timestamp).toBe('number');
      expect(timestamp).toBeGreaterThan(0);
    });
  });

  describe('format', () => {
    it('应该正确格式化日期', () => {
      const date = new Date('2026-01-25T12:34:56');
      expect(DateUtils.format(date)).toBe('2026-01-25 12:34:56');
      expect(DateUtils.format(date, 'YYYY-MM-DD')).toBe('2026-01-25');
    });
  });

  describe('addDays', () => {
    it('应该正确添加天数', () => {
      const date = new Date('2026-01-25');
      const result = DateUtils.addDays(date, 5);
      expect(result.getDate()).toBe(30);
    });
  });

  describe('addHours', () => {
    it('应该正确添加小时', () => {
      const date = new Date('2026-01-25T12:00:00');
      const result = DateUtils.addHours(date, 5);
      expect(result.getHours()).toBe(17);
    });
  });

  describe('addMinutes', () => {
    it('应该正确添加分钟', () => {
      const date = new Date('2026-01-25T12:00:00');
      const result = DateUtils.addMinutes(date, 30);
      expect(result.getMinutes()).toBe(30);
    });
  });

  describe('diff', () => {
    it('应该正确计算时间差', () => {
      const date1 = new Date('2026-01-25T12:00:00');
      const date2 = new Date('2026-01-25T11:00:00');
      expect(DateUtils.diff(date1, date2)).toBe(3600000);
    });
  });

  describe('diffDays', () => {
    it('应该正确计算天数差', () => {
      const date1 = new Date('2026-01-25');
      const date2 = new Date('2026-01-20');
      expect(DateUtils.diffDays(date1, date2)).toBe(5);
    });
  });

  describe('isBefore', () => {
    it('应该正确判断时间先后', () => {
      const date1 = new Date('2026-01-25');
      const date2 = new Date('2026-01-26');
      expect(DateUtils.isBefore(date1, date2)).toBe(true);
      expect(DateUtils.isBefore(date2, date1)).toBe(false);
    });
  });

  describe('isAfter', () => {
    it('应该正确判断时间先后', () => {
      const date1 = new Date('2026-01-25');
      const date2 = new Date('2026-01-26');
      expect(DateUtils.isAfter(date1, date2)).toBe(false);
      expect(DateUtils.isAfter(date2, date1)).toBe(true);
    });
  });

  describe('isSame', () => {
    it('应该正确判断时间相同', () => {
      const date1 = new Date('2026-01-25T12:00:00');
      const date2 = new Date('2026-01-25T12:00:00');
      expect(DateUtils.isSame(date1, date2)).toBe(true);
    });
  });

  describe('isBetween', () => {
    it('应该正确判断时间区间', () => {
      const date = new Date('2026-01-25');
      const start = new Date('2026-01-20');
      const end = new Date('2026-01-30');
      expect(DateUtils.isBetween(date, start, end)).toBe(true);
    });
  });
});

describe('ValidationUtils', () => {
  describe('isEmail', () => {
    it('应该正确验证邮箱', () => {
      expect(ValidationUtils.isEmail('test@example.com')).toBe(true);
      expect(ValidationUtils.isEmail('invalid-email')).toBe(false);
    });
  });

  describe('isUrl', () => {
    it('应该正确验证URL', () => {
      expect(ValidationUtils.isUrl('https://example.com')).toBe(true);
      expect(ValidationUtils.isUrl('invalid-url')).toBe(false);
    });
  });

  describe('isPhoneNumber', () => {
    it('应该正确验证电话号码', () => {
      expect(ValidationUtils.isPhoneNumber('123-456-7890')).toBe(true);
      expect(ValidationUtils.isPhoneNumber('abc')).toBe(false);
    });
  });

  describe('isUUID', () => {
    it('应该正确验证UUID', () => {
      expect(ValidationUtils.isUUID('550e8400-e29b-41d4-a716-446655440000')).toBe(true);
      expect(ValidationUtils.isUUID('invalid-uuid')).toBe(false);
    });
  });

  describe('isHexColor', () => {
    it('应该正确验证十六进制颜色', () => {
      expect(ValidationUtils.isHexColor('#ffffff')).toBe(true);
      expect(ValidationUtils.isHexColor('#fff')).toBe(true);
      expect(ValidationUtils.isHexColor('invalid')).toBe(false);
    });
  });

  describe('isIPv4', () => {
    it('应该正确验证IPv4地址', () => {
      expect(ValidationUtils.isIPv4('192.168.1.1')).toBe(true);
      expect(ValidationUtils.isIPv4('256.256.256.256')).toBe(false);
    });
  });

  describe('isStrongPassword', () => {
    it('应该正确验证强密码', () => {
      expect(ValidationUtils.isStrongPassword('StrongP@ssw0rd')).toBe(true);
      expect(ValidationUtils.isStrongPassword('weak')).toBe(false);
    });
  });

  describe('isCreditCard', () => {
    it('应该正确验证信用卡号', () => {
      expect(ValidationUtils.isCreditCard('4111111111111111')).toBe(true);
      expect(ValidationUtils.isCreditCard('1234567890123456')).toBe(false);
    });
  });
});

describe('FormatUtils', () => {
  describe('currency', () => {
    it('应该正确格式化货币', () => {
      expect(FormatUtils.currency(1234.56)).toBe('$1,234.56');
      expect(FormatUtils.currency(1234.56, 'EUR', 'de-DE')).toBe('1.234,56 €');
    });
  });

  describe('number', () => {
    it('应该正确格式化数字', () => {
      expect(FormatUtils.number(1234.567)).toBe('1,234.57');
      expect(FormatUtils.number(1234.567, 3)).toBe('1,234.567');
    });
  });

  describe('percent', () => {
    it('应该正确格式化百分比', () => {
      expect(FormatUtils.percent(12.345)).toBe('12.35%');
    });
  });

  describe('plural', () => {
    it('应该正确选择复数形式', () => {
      expect(FormatUtils.plural(1, 'item', 'items')).toBe('item');
      expect(FormatUtils.plural(2, 'item', 'items')).toBe('items');
    });
  });

  describe('ordinal', () => {
    it('应该正确格式化序数', () => {
      expect(FormatUtils.ordinal(1)).toBe('1st');
      expect(FormatUtils.ordinal(2)).toBe('2nd');
      expect(FormatUtils.ordinal(3)).toBe('3rd');
      expect(FormatUtils.ordinal(4)).toBe('4th');
    });
  });

  describe('maskEmail', () => {
    it('应该正确掩码邮箱', () => {
      expect(FormatUtils.maskEmail('test@example.com')).toBe('t**t@example.com');
    });
  });

  describe('maskPhone', () => {
    it('应该正确掩码电话', () => {
      expect(FormatUtils.maskPhone('123-456-7890')).toBe('******7890');
    });
  });

  describe('maskCreditCard', () => {
    it('应该正确掩码信用卡', () => {
      expect(FormatUtils.maskCreditCard('4111111111111111')).toBe('************1111');
    });
  });
});

describe('ErrorUtils', () => {
  describe('createError', () => {
    it('应该正确创建错误', () => {
      const error = ErrorUtils.createError('Test error', 'ERR001');
      expect(error.message).toBe('Test error');
      expect((error as any).code).toBe('ERR001');
    });
  });

  describe('isNetworkError', () => {
    it('应该正确判断网络错误', () => {
      expect(ErrorUtils.isNetworkError(new Error('network error'))).toBe(true);
      expect(ErrorUtils.isNetworkError(new Error('other error'))).toBe(false);
    });
  });

  describe('isValidationError', () => {
    it('应该正确判断验证错误', () => {
      expect(ErrorUtils.isValidationError(new Error('validation error'))).toBe(true);
      expect(ErrorUtils.isValidationError(new Error('other error'))).toBe(false);
    });
  });

  describe('isAuthenticationError', () => {
    it('应该正确判断认证错误', () => {
      expect(ErrorUtils.isAuthenticationError(new Error('unauthorized'))).toBe(true);
      expect(ErrorUtils.isAuthenticationError(new Error('401'))).toBe(true);
      expect(ErrorUtils.isAuthenticationError(new Error('other error'))).toBe(false);
    });
  });

  describe('isAuthorizationError', () => {
    it('应该正确判断授权错误', () => {
      expect(ErrorUtils.isAuthorizationError(new Error('forbidden'))).toBe(true);
      expect(ErrorUtils.isAuthorizationError(new Error('403'))).toBe(true);
      expect(ErrorUtils.isAuthorizationError(new Error('other error'))).toBe(false);
    });
  });

  describe('isNotFoundError', () => {
    it('应该正确判断未找到错误', () => {
      expect(ErrorUtils.isNotFoundError(new Error('not found'))).toBe(true);
      expect(ErrorUtils.isNotFoundError(new Error('404'))).toBe(true);
      expect(ErrorUtils.isNotFoundError(new Error('other error'))).toBe(false);
    });
  });

  describe('getErrorMessage', () => {
    it('应该正确获取错误消息', () => {
      expect(ErrorUtils.getErrorMessage(new Error('test error'))).toBe('test error');
      expect(ErrorUtils.getErrorMessage('string error')).toBe('string error');
      expect(ErrorUtils.getErrorMessage(null)).toBe('An unknown error occurred');
    });
  });
});

describe('DebounceThrottleUtils', () => {
  describe('debounce', () => {
    it('应该正确防抖', (done) => {
      let count = 0;
      const debouncedFn = DebounceThrottleUtils.debounce(() => {
        count++;
      }, 100);

      debouncedFn();
      debouncedFn();
      debouncedFn();

      setTimeout(() => {
        expect(count).toBe(1);
        done();
      }, 150);
    });
  });

  describe('throttle', () => {
    it('应该正确节流', (done) => {
      let count = 0;
      const throttledFn = DebounceThrottleUtils.throttle(() => {
        count++;
      }, 100);

      throttledFn();
      throttledFn();
      throttledFn();

      setTimeout(() => {
        expect(count).toBe(1);
        done();
      }, 50);
    });
  });

  describe('clear', () => {
    it('应该正确清除定时器', () => {
      let count = 0;
      const debouncedFn = DebounceThrottleUtils.debounce(() => {
        count++;
      }, 100);

      debouncedFn();
      DebounceThrottleUtils.clear();

      setTimeout(() => {
        expect(count).toBe(0);
      }, 150);
    });
  });
});

describe('TypeUtils', () => {
  describe('isNull', () => {
    it('应该正确判断null', () => {
      expect(TypeUtils.isNull(null)).toBe(true);
      expect(TypeUtils.isNull(undefined)).toBe(false);
      expect(TypeUtils.isNull(0)).toBe(false);
    });
  });

  describe('isUndefined', () => {
    it('应该正确判断undefined', () => {
      expect(TypeUtils.isUndefined(undefined)).toBe(true);
      expect(TypeUtils.isUndefined(null)).toBe(false);
      expect(TypeUtils.isUndefined(0)).toBe(false);
    });
  });

  describe('isNil', () => {
    it('应该正确判断null或undefined', () => {
      expect(TypeUtils.isNil(null)).toBe(true);
      expect(TypeUtils.isNil(undefined)).toBe(true);
      expect(TypeUtils.isNil(0)).toBe(false);
      expect(TypeUtils.isNil('')).toBe(false);
    });
  });

  describe('isString', () => {
    it('应该正确判断字符串', () => {
      expect(TypeUtils.isString('hello')).toBe(true);
      expect(TypeUtils.isString(123)).toBe(false);
    });
  });

  describe('isNumber', () => {
    it('应该正确判断数字', () => {
      expect(TypeUtils.isNumber(123)).toBe(true);
      expect(TypeUtils.isNumber('123')).toBe(false);
    });
  });

  describe('isBoolean', () => {
    it('应该正确判断布尔值', () => {
      expect(TypeUtils.isBoolean(true)).toBe(true);
      expect(TypeUtils.isBoolean(false)).toBe(true);
      expect(TypeUtils.isBoolean(1)).toBe(false);
    });
  });

  describe('isFunction', () => {
    it('应该正确判断函数', () => {
      expect(TypeUtils.isFunction(() => {})).toBe(true);
      expect(TypeUtils.isFunction(123)).toBe(false);
    });
  });

  describe('isObject', () => {
    it('应该正确判断对象', () => {
      expect(TypeUtils.isObject({})).toBe(true);
      expect(TypeUtils.isObject([])).toBe(false);
      expect(TypeUtils.isObject(null)).toBe(false);
    });
  });

  describe('isArray', () => {
    it('应该正确判断数组', () => {
      expect(TypeUtils.isArray([])).toBe(true);
      expect(TypeUtils.isArray({})).toBe(false);
    });
  });

  describe('isDate', () => {
    it('应该正确判断日期', () => {
      expect(TypeUtils.isDate(new Date())).toBe(true);
      expect(TypeUtils.isDate('2026-01-25')).toBe(false);
    });
  });

  describe('isRegExp', () => {
    it('应该正确判断正则表达式', () => {
      expect(TypeUtils.isRegExp(/test/)).toBe(true);
      expect(TypeUtils.isRegExp('test')).toBe(false);
    });
  });

  describe('isPromise', () => {
    it('应该正确判断Promise', () => {
      expect(TypeUtils.isPromise(Promise.resolve())).toBe(true);
      expect(TypeUtils.isPromise({})).toBe(false);
    });
  });
});
