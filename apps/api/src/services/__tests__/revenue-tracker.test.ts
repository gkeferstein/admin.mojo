import { describe, it, expect, beforeEach, vi } from 'vitest';
import { revenueTracker } from '../revenue-tracker.js';
import prisma from '../../lib/prisma.js';
import { Decimal } from '@prisma/client/runtime/library';
import { RevenueType, RevenuePayoutStatus, RegionalPayoutStatus } from '@prisma/client';

// Mock Prisma
vi.mock('../../lib/prisma.js', () => ({
  default: {
    regionalAgreement: {
      findFirst: vi.fn(),
      findMany: vi.fn(),
    },
    revenueRecord: {
      create: vi.fn(),
      findMany: vi.fn(),
      updateMany: vi.fn(),
    },
    regionalPayout: {
      create: vi.fn(),
      findMany: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
    },
  },
}));

describe('RevenueTracker', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('calculateTransactionFee', () => {
    it('should calculate transaction fee correctly (3.9% + €0.50)', () => {
      expect(revenueTracker.calculateTransactionFee(100)).toBe(4.4); // 3.9 + 0.50
      expect(revenueTracker.calculateTransactionFee(50)).toBe(2.45); // 1.95 + 0.50
      expect(revenueTracker.calculateTransactionFee(200)).toBe(8.3); // 7.8 + 0.50
    });
  });

  describe('formatPayoutPeriod', () => {
    it('should format date as YYYY-MM', () => {
      const date = new Date('2025-01-15T10:00:00Z');
      expect(revenueTracker.formatPayoutPeriod(date)).toBe('2025-01');
      
      const date2 = new Date('2025-12-31T23:59:59Z');
      expect(revenueTracker.formatPayoutPeriod(date2)).toBe('2025-12');
    });
  });

  describe('trackMembershipRevenue', () => {
    it('should create revenue record for membership with 30% regional partner provision', async () => {
      const mockAgreement = {
        id: 'agreement-1',
        tenantId: 'tenant-dach',
        tenantName: 'MOJO GmbH',
        regionCodes: ['DE', 'AT', 'CH'],
        regionName: 'DACH',
        status: 'ACTIVE', // Mock data - AgreementStatus enum not needed here
      };

      (prisma.regionalAgreement.findFirst as any).mockResolvedValue(mockAgreement);
      (prisma.revenueRecord.create as any).mockResolvedValue({
        id: 'revenue-1',
        type: RevenueType.MEMBERSHIP,
        amount: new Decimal(29),
        regionalPartnerProvision: new Decimal(8.7),
        platformOwnerAmount: new Decimal(20.3),
      });

      const result = await revenueTracker.trackMembershipRevenue({
        stripePaymentId: 'pi_test_123',
        amount: 29,
        currency: 'EUR',
        paymentDate: new Date('2025-01-15'),
        userId: 'user_123',
        membershipType: 'LEBENSENERGIE',
        billingCountry: 'DE',
      });

      expect(result).toBe('revenue-1');
      expect(prisma.revenueRecord.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          type: RevenueType.MEMBERSHIP,
          amount: expect.any(Decimal),
          regionalPartnerProvision: expect.any(Decimal),
          platformOwnerAmount: expect.any(Decimal),
          membershipType: 'LEBENSENERGIE',
          payoutPeriod: '2025-01',
          payoutStatus: RevenuePayoutStatus.PENDING,
        }),
      });
    });

    it('should throw error if no regional agreement found', async () => {
      (prisma.regionalAgreement.findFirst as any).mockResolvedValue(null);

      await expect(
        revenueTracker.trackMembershipRevenue({
          stripePaymentId: 'pi_test_123',
          amount: 29,
          currency: 'EUR',
          paymentDate: new Date('2025-01-15'),
          userId: 'user_123',
          membershipType: 'LEBENSENERGIE',
          billingCountry: 'US',
        })
      ).rejects.toThrow('No active regional agreement found');
    });
  });

  describe('trackTransactionRevenue', () => {
    it('should create revenue record for transaction with transaction fee split', async () => {
      (prisma.revenueRecord.create as any).mockResolvedValue({
        id: 'revenue-2',
        type: RevenueType.TRANSACTION,
        amount: new Decimal(100),
        transactionFee: new Decimal(4.4),
        regionalPartnerProvision: new Decimal(1.32), // 30% of 4.40
        platformOwnerAmount: new Decimal(3.08), // 70% of 4.40
      });

      const result = await revenueTracker.trackTransactionRevenue({
        stripePaymentId: 'pi_test_456',
        amount: 100,
        currency: 'EUR',
        paymentDate: new Date('2025-01-15'),
        tenantId: 'tenant-1',
        transactionType: 'EVENT_BOOKING',
        regionId: 'region-1',
        regionalPartnerId: 'tenant-dach',
      });

      expect(result).toBe('revenue-2');
      expect(prisma.revenueRecord.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          type: RevenueType.TRANSACTION,
          amount: expect.any(Decimal),
          transactionFee: expect.any(Decimal),
          regionalPartnerProvision: expect.any(Decimal),
          platformOwnerAmount: expect.any(Decimal),
          transactionType: 'EVENT_BOOKING',
          payoutPeriod: '2025-01',
          payoutStatus: RevenuePayoutStatus.PENDING,
        }),
      });
    });
  });

  describe('createMonthlyPayouts', () => {
    it('should create monthly payouts for all regional partners', async () => {
      const mockAgreements = [
        {
          id: 'agreement-1',
          tenantId: 'tenant-dach',
          tenantName: 'MOJO GmbH',
        },
      ];

      const mockRevenues = [
        {
          id: 'revenue-1',
          type: RevenueType.MEMBERSHIP,
          amount: new Decimal(29),
          regionalPartnerProvision: new Decimal(8.7),
        },
        {
          id: 'revenue-2',
          type: RevenueType.TRANSACTION,
          amount: new Decimal(100),
          regionalPartnerProvision: new Decimal(1.32),
        },
      ];

      (prisma.regionalAgreement.findMany as any).mockResolvedValue(mockAgreements);
      (prisma.revenueRecord.findMany as any).mockResolvedValue(mockRevenues);
      (prisma.regionalPayout.create as any).mockResolvedValue({
        id: 'payout-1',
        regionalPartnerId: 'tenant-dach',
      });
      (prisma.revenueRecord.updateMany as any).mockResolvedValue({ count: 2 });

      const result = await revenueTracker.createMonthlyPayouts('2025-01');

      expect(result).toEqual(['payout-1']);
      expect(prisma.regionalPayout.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          regionalPartnerId: 'tenant-dach',
          payoutPeriod: '2025-01',
          revenueCount: 2,
          membershipCount: 1,
          transactionCount: 1,
        }),
      });
    });

    it('should skip partners with no revenues', async () => {
      const mockAgreements = [
        {
          id: 'agreement-1',
          tenantId: 'tenant-dach',
          tenantName: 'MOJO GmbH',
        },
      ];

      (prisma.regionalAgreement.findMany as any).mockResolvedValue(mockAgreements);
      (prisma.revenueRecord.findMany as any).mockResolvedValue([]);

      const result = await revenueTracker.createMonthlyPayouts('2025-01');

      expect(result).toEqual([]);
      expect(prisma.regionalPayout.create).not.toHaveBeenCalled();
    });
  });

  describe('markPayoutAsPaid', () => {
    it('should mark payout and revenue records as paid', async () => {
      (prisma.regionalPayout.update as any).mockResolvedValue({
        id: 'payout-1',
        status: RegionalPayoutStatus.PAID,
      });
      (prisma.revenueRecord.updateMany as any).mockResolvedValue({ count: 5 });

      const paidAt = new Date('2025-02-15');
      await revenueTracker.markPayoutAsPaid('payout-1', 'REF-12345', paidAt);

      expect(prisma.regionalPayout.update).toHaveBeenCalledWith({
        where: { id: 'payout-1' },
        data: {
          status: RegionalPayoutStatus.PAID,
          paidAt,
          paymentReference: 'REF-12345',
        },
      });

      expect(prisma.revenueRecord.updateMany).toHaveBeenCalledWith({
        where: { payoutId: 'payout-1' },
        data: {
          payoutStatus: RevenuePayoutStatus.PAID,
          payoutDate: paidAt,
          payoutReference: 'REF-12345',
        },
      });
    });
  });
});

