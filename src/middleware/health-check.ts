/**
 * Health check middleware with dependency validation
 */

import { Request, Response } from 'express';
import { logger } from '../utils/logger';

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  uptime: number;
  dependencies: {
    openai: boolean;
    cdp?: boolean;
    exa?: boolean;
    letta?: boolean;
  };
  errors?: string[];
}

/**
 * Comprehensive health check endpoint
 */
export async function healthCheck(req: Request, res: Response) {
  const errors: string[] = [];
  const dependencies: HealthStatus['dependencies'] = {
    openai: false,
  };

  // Check OpenAI API key
  if (process.env.OPENAI_API_KEY && !process.env.OPENAI_API_KEY.startsWith('your_')) {
    dependencies.openai = true;
  } else {
    errors.push('OpenAI API key not configured');
  }

  // Check CDP keys (optional)
  if (process.env.CDP_API_KEY_ID && process.env.CDP_API_KEY_SECRET) {
    dependencies.cdp = true;
  }

  // Check Exa API key (optional)
  if (process.env.EXA_API_KEY) {
    dependencies.exa = true;
  }

  // Check Letta configuration (optional)
  if (process.env.LETTA_API_KEY || process.env.LETTA_BASE_URL) {
    dependencies.letta = true;
  }

  // Determine overall health status
  let status: HealthStatus['status'] = 'healthy';
  if (errors.length > 0) {
    status = dependencies.openai ? 'degraded' : 'unhealthy';
  }

  const healthStatus: HealthStatus = {
    status,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    dependencies,
    ...(errors.length > 0 && { errors }),
  };

  const statusCode = status === 'healthy' ? 200 : status === 'degraded' ? 200 : 503;

  if (status !== 'healthy') {
    logger.warn('Health check returned non-healthy status', healthStatus);
  }

  res.status(statusCode).json(healthStatus);
}

/**
 * Simple liveness probe (for Kubernetes/Cloud Run)
 */
export function livenessProbe(req: Request, res: Response) {
  res.status(200).send('ok');
}

/**
 * Readiness probe (checks if app is ready to serve traffic)
 */
export function readinessProbe(req: Request, res: Response) {
  // Check if critical dependencies are available
  const isReady = !!process.env.OPENAI_API_KEY;
  
  if (isReady) {
    res.status(200).json({ ready: true });
  } else {
    res.status(503).json({ ready: false, reason: 'Missing critical configuration' });
  }
}
