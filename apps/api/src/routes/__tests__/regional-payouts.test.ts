import { describe, it, expect, beforeEach, vi } from 'vitest';
import { FastifyInstance } from 'fastify';
import { Decimal } from '@prisma/client/runtime/library';
import prisma from '../../lib/prisma.js';
import { revenueTracker } from '../../services/revenue-tracker.js';

// Mock dependencies
vi.mock('../../lib/prisma.js');
vi.mock('../../services/revenue-tracker.js', () => ({
  revenueTracker: {
    createMonthlyPayouts: vi.fn(),
    markPayoutAsPaid: vi.fn(),
  },
}));

describe('Regional Payouts Routes', () => {
  let app: FastifyInstance;

  beforeEach(async () => {
    vi.clearAllMocks();
    
    // Create Fastify app for testing
    const fastify = (await import('fastify')).default();
    await fastify.register(async (fastify) => {
      const routes = await import('../regional-payouts.js');
      await routes.default(fastify);
    });
    app = fastify;
  });

  describe('POST /api/regional-payouts/create-monthly', () => {
    it('should create monthly payouts for a period', async () => {
      (revenueTracker.createMonthlyPayouts as any).mockResolvedValue(['payout-1', 'payout-2']);

      const response = await app.inject({
        method: 'POST',
        url: '/api/regional-payouts/create-monthly',
        payload: {
          period: '2025-01',
        },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.data.period).toBe('2025-01');
      expect(body.data.payout_ids).toHaveLength(2);
      expect(revenueTracker.createMonthlyPayouts).toHaveBeenCalledWith('2025-01');
    });

    it('should validate period format', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/regional-payouts/create-monthly',
        payload: {
          period: 'invalid',
        },
      });

      expect(response.statusCode).toBe(400);
    });
  });

  describe('GET /api/regional-payouts', () => {
    it('should return list of regional payouts', async () => {
      const mockPayouts = [
        {
          id: 'payout-1',
          regionalPartnerId: 'tenant-dach',
          regionalPartnerName: 'MOJO GmbH',
          payoutPeriod: '2025-01',
          totalRevenue: new Decimal(129),
          totalProvision: new Decimal(10.02),
          revenueCount: 2,
          membershipProvision: new Decimal(8.7),
          transactionProvision: new Decimal(1.32),
          membershipCount: 1,
          transactionCount: 1,
          status: 'PAID',
          approvedAt: new Date('2025-02-01'),
          paidAt: new Date('2025-02-15'),
          paymentReference: 'REF-12345',
          createdAt: new Date('2025-02-01'),
          revenueRecords: [],
        },
      ];

      (prisma.regionalPayout.findMany as any).mockResolvedValue(mockPayouts);
      (prisma.regionalPayout.count as any).mockResolvedValue(1);

      const response = await app.inject({
        method: 'GET',
        url: '/api/regional-payouts',
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.data).toHaveLength(1);
      expect(body.pagination.total).toBe(1);
    });

    it('should filter by regional partner and status', async () => {
      (prisma.regionalPayout.findMany as any).mockResolvedValue([]);
      (prisma.regionalPayout.count as any).mockResolvedValue(0);

      const response = await app.inject({
        method: 'GET',
        url: '/api/regional-payouts?regionalPartnerId=tenant-dach&status=PENDING',
      });

      expect(response.statusCode).toBe(200);
      expect(prisma.regionalPayout.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            regionalPartnerId: 'tenant-dach',
            status: 'PENDING',
          }),
        })
      );
    });
  });

  describe('GET /api/regional-payouts/:id', () => {
    it('should return payout details with revenue records', async () => {
      const mockPayout = {
        id: 'payout-1',
        regionalPartnerId: 'tenant-dach',
        regionalPartnerName: 'MOJO GmbH',
        payoutPeriod: '2025-01',
        totalRevenue: new Decimal(129),
        totalProvision: new Decimal(10.02),
        revenueCount: 2,
        membershipProvision: new Decimal(8.7),
        transactionProvision: new Decimal(1.32),
        membershipCount: 1,
        transactionCount: 1,
        status: 'PAID',
        approvedAt: new Date('2025-02-01'),
        approvedBy: 'admin-1',
        paidAt: new Date('2025-02-15'),
        paymentReference: 'REF-12345',
        bankAccountIban: 'DE89370400440532013000',
        bankAccountBic: 'COBADEFFXXX',
        bankAccountHolder: 'MOJO GmbH',
        createdAt: new Date('2025-02-01'),
        updatedAt: new Date('2025-02-15'),
        revenueRecords: [
          {
            id: 'revenue-1',
            type: 'MEMBERSHIP',
            amount: new Decimal(29),
            currency: 'EUR',
            regionalPartnerProvision: new Decimal(8.7),
            paymentDate: new Date('2025-01-15'),
            membershipType: 'LEBENSENERGIE',
            transactionType: null,
          },
        ],
      };

      (prisma.regionalPayout.findUnique as any).mockResolvedValue(mockPayout);

      const response = await app.inject({
        method: 'GET',
        url: '/api/regional-payouts/payout-1',
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.data.id).toBe('payout-1');
      expect(body.data.revenue_records).toHaveLength(1);
    });

    it('should return 404 if payout not found', async () => {
      (prisma.regionalPayout.findUnique as any).mockResolvedValue(null);

      const response = await app.inject({
        method: 'GET',
        url: '/api/regional-payouts/invalid-id',
      });

      expect(response.statusCode).toBe(404);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(false);
      expect(body.error.code).toBe('NOT_FOUND');
    });
  });

  describe('POST /api/regional-payouts/:id/approve', () => {
    it('should approve a pending payout', async () => {
      const mockPayout = {
        id: 'payout-1',
        status: 'PENDING',
      };

      (prisma.regionalPayout.findUnique as any).mockResolvedValue(mockPayout);
      (prisma.regionalPayout.update as any).mockResolvedValue({
        ...mockPayout,
        status: 'APPROVED',
        approvedAt: new Date(),
        approvedBy: 'admin-1',
      });

      const response = await app.inject({
        method: 'POST',
        url: '/api/regional-payouts/payout-1/approve',
        payload: {
          approved_by: 'admin-1',
        },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(prisma.regionalPayout.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'payout-1' },
          data: expect.objectContaining({
            status: 'APPROVED',
            approvedBy: 'admin-1',
          }),
        })
      );
    });

    it('should return 400 if payout is not pending', async () => {
      (prisma.regionalPayout.findUnique as any).mockResolvedValue({
        id: 'payout-1',
        status: 'APPROVED',
      });

      const response = await app.inject({
        method: 'POST',
        url: '/api/regional-payouts/payout-1/approve',
        payload: {
          approved_by: 'admin-1',
        },
      });

      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.body);
      expect(body.error.code).toBe('INVALID_STATUS');
    });
  });

  describe('POST /api/regional-payouts/:id/mark-paid', () => {
    it('should mark payout as paid', async () => {
      (revenueTracker.markPayoutAsPaid as any).mockResolvedValue(undefined);
      (prisma.regionalPayout.findUnique as any).mockResolvedValue({
        id: 'payout-1',
        status: 'APPROVED',
      });

      const response = await app.inject({
        method: 'POST',
        url: '/api/regional-payouts/payout-1/mark-paid',
        payload: {
          payment_reference: 'REF-12345',
        },
      });

      expect(response.statusCode).toBe(200);
      expect(revenueTracker.markPayoutAsPaid).toHaveBeenCalledWith(
        'payout-1',
        'REF-12345',
        expect.any(Date)
      );
    });
  });
});

