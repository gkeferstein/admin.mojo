export interface OrderInput {
    orderId: string;
    orderDate: Date;
    orderAmountNet: number;
    productId?: string;
    productName?: string;
    isPlatformProduct: boolean;
    sellerTenantId?: string;
    sellerTenantName?: string;
    customerUserId: string;
    customerBillingCountry: string;
}
export interface CommissionResult {
    orderId: string;
    commissions: CalculatedCommission[];
    totalCommissions: number;
    netForSeller: number;
}
export interface CalculatedCommission {
    type: 'REGIONAL_EXCLUSIVE' | 'AFFILIATE_FIRST' | 'AFFILIATE_RECURRING' | 'PLATFORM_FEE';
    recipientTenantId: string;
    recipientTenantName?: string;
    percent: number;
    amount: number;
    isFirstPurchase?: boolean;
    customerRegion?: string;
}
export declare class CommissionCalculator {
    /**
     * Berechnet alle Provisionen für eine Order
     */
    calculateCommissions(order: OrderInput): Promise<CommissionResult>;
    /**
     * Berechnet regionale Exklusiv-Provision (z.B. DACH 30%)
     */
    private calculateRegionalCommission;
    /**
     * Berechnet Affiliate-Provision (20% Erst / 10% Folge)
     */
    private calculateAffiliateCommission;
    /**
     * Berechnet Platform-Fee (2% für Tenant-Verkäufe via Stripe Connect)
     */
    private calculatePlatformFee;
    /**
     * Speichert berechnete Provisionen in der Datenbank
     */
    saveCommissions(result: CommissionResult, order: OrderInput): Promise<void>;
    /**
     * Berechnet und speichert Provisionen für eine Order
     */
    processOrder(order: OrderInput): Promise<CommissionResult>;
    /**
     * Storniert Provisionen für eine Order (bei Refund)
     */
    refundOrder(orderId: string, reason: string): Promise<number>;
    /**
     * Genehmigt Provisionen nach Wartezeit (30 Tage)
     */
    approveEligibleCommissions(): Promise<number>;
}
export declare const commissionCalculator: CommissionCalculator;
//# sourceMappingURL=commission-calculator.d.ts.map