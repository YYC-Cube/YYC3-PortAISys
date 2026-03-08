/**
 * @file ui/widget/WebSocketManager.ts
 * @description Web Socket Manager 模块
 * @author YanYuCloudCube Team <admin@0379.email>
 * @version v1.0.0
 * @created 2026-03-07
 * @updated 2026-03-07
 * @status stable
 * @license MIT
 * @copyright Copyright (c) 2026 YanYuCloudCube Team
 * @tags typescript,ui
 */

import EventEmitter from 'eventemitter3';

export class WebSocketManager extends EventEmitter {
  private socket: WebSocket | null;
  private url: string;
  private connected: boolean;
  private reconnectAttempts: number;
  private maxReconnectAttempts: number;
  private requestCount: number;

  constructor(url: string = 'ws://localhost:8080') {
    super();
    this.url = url;
    this.socket = null;
    this.connected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.requestCount = 0;
  }

  connect(): void {
    try {
      this.socket = new WebSocket(this.url);
      
      this.socket.onopen = () => {
        this.connected = true;
        this.reconnectAttempts = 0;
        this.emit('connected');
      };

      this.socket.onclose = () => {
        this.connected = false;
        this.emit('disconnected');
        this.reconnect();
      };

      this.socket.onerror = (error) => {
        this.emit('error', error);
      };

      this.socket.onmessage = (event) => {
        this.emit('message', event.data);
      };
    } catch (error) {
      this.emit('error', error);
    }
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
      this.connected = false;
    }
  }

  send(data: any): void {
    if (this.socket && this.connected) {
      this.socket.send(JSON.stringify(data));
      this.requestCount++;
    }
  }

  private reconnect(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      setTimeout(() => {
        this.connect();
      }, 1000 * this.reconnectAttempts);
    }
  }

  isConnected(): boolean {
    return this.connected;
  }

  getRequestCount(): number {
    return this.requestCount;
  }

  destroy(): void {
    this.disconnect();
    this.removeAllListeners();
  }
}
