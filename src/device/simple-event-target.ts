/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */

type Listener<T> = (data: T) => void;

/**
 * Lightweight typed event target with Set-based deduplication.
 */
export class SimpleEventTarget<M> {
  private listeners = new Map<string, Set<Listener<any>>>();

  addEventListener<K extends keyof M & string>(
    type: K,
    listener: Listener<M[K]>
  ): void {
    let set = this.listeners.get(type);
    if (!set) {
      set = new Set();
      this.listeners.set(type, set);
    }
    set.add(listener);
  }

  removeEventListener<K extends keyof M & string>(
    type: K,
    listener: Listener<M[K]>
  ): void {
    const set = this.listeners.get(type);
    if (set?.delete(listener) && set.size === 0) {
      this.listeners.delete(type);
    }
  }

  protected dispatchEvent<K extends keyof M & string>(
    type: K,
    ...[data]: M[K] extends void ? [] : [data: M[K]]
  ): void {
    const set = this.listeners.get(type);
    if (set) {
      for (const listener of set) {
        listener(data as M[K]);
      }
    }
  }
}
