import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { PayoutStatus, RevenuePayoutStatus } from '@prisma/client';
import prisma from '../lib/prisma.js';
import { revenueTracker } from '../services/revenue-tracker.js';
import { logAudit } from '../services/audit.js';

// ==============================================
// Routes
// ==============================================

export default async function regionalPayoutsRoutes(fastify: FastifyInstance) {
  
  // POST /api/regional-payouts/create-monthly - Erstellt monatliche Payouts
  fastify.post('/api/regional-payouts/create-monthly', async (
    request: FastifyRequest,
    reply: FastifyReply
  ) => {
    const input = z.object({
      period: z.string().regex(/^\d{4}-\d{2}$/), // YYYY-MM format
    }).parse(request.body);
    
    const payoutIds = await revenueTracker.createMonthlyPayouts(input.period);
    
    await logAudit({
      action: 'create',
      resource: 'regional_payouts',
      newValue: { period: input.period, payout_count: payoutIds.length },
      request,
    });
    
    return {
      success: true,
      data: {
        period: input.period,
        payout_ids: payoutIds,
        count: payoutIds.length,
      },
    };
  });

  // GET /api/regional-payouts - Liste aller Regional Payouts
  fastify.get('/api/regional-payouts', async (
    request: FastifyRequest,
    reply: FastifyReply
  ) => {
    const query = request.query as {
      regionalPartnerId?: string;
      period?: string;
      status?: RevenuePayoutStatus;
      limit?: string;
      offset?: string;
    };
    
    const where: any = {};
    
    if (query.regionalPartnerId) {
      where.regionalPartnerId = query.regionalPartnerId;
    }
    
    if (query.period) {
      where.payoutPeriod = query.period;
    }
    
    if (query.status) {
      where.status = query.status;
    }
    
    const limit = query.limit ? parseInt(query.limit, 10) : 50;
    const offset = query.offset ? parseInt(query.offset, 10) : 0;
    
    const [payouts, total] = await Promise.all([
      prisma.regionalPayout.findMany({
        where,
        orderBy: { payoutPeriod: 'desc' },
        take: limit,
        skip: offset,
        include: {
          revenueRecords: {
            take: 10, // Limit for preview
            orderBy: { paymentDate: 'desc' },
          },
        },
      }),
      prisma.regionalPayout.count({ where }),
    ]);
    
    return {
      success: true,
      data: payouts.map(p => ({
        id: p.id,
        regional_partner_id: p.regionalPartnerId,
        regional_partner_name: p.regionalPartnerName,
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
        revenue_records_preview: p.revenueRecords.map(r => ({
          id: r.id,
          type: r.type,
          amount: Number(r.amount.toDecimalPlaces(2)),
          provision: Number(r.regionalPartnerProvision.toDecimalPlaces(2)),
        })),
      })),
      pagination: {
        total,
        limit,
        offset,
        has_more: offset + limit < total,
      },
    };
  });

  // GET /api/regional-payouts/:id - Details eines Payouts
  fastify.get('/api/regional-payouts/:id', async (
    request: FastifyRequest,
    reply: FastifyReply
  ) => {
    const { id } = request.params as { id: string };
    
    const payout = await prisma.regionalPayout.findUnique({
      where: { id },
      include: {
        revenueRecords: {
          orderBy: { paymentDate: 'desc' },
        },
      },
    });
    
    if (!payout) {
      return reply.status(404).send({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Regional payout not found' },
      });
    }
    
    return {
      success: true,
      data: {
        id: payout.id,
        regional_partner_id: payout.regionalPartnerId,
        regional_partner_name: payout.regionalPartnerName,
        period: payout.payoutPeriod,
        total_revenue: Number(payout.totalRevenue.toDecimalPlaces(2)),
        total_provision: Number(payout.totalProvision.toDecimalPlaces(2)),
        revenue_count: payout.revenueCount,
        membership_provision: Number(payout.membershipProvision.toDecimalPlaces(2)),
        transaction_provision: Number(payout.transactionProvision.toDecimalPlaces(2)),
        membership_count: payout.membershipCount,
        transaction_count: payout.transactionCount,
        status: payout.status,
        approved_at: payout.approvedAt,
        approved_by: payout.approvedBy,
        paid_at: payout.paidAt,
        payment_reference: payout.paymentReference,
        bank_account_iban: payout.bankAccountIban,
        bank_account_bic: payout.bankAccountBic,
        bank_account_holder: payout.bankAccountHolder,
        revenue_records: payout.revenueRecords.map(r => ({
          id: r.id,
          type: r.type,
          amount: Number(r.amount.toDecimalPlaces(2)),
          currency: r.currency,
          provision: Number(r.regionalPartnerProvision.toDecimalPlaces(2)),
          payment_date: r.paymentDate,
          membership_type: r.membershipType,
          transaction_type: r.transactionType,
        })),
        created_at: payout.createdAt,
        updated_at: payout.updatedAt,
      },
    };
  });

  // POST /api/regional-payouts/:id/approve - Payout genehmigen
  fastify.post('/api/regional-payouts/:id/approve', async (
    request: FastifyRequest,
    reply: FastifyReply
  ) => {
    const { id } = request.params as { id: string };
    const input = z.object({
      approved_by: z.string(),
    }).parse(request.body);
    
    const payout = await prisma.regionalPayout.findUnique({ where: { id } });
    
    if (!payout) {
      return reply.status(404).send({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Regional payout not found' },
      });
    }
    
    if (payout.status !== PayoutStatus.PENDING) {
      return reply.status(400).send({
        success: false,
        error: { code: 'INVALID_STATUS', message: `Payout is ${payout.status}, expected PENDING` },
      });
    }
    
    const updated = await prisma.regionalPayout.update({
      where: { id },
      data: {
        status: PayoutStatus.PROCESSING,
        approvedAt: new Date(),
        approvedBy: input.approved_by,
      },
    });
    
    await logAudit({
      action: 'approve',
      resource: 'regional_payout',
      resourceId: id,
      newValue: { status: PayoutStatus.PROCESSING, approved_by: input.approved_by },
      request,
    });
    
    return { success: true, data: updated };
  });

  // POST /api/regional-payouts/:id/mark-paid - Payout als bezahlt markieren
  fastify.post('/api/regional-payouts/:id/mark-paid', async (
    request: FastifyRequest,
    reply: FastifyReply
  ) => {
    const { id } = request.params as { id: string };
    const input = z.object({
      payment_reference: z.string(),
      paid_at: z.string().datetime().optional(),
    }).parse(request.body);
    
    const paidAt = input.paid_at ? new Date(input.paid_at) : new Date();
    
    await revenueTracker.markPayoutAsPaid(id, input.payment_reference, paidAt);
    
    await logAudit({
      action: 'mark_paid',
      resource: 'regional_payout',
      resourceId: id,
      newValue: { payment_reference: input.payment_reference, paid_at: paidAt },
      request,
    });
    
    const payout = await prisma.regionalPayout.findUnique({ where: { id } });
    
    return { success: true, data: payout };
  });
}

