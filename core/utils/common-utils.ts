/**
 * @file 公共工具函数库
 * @description 提供项目中常用的工具函数，消除代码重复
 * @author YYC³ Team
 * @version 1.0.0
 * @created 2026-01-25
 * @copyright Copyright (c) 2026 YYC³
 * @license MIT
 */

/**
 * 字符串工具类
 */
export class StringUtils {
  static isEmpty(str: string | null | undefined): boolean {
    return !str || str.trim().length === 0;
  }

  static isNotEmpty(str: string | null | undefined): boolean {
    return !this.isEmpty(str);
  }

  static truncate(str: string, maxLength: number, suffix: string = '...'): string {
    if (str.length <= maxLength) {
      return str;
    }
    return str.substring(0, maxLength - suffix.length) + suffix;
  }

  static capitalize(str: string): string {
    if (this.isEmpty(str)) {
      return str;
    }
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  static camelCase(str: string): string {
    return str
      .replace(/[-_\s]+(.)?/g, (_, c) => (c ? c.toUpperCase() : ''))
      .replace(/^(.)/, c => c.toLowerCase());
  }

  static kebabCase(str: string): string {
    return str
      .replace(/([a-z])([A-Z])/g, '$1-$2')
      .replace(/[\s_]+/g, '-')
      .toLowerCase();
  }

  static snakeCase(str: string): string {
    return str
      .replace(/([a-z])([A-Z])/g, '$1_$2')
      .replace(/[\s-]+/g, '_')
      .toLowerCase();
  }

  static generateId(prefix: string = 'id'): string {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  static formatBytes(bytes: number, decimals: number = 2): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }

  static formatDuration(ms: number): string {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) {
      return `${days}d ${hours % 24}h`;
    }
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    }
    if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    }
    return `${seconds}s`;
  }
}

/**
 * 数值工具类
 */
export class NumberUtils {
  static isNumber(value: any): boolean {
    return typeof value === 'number' && !isNaN(value);
  }

  static isInteger(value: any): boolean {
    return this.isNumber(value) && Number.isInteger(value);
  }

  static isPositive(value: number): boolean {
    return this.isNumber(value) && value > 0;
  }

  static isNegative(value: number): boolean {
    return this.isNumber(value) && value < 0;
  }

  static clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max);
  }

  static round(value: number, decimals: number = 2): number {
    const factor = Math.pow(10, decimals);
    return Math.round(value * factor) / factor;
  }

  static percentage(value: number, total: number): number {
    if (total === 0) return 0;
    return (value / total) * 100;
  }

  static average(values: number[]): number {
    if (values.length === 0) return 0;
    return values.reduce((sum, val) => sum + val, 0) / values.length;
  }

  static sum(values: number[]): number {
    return values.reduce((sum, val) => sum + val, 0);
  }

  static min(values: number[]): number {
    if (values.length === 0) return 0;
    return Math.min(...values);
  }

  static max(values: number[]): number {
    if (values.length === 0) return 0;
    return Math.max(...values);
  }

  static median(values: number[]): number {
    if (values.length === 0) return 0;
    const sorted = [...values].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
  }

  static standardDeviation(values: number[]): number {
    if (values.length === 0) return 0;
    const avg = this.average(values);
    const squareDiffs = values.map(value => Math.pow(value - avg, 2));
    return Math.sqrt(this.average(squareDiffs));
  }
}

/**
 * 数组工具类
 */
export class ArrayUtils {
  static isEmpty<T>(arr: T[] | null | undefined): boolean {
    return !arr || arr.length === 0;
  }

  static isNotEmpty<T>(arr: T[] | null | undefined): boolean {
    return !this.isEmpty(arr);
  }

  static unique<T>(arr: T[]): T[] {
    return Array.from(new Set(arr));
  }

  static chunk<T>(arr: T[], size: number): T[][] {
    const result: T[][] = [];
    for (let i = 0; i < arr.length; i += size) {
      result.push(arr.slice(i, i + size));
    }
    return result;
  }

  static flatten<T>(arr: T[][]): T[] {
    return arr.reduce((flat, current) => flat.concat(current), []);
  }

