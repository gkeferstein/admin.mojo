import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import prisma from '../lib/prisma.js';
import { logAudit } from '../services/audit.js';

// ==============================================
// Validation Schemas
// ==============================================

const createAttributionSchema = z.object({
  customerUserId: z.string().min(1),
  customerEmail: z.string().email().optional(),
  attributedTenantId: z.string().min(1),
  attributedTenantName: z.string().optional(),
  source: z.enum(['AFFILIATE_CODE', 'REFERRAL_LINK', 'MANUAL', 'MIGRATION']).default('AFFILIATE_CODE'),
  sourceRef: z.string().optional(),
});

const querySchema = z.object({
  tenantId: z.string().optional(),
  expiredOnly: z.string().optional(),
  activeOnly: z.string().optional(),
  limit: z.string().transform(Number).default('50'),
  offset: z.string().transform(Number).default('0'),
});

// ==============================================
// Constants
// ==============================================

const ATTRIBUTION_DURATION_YEARS = 3;

// ==============================================
// Routes
// ==============================================

export default async function customerAttributionsRoutes(fastify: FastifyInstance) {
  
  // GET /api/customer-attributions - Liste aller Attributionen
  fastify.get('/api/customer-attributions', async (request: FastifyRequest, reply: FastifyReply) => {
    const query = querySchema.parse(request.query);
    
    const where: any = {};
    const now = new Date();
    
    if (query.tenantId) {
      where.attributedTenantId = query.tenantId;
    }
    
    if (query.expiredOnly === 'true') {
      where.attributionExpiresAt = { lt: now };
    }
    
    if (query.activeOnly === 'true') {
      where.attributionExpiresAt = { gte: now };
    }
    
    const [attributions, total] = await Promise.all([
      prisma.customerAttribution.findMany({
        where,
        orderBy: { attributedAt: 'desc' },
        take: query.limit,
        skip: query.offset,
      }),
      prisma.customerAttribution.count({ where }),
    ]);
    
    return {
      success: true,
      data: attributions,
      meta: {
        total,
        limit: query.limit,
        offset: query.offset,
        hasMore: query.offset + attributions.length < total,
      },
    };
  });

  // GET /api/customer-attributions/:userId - Attribution eines Kunden
  fastify.get('/api/customer-attributions/:userId', async (request: FastifyRequest, reply: FastifyReply) => {
    const { userId } = request.params as { userId: string };
    
    const attribution = await prisma.customerAttribution.findUnique({
      where: { customerUserId: userId },
    });
    
    if (!attribution) {
      return {
        success: true,
        data: null,
        hasAttribution: false,
      };
    }
    
    const now = new Date();
    const isActive = attribution.attributionExpiresAt > now;
    
    return {
      success: true,
      data: attribution,
      hasAttribution: true,
      isActive,
      daysRemaining: isActive 
        ? Math.ceil((attribution.attributionExpiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
        : 0,
    };
  });

  // POST /api/customer-attributions - Neue Attribution erstellen
  fastify.post('/api/customer-attributions', async (request: FastifyRequest, reply: FastifyReply) => {
    const input = createAttributionSchema.parse(request.body);
    
    // Check if customer already has attribution
    const existing = await prisma.customerAttribution.findUnique({
      where: { customerUserId: input.customerUserId },
    });
    
    if (existing) {
      return reply.status(409).send({
        success: false,
        error: {
          code: 'ALREADY_ATTRIBUTED',
          message: 'Customer already has an attribution',
          details: {
            attributedTenantId: existing.attributedTenantId,
            attributedAt: existing.attributedAt,
            expiresAt: existing.attributionExpiresAt,
          },
        },
      });
    }
    
    const now = new Date();
    const expiresAt = new Date(now);
    expiresAt.setFullYear(expiresAt.getFullYear() + ATTRIBUTION_DURATION_YEARS);
    
    const attribution = await prisma.customerAttribution.create({
      data: {
        customerUserId: input.customerUserId,
        customerEmail: input.customerEmail,
        attributedTenantId: input.attributedTenantId,
        attributedTenantName: input.attributedTenantName,
        attributedAt: now,
        attributionExpiresAt: expiresAt,
        source: input.source,
        sourceRef: input.sourceRef,
      },
    });
    
    await logAudit({
      action: 'create',
      resource: 'customer_attribution',
      resourceId: attribution.id,
      newValue: attribution,
      request,
    });
    
    return reply.status(201).send({ success: true, data: attribution });
  });

  // POST /api/customer-attributions/:userId/record-purchase - Kauf aufzeichnen
  fastify.post('/api/customer-attributions/:userId/record-purchase', async (request: FastifyRequest, reply: FastifyReply) => {
    const { userId } = request.params as { userId: string };
    const input = z.object({
      orderId: z.string(),
      orderAmount: z.number().positive(),
    }).parse(request.body);
    
    const attribution = await prisma.customerAttribution.findUnique({
      where: { customerUserId: userId },
    });
    
    if (!attribution) {
      return reply.status(404).send({
        success: false,
        error: { code: 'NOT_FOUND', message: 'No attribution found for this customer' },
      });
    }
    
    const isFirstPurchase = !attribution.firstPurchaseAt;
    
    const updated = await prisma.customerAttribution.update({
      where: { customerUserId: userId },
      data: {
        ...(isFirstPurchase && {
          firstPurchaseAt: new Date(),
          firstPurchaseOrderId: input.orderId,
        }),
        totalPurchases: { increment: 1 },
        totalRevenue: { increment: input.orderAmount },
      },
    });
    
    return {
      success: true,
      data: updated,
      isFirstPurchase,
    };
  });

  // DELETE /api/customer-attributions/:userId - Attribution entfernen (Admin only)
  fastify.delete('/api/customer-attributions/:userId', async (request: FastifyRequest, reply: FastifyReply) => {
    const { userId } = request.params as { userId: string };
    const { reason } = request.query as { reason?: string };
    
    const existing = await prisma.customerAttribution.findUnique({
      where: { customerUserId: userId },
    });
    
    if (!existing) {
      return reply.status(404).send({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Attribution not found' },
      });
    }
    
    await prisma.customerAttribution.delete({
      where: { customerUserId: userId },
    });
    
    await logAudit({
      action: 'delete',
      resource: 'customer_attribution',
      resourceId: existing.id,
      oldValue: existing,
      metadata: { reason },
      request,
    });
    
    return { success: true, message: 'Attribution removed' };
  });

  // GET /api/customer-attributions/stats - Statistiken
  fastify.get('/api/customer-attributions/stats', async (request: FastifyRequest, reply: FastifyReply) => {
    const { tenantId } = request.query as { tenantId?: string };
    
    const now = new Date();
    const where: any = {};
    if (tenantId) {
      where.attributedTenantId = tenantId;
    }
    
    const [
      total,
      active,
      withPurchase,
      aggregates,
    ] = await Promise.all([
      prisma.customerAttribution.count({ where }),
      prisma.customerAttribution.count({
        where: { ...where, attributionExpiresAt: { gte: now } },
      }),
      prisma.customerAttribution.count({
        where: { ...where, firstPurchaseAt: { not: null } },
      }),
      prisma.customerAttribution.aggregate({
        where,
        _sum: {
          totalPurchases: true,
          totalRevenue: true,
          totalCommissionPaid: true,
        },
      }),
    ]);
    
    return {
      success: true,
      data: {
        totalAttributions: total,
        activeAttributions: active,
        expiredAttributions: total - active,
        attributionsWithPurchase: withPurchase,
        conversionRate: total > 0 ? ((withPurchase / total) * 100).toFixed(2) + '%' : '0%',
        totalPurchases: aggregates._sum.totalPurchases || 0,
        totalRevenue: aggregates._sum.totalRevenue || 0,
        totalCommissionPaid: aggregates._sum.totalCommissionPaid || 0,
      },
    };
  });

  // POST /api/customer-attributions/check - Attribution prüfen (für payments.mojo)
  fastify.post('/api/customer-attributions/check', async (request: FastifyRequest, reply: FastifyReply) => {
    const input = z.object({
      customerUserId: z.string(),
    }).parse(request.body);
    
    const attribution = await prisma.customerAttribution.findUnique({
      where: { customerUserId: input.customerUserId },
    });
    
    if (!attribution) {
      return {
        success: true,
        hasAttribution: false,
        affiliate: null,
        isFirstPurchase: true, // No attribution = first purchase in system
      };
    }
    
    const now = new Date();
    const isActive = attribution.attributionExpiresAt > now;
    const isFirstPurchase = !attribution.firstPurchaseAt;
    
    return {
      success: true,
      hasAttribution: true,
      isActive,
      affiliate: isActive ? {
        tenantId: attribution.attributedTenantId,
        tenantName: attribution.attributedTenantName,
        source: attribution.source,
        sourceRef: attribution.sourceRef,
      } : null,
      isFirstPurchase,
      commissionRate: isFirstPurchase ? 20 : 10, // 20% first, 10% recurring
    };
  });
}




