/**
 * In-memory cache with TTL support
 * Provides fast response caching for repeated queries
 */

import { logger } from "./logger";

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

class Cache {
  private store: Map<string, CacheEntry<any>>;
  private cleanupInterval: NodeJS.Timeout | null;

  constructor() {
    this.store = new Map();
    this.cleanupInterval = null;
    this.startCleanup();
  }

  /**
   * Get value from cache
   */
  get<T>(key: string): T | null {
    const entry = this.store.get(key);
    
    if (!entry) {
      return null;
    }

    const now = Date.now();
    const age = now - entry.timestamp;

    // Check if expired
    if (age > entry.ttl) {
      this.store.delete(key);
      logger.debug(`Cache expired: ${key}`);
      return null;
    }

    logger.debug(`Cache hit: ${key} (age: ${Math.round(age / 1000)}s)`);
    return entry.data as T;
  }

  /**
   * Set value in cache with TTL
   */
  set<T>(key: string, data: T, ttl: number = 300000): void {
    this.store.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
    logger.debug(`Cache set: ${key} (ttl: ${ttl / 1000}s)`);
  }

  /**
   * Delete specific key from cache
   */
  delete(key: string): boolean {
    const deleted = this.store.delete(key);
    if (deleted) {
      logger.debug(`Cache deleted: ${key}`);
    }
    return deleted;
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    const size = this.store.size;
    this.store.clear();
    logger.info(`Cache cleared: ${size} entries removed`);
  }

  /**
   * Get cache statistics
   */
  getStats(): { size: number; keys: string[] } {
    return {
      size: this.store.size,
      keys: Array.from(this.store.keys()),
    };
  }

  /**
   * Check if key exists and is not expired
   */
  has(key: string): boolean {
    return this.get(key) !== null;
  }

  /**
   * Start periodic cleanup of expired entries
   */
  private startCleanup(): void {
    // Run cleanup every 5 minutes
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 5 * 60 * 1000);
  }

  /**
   * Remove expired entries
   */
  private cleanup(): void {
    const now = Date.now();
    let removed = 0;

    for (const [key, entry] of this.store.entries()) {
      const age = now - entry.timestamp;
      if (age > entry.ttl) {
        this.store.delete(key);
        removed++;
      }
    }

    if (removed > 0) {
      logger.info(`Cache cleanup: ${removed} expired entries removed`);
    }
  }

  /**
   * Stop cleanup interval
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }
}

// Singleton instance
export const cache = new Cache();

/**
 * Generate cache key for wallet analysis
 */
export function getWalletCacheKey(address: string): string {
  return `wallet:${address.toLowerCase()}`;
}

/**
 * Generate cache key for ENS resolution
 */
export function getENSCacheKey(name: string): string {
  return `ens:${name.toLowerCase()}`;
}

/**
 * Generate cache key for quest verification
 */
export function getQuestCacheKey(address: string): string {
  return `quest:${address.toLowerCase()}`;
}

/**
 * Generate cache key for transaction analysis
 */
export function getTransactionCacheKey(txHash: string): string {
  return `tx:${txHash.toLowerCase()}`;
}

/**
 * Cache TTL constants (in milliseconds)
 */
export const CacheTTL = {
  WALLET_ANALYSIS: 5 * 60 * 1000,      // 5 minutes
  ENS_RESOLUTION: 60 * 60 * 1000,      // 1 hour (ENS rarely changes)
  QUEST_VERIFICATION: 2 * 60 * 1000,   // 2 minutes (quests update frequently)
  TRANSACTION: 30 * 60 * 1000,         // 30 minutes
  CHAT_RESPONSE: 10 * 60 * 1000,       // 10 minutes
};
