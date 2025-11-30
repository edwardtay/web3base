/**
 * Request deduplication utility
 * Prevents duplicate processing of identical concurrent requests
 */

import { logger } from "./logger";

interface PendingRequest<T> {
  promise: Promise<T>;
  timestamp: number;
  requestId: string;
}

class RequestDeduplicator {
  private pending: Map<string, PendingRequest<any>>;
  private cleanupInterval: NodeJS.Timeout | null;

  constructor() {
    this.pending = new Map();
    this.cleanupInterval = null;
    this.startCleanup();
  }

  /**
   * Execute a request with deduplication
   * If an identical request is already in progress, return the existing promise
   */
  async deduplicate<T>(
    key: string,
    requestId: string,
    executor: () => Promise<T>,
    timeout: number = 30000
  ): Promise<{ data: T; deduplicated: boolean }> {
    // Check if request is already pending
    const existing = this.pending.get(key);

    if (existing) {
      const age = Date.now() - existing.timestamp;
      
      // If request is still fresh, reuse it
      if (age < timeout) {
        logger.info(`[${requestId}] Request deduplicated: ${key} (original: ${existing.requestId}, age: ${age}ms)`);
        
        try {
          const data = await existing.promise;
          return { data, deduplicated: true };
        } catch (error) {
          // If the original request failed, remove it and retry
          this.pending.delete(key);
          throw error;
        }
      } else {
        // Request is too old, remove it
        logger.warn(`[${requestId}] Stale request removed: ${key} (age: ${age}ms)`);
        this.pending.delete(key);
      }
    }

    // Create new request
    logger.debug(`[${requestId}] New request: ${key}`);
    
    const promise = executor()
      .then((result) => {
        // Remove from pending after completion
        this.pending.delete(key);
        return result;
      })
      .catch((error) => {
        // Remove from pending on error
        this.pending.delete(key);
        throw error;
      });

    // Store pending request
    this.pending.set(key, {
      promise,
      timestamp: Date.now(),
      requestId,
    });

    const data = await promise;
    return { data, deduplicated: false };
  }

  /**
   * Get statistics about pending requests
   */
  getStats(): { pendingCount: number; keys: string[] } {
    return {
      pendingCount: this.pending.size,
      keys: Array.from(this.pending.keys()),
    };
  }

  /**
   * Clear all pending requests
   */
  clear(): void {
    const size = this.pending.size;
    this.pending.clear();
    logger.info(`Request deduplicator cleared: ${size} pending requests removed`);
  }

  /**
   * Start periodic cleanup of stale requests
   */
  private startCleanup(): void {
    // Run cleanup every minute
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 60 * 1000);
  }

  /**
   * Remove stale pending requests (older than 2 minutes)
   */
  private cleanup(): void {
    const now = Date.now();
    const maxAge = 2 * 60 * 1000; // 2 minutes
    let removed = 0;

    for (const [key, request] of this.pending.entries()) {
      const age = now - request.timestamp;
      if (age > maxAge) {
        this.pending.delete(key);
        removed++;
        logger.warn(`Stale request removed during cleanup: ${key} (age: ${age}ms)`);
      }
    }

    if (removed > 0) {
      logger.info(`Request deduplicator cleanup: ${removed} stale requests removed`);
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
export const deduplicator = new RequestDeduplicator();

/**
 * Generate deduplication key for wallet analysis
 */
export function getWalletDeduplicationKey(address: string): string {
  return `wallet:${address.toLowerCase()}`;
}

/**
 * Generate deduplication key for ENS resolution
 */
export function getENSDeduplicationKey(name: string): string {
  return `ens:${name.toLowerCase()}`;
}

/**
 * Generate deduplication key for quest verification
 */
export function getQuestDeduplicationKey(address: string): string {
  return `quest:${address.toLowerCase()}`;
}

/**
 * Generate deduplication key for transaction analysis
 */
export function getTransactionDeduplicationKey(txHash: string): string {
  return `tx:${txHash.toLowerCase()}`;
}

/**
 * Generate deduplication key for chat requests
 */
export function getChatDeduplicationKey(message: string, threadId?: string): string {
  const messageHash = Buffer.from(message).toString('base64').substring(0, 32);
  return `chat:${threadId || 'default'}:${messageHash}`;
}
