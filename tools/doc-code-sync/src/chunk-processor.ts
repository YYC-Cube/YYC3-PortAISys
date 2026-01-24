import * as fs from 'fs';
import * as path from 'path';
import { createReadStream, createWriteStream } from 'fs';
import { pipeline } from 'stream/promises';

const CHUNK_SIZE = 1024 * 1024; // 1MB

export interface Chunk {
  index: number;
  data: Buffer;
  checksum: string;
}

export interface ChunkProcessingOptions {
  chunkSize?: number;
  onProgress?: (progress: number) => void;
}

export class ChunkProcessor {
  private chunkSize: number;
  private onProgress?: (progress: number) => void;

  constructor(options: ChunkProcessingOptions = {}) {
    this.chunkSize = options.chunkSize || CHUNK_SIZE;
    this.onProgress = options.onProgress;
  }

  async readFileInChunks(filePath: string): Promise<Chunk[]> {
    const stats = await fs.promises.stat(filePath);
    const fileSize = stats.size;
    const chunks: Chunk[] = [];
    let bytesRead = 0;

    const stream = createReadStream(filePath, { highWaterMark: this.chunkSize });

    return new Promise((resolve, reject) => {
      let chunkIndex = 0;

      stream.on('data', (chunk: string | Buffer) => {
        const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
        const checksum = this.calculateChecksum(buffer);
        chunks.push({
          index: chunkIndex++,
          data: buffer,
          checksum
        });
        bytesRead += buffer.length;

        if (this.onProgress) {
          this.onProgress((bytesRead / fileSize) * 100);
        }
      });

      stream.on('end', () => {
        resolve(chunks);
      });

      stream.on('error', reject);
    });
  }

  async writeFileFromChunks(filePath: string, chunks: Chunk[]): Promise<void> {
    const dir = path.dirname(filePath);
    await fs.promises.mkdir(dir, { recursive: true });

    const writeStream = createWriteStream(filePath);
    let bytesWritten = 0;
    const totalSize = chunks.reduce((sum, chunk) => sum + chunk.data.length, 0);

    for (const chunk of chunks) {
      await new Promise<void>((resolve, reject) => {
        writeStream.write(chunk.data, (error) => {
          if (error) reject(error);
          else resolve();
        });
      });

      bytesWritten += chunk.data.length;

      if (this.onProgress) {
        this.onProgress((bytesWritten / totalSize) * 100);
      }
    }

    return new Promise<void>((resolve, reject) => {
      writeStream.end((error: Error | null | undefined) => {
        if (error) reject(error);
        else resolve();
      });
    });
  }

  async processFileInChunks<T>(
    filePath: string,
    processor: (chunk: Chunk) => Promise<T>
  ): Promise<T[]> {
    const chunks = await this.readFileInChunks(filePath);
    const results: T[] = [];

    for (const chunk of chunks) {
      const result = await processor(chunk);
      results.push(result);
    }

    return results;
  }

  private calculateChecksum(data: Buffer): string {
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data[i];
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(16);
  }

  async validateChunks(chunks: Chunk[]): Promise<boolean> {
    for (const chunk of chunks) {
      const expectedChecksum = chunk.checksum;
      const actualChecksum = this.calculateChecksum(chunk.data);

      if (expectedChecksum !== actualChecksum) {
        return false;
      }
    }
    return true;
  }
}

export async function processLargeFile(
  filePath: string,
  processor: (content: string) => string,
  options: ChunkProcessingOptions = {}
): Promise<void> {
  const chunkProcessor = new ChunkProcessor(options);
  const chunks = await chunkProcessor.readFileInChunks(filePath);

  let processedContent = '';
  for (const chunk of chunks) {
    const content = chunk.data.toString('utf-8');
    const processed = processor(content);
    processedContent += processed;
  }

  const processedChunks: Chunk[] = [];
  let chunkIndex = 0;
  let offset = 0;
  const chunkSize = options.chunkSize || CHUNK_SIZE;

  while (offset < processedContent.length) {
    const end = Math.min(offset + chunkSize, processedContent.length);
    const chunkData = processedContent.slice(offset, end);
    const checksum = chunkProcessor['calculateChecksum'](Buffer.from(chunkData));

    processedChunks.push({
      index: chunkIndex++,
      data: Buffer.from(chunkData),
      checksum
    });

    offset = end;
  }

  await chunkProcessor.writeFileFromChunks(filePath, processedChunks);
}
