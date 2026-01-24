export interface TestInterface {
  name: string;
  value: number;
  description: string;
}

export class TestClass {
  private name: string;
  private value: number;

  constructor(name: string, value: number) {
    this.name = name;
    this.value = value;
  }

  public getName(): string {
    return this.name;
  }

  public getValue(): number {
    return this.value;
  }

  public setValue(value: number): void {
    this.value = value;
  }

  public getDescription(): string {
    return `${this.name} has value ${this.value}`;
  }

  public async processAsync(): Promise<TestInterface> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          name: this.name,
          value: this.value,
          description: this.getDescription(),
        });
      }, 100);
    });
  }

  public static createDefault(): TestClass {
    return new TestClass('default', 0);
  }

  public static fromInterface(data: TestInterface): TestClass {
    return new TestClass(data.name, data.value);
  }
}

export function testFunction(input: string): string {
  return input.toUpperCase();
}

export async function asyncTestFunction(input: string): Promise<string> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(input.toLowerCase());
    }, 50);
  });
}

export const testConstant = 'constant-value';

export const testObject = {
  key1: 'value1',
  key2: 'value2',
  key3: 'value3',
};

export type TestType = {
  id: string;
  name: string;
  value: number;
};

export const testArray: TestType[] = [
  { id: '1', name: 'test1', value: 100 },
  { id: '2', name: 'test2', value: 200 },
  { id: '3', name: 'test3', value: 300 },
];

export function complexFunction(
  input: TestInterface[],
  options?: {
    filter?: (item: TestInterface) => boolean;
    map?: (item: TestInterface) => TestInterface;
    reduce?: (acc: TestInterface, item: TestInterface) => TestInterface;
  }
): TestInterface[] {
  let result = input;

  if (options?.filter) {
    result = result.filter(options.filter);
  }

  if (options?.map) {
    result = result.map(options.map);
  }

  if (options?.reduce) {
    result = result.reduce(options.reduce, input[0]);
  }

  return result;
}

export class ComplexClass {
  private data: Map<string, TestInterface>;

  constructor() {
    this.data = new Map();
  }

  public add(key: string, value: TestInterface): void {
    this.data.set(key, value);
  }

  public get(key: string): TestInterface | undefined {
    return this.data.get(key);
  }

  public has(key: string): boolean {
    return this.data.has(key);
  }

  public delete(key: string): boolean {
    return this.data.delete(key);
  }

  public clear(): void {
    this.data.clear();
  }

  public size(): number {
    return this.data.size;
  }

  public keys(): string[] {
    return Array.from(this.data.keys());
  }

  public values(): TestInterface[] {
    return Array.from(this.data.values());
  }

  public entries(): [string, TestInterface][] {
    return Array.from(this.data.entries());
  }

  public async processAll(): Promise<TestInterface[]> {
    const results: TestInterface[] = [];

    for (const [key, value] of this.data.entries()) {
      const processed = await this.processItem(key, value);
      results.push(processed);
    }

    return results;
  }

  private async processItem(
    key: string,
    value: TestInterface
  ): Promise<TestInterface> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          ...value,
          description: `Processed: ${key}`,
        });
      }, 10);
    });
  }
}

export default {
  TestClass,
  testFunction,
  asyncTestFunction,
  testConstant,
  testObject,
  testArray,
  complexFunction,
  ComplexClass,
};
