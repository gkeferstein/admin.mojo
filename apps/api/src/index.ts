import Fastify, { FastifyRequest, FastifyReply } from 'fastify';
import cors from '@fastify/cors';
import { logger } from './lib/logger';
import { env } from './lib/env';
import prisma from './lib/prisma.js';
import regionalAgreementsRoutes from './routes/regional-agreements';
import regionalPartnersRoutes from './routes/regional-partners.js';
import regionalPayoutsRoutes from './routes/regional-payouts.js';
import platformProductsRoutes from './routes/platform-products.js';
import customerAttributionsRoutes from './routes/customer-attributions.js';
import commissionsRoutes from './routes/commissions.js';
import payoutsRoutes from './routes/payouts.js';
import contractsRoutes from './routes/contracts.js';
import auditRoutes from './routes/audit.js';
import entitlementRegistryRoutes from './routes/entitlement-registry.js';

const fastify = Fastify({
  logger: true,
});

// CORS
await fastify.register(cors, {
  origin: true,
  credentials: true,
});

// Health check
const startTime = Date.now();
fastify.get('/health', async () => {
  const uptime = Math.floor((Date.now() - startTime) / 1000);
  
  // Check database connection
  let dbStatus = 'ok';
  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch (error) {
    dbStatus = 'error';
  }
  
  return {
    status: 'ok',
    service: 'admin.mojo-api',
    version: '1.0.0',
    uptime,
    timestamp: new Date().toISOString(),
    checks: {
      database: dbStatus,
    },
  };
});

// API Info
fastify.get('/api', async () => ({
  service: 'admin.mojo API',
  version: '1.0.0',
  description: 'Platform Administration API für das MOJO Ökosystem',
    endpoints: {
      'regional-agreements': '/api/regional-agreements',
      'regional-partners': '/api/regional-partners',
      'regional-payouts': '/api/regional-payouts',
      'platform-products': '/api/platform-products',
      'customer-attributions': '/api/customer-attributions',
      commissions: '/api/commissions',
      payouts: '/api/payouts',
      contracts: '/api/contracts',
      audit: '/api/audit',
      'entitlement-registry': '/api/entitlement-registry',
    },
}));

// Register routes
await fastify.register(regionalAgreementsRoutes);
await fastify.register(regionalPartnersRoutes);
await fastify.register(regionalPayoutsRoutes);
await fastify.register(platformProductsRoutes);
await fastify.register(customerAttributionsRoutes);
await fastify.register(commissionsRoutes);
await fastify.register(payoutsRoutes);
await fastify.register(contractsRoutes);
await fastify.register(auditRoutes);
await fastify.register(entitlementRegistryRoutes);

// Error handler
fastify.setErrorHandler((error: unknown, request: FastifyRequest, reply: FastifyReply) => {
  logger.error({ err: error, url: request.url }, 'Request error');
  
  // Zod validation errors
  if (
    typeof error === 'object' &&
    error !== null &&
    'name' in error &&
    error.name === 'ZodError' &&
    'issues' in error
  ) {
    const zodError = error as { issues: unknown[] };
    return reply.status(400).send({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid request data',
        details: zodError.issues,
      },
    });
  }

  // Prisma errors
  if (
    typeof error === 'object' &&
    error !== null &&
    'name' in error &&
    error.name === 'PrismaClientKnownRequestError'
  ) {
    return reply.status(400).send({
      success: false,
      error: {
        code: 'DATABASE_ERROR',
        message: 'Database operation failed',
      },
    });
  }
  
  // Default error
  const errorMessage = error instanceof Error ? error.message : String(error);
  return reply.status(500).send({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: env.NODE_ENV === 'production' ? 'Internal server error' : errorMessage,
    },
  });
});

// Start server
const start = async () => {
  try {
    await fastify.listen({ port: env.PORT, host: '0.0.0.0' });
    logger.info(`
╔═══════════════════════════════════════════════════════════╗
║                    admin.mojo API                         ║
║═══════════════════════════════════════════════════════════║
║  Server running on http://0.0.0.0:${env.PORT}                  ║
║  Environment: ${env.NODE_ENV.padEnd(20)}                   ║
║                                                           ║
║  Endpoints:                                               ║
║  • Regional Agreements: /api/regional-agreements          ║
║  • Platform Products:   /api/platform-products            ║
║  • Customer Attribution:/api/customer-attributions         ║
║  • Commissions:         /api/commissions                   ║
║  • Payouts:             /api/payouts                       ║
║  • Contracts:           /api/contracts                     ║
║  • Audit:               /api/audit                         ║
║  • Entitlement Registry:/api/entitlement-registry         ║
╚═══════════════════════════════════════════════════════════╝
    `);
  } catch (err) {
    logger.error(err);
    process.exit(1);
  }
};

start();
