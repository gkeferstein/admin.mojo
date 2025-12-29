import { z } from 'zod';
import prisma from '../lib/prisma.js';
import { logAudit } from '../services/audit.js';
// ==============================================
// Validation Schemas
// ==============================================
const createProductSchema = z.object({
    name: z.string().min(1),
    slug: z.string().min(1).regex(/^[a-z0-9-]+$/),
    description: z.string().optional(),
    userJourneyLevel: z.number().int().min(1).max(6),
    levelName: z.string().min(1),
    levelColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
    priceNet: z.number().positive(),
    currency: z.string().length(3).default('EUR'),
    stripeProductId: z.string().optional(),
    stripePriceId: z.string().optional(),
    isActive: z.boolean().default(true),
    sortOrder: z.number().int().default(0),
    metadata: z.record(z.any()).optional(),
    entitlements: z.array(z.object({
        resourceType: z.string(),
        resourceId: z.string(),
        resourceName: z.string().optional(),
        durationDays: z.number().int().positive().optional().nullable(),
        quantity: z.number().int().positive().default(1),
    })).optional(),
});
const updateProductSchema = z.object({
    name: z.string().min(1).optional(),
    description: z.string().optional(),
    priceNet: z.number().positive().optional(),
    stripeProductId: z.string().optional(),
    stripePriceId: z.string().optional(),
    isActive: z.boolean().optional(),
    sortOrder: z.number().int().optional(),
    metadata: z.record(z.any()).optional(),
});
// ==============================================
// Default Platform Products (Seed Data)
// ==============================================
const DEFAULT_PRODUCTS = [
    {
        userJourneyLevel: 1,
        name: 'LEBENSENERGIE',
        slug: 'lebensenergie',
        levelName: 'LEBENSENERGIE',
        levelColor: '#66dd99',
        priceNet: 99,
        description: 'Finde dein MOJO (wieder)',
    },
    {
        userJourneyLevel: 2,
        name: 'CAMPUS',
        slug: 'campus',
        levelName: 'CAMPUS',
        levelColor: '#ffffff',
        priceNet: 299,
        description: 'Vernetze dich und optimiere deine Regeneration',
    },
    {
        userJourneyLevel: 3,
        name: 'BUSINESS BOOTCAMP',
        slug: 'business-bootcamp',
        levelName: 'BUSINESS BOOTCAMP',
        levelColor: '#0d63bf',
        priceNet: 999,
        description: 'Starte dein eigenes Gesundheitsbusiness',
    },
    {
        userJourneyLevel: 4,
        name: 'RegenerationsmedizinOS',
        slug: 'regenerationsmedizin-os',
        levelName: 'RegenerationsmedizinOS',
        levelColor: '#873acf',
        priceNet: 2999,
        description: 'Das Betriebssystem für chronische Gesundheit',
    },
    {
        userJourneyLevel: 5,
        name: 'Praxiszirkel',
        slug: 'praxiszirkel',
        levelName: 'Praxiszirkel',
        levelColor: '#f5bb00',
        priceNet: 4999,
        description: 'Behandle Menschen unter Fachleuten',
    },
    {
        userJourneyLevel: 6,
        name: 'MOJO Inkubator',
        slug: 'mojo-inkubator',
        levelName: 'MOJO Inkubator',
        levelColor: '#000000',
        priceNet: 9999,
        description: 'Eröffne dein eigenes MOJO Institut',
    },
];
// ==============================================
// Routes
// ==============================================
export default async function platformProductsRoutes(fastify) {
    // GET /api/v1/platform-products - Liste aller Produkte
    fastify.get('/api/v1/platform-products', async (request, _reply) => {
        const { active } = request.query;
        const where = {};
        if (active === 'true') {
            where.isActive = true;
        }
        const products = await prisma.platformProduct.findMany({
            where,
            include: {
                entitlements: true,
            },
            orderBy: { sortOrder: 'asc' },
        });
        // If no products exist, return defaults
        if (products.length === 0) {
            return {
                success: true,
                data: DEFAULT_PRODUCTS.map((p, i) => ({
                    id: `default-${p.userJourneyLevel}`,
                    ...p,
                    currency: 'EUR',
                    isActive: true,
                    sortOrder: i,
                    entitlements: [],
                })),
                meta: { total: DEFAULT_PRODUCTS.length, isDefault: true },
            };
        }
        return {
            success: true,
            data: products,
            meta: { total: products.length },
        };
    });
    // GET /api/v1/platform-products/:id - Einzelnes Produkt
    fastify.get('/api/v1/platform-products/:id', async (request, reply) => {
        const { id } = request.params;
        const product = await prisma.platformProduct.findUnique({
            where: { id },
            include: { entitlements: true },
        });
        if (!product) {
            return reply.status(404).send({
                success: false,
                error: { code: 'NOT_FOUND', message: 'Platform product not found' },
            });
        }
        return { success: true, data: product };
    });
    // GET /api/v1/platform-products/by-level/:level - Nach Level
    fastify.get('/api/v1/platform-products/by-level/:level', async (request, reply) => {
        const { level } = request.params;
        const product = await prisma.platformProduct.findFirst({
            where: { userJourneyLevel: parseInt(level, 10) },
            include: { entitlements: true },
        });
        if (!product) {
            // Return default if exists
            const defaultProduct = DEFAULT_PRODUCTS.find(p => p.userJourneyLevel === parseInt(level, 10));
            if (defaultProduct) {
                return {
                    success: true,
                    data: { id: `default-${level}`, ...defaultProduct, currency: 'EUR', isActive: true, entitlements: [] },
                    isDefault: true,
                };
            }
            return reply.status(404).send({
                success: false,
                error: { code: 'NOT_FOUND', message: 'Platform product not found' },
            });
        }
        return { success: true, data: product };
    });
    // POST /api/v1/platform-products - Neues Produkt erstellen
    fastify.post('/api/v1/platform-products', async (request, reply) => {
        const input = createProductSchema.parse(request.body);
        // Check for duplicate level or slug
        const existing = await prisma.platformProduct.findFirst({
            where: {
                OR: [
                    { userJourneyLevel: input.userJourneyLevel },
                    { slug: input.slug },
                ],
            },
        });
        if (existing) {
            return reply.status(409).send({
                success: false,
                error: {
                    code: 'DUPLICATE',
                    message: existing.slug === input.slug
                        ? 'Product with this slug already exists'
                        : 'Product for this level already exists',
                },
            });
        }
        const { entitlements, ...productData } = input;
        const product = await prisma.platformProduct.create({
            data: {
                ...productData,
                entitlements: entitlements ? {
                    create: entitlements,
                } : undefined,
            },
            include: { entitlements: true },
        });
        await logAudit({
            action: 'create',
            resource: 'platform_product',
            resourceId: product.id,
            newValue: product,
            request,
        });
        return reply.status(201).send({ success: true, data: product });
    });
    // PATCH /api/v1/platform-products/:id - Produkt aktualisieren
    fastify.patch('/api/v1/platform-products/:id', async (request, reply) => {
        const { id } = request.params;
        const input = updateProductSchema.parse(request.body);
        const existing = await prisma.platformProduct.findUnique({ where: { id } });
        if (!existing) {
            return reply.status(404).send({
                success: false,
                error: { code: 'NOT_FOUND', message: 'Platform product not found' },
            });
        }
        const product = await prisma.platformProduct.update({
            where: { id },
            data: {
                ...(input.name !== undefined && { name: input.name }),
                ...(input.description !== undefined && { description: input.description }),
                ...(input.priceNet !== undefined && { priceNet: input.priceNet }),
                ...(input.stripeProductId !== undefined && { stripeProductId: input.stripeProductId }),
                ...(input.stripePriceId !== undefined && { stripePriceId: input.stripePriceId }),
                ...(input.isActive !== undefined && { isActive: input.isActive }),
                ...(input.sortOrder !== undefined && { sortOrder: input.sortOrder }),
                ...(input.metadata !== undefined && { metadata: input.metadata }),
            },
            include: { entitlements: true },
        });
        await logAudit({
            action: 'update',
            resource: 'platform_product',
            resourceId: id,
            oldValue: existing,
            newValue: product,
            request,
        });
        return { success: true, data: product };
    });
    // POST /api/v1/platform-products/:id/entitlements - Entitlement hinzufügen
    fastify.post('/api/v1/platform-products/:id/entitlements', async (request, reply) => {
        const { id } = request.params;
        const input = z.object({
            resourceType: z.string(),
            resourceId: z.string(),
            resourceName: z.string().optional(),
            durationDays: z.number().int().positive().optional().nullable(),
            quantity: z.number().int().positive().default(1),
        }).parse(request.body);
        const product = await prisma.platformProduct.findUnique({ where: { id } });
        if (!product) {
            return reply.status(404).send({
                success: false,
                error: { code: 'NOT_FOUND', message: 'Platform product not found' },
            });
        }
        const entitlement = await prisma.productEntitlement.create({
            data: {
                productId: id,
                ...input,
            },
        });
        await logAudit({
            action: 'add_entitlement',
            resource: 'platform_product',
            resourceId: id,
            newValue: entitlement,
            request,
        });
        return reply.status(201).send({ success: true, data: entitlement });
    });
    // DELETE /api/v1/platform-products/:id/entitlements/:entitlementId - Entitlement entfernen
    fastify.delete('/api/v1/platform-products/:id/entitlements/:entitlementId', async (request, reply) => {
        const { id, entitlementId } = request.params;
        const entitlement = await prisma.productEntitlement.findFirst({
            where: { id: entitlementId, productId: id },
        });
        if (!entitlement) {
            return reply.status(404).send({
                success: false,
                error: { code: 'NOT_FOUND', message: 'Entitlement not found' },
            });
        }
        await prisma.productEntitlement.delete({ where: { id: entitlementId } });
        await logAudit({
            action: 'remove_entitlement',
            resource: 'platform_product',
            resourceId: id,
            oldValue: entitlement,
            request,
        });
        return { success: true, message: 'Entitlement removed' };
    });
    // POST /api/v1/platform-products/seed - Seed default products
    fastify.post('/api/v1/platform-products/seed', async (request, reply) => {
        const existing = await prisma.platformProduct.count();
        if (existing > 0) {
            return reply.status(400).send({
                success: false,
                error: { code: 'ALREADY_SEEDED', message: 'Products already exist' },
            });
        }
        const products = await prisma.platformProduct.createMany({
            data: DEFAULT_PRODUCTS.map((p, i) => ({
                ...p,
                currency: 'EUR',
                isActive: true,
                sortOrder: i,
            })),
        });
        await logAudit({
            action: 'seed',
            resource: 'platform_products',
            newValue: { count: products.count },
            request,
        });
        return reply.status(201).send({
            success: true,
            message: `Created ${products.count} platform products`,
        });
    });
}
//# sourceMappingURL=platform-products.js.map