  static groupBy<T, K extends keyof T>(arr: T[], key: K): Map<T[K], T[]> {
    const result = new Map<T[K], T[]>();
    for (const item of arr) {
      const groupKey = item[key];
      if (!result.has(groupKey)) {
        result.set(groupKey, []);
      }
      result.get(groupKey)!.push(item);
    }
    return result;
  }

  static sortBy<T>(arr: T[], key: keyof T, order: 'asc' | 'desc' = 'asc'): T[] {
    return [...arr].sort((a, b) => {
      const aVal = a[key];
      const bVal = b[key];
      if (aVal < bVal) return order === 'asc' ? -1 : 1;
      if (aVal > bVal) return order === 'asc' ? 1 : -1;
      return 0;
    });
  }

  static shuffle<T>(arr: T[]): T[] {
    const result = [...arr];
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }

  static sample<T>(arr: T[], count: number): T[] {
    return this.shuffle(arr).slice(0, count);
  }

  static difference<T>(arr1: T[], arr2: T[]): T[] {
    return arr1.filter(item => !arr2.includes(item));
  }

  static intersection<T>(arr1: T[], arr2: T[]): T[] {
    return arr1.filter(item => arr2.includes(item));
  }

  static union<T>(arr1: T[], arr2: T[]): T[] {
    return this.unique([...arr1, ...arr2]);
  }
}

/**
 * 对象工具类
 */
export class ObjectUtils {
  static isEmpty(obj: any): boolean {
    if (obj === null || obj === undefined) return true;
    if (typeof obj !== 'object') return false;
    if (Array.isArray(obj)) return obj.length === 0;
    return Object.keys(obj).length === 0;
  }

  static isNotEmpty(obj: any): boolean {
    return !this.isEmpty(obj);
  }

  static deepClone<T>(obj: T): T {
    if (obj === null || typeof obj !== 'object') return obj;
    if (Array.isArray(obj)) return obj.map(item => this.deepClone(item)) as any;
    const cloned = {} as T;
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        cloned[key] = this.deepClone(obj[key]);
      }
    }
    return cloned;
  }

  static merge<T extends object>(target: T, source: Partial<T>): T {
    return { ...target, ...source };
  }

  static deepMerge<T extends object>(target: T, source: Partial<T>): T {
    const result = this.deepClone(target);
    for (const key in source) {
      if (source.hasOwnProperty(key)) {
        const sourceValue = source[key];
        const targetValue = result[key];
        if (typeof sourceValue === 'object' && sourceValue !== null && !Array.isArray(sourceValue)) {
          result[key] = this.deepMerge(targetValue || {}, sourceValue) as any;
        } else {
          result[key] = this.deepClone(sourceValue) as any;
        }
      }
    }
    return result;
  }

  static pick<T extends object, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> {
    const result = {} as Pick<T, K>;
    for (const key of keys) {
      if (key in obj) {
        result[key] = obj[key];
      }
    }
    return result;
  }

  static omit<T extends object, K extends keyof T>(obj: T, keys: K[]): Omit<T, K> {
    const result = { ...obj };
    for (const key of keys) {
      delete result[key];
    }
    return result;
  }

  static get<T extends object, K extends keyof T>(obj: T, path: string, defaultValue?: T[K]): T[K] | undefined {
    const keys = path.split('.');
    let result: any = obj;
    for (const key of keys) {
      if (result === null || result === undefined) {
        return defaultValue;
      }
      result = result[key];
    }
    return result !== undefined ? result : defaultValue;
  }

  static set<T extends object>(obj: T, path: string, value: any): void {
    const keys = path.split('.');
    let current: any = obj;
    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i];
      if (!(key in current)) {
        current[key] = {};
      }
      current = current[key];
    }
    current[keys[keys.length - 1]] = value;
  }
}

/**
 * 日期工具类
 */
export class DateUtils {
  static now(): Date {
    return new Date();
  }

  static nowTimestamp(): number {
    return Date.now();
  }

