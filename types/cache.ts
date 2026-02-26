export interface CacheEntry<T> {
  value: T;
}

export type Cache<Key extends string, T> = Record<Key, CacheEntry<T>>;
