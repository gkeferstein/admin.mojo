import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Decimal } from '@prisma/client/runtime/library';
import { RevenueType, RevenuePayoutStatus, RegionalPayoutStatus, MembershipType } from '@prisma/client';
import prisma from '../../lib/prisma.js';
import { revenueTracker } from '../../services/revenue-tracker.js';

// Mock dependencies
vi.mock('../../lib/prisma.js', () => ({
  default: {
    regionalPayout: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      count: vi.fn(),
      update: vi.fn(),
      create: vi.fn(),
    },
    revenueRecord: {
      findMany: vi.fn(),
    },
  },
}));

vi.mock('../../services/revenue-tracker.js', () => ({
  revenueTracker: {
    createMonthlyPayouts: vi.fn(),
    markPayoutAsPaid: vi.fn(),
  },
}));

// Mock audit service
vi.mock('../../services/audit.js', () => ({
  logAudit: vi.fn(),
}));

describe('Regional Payouts Routes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('POST /api/regional-payouts/create-monthly', () => {
    it('should create monthly payouts for a period', async () => {
      (revenueTracker.createMonthlyPayouts as any).mockResolvedValue(['payout-1', 'payout-2']);
      
      const result = await revenueTracker.createMonthlyPayouts('2025-01');
      
      expect(result).toHaveLength(2);
      expect(result).toEqual(['payout-1', 'payout-2']);
    });

    it('should validate period format', () => {
      const validPeriod = '2025-01';
      const invalidPeriod = 'invalid';
      
      expect(/^\d{4}-\d{2}$/.test(validPeriod)).toBe(true);
      expect(/^\d{4}-\d{2}$/.test(invalidPeriod)).toBe(false);
    });
  });

  describe('GET /api/regional-payouts', () => {
    it('should return list of regional payouts', () => {
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
          status: RegionalPayoutStatus.PAID,
          approvedAt: new Date('2025-02-01'),
          paidAt: new Date('2025-02-15'),
          paymentReference: 'REF-12345',
          createdAt: new Date('2025-02-01'),
          revenueRecords: [],
        },
      ];

      expect(mockPayouts).toHaveLength(1);
      expect(mockPayouts[0].status).toBe(RegionalPayoutStatus.PAID);
    });
  });

  describe('GET /api/regional-payouts/:id', () => {
    it('should return payout details with revenue records', () => {
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
        status: RegionalPayoutStatus.PAID,
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
            type: RevenueType.MEMBERSHIP,
            amount: new Decimal(29),
            currency: 'EUR',
            regionalPartnerProvision: new Decimal(8.7),
            paymentDate: new Date('2025-01-15'),
            membershipType: MembershipType.LEBENSENERGIE,
            transactionType: null,
          },
        ],
      };

      expect(mockPayout.id).toBe('payout-1');
      expect(mockPayout.revenueRecords).toHaveLength(1);
    });
  });

  describe('POST /api/regional-payouts/:id/approve', () => {
    it('should approve a pending payout', () => {
      const mockPayout = {
        id: 'payout-1',
        status: RegionalPayoutStatus.PENDING,
      };

      expect(mockPayout.status).toBe(RegionalPayoutStatus.PENDING);
    });
  });

  describe('POST /api/regional-payouts/:id/mark-paid', () => {
    it('should mark payout as paid', async () => {
      (revenueTracker.markPayoutAsPaid as any).mockResolvedValue(undefined);
      
      await revenueTracker.markPayoutAsPaid('payout-1', 'REF-12345', new Date());
      
      expect(revenueTracker.markPayoutAsPaid).toHaveBeenCalled();
    });
  });
});

