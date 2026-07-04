/**
 * Copyright (c) 2021, Ethan Elliott
 */

interface Entry<V> {
  value: V;
  expiresAt: number;
}

/**
 * A tiny in-memory cache with a size cap and optional TTL. Entries are evicted
 * in least-recently-used order once the cap is exceeded. Used to avoid
 * repeating expensive, repeatable work (artwork palette extraction, immutable
 * Spotify metadata lookups) on the hot paths.
 *
 * Dependency-free and process-local; for multi-instance deployments this would
 * move to a shared cache (e.g. Redis), but it already removes the per-request
 * and per-tick duplication within a single instance.
 */
export class BoundedCache<V> {
  private readonly _store = new Map<string, Entry<V>>();

  constructor(
    private readonly _maxSize: number,
    private readonly _ttlMs?: number
  ) {}

  get(key: string): V | undefined {
    const hit = this._store.get(key);
    if (!hit) {
      return undefined;
    }
    if (hit.expiresAt <= Date.now()) {
      this._store.delete(key);
      return undefined;
    }
    // Re-insert to mark as most-recently-used.
    this._store.delete(key);
    this._store.set(key, hit);
    return hit.value;
  }

  set(key: string, value: V): void {
    if (this._store.has(key)) {
      this._store.delete(key);
    }
    this._store.set(key, {
      expiresAt: this._ttlMs ? Date.now() + this._ttlMs : Number.POSITIVE_INFINITY,
      value,
    });
    if (this._store.size > this._maxSize) {
      const oldest = this._store.keys().next().value;
      if (oldest !== undefined) {
        this._store.delete(oldest);
      }
    }
  }

  // Returns the cached value or computes, stores, and returns it. Concurrent
  // misses for the same key may each call the loader; acceptable for the
  // idempotent reads this cache is used for.
  async getOrLoad(key: string, loader: () => Promise<V>): Promise<V> {
    const cached = this.get(key);
    if (cached !== undefined) {
      return cached;
    }
    const value = await loader();
    this.set(key, value);
    return value;
  }
}
