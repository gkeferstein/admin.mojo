import { describe, it, expect, beforeEach, vi } from 'vitest';
import { FastifyInstance } from 'fastify';
import { Decimal } from '@prisma/client/runtime/library';
import prisma from '../../lib/prisma.js';
import { revenueTracker } from '../../services/revenue-tracker.js';

// Mock dependencies
vi.mock('../../lib/prisma.js');
vi.mock('../../services/revenue-tracker.js', () => ({
  revenueTracker: {
    formatPayoutPeriod: vi.fn((date: Date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      return `${year}-${month}`;
    }),
  },
}));

describe('Regional Partners Routes', () => {
  let app: FastifyInstance;

  beforeEach(async () => {
    vi.clearAllMocks();
    
    // Create Fastify app for testing
    const fastify = (await import('fastify')).default();
    await fastify.register(async (fastify) => {
      const routes = await import('../regional-partners.js');
      await routes.default(fastify);
    });
    app = fastify;
  });

  describe('GET /api/regional-partners/:id/dashboard', () => {
    it('should return dashboard data for regional partner', async () => {
      const mockAgreement = {
        id: 'agreement-1',
        tenantId: 'tenant-dach',
        tenantName: 'MOJO GmbH',
        regionName: 'DACH',
        regionCodes: ['DE', 'AT', 'CH'],
      };

      const mockRevenues = [
        {
          id: 'revenue-1',
          type: 'MEMBERSHIP',
          regionalPartnerProvision: new Decimal(8.7),
        },
        {
          id: 'revenue-2',
          type: 'TRANSACTION',
          regionalPartnerProvision: new Decimal(1.32),
        },
      ];

      (prisma.regionalAgreement.findUnique as any).mockResolvedValue(mockAgreement);
      (prisma.revenueRecord.findMany as any).mockResolvedValue(mockRevenues);
      (prisma.regionalPayout.findFirst as any).mockResolvedValue(null);

      const response = await app.inject({
        method: 'GET',
        url: '/api/regional-partners/tenant-dach/dashboard',
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.data.current_period).toBeDefined();
      expect(body.data.current_provision).toBeGreaterThan(0);
      expect(body.data.membership_count).toBe(1);
      expect(body.data.transaction_count).toBe(1);
    });

    it('should return 404 if regional partner not found', async () => {
      (prisma.regionalAgreement.findUnique as any).mockResolvedValue(null);

      const response = await app.inject({
        method: 'GET',
        url: '/api/regional-partners/invalid-id/dashboard',
      });

      expect(response.statusCode).toBe(404);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(false);
      expect(body.error.code).toBe('NOT_FOUND');
    });
  });

  describe('GET /api/regional-partners/:id/revenues', () => {
    it('should return revenue records with pagination', async () => {
      const mockRevenues = [
        {
          id: 'revenue-1',
          type: 'MEMBERSHIP',
          amount: new Decimal(29),
          currency: 'EUR',
          regionalPartnerProvision: new Decimal(8.7),
          paymentDate: new Date('2025-01-15'),
          payoutPeriod: '2025-01',
          payoutStatus: 'PENDING',
          membershipType: 'LEBENSENERGIE',
          transactionType: null,
          metadata: {},
        },
      ];

      (prisma.revenueRecord.findMany as any).mockResolvedValue(mockRevenues);
      (prisma.revenueRecord.count as any).mockResolvedValue(1);

      const response = await app.inject({
        method: 'GET',
        url: '/api/regional-partners/tenant-dach/revenues?limit=10&offset=0',
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.data).toHaveLength(1);
      expect(body.pagination.total).toBe(1);
    });

    it('should filter by period and type', async () => {
      (prisma.revenueRecord.findMany as any).mockResolvedValue([]);
      (prisma.revenueRecord.count as any).mockResolvedValue(0);

      const response = await app.inject({
        method: 'GET',
        url: '/api/regional-partners/tenant-dach/revenues?period=2025-01&type=MEMBERSHIP',
      });

      expect(response.statusCode).toBe(200);
      expect(prisma.revenueRecord.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            regionalPartnerId: 'tenant-dach',
            payoutPeriod: '2025-01',
            type: 'MEMBERSHIP',
          }),
        })
      );
    });
  });

  describe('GET /api/regional-partners/:id/payouts', () => {
    it('should return payout history', async () => {
      const mockPayouts = [
        {
          id: 'payout-1',
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
        },
      ];

      (prisma.regionalPayout.findMany as any).mockResolvedValue(mockPayouts);
      (prisma.regionalPayout.count as any).mockResolvedValue(1);

      const response = await app.inject({
        method: 'GET',
        url: '/api/regional-partners/tenant-dach/payouts',
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.data).toHaveLength(1);
      expect(body.data[0].period).toBe('2025-01');
      expect(body.data[0].status).toBe('PAID');
    });
  });
});

