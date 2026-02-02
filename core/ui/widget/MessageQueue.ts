/**
 * @file 消息队列
 * @description 管理消息队列
 * @module ui/widget/MessageQueue
 * @author YYC³
 * @version 1.0.0
 * @created 2025-01-05
 */

import EventEmitter from 'eventemitter3';

export interface Message {
  id: string;
  type: string;
  data: any;
  timestamp: number;
  priority: number;
}

export class MessageQueue extends EventEmitter {
  private queue: Message[];
  private processing: boolean;
  private maxSize: number;
  private concurrency: number;
  private activeMessages: number;

  constructor(maxSize: number = 1000, concurrency: number = 10) {
    super();
    this.queue = [];
    this.processing = false;
    this.maxSize = maxSize;
    this.concurrency = concurrency;
    this.activeMessages = 0;
  }

  enqueue(message: Omit<Message, 'id' | 'timestamp'>): void {
    if (this.queue.length >= this.maxSize) {
      this.emit('queue:full');
      return;
    }

    const fullMessage: Message = {
      id: `msg-${Date.now()}-${Math.random()}`,
      timestamp: Date.now(),
      ...message,
    };

    this.queue.push(fullMessage);
    this.emit('message:enqueued', fullMessage);
    
    this.process();
  }

  dequeue(): Message | undefined {
    return this.queue.shift();
  }

  private async process(): Promise<void> {
    if (this.processing || this.activeMessages >= this.concurrency) {
      return;
    }

    this.processing = true;

    while (this.queue.length > 0 && this.activeMessages < this.concurrency) {
      const message = this.dequeue();
      if (message) {
        this.activeMessages++;
        this.emit('message:processing', message);
        
        this.processMessage(message).finally(() => {
          this.activeMessages--;
          this.emit('message:processed', message);
        });
      }
    }

    this.processing = false;
  }

  private async processMessage(message: Message): Promise<void> {
    return Promise.resolve();
  }

  getQueueSize(): number {
    return this.queue.length;
  }

  getThroughput(): number {
    return this.activeMessages;
  }

  getConcurrency(): number {
    return this.concurrency;
  }

  clear(): void {
    this.queue = [];
    this.emit('queue:cleared');
  }

  destroy(): void {
    this.clear();
    this.removeAllListeners();
  }
}