  static format(date: Date, format: string = 'YYYY-MM-DD HH:mm:ss'): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    return format
      .replace('YYYY', String(year))
      .replace('MM', month)
      .replace('DD', day)
      .replace('HH', hours)
      .replace('mm', minutes)
      .replace('ss', seconds);
  }

  static parse(dateString: string): Date {
    return new Date(dateString);
  }

  static addDays(date: Date, days: number): Date {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }

  static addHours(date: Date, hours: number): Date {
    const result = new Date(date);
    result.setHours(result.getHours() + hours);
    return result;
  }

  static addMinutes(date: Date, minutes: number): Date {
    const result = new Date(date);
    result.setMinutes(result.getMinutes() + minutes);
    return result;
  }

  static diff(date1: Date, date2: Date): number {
    return date1.getTime() - date2.getTime();
  }

  static diffDays(date1: Date, date2: Date): number {
    return Math.floor(this.diff(date1, date2) / (1000 * 60 * 60 * 24));
  }

  static diffHours(date1: Date, date2: Date): number {
    return Math.floor(this.diff(date1, date2) / (1000 * 60 * 60));
  }

  static diffMinutes(date1: Date, date2: Date): number {
    return Math.floor(this.diff(date1, date2) / (1000 * 60));
  }

  static isBefore(date1: Date, date2: Date): boolean {
    return date1.getTime() < date2.getTime();
  }

  static isAfter(date1: Date, date2: Date): boolean {
    return date1.getTime() > date2.getTime();
  }

  static isSame(date1: Date, date2: Date): boolean {
    return date1.getTime() === date2.getTime();
  }

  static isBetween(date: Date, start: Date, end: Date): boolean {
    return this.isAfter(date, start) && this.isBefore(date, end);
  }
}

/**
 * 验证工具类
 */
export class ValidationUtils {
  static isEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  static isUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  static isPhoneNumber(phone: string): boolean {
    const phoneRegex = /^[\d\s\-+()]{10,}$/;
    return phoneRegex.test(phone);
  }

  static isUUID(uuid: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  }

  static isHexColor(color: string): boolean {
    const hexRegex = /^#?([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/;
    return hexRegex.test(color);
  }

  static isIPv4(ip: string): boolean {
    const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
    if (!ipv4Regex.test(ip)) return false;
    return ip.split('.').every(octet => parseInt(octet) >= 0 && parseInt(octet) <= 255);
  }

  static isIPv6(ip: string): boolean {
    const ipv6Regex = /^([0-9a-fA-F]{0,4}:){7}[0-9a-fA-F]{0,4}$/;
    return ipv6Regex.test(ip);
  }

  static isStrongPassword(password: string): boolean {
    if (password.length < 8) return false;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    return hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar;
  }

  static isCreditCard(cardNumber: string): boolean {
    const cleaned = cardNumber.replace(/\s/g, '');
    if (!/^\d{13,19}$/.test(cleaned)) return false;
    
    let sum = 0;
    let isEven = false;
    for (let i = cleaned.length - 1; i >= 0; i--) {
      let digit = parseInt(cleaned[i], 10);
      if (isEven) {
        digit *= 2;
        if (digit > 9) digit -= 9;
      }
      sum += digit;
      isEven = !isEven;
    }
    return sum % 10 === 0;
  }
}

/**
 * 格式化工具类
 */
export class FormatUtils {
  static currency(amount: number, currency: string = 'USD', locale: string = 'en-US'): string {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency
    }).format(amount);
  }

  static number(value: number, decimals: number = 2, locale: string = 'en-US'): string {
    return new Intl.NumberFormat(locale, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }).format(value);
  }

  static percent(value: number, decimals: number = 2): string {
    return `${value.toFixed(decimals)}%`;
  }

  static plural(count: number, singular: string, plural: string): string {
    return count === 1 ? singular : plural;
  }

  static ordinal(number: number): string {
    const suffixes = ['th', 'st', 'nd', 'rd'];
    const value = number % 100;
    return number + (suffixes[(value - 20) % 10] || suffixes[value] || suffixes[0]);
  }

  static maskEmail(email: string, maskChar: string = '*'): string {
    const [username, domain] = email.split('@');
    if (username.length <= 2) return email;
    const maskedUsername = username.charAt(0) + maskChar.repeat(username.length - 2) + username.charAt(username.length - 1);
    return `${maskedUsername}@${domain}`;
  }

  static maskPhone(phone: string, maskChar: string = '*'): string {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length < 4) return phone;
    const visibleDigits = 4;
    const maskedDigits = cleaned.length - visibleDigits;
    return maskChar.repeat(maskedDigits) + cleaned.slice(-visibleDigits);
  }

  static maskCreditCard(cardNumber: string, maskChar: string = '*'): string {
    const cleaned = cardNumber.replace(/\s/g, '');
    if (cleaned.length < 4) return cardNumber;
    return maskChar.repeat(cleaned.length - 4) + cleaned.slice(-4);
  }
}

