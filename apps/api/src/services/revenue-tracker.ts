import prisma from '../lib/prisma.js';
import { Decimal } from '@prisma/client/runtime/library';
import { RevenueType, RevenuePayoutStatus, RegionalPayoutStatus, AgreementStatus } from '@prisma/client';

// ==============================================
// Constants
// ==============================================

const TRANSACTION_FEE_PERCENT = 3.9; // 3.9%
const TRANSACTION_FEE_FIXED = 0.50; // €0.50
const REGIONAL_PARTNER_SPLIT = 0.30; // 30% of transaction fee goes to regional partner
const PLATFORM_OWNER_SPLIT = 0.70; // 70% of transaction fee goes to platform owner
const MEMBERSHIP_REGIONAL_PARTNER_PERCENT = 0.30; // 30% of membership goes to regional partner
const MEMBERSHIP_PLATFORM_OWNER_PERCENT = 0.70; // 70% of membership goes to platform owner

// ==============================================
// Types
// ==============================================

export interface MembershipRevenueInput {
  stripePaymentId: string;
  amount: number; // Original amount (e.g., €29)
  currency: string;
  paymentDate: Date;
  userId: string; // Clerk User ID
  membershipType: 'LEBENSENERGIE' | 'RESILIENZ' | 'BUSINESS_BOOTCAMP' | 'REGENERATIONSMEDIZIN_OS';
  billingCountry: string; // ISO 3166-1 Alpha-2 (e.g., 'DE')
  metadata?: Record<string, any>;
}

export interface TransactionRevenueInput {
  stripePaymentId: string;
  amount: number; // Original amount (e.g., €100)
  currency: string;
  paymentDate: Date;
  tenantId: string; // B2B Tenant ID
  transactionType: 'EVENT_BOOKING' | 'MENTORING' | 'WORKSHOP';
  regionId: string; // Region ID (from tenant)
  regionalPartnerId: string; // Regional Partner Tenant ID
  metadata?: Record<string, any>;
}

// ==============================================
// Revenue Tracker Service
// ==============================================

export class RevenueTracker {
  /**
   * Erstellt Revenue Record für Mitgliedschaft
   */
  async trackMembershipRevenue(input: MembershipRevenueInput): Promise<string> {
    // Find regional agreement for billing country
    const agreement = await prisma.regionalAgreement.findFirst({
      where: {
        regionCodes: { has: input.billingCountry.toUpperCase() },
        status: AgreementStatus.ACTIVE,
        validFrom: { lte: input.paymentDate },
        OR: [
          { validUntil: null },
          { validUntil: { gte: input.paymentDate } },
        ],
      },
    });

    if (!agreement) {
      throw new Error(`No active regional agreement found for country: ${input.billingCountry}`);
    }

    // Calculate revenue split
    const regionalPartnerProvision = new Decimal(input.amount)
      .times(MEMBERSHIP_REGIONAL_PARTNER_PERCENT)
      .toDecimalPlaces(2);
    
    const platformOwnerAmount = new Decimal(input.amount)
      .times(MEMBERSHIP_PLATFORM_OWNER_PERCENT)
      .toDecimalPlaces(2);

    // Format payout period (YYYY-MM)
    const payoutPeriod = this.formatPayoutPeriod(input.paymentDate);

    // Create revenue record
    const revenueRecord = await prisma.revenueRecord.create({
      data: {
        type: RevenueType.MEMBERSHIP,
        amount: new Decimal(input.amount),
        currency: input.currency,
        stripePaymentId: input.stripePaymentId,
        paymentDate: input.paymentDate,
        platformOwnerAmount,
        regionalPartnerProvision,
        regionId: agreement.id,
        regionalPartnerId: agreement.tenantId,
        userId: input.userId,
        membershipType: input.membershipType,
        payoutPeriod,
        payoutStatus: RevenuePayoutStatus.PENDING,
        metadata: input.metadata || {},
      },
    });

    return revenueRecord.id;
  }

