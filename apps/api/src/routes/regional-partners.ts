import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { Decimal } from '@prisma/client/runtime/library';
import { RevenueType, RevenuePayoutStatus, PayoutStatus } from '@prisma/client';
import prisma from '../lib/prisma.js';
import { revenueTracker } from '../services/revenue-tracker.js';

// ==============================================
// Routes
// ==============================================

export default async function regionalPartnersRoutes(fastify: FastifyInstance) {
  
  // GET /api/regional-partners/:id/dashboard - Regional Partner Dashboard
  fastify.get('/api/regional-partners/:id/dashboard', async (
    request: FastifyRequest,
    reply: FastifyReply
  ) => {
    const { id } = request.params as { id: string };
    
    const currentPeriod = revenueTracker.formatPayoutPeriod(new Date());
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    const lastPeriod = revenueTracker.formatPayoutPeriod(lastMonth);
    
    // Get regional agreement
    const agreement = await prisma.regionalAgreement.findUnique({
      where: { tenantId: id },
    });
    
    if (!agreement) {
      return reply.status(404).send({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Regional partner not found' },
      });
    }
    
    // Current period revenues
    const currentRevenues = await prisma.revenueRecord.findMany({
      where: {
        regionalPartnerId: id,
        payoutPeriod: currentPeriod,
      },
    });
    
    // Last paid payout
    const lastPayout = await prisma.regionalPayout.findFirst({
      where: {
        regionalPartnerId: id,
        status: PayoutStatus.COMPLETED,
      },
      orderBy: { payoutPeriod: 'desc' },
    });
    
    // Aggregate current period
    const currentProvision = currentRevenues.reduce(
      (sum, r) => sum.plus(r.regionalPartnerProvision),
      new Decimal(0)
    );
    
    const membershipRevenues = currentRevenues.filter(r => r.type === RevenueType.MEMBERSHIP);
    const transactionRevenues = currentRevenues.filter(r => r.type === RevenueType.TRANSACTION);
    
    const membershipProvision = membershipRevenues.reduce(
      (sum, r) => sum.plus(r.regionalPartnerProvision),
      new Decimal(0)
    );
    
    const transactionProvision = transactionRevenues.reduce(
      (sum, r) => sum.plus(r.regionalPartnerProvision),
      new Decimal(0)
    );
    
    // Calculate next payout date (15th of next month)
    const nextPayoutDate = new Date();
    nextPayoutDate.setMonth(nextPayoutDate.getMonth() + 1);
    nextPayoutDate.setDate(15);
    
    return {
      success: true,
      data: {
        current_period: currentPeriod,
        current_provision: Number(currentProvision.toDecimalPlaces(2)),
        current_revenue_count: currentRevenues.length,
        membership_provision: Number(membershipProvision.toDecimalPlaces(2)),
        transaction_provision: Number(transactionProvision.toDecimalPlaces(2)),
        membership_count: membershipRevenues.length,
        transaction_count: transactionRevenues.length,
        last_payout: lastPayout ? {
          period: lastPayout.payoutPeriod,
          amount: Number(lastPayout.totalProvision.toDecimalPlaces(2)),
          paid_at: lastPayout.paidAt,
          payment_reference: lastPayout.paymentReference,
        } : null,
        next_payout_date: nextPayoutDate.toISOString(),
        region: {
          id: agreement.id,
          name: agreement.regionName,
          codes: agreement.regionCodes,
        },
      },
    };
  });

  // GET /api/regional-partners/:id/revenues - Revenue Records
  fastify.get('/api/regional-partners/:id/revenues', async (
    request: FastifyRequest,
    reply: FastifyReply
  ) => {
    const { id } = request.params as { id: string };
    const query = request.query as {
      period?: string;
      type?: RevenueType;
      status?: RevenuePayoutStatus;
      limit?: string;
      offset?: string;
    };
    
    const where: any = {
      regionalPartnerId: id,
    };
    
    if (query.period) {
      where.payoutPeriod = query.period;
    }
    
    if (query.type) {
      where.type = query.type;
    }
    
    if (query.status) {
      where.payoutStatus = query.status;
    }
    
    const limit = query.limit ? parseInt(query.limit, 10) : 50;
    const offset = query.offset ? parseInt(query.offset, 10) : 0;
    
    const [revenues, total] = await Promise.all([
      prisma.revenueRecord.findMany({
        where,
        orderBy: { paymentDate: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.revenueRecord.count({ where }),
    ]);
    
    return {
      success: true,
      data: revenues.map(r => ({
        id: r.id,
        type: r.type,
        amount: Number(r.amount.toDecimalPlaces(2)),
        currency: r.currency,
        provision: Number(r.regionalPartnerProvision.toDecimalPlaces(2)),
        payment_date: r.paymentDate,
        payout_period: r.payoutPeriod,
        payout_status: r.payoutStatus,
        membership_type: r.membershipType,
        transaction_type: r.transactionType,
        metadata: r.metadata,
      })),
      pagination: {
        total,
        limit,
        offset,
        has_more: offset + limit < total,
      },
    };
  });

  // GET /api/regional-partners/:id/payouts - Payout History
  fastify.get('/api/regional-partners/:id/payouts', async (
    request: FastifyRequest,
    reply: FastifyReply
  ) => {
    const { id } = request.params as { id: string };
    const query = request.query as {
      limit?: string;
      offset?: string;
    };
    
    const limit = query.limit ? parseInt(query.limit, 10) : 20;
    const offset = query.offset ? parseInt(query.offset, 10) : 0;
    
    const [payouts, total] = await Promise.all([
      prisma.regionalPayout.findMany({
        where: { regionalPartnerId: id },
        orderBy: { payoutPeriod: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.regionalPayout.count({ where: { regionalPartnerId: id } }),
    ]);
    
    return {
      success: true,
      data: payouts.map(p => ({
        id: p.id,
        period: p.payoutPeriod,
        total_revenue: Number(p.totalRevenue.toDecimalPlaces(2)),
        total_provision: Number(p.totalProvision.toDecimalPlaces(2)),
        revenue_count: p.revenueCount,
        membership_provision: Number(p.membershipProvision.toDecimalPlaces(2)),
        transaction_provision: Number(p.transactionProvision.toDecimalPlaces(2)),
        membership_count: p.membershipCount,
        transaction_count: p.transactionCount,
        status: p.status,
        approved_at: p.approvedAt,
        paid_at: p.paidAt,
        payment_reference: p.paymentReference,
        created_at: p.createdAt,
      })),
      pagination: {
        total,
        limit,
        offset,
        has_more: offset + limit < total,
      },
    };
  });
}

