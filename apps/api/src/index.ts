import Fastify, { FastifyRequest, FastifyReply } from 'fastify';
import cors from '@fastify/cors';
import { logger } from './lib/logger';
import { env } from './lib/env';
import regionalAgreementsRoutes from './routes/regional-agreements';
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
fastify.get('/health', async () => ({
  status: 'ok',
  service: 'admin.mojo-api',
  version: '1.0.0',
  timestamp: new Date().toISOString(),
}));

// API Info
fastify.get('/api/v1', async () => ({
  service: 'admin.mojo API',
  version: '1.0.0',
  description: 'Platform Administration API für das MOJO Ökosystem',
    endpoints: {
      'regional-agreements': '/api/v1/regional-agreements',
      'platform-products': '/api/v1/platform-products',
      'customer-attributions': '/api/v1/customer-attributions',
      commissions: '/api/v1/commissions',
      payouts: '/api/v1/payouts',
      contracts: '/api/v1/contracts',
      audit: '/api/v1/audit',
      'entitlement-registry': '/api/v1/entitlement-registry',
    },
}));

// Register routes
await fastify.register(regionalAgreementsRoutes);
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
║  • Regional Agreements: /api/v1/regional-agreements       ║
║  • Platform Products:   /api/v1/platform-products         ║
║  • Customer Attribution:/api/v1/customer-attributions     ║
║  • Commissions:         /api/v1/commissions               ║
║  • Payouts:             /api/v1/payouts                   ║
║  • Contracts:           /api/v1/contracts                 ║
║  • Audit:               /api/v1/audit                     ║
║  • Entitlement Registry:/api/v1/entitlement-registry      ║
╚═══════════════════════════════════════════════════════════╝
    `);
  } catch (err) {
    logger.error(err);
    process.exit(1);
  }
};

start();