  /**
   * Erstellt Revenue Record für Transaktion (B2C → B2B)
   */
  async trackTransactionRevenue(input: TransactionRevenueInput): Promise<string> {
    // Calculate transaction fee (3.9% + €0.50)
    const transactionFee = new Decimal(input.amount)
      .times(TRANSACTION_FEE_PERCENT / 100)
      .plus(TRANSACTION_FEE_FIXED)
      .toDecimalPlaces(2);

    // Calculate revenue split (70/30)
    const regionalPartnerProvision = transactionFee
      .times(REGIONAL_PARTNER_SPLIT)
      .toDecimalPlaces(2);
    
    const platformOwnerAmount = transactionFee
      .times(PLATFORM_OWNER_SPLIT)
      .toDecimalPlaces(2);

    // Format payout period (YYYY-MM)
    const payoutPeriod = this.formatPayoutPeriod(input.paymentDate);

    // Create revenue record
    const revenueRecord = await prisma.revenueRecord.create({
      data: {
        type: RevenueType.TRANSACTION,
        amount: new Decimal(input.amount),
        currency: input.currency,
        stripePaymentId: input.stripePaymentId,
        paymentDate: input.paymentDate,
        platformOwnerAmount,
        regionalPartnerProvision,
        transactionFee,
        tenantId: input.tenantId,
        transactionType: input.transactionType,
        regionId: input.regionId,
        regionalPartnerId: input.regionalPartnerId,
        payoutPeriod,
        payoutStatus: RevenuePayoutStatus.PENDING,
        metadata: input.metadata || {},
      },
    });

    return revenueRecord.id;
  }

  /**
   * Berechnet Transaction Fee (3.9% + €0.50)
   */
  calculateTransactionFee(amount: number): number {
    return Number(
      new Decimal(amount)
        .times(TRANSACTION_FEE_PERCENT / 100)
        .plus(TRANSACTION_FEE_FIXED)
        .toDecimalPlaces(2)
    );
  }

  /**
   * Formatiert Payout Period (YYYY-MM)
   */
  formatPayoutPeriod(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  }

  /**
   * Erstellt monatliche Payouts für Regional Partner
   */
  async createMonthlyPayouts(period: string): Promise<string[]> {
    // Get all active regional agreements
    const agreements = await prisma.regionalAgreement.findMany({
      where: {
        status: AgreementStatus.ACTIVE,
      },
    });

    const payoutIds: string[] = [];

    for (const agreement of agreements) {
      // Get all pending revenue records for this partner and period
      const revenues = await prisma.revenueRecord.findMany({
        where: {
          regionalPartnerId: agreement.tenantId,
          payoutPeriod: period,
          payoutStatus: RevenuePayoutStatus.PENDING,
        },
      });

      if (revenues.length === 0) {
        continue;
      }

      // Aggregate
      const totalProvision = revenues.reduce(
        (sum, r) => sum.plus(r.regionalPartnerProvision),
        new Decimal(0)
      );

      const membershipRevenues = revenues.filter(r => r.type === RevenueType.MEMBERSHIP);
      const transactionRevenues = revenues.filter(r => r.type === RevenueType.TRANSACTION);

      const membershipProvision = membershipRevenues.reduce(
        (sum, r) => sum.plus(r.regionalPartnerProvision),
        new Decimal(0)
      );

      const transactionProvision = transactionRevenues.reduce(
        (sum, r) => sum.plus(r.regionalPartnerProvision),
        new Decimal(0)
      );

      const totalRevenue = revenues.reduce(
        (sum, r) => sum.plus(r.amount),
        new Decimal(0)
      );

      // Create payout
      const payout = await prisma.regionalPayout.create({
        data: {
          regionalPartnerId: agreement.tenantId,
          regionalPartnerName: agreement.tenantName,
          payoutPeriod: period,
          totalRevenue: totalRevenue.toDecimalPlaces(2),
          totalProvision: totalProvision.toDecimalPlaces(2),
          revenueCount: revenues.length,
          membershipProvision: membershipProvision.toDecimalPlaces(2),
          transactionProvision: transactionProvision.toDecimalPlaces(2),
          membershipCount: membershipRevenues.length,
          transactionCount: transactionRevenues.length,
          status: RegionalPayoutStatus.PENDING,
        },
      });

      // Update revenue records to link to payout
      await prisma.revenueRecord.updateMany({
        where: {
          id: { in: revenues.map(r => r.id) },
        },
        data: {
          payoutId: payout.id,
          payoutStatus: RevenuePayoutStatus.APPROVED,
        },
      });

      payoutIds.push(payout.id);
    }

    return payoutIds;
  }

  /**
   * Markiert Payout als bezahlt
   */
  async markPayoutAsPaid(
    payoutId: string,
    paymentReference: string,
    paidAt: Date = new Date()
  ): Promise<void> {
    await prisma.regionalPayout.update({
      where: { id: payoutId },
      data: {
        status: RegionalPayoutStatus.PAID,
        paidAt,
        paymentReference,
      },
    });

    // Update revenue records
    await prisma.revenueRecord.updateMany({
      where: { payoutId },
      data: {
        payoutStatus: RevenuePayoutStatus.PAID,
        payoutDate: paidAt,
        payoutReference: paymentReference,
      },
    });
  }
}

export const revenueTracker = new RevenueTracker();

