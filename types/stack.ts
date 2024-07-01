interface IStack<T> {
  push(dataItem: T): void;
  pop(): T | null | undefined;
  popAll(): Array<T | null | undefined>;
  peek(): T | null | undefined;
  size(): number;
  isEmpty(): boolean;
  isFull(): boolean;
  storage(): Array<T | null | undefined>;
}

export class Stack<T> implements IStack<T> {
  private queue: T[];

  constructor(private capacity: number = Infinity) {
    this.queue = [];
  }

  push(item: T): void {
    if (this.isFull()) {
      throw new Error(
        "Stack has reached max capacity, you cannot add more items"
      );
    }
    this.queue.push(item);
  }

  pop(): T | undefined {
    return this.queue.pop();
  }

  popAll() {
    const length = this.queue.length;
    const items = this.queue.splice(-length);
    return items;
  }

  peek(): T | undefined {
    return this.queue[this.size() - 1];
  }

  size(): number {
    return this.queue.length;
  }

  isEmpty(): boolean {
    return !this.size();
  }

  isFull(): boolean {
    return this.size() === this.capacity;
  }

  storage() {
    return this.queue;
  }
}
