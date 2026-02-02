export interface EncodingConfig {
  enableHTML?: boolean;
  enableJavaScript?: boolean;
  enableURL?: boolean;
  enableCSS?: boolean;
  enableJSON?: boolean;
  customEncoders?: Map<string, (value: string) => string>;
}

export class OutputEncoder {
  private config: Required<EncodingConfig>;
  private encodingHistory: Array<{ timestamp: number; type: string; input: string; output: string }> = [];

  constructor(config: EncodingConfig = {}) {
    this.config = {
      enableHTML: config.enableHTML !== false,
      enableJavaScript: config.enableJavaScript !== false,
      enableURL: config.enableURL !== false,
      enableCSS: config.enableCSS !== false,
      enableJSON: config.enableJSON !== false,
      customEncoders: config.customEncoders || new Map(),
    };
  }

  encodeHTML(value: string): string {
    if (!this.config.enableHTML) return value;

    const encoded = value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');

    this.recordEncoding('html', value, encoded);
    return encoded;
  }

  encodeHTMLAttribute(value: string): string {
    if (!this.config.enableHTML) return value;

    const encoded = value
      .replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    this.recordEncoding('htmlAttribute', value, encoded);
    return encoded;
  }

  encodeJavaScript(value: string): string {
    if (!this.config.enableJavaScript) return value;

    const encoded = value
      .replace(/\\/g, '\\\\')
      .replace(/'/g, "\\'")
      .replace(/"/g, '\\"')
      .replace(/\n/g, '\\n')
      .replace(/\r/g, '\\r')
      .replace(/\t/g, '\\t')
      .replace(/\f/g, '\\f')
      .replace(/\b/g, '\\b')
      .replace(/\u2028/g, '\\u2028')
      .replace(/\u2029/g, '\\u2029')
      .replace(/</g, '\\x3C')
      .replace(/>/g, '\\x3E')
      .replace(/\//g, '\\x2F')
      .replace(/&/g, '\\x26')
      .replace(/=/g, '\\x3D');

    this.recordEncoding('javascript', value, encoded);
    return encoded;
  }

  encodeURL(value: string): string {
    if (!this.config.enableURL) return value;

    try {
      const encoded = encodeURIComponent(value);
      this.recordEncoding('url', value, encoded);
      return encoded;
    } catch (error) {
      console.error('URL encoding error:', error);
      return value;
    }
  }

  encodeURLComponent(value: string): string {
    if (!this.config.enableURL) return value;

    try {
      const encoded = encodeURIComponent(value);
      this.recordEncoding('urlComponent', value, encoded);
      return encoded;
    } catch (error) {
      console.error('URL component encoding error:', error);
      return value;
    }
  }

  encodeCSS(value: string): string {
    if (!this.config.enableCSS) return value;

    const encoded = value
      .replace(/&/g, '\\26 ')
      .replace(/</g, '\\3C ')
      .replace(/>/g, '\\3E ')
      .replace(/"/g, '\\22 ')
      .replace(/'/g, '\\27 ')
      .replace(/\//g, '\\2F ')
      .replace(/=/g, '\\3D ')
      .replace(/!/g, '\\21 ')
      .replace(/@/g, '\\40 ')
      .replace(/#/g, '\\23 ')
      .replace(/\$/g, '\\24 ')
      .replace(/%/g, '\\25 ')
      .replace(/\^/g, '\\5E ')
      .replace(/\(/g, '\\28 ')
      .replace(/\)/g, '\\29 ')
      .replace(/\{/g, '\\7B ')
      .replace(/\}/g, '\\7D ')
      .replace(/\[/g, '\\5B ')
      .replace(/\]/g, '\\5D ');

    this.recordEncoding('css', value, encoded);
    return encoded;
  }

  encodeJSON(value: any): string {
    if (!this.config.enableJSON) {
      return JSON.stringify(value);
    }

    try {
      const encoded = JSON.stringify(value, (key, val) => {
        if (typeof val === 'string') {
          return this.encodeJavaScript(val);
        }
        return val;
      });

      this.recordEncoding('json', typeof value === 'string' ? value : JSON.stringify(value), encoded);
      return encoded;
    } catch (error) {
      console.error('JSON encoding error:', error);
      return JSON.stringify(value);
    }
  }

  encodeXML(value: string): string {
    const encoded = value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');

    this.recordEncoding('xml', value, encoded);
    return encoded;
  }

  encodeBase64(value: string): string {
    try {
      const encoded = Buffer.from(value).toString('base64');
      this.recordEncoding('base64', value, encoded);
      return encoded;
    } catch (error) {
      console.error('Base64 encoding error:', error);
      return value;
    }
  }

  encodeHex(value: string): string {
    try {
      const encoded = Buffer.from(value).toString('hex');
      this.recordEncoding('hex', value, encoded);
      return encoded;
    } catch (error) {
      console.error('Hex encoding error:', error);
      return value;
    }
  }

  encode(value: string, type: 'html' | 'javascript' | 'url' | 'css' | 'json' | 'xml' | 'base64' | 'hex'): string {
    switch (type) {
      case 'html':
        return this.encodeHTML(value);
      case 'javascript':
        return this.encodeJavaScript(value);
      case 'url':
        return this.encodeURL(value);
      case 'css':
        return this.encodeCSS(value);
      case 'json':
        return this.encodeJSON(value);
      case 'xml':
        return this.encodeXML(value);
      case 'base64':
        return this.encodeBase64(value);
      case 'hex':
        return this.encodeHex(value);
      default:
        return value;
    }
  }

  encodeObject(obj: any, encodingType: 'html' | 'javascript' | 'url' | 'css' | 'json'): any {
    if (obj === null || obj === undefined) {
      return obj;
    }

    if (typeof obj === 'string') {
      return this.encode(obj, encodingType);
    }

    if (typeof obj === 'number' || typeof obj === 'boolean') {
      return obj;
    }

    if (Array.isArray(obj)) {
      return obj.map(item => this.encodeObject(item, encodingType));
    }

    if (typeof obj === 'object') {
      const encoded: any = {};
      for (const [key, value] of Object.entries(obj)) {
        encoded[this.encode(key, encodingType)] = this.encodeObject(value, encodingType);
      }
      return encoded;
    }

    return obj;
  }

  addCustomEncoder(name: string, encoder: (value: string) => string): void {
    this.config.customEncoders.set(name, encoder);
  }

  useCustomEncoder(name: string, value: string): string {
    const encoder = this.config.customEncoders.get(name);
    if (!encoder) {
      throw new Error(`Custom encoder '${name}' not found`);
    }

    const encoded = encoder(value);
    this.recordEncoding(`custom:${name}`, value, encoded);
    return encoded;
  }

  sanitize(value: string): string {
    return value
      .replace(/<script[^>]*>.*?<\/script>/gi, '')
      .replace(/<iframe[^>]*>.*?<\/iframe>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '')
      .replace(/<\?php/gi, '')
      .replace(/<\?%/gi, '')
      .replace(/<\s*\/?\s*(script|iframe|object|embed|form|input|button|link|meta|style)[^>]*>/gi, '');
  }

  stripTags(value: string): string {
    return value.replace(/<[^>]*>/g, '');
  }

  escapeRegex(value: string): string {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  private recordEncoding(type: string, input: string, output: string): void {
    this.encodingHistory.push({
      timestamp: Date.now(),
      type,
      input,
      output,
    });

    if (this.encodingHistory.length > 1000) {
      this.encodingHistory.shift();
    }
  }

  getEncodingHistory(limit: number = 100): Array<{ timestamp: number; type: string; input: string; output: string }> {
    return this.encodingHistory.slice(-limit);
  }

  getStatistics(): {
    total: number;
    byType: Record<string, number>;
    avgInputLength: number;
    avgOutputLength: number;
  } {
    const total = this.encodingHistory.length;
    const byType: Record<string, number> = {};

    let totalInputLength = 0;
    let totalOutputLength = 0;

    for (const entry of this.encodingHistory) {
      byType[entry.type] = (byType[entry.type] || 0) + 1;
      totalInputLength += entry.input.length;
      totalOutputLength += entry.output.length;
    }

    return {
      total,
      byType,
      avgInputLength: total > 0 ? totalInputLength / total : 0,
      avgOutputLength: total > 0 ? totalOutputLength / total : 0,
    };
  }

  resetHistory(): void {
    this.encodingHistory = [];
  }
}
