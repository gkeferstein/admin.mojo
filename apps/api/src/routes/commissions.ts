import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import prisma from '../lib/prisma.js';
import { commissionCalculator, OrderInput } from '../services/commission-calculator.js';
import { logAudit } from '../services/audit.js';

// ==============================================
// Validation Schemas
// ==============================================

const calculateSchema = z.object({
  orderId: z.string(),
  orderDate: z.string().datetime().optional(),
  orderAmountNet: z.number().positive(),
  productId: z.string().optional(),
  productName: z.string().optional(),
  isPlatformProduct: z.boolean().default(false),
  sellerTenantId: z.string().optional().nullable(),
  sellerTenantName: z.string().optional(),
  customerUserId: z.string(),
  customerBillingCountry: z.string().length(2),
});

const querySchema = z.object({
  recipientTenantId: z.string().optional(),
  status: z.string().optional(),
  type: z.string().optional(),
  fromDate: z.string().optional(),
  toDate: z.string().optional(),
  limit: z.string().transform(Number).default('50'),
  offset: z.string().transform(Number).default('0'),
});

// ==============================================
// Routes
// ==============================================

export default async function commissionsRoutes(fastify: FastifyInstance) {
  
  // POST /api/v1/commissions/calculate - Provisionen berechnen (Preview)
  fastify.post('/api/v1/commissions/calculate', async (request: FastifyRequest, reply: FastifyReply) => {
    const input = calculateSchema.parse(request.body);
    
    const order: OrderInput = {
      orderId: input.orderId,
      orderDate: input.orderDate ? new Date(input.orderDate) : new Date(),
      orderAmountNet: input.orderAmountNet,
      productId: input.productId,
      productName: input.productName,
      isPlatformProduct: input.isPlatformProduct,
      sellerTenantId: input.sellerTenantId || undefined,
      sellerTenantName: input.sellerTenantName,
      customerUserId: input.customerUserId,
      customerBillingCountry: input.customerBillingCountry,
    };
    
    const result = await commissionCalculator.calculateCommissions(order);
    
    return {
      success: true,
      data: result,
      preview: true, // Indicates this is a preview, not saved
    };
  });

  // POST /api/v1/commissions/process - Provisionen berechnen und speichern
  fastify.post('/api/v1/commissions/process', async (request: FastifyRequest, reply: FastifyReply) => {
    const input = calculateSchema.parse(request.body);
    
    // Check for duplicate order
    const existing = await prisma.commission.findFirst({
      where: { orderId: input.orderId },
    });
    
    if (existing) {
      return reply.status(409).send({
        success: false,
        error: {
          code: 'DUPLICATE_ORDER',
          message: 'Commissions for this order already exist',
        },
      });
    }
    
    const order: OrderInput = {
      orderId: input.orderId,
      orderDate: input.orderDate ? new Date(input.orderDate) : new Date(),
      orderAmountNet: input.orderAmountNet,
      productId: input.productId,
      productName: input.productName,
      isPlatformProduct: input.isPlatformProduct,
      sellerTenantId: input.sellerTenantId || undefined,
      sellerTenantName: input.sellerTenantName,
      customerUserId: input.customerUserId,
      customerBillingCountry: input.customerBillingCountry,
    };
    
    const result = await commissionCalculator.processOrder(order);
    
    await logAudit({
      action: 'process_order',
      resource: 'commission',
      resourceId: input.orderId,
      newValue: result,
      request,
    });
    
    return reply.status(201).send({
      success: true,
      data: result,
    });
  });

  // GET /api/v1/commissions - Liste aller Provisionen
  fastify.get('/api/v1/commissions', async (request: FastifyRequest, reply: FastifyReply) => {
    const query = querySchema.parse(request.query);
    
    const where: any = {};
    
    if (query.recipientTenantId) {
      where.recipientTenantId = query.recipientTenantId;
    }
    
    if (query.status) {
      where.status = query.status;
    }
    
    if (query.type) {
      where.commissionType = query.type;
    }
    
    if (query.fromDate || query.toDate) {
      where.orderDate = {};
      if (query.fromDate) {
        where.orderDate.gte = new Date(query.fromDate);
      }
      if (query.toDate) {
        where.orderDate.lte = new Date(query.toDate);
      }
    }
    
    const [commissions, total, aggregates] = await Promise.all([
      prisma.commission.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: query.limit,
        skip: query.offset,
      }),
      prisma.commission.count({ where }),
      prisma.commission.aggregate({
        where,
        _sum: { commissionAmount: true },
      }),
    ]);
    
    return {
      success: true,
      data: commissions,
      meta: {
        total,
        totalAmount: aggregates._sum.commissionAmount || 0,
        limit: query.limit,
        offset: query.offset,
      },
    };
  });

  // GET /api/v1/commissions/by-order/:orderId - Provisionen einer Order
  fastify.get('/api/v1/commissions/by-order/:orderId', async (request: FastifyRequest, reply: FastifyReply) => {
    const { orderId } = request.params as { orderId: string };
    
    const commissions = await prisma.commission.findMany({
      where: { orderId },
    });
    
    const total = commissions.reduce((sum, c) => sum + Number(c.commissionAmount), 0);
    
    return {
      success: true,
      data: commissions,
      meta: { count: commissions.length, total },
    };
  });

  // POST /api/v1/commissions/refund - Order-Provisionen stornieren
  fastify.post('/api/v1/commissions/refund', async (request: FastifyRequest, reply: FastifyReply) => {
    const input = z.object({
      orderId: z.string(),
      reason: z.string().min(1),
    }).parse(request.body);
    
    const count = await commissionCalculator.refundOrder(input.orderId, input.reason);
    
    if (count === 0) {
      return reply.status(404).send({
        success: false,
        error: { code: 'NOT_FOUND', message: 'No refundable commissions found for this order' },
      });
    }
    
    await logAudit({
      action: 'refund',
      resource: 'commission',
      resourceId: input.orderId,
      metadata: { reason: input.reason, count },
      request,
    });
    
    return {
      success: true,
      message: `Refunded ${count} commission(s)`,
      count,
    };
  });

  // POST /api/v1/commissions/approve-eligible - Ausstehende genehmigen (Cron Job)
  fastify.post('/api/v1/commissions/approve-eligible', async (request: FastifyRequest, reply: FastifyReply) => {
    const count = await commissionCalculator.approveEligibleCommissions();
    
    await logAudit({
      action: 'approve_batch',
      resource: 'commission',
      metadata: { count },
      request,
    });
    
    return {
      success: true,
      message: `Approved ${count} commission(s)`,
      count,
    };
  });

  // GET /api/v1/commissions/stats - Statistiken
  fastify.get('/api/v1/commissions/stats', async (request: FastifyRequest, reply: FastifyReply) => {
    const { recipientTenantId, period } = request.query as { 
      recipientTenantId?: string; 
      period?: 'day' | 'week' | 'month' | 'year';
    };
    
    const where: any = {};
    if (recipientTenantId) {
      where.recipientTenantId = recipientTenantId;
    }
    
    // Period filter
    if (period) {
      const now = new Date();
      const startDate = new Date();
      switch (period) {
        case 'day':
          startDate.setDate(now.getDate() - 1);
          break;
        case 'week':
          startDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          startDate.setMonth(now.getMonth() - 1);
          break;
        case 'year':
          startDate.setFullYear(now.getFullYear() - 1);
          break;
      }
      where.createdAt = { gte: startDate };
    }
    
    const [byStatus, byType, totals] = await Promise.all([
      prisma.commission.groupBy({
        by: ['status'],
        where,
        _count: true,
        _sum: { commissionAmount: true },
      }),
      prisma.commission.groupBy({
        by: ['commissionType'],
        where,
        _count: true,
        _sum: { commissionAmount: true },
      }),
      prisma.commission.aggregate({
        where,
        _count: true,
        _sum: { commissionAmount: true },
      }),
    ]);
    
    return {
      success: true,
      data: {
        totals: {
          count: totals._count,
          amount: totals._sum.commissionAmount || 0,
        },
        byStatus: byStatus.map(s => ({
          status: s.status,
          count: s._count,
          amount: s._sum.commissionAmount || 0,
        })),
        byType: byType.map(t => ({
          type: t.commissionType,
          count: t._count,
          amount: t._sum.commissionAmount || 0,
        })),
      },
    };
  });

  // GET /api/v1/commissions/pending-payout - Auszahlungsreife Provisionen
  fastify.get('/api/v1/commissions/pending-payout', async (request: FastifyRequest, reply: FastifyReply) => {
    const { recipientTenantId } = request.query as { recipientTenantId?: string };
    
    const where: any = {
      status: 'APPROVED',
      payoutId: null,
    };
    
    if (recipientTenantId) {
      where.recipientTenantId = recipientTenantId;
    }
    
    const commissions = await prisma.commission.groupBy({
      by: ['recipientTenantId', 'recipientTenantName'],
      where,
      _count: true,
      _sum: { commissionAmount: true },
    });
    
    const MINIMUM_PAYOUT = 50;
    
    const eligiblePayouts = commissions
      .filter(c => Number(c._sum.commissionAmount) >= MINIMUM_PAYOUT)
      .map(c => ({
        recipientTenantId: c.recipientTenantId,
        recipientTenantName: c.recipientTenantName,
        commissionCount: c._count,
        totalAmount: c._sum.commissionAmount,
        isEligible: true,
      }));
    
    const belowMinimum = commissions
      .filter(c => Number(c._sum.commissionAmount) < MINIMUM_PAYOUT)
      .map(c => ({
        recipientTenantId: c.recipientTenantId,
        recipientTenantName: c.recipientTenantName,
        commissionCount: c._count,
        totalAmount: c._sum.commissionAmount,
        isEligible: false,
        missingAmount: MINIMUM_PAYOUT - Number(c._sum.commissionAmount),
      }));
    
    return {
      success: true,
      data: {
        eligible: eligiblePayouts,
        belowMinimum,
        minimumPayout: MINIMUM_PAYOUT,
      },
    };
  });
}

