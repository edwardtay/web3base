/**
 * Request ID middleware
 * Adds unique request ID to each request for tracking and debugging
 */

import { Request, Response, NextFunction } from 'express';
import { randomBytes } from 'crypto';
import { logger } from '../utils/logger';

// Extend Express Request type to include requestId
declare global {
  namespace Express {
    interface Request {
      requestId: string;
    }
  }
}

/**
 * Generate a unique request ID
 */
function generateRequestId(): string {
  return `req_${Date.now()}_${randomBytes(8).toString('hex')}`;
}

/**
 * Request ID middleware
 * Adds a unique ID to each request and includes it in response headers
 */
export function requestIdMiddleware(req: Request, res: Response, next: NextFunction): void {
  // Check if request already has an ID (from client or load balancer)
  const existingId = req.headers['x-request-id'] as string;
  
  // Use existing ID or generate new one
  const requestId = existingId || generateRequestId();
  
  // Attach to request object
  req.requestId = requestId;
  
  // Add to response headers
  res.setHeader('X-Request-ID', requestId);
  
  // Log request start
  logger.info(`[${requestId}] ${req.method} ${req.path} - Request started`, {
    requestId,
    method: req.method,
    path: req.path,
    ip: req.ip,
    userAgent: req.headers['user-agent'],
  });
  
  // Track request duration
  const startTime = Date.now();
  
  // Log when response is finished
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const logLevel = res.statusCode >= 400 ? 'warn' : 'info';
    
    logger[logLevel](`[${requestId}] ${req.method} ${req.path} - ${res.statusCode} (${duration}ms)`, {
      requestId,
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration,
      ip: req.ip,
    });
  });
  
  next();
}

/**
 * Get request ID from request object
 */
export function getRequestId(req: Request): string {
  return req.requestId || 'unknown';
}

/**
 * Create a child logger with request ID context
 */
export function getRequestLogger(req: Request) {
  const requestId = getRequestId(req);
  
  return {
    info: (message: string, meta?: any) => {
      logger.info(`[${requestId}] ${message}`, { requestId, ...meta });
    },
    warn: (message: string, meta?: any) => {
      logger.warn(`[${requestId}] ${message}`, { requestId, ...meta });
    },
    error: (message: string, meta?: any) => {
      logger.error(`[${requestId}] ${message}`, { requestId, ...meta });
    },
    debug: (message: string, meta?: any) => {
      logger.debug(`[${requestId}] ${message}`, { requestId, ...meta });
    },
  };
}
