import { Router } from 'express'
import os from 'os'

const router = Router()

/**
 * @swagger
 * /api/health:
 *   get:
 *     summary: Basic health check
 *     tags: [Health]
 *     security: []
 *     responses:
 *       200:
 *         description: Service is healthy
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HealthResponse'
 */
router.get('/', (_req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    version: process.env.npm_package_version || '1.0.0'
  })
})

/**
 * @swagger
 * /api/health/detailed:
 *   get:
 *     summary: Detailed health check with system information
 *     tags: [Health]
 *     security: []
 *     responses:
 *       200:
 *         description: Detailed system information
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 timestamp:
 *                   type: string
 *                 process:
 *                   type: object
 *                 system:
 *                   type: object
 */
router.get('/detailed', (_req, res) => {
  const memoryUsage = process.memoryUsage()
  const totalMemory = os.totalmem()
  const freeMemory = os.freemem()
  
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    process: {
      uptime: process.uptime(),
      pid: process.pid,
      version: process.version,
      memory: {
        rss: Math.round(memoryUsage.rss / 1024 / 1024) + ' MB',
        heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024) + ' MB',
        heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024) + ' MB',
        external: Math.round(memoryUsage.external / 1024 / 1024) + ' MB'
      }
    },
    system: {
      platform: os.platform(),
      arch: os.arch(),
      cpus: os.cpus().length,
      totalMemory: Math.round(totalMemory / 1024 / 1024 / 1024) + ' GB',
      freeMemory: Math.round(freeMemory / 1024 / 1024 / 1024) + ' GB',
      memoryUsage: Math.round((1 - freeMemory / totalMemory) * 100) + '%',
      loadAverage: os.loadavg()
    }
  })
})

/**
 * @swagger
 * /api/health/ready:
 *   get:
 *     summary: Readiness check - verifies external dependencies
 *     tags: [Health]
 *     security: []
 *     responses:
 *       200:
 *         description: All services are ready
 *       503:
 *         description: One or more services are degraded
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   enum: [ready, degraded]
 *                 checks:
 *                   type: object
 */
router.get('/ready', async (_req, res) => {
  const checks: Record<string, { status: boolean; latency?: number; error?: string }> = {
    openrouter: { status: false },
    bunny: { status: false },
    supabase: { status: false }
  }

  // Check OpenRouter
  try {
    const start = Date.now()
    const response = await fetch('https://openrouter.ai/api/v1/models', {
      method: 'HEAD',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`
      },
      signal: AbortSignal.timeout(5000) // 5s timeout
    })
    checks.openrouter = {
      status: response.ok,
      latency: Date.now() - start
    }
  } catch (error) {
    checks.openrouter = {
      status: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }

  // Check Bunny Storage
  try {
    const start = Date.now()
    const response = await fetch(
      `https://${process.env.BUNNY_STORAGE_HOSTNAME}/${process.env.BUNNY_STORAGE_ZONE_NAME}/`,
      {
        method: 'HEAD',
        headers: {
          'AccessKey': process.env.BUNNY_STORAGE_API_KEY!
        },
        signal: AbortSignal.timeout(5000) // 5s timeout
      }
    )
    checks.bunny = {
      status: response.ok || response.status === 404, // 404 is ok for empty directory
      latency: Date.now() - start
    }
  } catch (error) {
    checks.bunny = {
      status: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }

  // Check Supabase Auth
  if (process.env.SUPABASE_URL && process.env.SUPABASE_PUBLISHABLE_KEY) {
    try {
      const start = Date.now()
      const response = await fetch(
        `${process.env.SUPABASE_URL}/auth/v1/health`,
        {
          method: 'GET',
          headers: {
            'apikey': process.env.SUPABASE_PUBLISHABLE_KEY
          },
          signal: AbortSignal.timeout(5000) // 5s timeout
        }
      )
      checks.supabase = {
        status: response.ok,
        latency: Date.now() - start
      }
    } catch (error) {
      checks.supabase = {
        status: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  } else {
    checks.supabase = {
      status: false,
      error: 'Supabase not configured'
    }
  }

  const allHealthy = Object.values(checks).every(check => check.status)
  const hasWarnings = Object.values(checks).some(check => !check.status)
  
  res.status(allHealthy ? 200 : hasWarnings ? 503 : 500).json({
    status: allHealthy ? 'ready' : 'degraded',
    timestamp: new Date().toISOString(),
    checks
  })
})

/**
 * @swagger
 * /api/health/live:
 *   get:
 *     summary: Liveness check for container orchestration
 *     tags: [Health]
 *     security: []
 *     responses:
 *       200:
 *         description: Service is alive
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: OK
 */
router.get('/live', (_req, res) => {
  res.status(200).send('OK')
})

export default router