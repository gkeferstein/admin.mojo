import prisma from '../lib/prisma.js';
// ==============================================
// Constants
// ==============================================
const PLATFORM_FEE_PERCENT = 2; // 2% Stripe Connect fee for tenant sales
const AFFILIATE_FIRST_PERCENT = 20; // 20% for first purchase
const AFFILIATE_RECURRING_PERCENT = 10; // 10% for recurring purchases
// MAX_DACH_COMMISSION = 30% cap is handled in calculateCommissions logic
// ==============================================
// Commission Calculator Service
// ==============================================
export class CommissionCalculator {
    /**
     * Berechnet alle Provisionen für eine Order
     */
    async calculateCommissions(order) {
        const commissions = [];
        const netAmount = order.orderAmountNet;
        // 1. Prüfe DACH/Regional Exclusive (nur für Platform-Produkte)
        if (order.isPlatformProduct) {
            const regionalCommission = await this.calculateRegionalCommission(order, netAmount);
            if (regionalCommission) {
                commissions.push(regionalCommission);
            }
        }
        // 2. Prüfe Affiliate Attribution
        const affiliateCommission = await this.calculateAffiliateCommission(order, netAmount);
        if (affiliateCommission) {
            // Check for cap: If DACH distributor is also affiliate for platform product
            const existingRegional = commissions.find(c => c.type === 'REGIONAL_EXCLUSIVE');
            if (existingRegional &&
                existingRegional.recipientTenantId === affiliateCommission.recipientTenantId &&
                order.isPlatformProduct) {
                // Cap at 30%, don't add additional affiliate commission
                // The regional commission already covers it
            }
            else {
                commissions.push(affiliateCommission);
            }
        }
        // 3. Platform Fee (nur für Tenant-Verkäufe)
        if (order.sellerTenantId) {
            const platformFee = this.calculatePlatformFee(order, netAmount);
            commissions.push(platformFee);
        }
        // Calculate totals
        const totalCommissions = commissions.reduce((sum, c) => sum + c.amount, 0);
        const netForSeller = netAmount - totalCommissions;
        return {
            orderId: order.orderId,
            commissions,
            totalCommissions,
            netForSeller,
        };
    }
    /**
     * Berechnet regionale Exklusiv-Provision (z.B. DACH 30%)
     */
    async calculateRegionalCommission(order, netAmount) {
        // Find active regional agreement for customer's billing country
        const agreement = await prisma.regionalAgreement.findFirst({
            where: {
                regionCodes: { has: order.customerBillingCountry.toUpperCase() },
                status: 'ACTIVE',
                validFrom: { lte: order.orderDate },
                OR: [
                    { validUntil: null },
                    { validUntil: { gte: order.orderDate } },
                ],
            },
        });
        if (!agreement) {
            return null;
        }
        // Check: Distributor selbst kauft = keine Provision (Rabatt-Äquivalent)
        if (agreement.tenantId === order.customerUserId) {
            return null;
        }
        const percent = Number(agreement.commissionPercent);
        const amount = Math.round((netAmount * percent / 100) * 100) / 100;
        return {
            type: 'REGIONAL_EXCLUSIVE',
            recipientTenantId: agreement.tenantId,
            recipientTenantName: agreement.tenantName,
            percent,
            amount,
            customerRegion: agreement.regionName,
        };
    }
    /**
     * Berechnet Affiliate-Provision (20% Erst / 10% Folge)
     */
    async calculateAffiliateCommission(order, netAmount) {
        // Get customer attribution
        const attribution = await prisma.customerAttribution.findUnique({
            where: { customerUserId: order.customerUserId },
        });
        if (!attribution) {
            return null;
        }
        // Check if attribution is still active
        if (attribution.attributionExpiresAt < order.orderDate) {
            return null;
        }
        // Determine if first purchase
        const isFirstPurchase = !attribution.firstPurchaseAt;
        const percent = isFirstPurchase ? AFFILIATE_FIRST_PERCENT : AFFILIATE_RECURRING_PERCENT;
        const amount = Math.round((netAmount * percent / 100) * 100) / 100;
        return {
            type: isFirstPurchase ? 'AFFILIATE_FIRST' : 'AFFILIATE_RECURRING',
            recipientTenantId: attribution.attributedTenantId,
            recipientTenantName: attribution.attributedTenantName || undefined,
            percent,
            amount,
            isFirstPurchase,
        };
    }
    /**
     * Berechnet Platform-Fee (2% für Tenant-Verkäufe via Stripe Connect)
     */
    calculatePlatformFee(_order, netAmount) {
        const amount = Math.round((netAmount * PLATFORM_FEE_PERCENT / 100) * 100) / 100;
        return {
            type: 'PLATFORM_FEE',
            recipientTenantId: 'PLATFORM', // Special ID for platform
            recipientTenantName: 'MOJO LLC',
            percent: PLATFORM_FEE_PERCENT,
            amount,
        };
    }
    /**
     * Speichert berechnete Provisionen in der Datenbank
     */
    async saveCommissions(result, order) {
        const commissionData = result.commissions.map(c => ({
            orderId: order.orderId,
            orderDate: order.orderDate,
            orderAmount: order.orderAmountNet,
            productId: order.productId,
            productName: order.productName,
            isPlatformProduct: order.isPlatformProduct,
            sellerTenantId: order.sellerTenantId,
            sellerTenantName: order.sellerTenantName,
            recipientTenantId: c.recipientTenantId,
            recipientTenantName: c.recipientTenantName,
            commissionType: c.type,
            commissionPercent: c.percent,
            commissionAmount: c.amount,
            customerUserId: order.customerUserId,
            customerRegion: order.customerBillingCountry,
            isFirstPurchase: c.isFirstPurchase || false,
            status: 'PENDING',
        }));
        await prisma.commission.createMany({
            data: commissionData,
        });
    }
    /**
     * Berechnet und speichert Provisionen für eine Order
     */
    async processOrder(order) {
        const result = await this.calculateCommissions(order);
        if (result.commissions.length > 0) {
            await this.saveCommissions(result, order);
            // Update customer attribution stats if affiliate commission was created
            const affiliateCommission = result.commissions.find(c => c.type === 'AFFILIATE_FIRST' || c.type === 'AFFILIATE_RECURRING');
            if (affiliateCommission) {
                await prisma.customerAttribution.update({
                    where: { customerUserId: order.customerUserId },
                    data: {
                        ...(affiliateCommission.isFirstPurchase && {
                            firstPurchaseAt: order.orderDate,
                            firstPurchaseOrderId: order.orderId,
                        }),
                        totalPurchases: { increment: 1 },
                        totalRevenue: { increment: order.orderAmountNet },
                    },
                });
            }
        }
        return result;
    }
    /**
     * Storniert Provisionen für eine Order (bei Refund)
     */
    async refundOrder(orderId, reason) {
        const result = await prisma.commission.updateMany({
            where: {
                orderId,
                status: { in: ['PENDING', 'APPROVED'] },
            },
            data: {
                status: 'REFUNDED',
                refundedAt: new Date(),
                refundReason: reason,
            },
        });
        return result.count;
    }
    /**
     * Genehmigt Provisionen nach Wartezeit (30 Tage)
     */
    async approveEligibleCommissions() {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const result = await prisma.commission.updateMany({
            where: {
                status: 'PENDING',
                orderDate: { lte: thirtyDaysAgo },
            },
            data: {
                status: 'APPROVED',
                approvedAt: new Date(),
            },
        });
        return result.count;
    }
}
export const commissionCalculator = new CommissionCalculator();
//# sourceMappingURL=commission-calculator.js.map