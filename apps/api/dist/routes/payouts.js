import { z } from 'zod';
import prisma from '../lib/prisma.js';
import { logAudit } from '../services/audit.js';
// ==============================================
// Validation Schemas
// ==============================================
const createPayoutSchema = z.object({
    recipientTenantId: z.string(),
    stripeAccountId: z.string(),
});
const querySchema = z.object({
    recipientTenantId: z.string().optional(),
    status: z.string().optional(),
    limit: z.string().transform(Number).default('50'),
    offset: z.string().transform(Number).default('0'),
});
// ==============================================
// Constants
// ==============================================
const MINIMUM_PAYOUT = 50;
// ==============================================
// Routes
// ==============================================
export default async function payoutsRoutes(fastify) {
    // GET /api/v1/payouts - Liste aller Auszahlungen
    fastify.get('/api/v1/payouts', async (request, reply) => {
        const query = querySchema.parse(request.query);
        const where = {};
        if (query.recipientTenantId) {
            where.recipientTenantId = query.recipientTenantId;
        }
        if (query.status) {
            where.status = query.status;
        }
        const [payouts, total] = await Promise.all([
            prisma.payout.findMany({
                where,
                include: {
                    commissions: {
                        select: {
                            id: true,
                            orderId: true,
                            commissionType: true,
                            commissionAmount: true,
                        },
                    },
                },
                orderBy: { createdAt: 'desc' },
                take: query.limit,
                skip: query.offset,
            }),
            prisma.payout.count({ where }),
        ]);
        return {
            success: true,
            data: payouts,
            meta: {
                total,
                limit: query.limit,
                offset: query.offset,
            },
        };
    });
    // GET /api/v1/payouts/:id - Einzelne Auszahlung
    fastify.get('/api/v1/payouts/:id', async (request, reply) => {
        const { id } = request.params;
        const payout = await prisma.payout.findUnique({
            where: { id },
            include: {
                commissions: true,
            },
        });
        if (!payout) {
            return reply.status(404).send({
                success: false,
                error: { code: 'NOT_FOUND', message: 'Payout not found' },
            });
        }
        return { success: true, data: payout };
    });
    // POST /api/v1/payouts/create - Neue Auszahlung erstellen
    fastify.post('/api/v1/payouts/create', async (request, reply) => {
        const input = createPayoutSchema.parse(request.body);
        // Get all approved commissions for this tenant
        const commissions = await prisma.commission.findMany({
            where: {
                recipientTenantId: input.recipientTenantId,
                status: 'APPROVED',
                payoutId: null,
            },
        });
        if (commissions.length === 0) {
            return reply.status(400).send({
                success: false,
                error: { code: 'NO_COMMISSIONS', message: 'No approved commissions to pay out' },
            });
        }
        const totalAmount = commissions.reduce((sum, c) => sum + Number(c.commissionAmount), 0);
        if (totalAmount < MINIMUM_PAYOUT) {
            return reply.status(400).send({
                success: false,
                error: {
                    code: 'BELOW_MINIMUM',
                    message: `Total amount ${totalAmount}€ is below minimum ${MINIMUM_PAYOUT}€`,
                    details: { totalAmount, minimumPayout: MINIMUM_PAYOUT },
                },
            });
        }
        // Get period dates
        const orderDates = commissions.map(c => c.orderDate);
        const periodStart = new Date(Math.min(...orderDates.map(d => d.getTime())));
        const periodEnd = new Date(Math.max(...orderDates.map(d => d.getTime())));
        // Create payout and link commissions
        const payout = await prisma.payout.create({
            data: {
                recipientTenantId: input.recipientTenantId,
                recipientTenantName: commissions[0].recipientTenantName,
                stripeAccountId: input.stripeAccountId,
                totalAmount,
                commissionCount: commissions.length,
                currency: 'EUR',
                periodStart,
                periodEnd,
                status: 'PENDING',
            },
        });
        // Link commissions to payout
        await prisma.commission.updateMany({
            where: {
                id: { in: commissions.map(c => c.id) },
            },
            data: {
                payoutId: payout.id,
            },
        });
        await logAudit({
            action: 'create',
            resource: 'payout',
            resourceId: payout.id,
            newValue: { ...payout, commissionCount: commissions.length },
            request,
        });
        return reply.status(201).send({
            success: true,
            data: {
                ...payout,
                commissions: commissions.map(c => ({
                    id: c.id,
                    orderId: c.orderId,
                    amount: c.commissionAmount,
                })),
            },
        });
    });
    // POST /api/v1/payouts/:id/process - Auszahlung verarbeiten (Stripe Transfer)
    fastify.post('/api/v1/payouts/:id/process', async (request, reply) => {
        const { id } = request.params;
        const payout = await prisma.payout.findUnique({
            where: { id },
            include: { commissions: true },
        });
        if (!payout) {
            return reply.status(404).send({
                success: false,
                error: { code: 'NOT_FOUND', message: 'Payout not found' },
            });
        }
        if (payout.status !== 'PENDING') {
            return reply.status(400).send({
                success: false,
                error: {
                    code: 'INVALID_STATUS',
                    message: `Payout is ${payout.status}, expected PENDING`
                },
            });
        }
        // TODO: Actual Stripe Connect Transfer
        // const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
        // const transfer = await stripe.transfers.create({
        //   amount: Math.round(Number(payout.totalAmount) * 100), // cents
        //   currency: payout.currency.toLowerCase(),
        //   destination: payout.stripeAccountId,
        //   transfer_group: `payout_${payout.id}`,
        // });
        // For now, simulate successful transfer
        const mockTransferId = `tr_mock_${Date.now()}`;
        // Update payout status
        const updated = await prisma.payout.update({
            where: { id },
            data: {
                status: 'PROCESSING',
                stripeTransferId: mockTransferId,
                processedAt: new Date(),
            },
        });
        await logAudit({
            action: 'process',
            resource: 'payout',
            resourceId: id,
            newValue: { stripeTransferId: mockTransferId },
            request,
        });
        return {
            success: true,
            data: updated,
            stripeTransferId: mockTransferId,
        };
    });
    // POST /api/v1/payouts/:id/complete - Auszahlung abschließen (Webhook Handler)
    fastify.post('/api/v1/payouts/:id/complete', async (request, reply) => {
        const { id } = request.params;
        const input = z.object({
            stripePayoutId: z.string().optional(),
        }).parse(request.body);
        const payout = await prisma.payout.findUnique({ where: { id } });
        if (!payout) {
            return reply.status(404).send({
                success: false,
                error: { code: 'NOT_FOUND', message: 'Payout not found' },
            });
        }
        if (payout.status !== 'PROCESSING') {
            return reply.status(400).send({
                success: false,
                error: { code: 'INVALID_STATUS', message: `Payout is ${payout.status}, expected PROCESSING` },
            });
        }
        // Update payout and commissions
        const [updated] = await prisma.$transaction([
            prisma.payout.update({
                where: { id },
                data: {
                    status: 'COMPLETED',
                    stripePayoutId: input.stripePayoutId,
                },
            }),
            prisma.commission.updateMany({
                where: { payoutId: id },
                data: {
                    status: 'PAID',
                    paidAt: new Date(),
                },
            }),
        ]);
        await logAudit({
            action: 'complete',
            resource: 'payout',
            resourceId: id,
            newValue: { status: 'COMPLETED' },
            request,
        });
        return { success: true, data: updated };
    });
    // POST /api/v1/payouts/:id/fail - Auszahlung fehlgeschlagen
    fastify.post('/api/v1/payouts/:id/fail', async (request, reply) => {
        const { id } = request.params;
        const input = z.object({
            reason: z.string(),
        }).parse(request.body);
        const payout = await prisma.payout.findUnique({ where: { id } });
        if (!payout) {
            return reply.status(404).send({
                success: false,
                error: { code: 'NOT_FOUND', message: 'Payout not found' },
            });
        }
        // Reset commissions back to APPROVED
        const [updated] = await prisma.$transaction([
            prisma.payout.update({
                where: { id },
                data: {
                    status: 'FAILED',
                    failedAt: new Date(),
                    failureReason: input.reason,
                },
            }),
            prisma.commission.updateMany({
                where: { payoutId: id },
                data: {
                    payoutId: null, // Unlink from failed payout
                },
            }),
        ]);
        await logAudit({
            action: 'fail',
            resource: 'payout',
            resourceId: id,
            metadata: { reason: input.reason },
            request,
        });
        return { success: true, data: updated };
    });
    // GET /api/v1/payouts/stats - Auszahlungsstatistiken
    fastify.get('/api/v1/payouts/stats', async (request, reply) => {
        const { recipientTenantId } = request.query;
        const where = {};
        if (recipientTenantId) {
            where.recipientTenantId = recipientTenantId;
        }
        const [byStatus, totals] = await Promise.all([
            prisma.payout.groupBy({
                by: ['status'],
                where,
                _count: true,
                _sum: { totalAmount: true },
            }),
            prisma.payout.aggregate({
                where: { ...where, status: 'COMPLETED' },
                _count: true,
                _sum: { totalAmount: true },
            }),
        ]);
        return {
            success: true,
            data: {
                totalPaidOut: totals._sum.totalAmount || 0,
                totalPayouts: totals._count,
                byStatus: byStatus.map(s => ({
                    status: s.status,
                    count: s._count,
                    amount: s._sum.totalAmount || 0,
                })),
            },
        };
    });
    // POST /api/v1/payouts/process-all - Alle fälligen Auszahlungen verarbeiten (Cron)
    fastify.post('/api/v1/payouts/process-all', async (_request, _reply) => {
        // Get all tenants with eligible payouts
        const eligibleTenants = await prisma.commission.groupBy({
            by: ['recipientTenantId'],
            where: {
                status: 'APPROVED',
                payoutId: null,
            },
            _sum: { commissionAmount: true },
            having: {
                commissionAmount: { _sum: { gte: MINIMUM_PAYOUT } },
            },
        });
        // Note: In production, you'd need to fetch stripeAccountId from tenant data
        const results = {
            processed: 0,
            skipped: 0,
            errors: [],
        };
        // For now, just report eligibility
        return {
            success: true,
            message: `Found ${eligibleTenants.length} tenants eligible for payout`,
            data: {
                eligibleTenants: eligibleTenants.map(t => ({
                    tenantId: t.recipientTenantId,
                    amount: t._sum.commissionAmount,
                })),
                ...results,
            },
            note: 'Use /api/v1/payouts/create to create individual payouts with stripeAccountId',
        };
    });
}
//# sourceMappingURL=payouts.js.map