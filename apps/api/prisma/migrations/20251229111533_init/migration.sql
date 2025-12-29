-- CreateEnum
CREATE TYPE "AppliesTo" AS ENUM ('PLATFORM_PRODUCTS', 'ALL_PRODUCTS');

-- CreateEnum
CREATE TYPE "AgreementStatus" AS ENUM ('PENDING', 'ACTIVE', 'SUSPENDED', 'TERMINATED');

-- CreateEnum
CREATE TYPE "AttributionSource" AS ENUM ('AFFILIATE_CODE', 'REFERRAL_LINK', 'MANUAL', 'MIGRATION');

-- CreateEnum
CREATE TYPE "CommissionType" AS ENUM ('REGIONAL_EXCLUSIVE', 'AFFILIATE_FIRST', 'AFFILIATE_RECURRING', 'PLATFORM_FEE');

-- CreateEnum
CREATE TYPE "CommissionStatus" AS ENUM ('PENDING', 'APPROVED', 'PAID', 'REFUNDED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PayoutStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "ContractType" AS ENUM ('REGIONAL_DISTRIBUTOR', 'TENANT_AFFILIATE');

-- CreateTable
CREATE TABLE "regional_agreements" (
    "id" UUID NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "tenant_name" TEXT NOT NULL,
    "tenant_slug" TEXT NOT NULL,
    "region_codes" TEXT[],
    "region_name" TEXT NOT NULL,
    "commission_percent" DECIMAL(5,2) NOT NULL,
    "applies_to" "AppliesTo" NOT NULL DEFAULT 'PLATFORM_PRODUCTS',
    "contract_signed_at" TIMESTAMP(3),
    "contract_signed_by" TEXT,
    "contract_document_url" TEXT,
    "contract_version" TEXT NOT NULL DEFAULT '1.0',
    "valid_from" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "valid_until" TIMESTAMP(3),
    "status" "AgreementStatus" NOT NULL DEFAULT 'PENDING',
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,

    CONSTRAINT "regional_agreements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "platform_products" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "user_journey_level" INTEGER NOT NULL,
    "level_name" TEXT NOT NULL,
    "level_color" TEXT NOT NULL,
    "price_net" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'EUR',
    "stripe_product_id" TEXT,
    "stripe_price_id" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "platform_products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_entitlements" (
    "id" UUID NOT NULL,
    "product_id" UUID NOT NULL,
    "resource_type" TEXT NOT NULL,
    "resource_id" TEXT NOT NULL,
    "resource_name" TEXT,
    "duration_days" INTEGER,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "product_entitlements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customer_attributions" (
    "id" UUID NOT NULL,
    "customer_user_id" TEXT NOT NULL,
    "customer_email" TEXT,
    "attributed_tenant_id" TEXT NOT NULL,
    "attributed_tenant_name" TEXT,
    "attributed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "attribution_expires_at" TIMESTAMP(3) NOT NULL,
    "source" "AttributionSource" NOT NULL DEFAULT 'AFFILIATE_CODE',
    "source_ref" TEXT,
    "first_purchase_at" TIMESTAMP(3),
    "first_purchase_order_id" TEXT,
    "total_purchases" INTEGER NOT NULL DEFAULT 0,
    "total_revenue" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "total_commission_paid" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "customer_attributions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "commissions" (
    "id" UUID NOT NULL,
    "order_id" TEXT NOT NULL,
    "order_date" TIMESTAMP(3) NOT NULL,
    "order_amount" DECIMAL(12,2) NOT NULL,
    "product_id" TEXT,
    "product_name" TEXT,
    "is_platform_product" BOOLEAN NOT NULL DEFAULT false,
    "seller_tenant_id" TEXT,
    "seller_tenant_name" TEXT,
    "recipient_tenant_id" TEXT NOT NULL,
    "recipient_tenant_name" TEXT,
    "commission_type" "CommissionType" NOT NULL,
    "commission_percent" DECIMAL(5,2) NOT NULL,
    "commission_amount" DECIMAL(12,2) NOT NULL,
    "customer_user_id" TEXT,
    "customer_region" TEXT,
    "is_first_purchase" BOOLEAN NOT NULL DEFAULT false,
    "status" "CommissionStatus" NOT NULL DEFAULT 'PENDING',
    "approved_at" TIMESTAMP(3),
    "approved_by" TEXT,
    "payout_id" UUID,
    "paid_at" TIMESTAMP(3),
    "stripe_transfer_id" TEXT,
    "refunded_at" TIMESTAMP(3),
    "refund_reason" TEXT,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "commissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payouts" (
    "id" UUID NOT NULL,
    "recipient_tenant_id" TEXT NOT NULL,
    "recipient_tenant_name" TEXT,
    "stripe_account_id" TEXT NOT NULL,
    "total_amount" DECIMAL(12,2) NOT NULL,
    "commission_count" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'EUR',
    "period_start" TIMESTAMP(3) NOT NULL,
    "period_end" TIMESTAMP(3) NOT NULL,
    "stripe_transfer_id" TEXT,
    "stripe_payout_id" TEXT,
    "status" "PayoutStatus" NOT NULL DEFAULT 'PENDING',
    "processed_at" TIMESTAMP(3),
    "processed_by" TEXT,
    "failed_at" TIMESTAMP(3),
    "failure_reason" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payouts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contract_signatures" (
    "id" UUID NOT NULL,
    "contract_type" "ContractType" NOT NULL,
    "contract_version" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "tenant_name" TEXT,
    "signer_user_id" TEXT NOT NULL,
    "signer_name" TEXT NOT NULL,
    "signer_email" TEXT NOT NULL,
    "signature_text" TEXT NOT NULL,
    "signed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "contract_hash" TEXT NOT NULL,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "contract_signatures_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" UUID NOT NULL,
    "actor_user_id" TEXT,
    "actor_email" TEXT,
    "actor_role" TEXT,
    "action" TEXT NOT NULL,
    "resource" TEXT NOT NULL,
    "resource_id" TEXT,
    "old_value" JSONB,
    "new_value" JSONB,
    "metadata" JSONB,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "regional_agreements_tenant_id_key" ON "regional_agreements"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "platform_products_slug_key" ON "platform_products"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "customer_attributions_customer_user_id_key" ON "customer_attributions"("customer_user_id");

-- CreateIndex
CREATE INDEX "customer_attributions_attributed_tenant_id_idx" ON "customer_attributions"("attributed_tenant_id");

-- CreateIndex
CREATE INDEX "customer_attributions_attribution_expires_at_idx" ON "customer_attributions"("attribution_expires_at");

-- CreateIndex
CREATE INDEX "commissions_order_id_idx" ON "commissions"("order_id");

-- CreateIndex
CREATE INDEX "commissions_recipient_tenant_id_idx" ON "commissions"("recipient_tenant_id");

-- CreateIndex
CREATE INDEX "commissions_status_idx" ON "commissions"("status");

-- CreateIndex
CREATE INDEX "commissions_created_at_idx" ON "commissions"("created_at");

-- CreateIndex
CREATE INDEX "payouts_recipient_tenant_id_idx" ON "payouts"("recipient_tenant_id");

-- CreateIndex
CREATE INDEX "payouts_status_idx" ON "payouts"("status");

-- CreateIndex
CREATE INDEX "contract_signatures_tenant_id_idx" ON "contract_signatures"("tenant_id");

-- CreateIndex
CREATE INDEX "contract_signatures_contract_type_idx" ON "contract_signatures"("contract_type");

-- CreateIndex
CREATE INDEX "audit_logs_actor_user_id_idx" ON "audit_logs"("actor_user_id");

-- CreateIndex
CREATE INDEX "audit_logs_resource_resource_id_idx" ON "audit_logs"("resource", "resource_id");

-- CreateIndex
CREATE INDEX "audit_logs_created_at_idx" ON "audit_logs"("created_at");

-- AddForeignKey
ALTER TABLE "product_entitlements" ADD CONSTRAINT "product_entitlements_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "platform_products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "commissions" ADD CONSTRAINT "commissions_payout_id_fkey" FOREIGN KEY ("payout_id") REFERENCES "payouts"("id") ON DELETE SET NULL ON UPDATE CASCADE;
