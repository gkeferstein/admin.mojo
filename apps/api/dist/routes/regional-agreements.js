import { z } from 'zod';
import prisma from '../lib/prisma.js';
import { logAudit } from '../services/audit.js';
// ==============================================
// Validation Schemas
// ==============================================
const createAgreementSchema = z.object({
    tenantId: z.string().uuid(),
    tenantName: z.string().min(1),
    tenantSlug: z.string().min(1),
    regionCodes: z.array(z.string().length(2)).min(1), // ISO 3166-1 Alpha-2
    regionName: z.string().min(1),
    commissionPercent: z.number().min(0).max(100),
    appliesTo: z.enum(['PLATFORM_PRODUCTS', 'ALL_PRODUCTS']).default('PLATFORM_PRODUCTS'),
    validFrom: z.string().datetime().optional(),
    validUntil: z.string().datetime().optional().nullable(),
    notes: z.string().optional(),
});
const updateAgreementSchema = z.object({
    commissionPercent: z.number().min(0).max(100).optional(),
    validUntil: z.string().datetime().optional().nullable(),
    status: z.enum(['PENDING', 'ACTIVE', 'SUSPENDED', 'TERMINATED']).optional(),
    notes: z.string().optional(),
});
const signContractSchema = z.object({
    signedBy: z.string().min(3),
    contractVersion: z.string().default('1.0'),
});
// ==============================================
// Routes
// ==============================================
export default async function regionalAgreementsRoutes(fastify) {
    // GET /api/v1/regional-agreements - Liste aller Vereinbarungen
    fastify.get('/api/v1/regional-agreements', async (request, _reply) => {
        const { status, region } = request.query;
        const where = {};
        if (status) {
            where.status = status;
        }
        if (region) {
            where.regionCodes = { has: region.toUpperCase() };
        }
        const agreements = await prisma.regionalAgreement.findMany({
            where,
            orderBy: { createdAt: 'desc' },
        });
        return {
            success: true,
            data: agreements,
            meta: { total: agreements.length },
        };
    });
    // GET /api/v1/regional-agreements/:id - Einzelne Vereinbarung
    fastify.get('/api/v1/regional-agreements/:id', async (request, reply) => {
        const { id } = request.params;
        const agreement = await prisma.regionalAgreement.findUnique({
            where: { id },
        });
        if (!agreement) {
            return reply.status(404).send({
                success: false,
                error: { code: 'NOT_FOUND', message: 'Regional agreement not found' },
            });
        }
        return { success: true, data: agreement };
    });
    // GET /api/v1/regional-agreements/by-region/:regionCode - Nach Region suchen
    fastify.get('/api/v1/regional-agreements/by-region/:regionCode', async (request, _reply) => {
        const { regionCode } = request.params;
        const agreement = await prisma.regionalAgreement.findFirst({
            where: {
                regionCodes: { has: regionCode.toUpperCase() },
                status: 'ACTIVE',
            },
        });
        return {
            success: true,
            data: agreement,
            found: !!agreement,
        };
    });
    // POST /api/v1/regional-agreements - Neue Vereinbarung erstellen
    fastify.post('/api/v1/regional-agreements', async (request, reply) => {
        const input = createAgreementSchema.parse(request.body);
        // Check for overlapping regions
        const existingWithRegion = await prisma.regionalAgreement.findFirst({
            where: {
                regionCodes: { hasSome: input.regionCodes },
                status: { in: ['PENDING', 'ACTIVE'] },
            },
        });
        if (existingWithRegion) {
            return reply.status(409).send({
                success: false,
                error: {
                    code: 'REGION_CONFLICT',
                    message: `Region already has an active agreement with ${existingWithRegion.tenantName}`,
                    details: { existingAgreementId: existingWithRegion.id },
                },
            });
        }
        const agreement = await prisma.regionalAgreement.create({
            data: {
                tenantId: input.tenantId,
                tenantName: input.tenantName,
                tenantSlug: input.tenantSlug,
                regionCodes: input.regionCodes,
                regionName: input.regionName,
                commissionPercent: input.commissionPercent,
                appliesTo: input.appliesTo,
                validFrom: input.validFrom ? new Date(input.validFrom) : new Date(),
                validUntil: input.validUntil ? new Date(input.validUntil) : null,
                notes: input.notes,
                status: 'PENDING',
            },
        });
        await logAudit({
            action: 'create',
            resource: 'regional_agreement',
            resourceId: agreement.id,
            newValue: agreement,
            request,
        });
        return reply.status(201).send({ success: true, data: agreement });
    });
    // PATCH /api/v1/regional-agreements/:id - Vereinbarung aktualisieren
    fastify.patch('/api/v1/regional-agreements/:id', async (request, reply) => {
        const { id } = request.params;
        const input = updateAgreementSchema.parse(request.body);
        const existing = await prisma.regionalAgreement.findUnique({ where: { id } });
        if (!existing) {
            return reply.status(404).send({
                success: false,
                error: { code: 'NOT_FOUND', message: 'Regional agreement not found' },
            });
        }
        const agreement = await prisma.regionalAgreement.update({
            where: { id },
            data: {
                ...(input.commissionPercent !== undefined && { commissionPercent: input.commissionPercent }),
                ...(input.validUntil !== undefined && { validUntil: input.validUntil ? new Date(input.validUntil) : null }),
                ...(input.status && { status: input.status }),
                ...(input.notes !== undefined && { notes: input.notes }),
            },
        });
        await logAudit({
            action: 'update',
            resource: 'regional_agreement',
            resourceId: id,
            oldValue: existing,
            newValue: agreement,
            request,
        });
        return { success: true, data: agreement };
    });
    // POST /api/v1/regional-agreements/:id/sign - Vertrag unterzeichnen
    fastify.post('/api/v1/regional-agreements/:id/sign', async (request, reply) => {
        const { id } = request.params;
        const input = signContractSchema.parse(request.body);
        const existing = await prisma.regionalAgreement.findUnique({ where: { id } });
        if (!existing) {
            return reply.status(404).send({
                success: false,
                error: { code: 'NOT_FOUND', message: 'Regional agreement not found' },
            });
        }
        if (existing.contractSignedAt) {
            return reply.status(400).send({
                success: false,
                error: { code: 'ALREADY_SIGNED', message: 'Contract already signed' },
            });
        }
        const agreement = await prisma.regionalAgreement.update({
            where: { id },
            data: {
                contractSignedAt: new Date(),
                contractSignedBy: input.signedBy,
                contractVersion: input.contractVersion,
                status: 'ACTIVE',
            },
        });
        await logAudit({
            action: 'sign_contract',
            resource: 'regional_agreement',
            resourceId: id,
            newValue: { signedBy: input.signedBy, signedAt: agreement.contractSignedAt },
            request,
        });
        return { success: true, data: agreement };
    });
    // DELETE /api/v1/regional-agreements/:id - Vereinbarung beenden
    fastify.delete('/api/v1/regional-agreements/:id', async (request, reply) => {
        const { id } = request.params;
        const existing = await prisma.regionalAgreement.findUnique({ where: { id } });
        if (!existing) {
            return reply.status(404).send({
                success: false,
                error: { code: 'NOT_FOUND', message: 'Regional agreement not found' },
            });
        }
        const agreement = await prisma.regionalAgreement.update({
            where: { id },
            data: {
                status: 'TERMINATED',
                validUntil: new Date(),
            },
        });
        await logAudit({
            action: 'terminate',
            resource: 'regional_agreement',
            resourceId: id,
            oldValue: existing,
            newValue: agreement,
            request,
        });
        return { success: true, data: agreement };
    });
}
//# sourceMappingURL=regional-agreements.js.map