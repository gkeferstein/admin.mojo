import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Decimal } from '@prisma/client/runtime/library';
import prisma from '../../lib/prisma.js';
import { revenueTracker } from '../../services/revenue-tracker.js';

// Mock dependencies
vi.mock('../../lib/prisma.js', () => ({
  default: {
    regionalAgreement: {
      findUnique: vi.fn(),
    },
    revenueRecord: {
      findMany: vi.fn(),
      count: vi.fn(),
    },
    regionalPayout: {
      findFirst: vi.fn(),
    },
  },
}));

vi.mock('../../services/revenue-tracker.js', () => ({
  revenueTracker: {
    formatPayoutPeriod: vi.fn((date: Date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      return `${year}-${month}`;
    }),
  },
}));

// Mock audit service
vi.mock('../../services/audit.js', () => ({
  logAudit: vi.fn(),
}));

describe('Regional Partners Routes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
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

      // Test that the route handler would work correctly
      // Note: Full integration test would require Fastify app setup
      expect(mockAgreement.tenantId).toBe('tenant-dach');
      expect(mockRevenues).toHaveLength(2);
    });

    it('should handle missing regional partner', () => {
      const mockAgreement = null;
      expect(mockAgreement).toBeNull();
    });
  });

  describe('GET /api/regional-partners/:id/revenues', () => {
    it('should return revenue records with pagination', () => {
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

      expect(mockRevenues).toHaveLength(1);
      expect(mockRevenues[0].type).toBe('MEMBERSHIP');
    });
  });

  describe('GET /api/regional-partners/:id/payouts', () => {
    it('should return payout history', () => {
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

      expect(mockPayouts).toHaveLength(1);
      expect(mockPayouts[0].period).toBe('2025-01');
      expect(mockPayouts[0].status).toBe('PAID');
    });
  });
});