/**
 * 错误处理工具类
 */
export class ErrorUtils {
  static createError(message: string, code?: string): Error {
    const error = new Error(message);
    if (code) {
      (error as any).code = code;
    }
    return error;
  }

  static isNetworkError(error: Error): boolean {
    return error.message.includes('network') || 
           error.message.includes('fetch') || 
           error.message.includes('timeout');
  }

  static isValidationError(error: Error): boolean {
    return error.message.includes('validation') || 
           error.message.includes('invalid');
  }

  static isAuthenticationError(error: Error): boolean {
    return error.message.includes('unauthorized') || 
           error.message.includes('authentication') ||
           error.message.includes('401');
  }

  static isAuthorizationError(error: Error): boolean {
    return error.message.includes('forbidden') || 
           error.message.includes('authorization') ||
           error.message.includes('403');
  }

  static isNotFoundError(error: Error): boolean {
    return error.message.includes('not found') || 
           error.message.includes('404');
  }

  static getErrorMessage(error: unknown): string {
    if (error instanceof Error) {
      return error.message;
    }
    if (typeof error === 'string') {
      return error;
    }
    return 'An unknown error occurred';
  }
}

/**
 * 防抖和节流工具类
 */
export class DebounceThrottleUtils {
  private static timers: Map<string, NodeJS.Timeout> = new Map();

  static debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number,
    key: string = 'default'
  ): (...args: Parameters<T>) => void {
    return (...args: Parameters<T>) => {
      if (this.timers.has(key)) {
        clearTimeout(this.timers.get(key)!);
      }
      this.timers.set(
        key,
        setTimeout(() => {
          func(...args);
          this.timers.delete(key);
        }, wait)
      );
    };
  }

  static throttle<T extends (...args: any[]) => any>(
    func: T,
    limit: number,
    key: string = 'default'
  ): (...args: Parameters<T>) => void {
    let inThrottle = false;
    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        func(...args);
        inThrottle = true;
        setTimeout(() => (inThrottle = false), limit);
      }
    };
  }

  static clear(key?: string): void {
    if (key) {
      const timer = this.timers.get(key);
      if (timer) {
        clearTimeout(timer);
        this.timers.delete(key);
      }
    } else {
      this.timers.forEach(timer => clearTimeout(timer));
      this.timers.clear();
    }
  }
}

/**
 * 类型检查工具类
 */
export class TypeUtils {
  static isNull(value: any): value is null {
    return value === null;
  }

  static isUndefined(value: any): value is undefined {
    return value === undefined;
  }

  static isNil(value: any): value is null | undefined {
    return this.isNull(value) || this.isUndefined(value);
  }

  static isString(value: any): value is string {
    return typeof value === 'string';
  }

  static isNumber(value: any): value is number {
    return typeof value === 'number' && !isNaN(value);
  }

  static isBoolean(value: any): value is boolean {
    return typeof value === 'boolean';
  }

  static isFunction(value: any): value is Function {
    return typeof value === 'function';
  }

  static isObject(value: any): value is object {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
  }

  static isArray(value: any): value is any[] {
    return Array.isArray(value);
  }

  static isDate(value: any): value is Date {
    return value instanceof Date;
  }

  static isRegExp(value: any): value is RegExp {
    return value instanceof RegExp;
  }

  static isPromise(value: any): value is Promise<any> {
    return value instanceof Promise;
  }
}
