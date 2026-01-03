import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import prisma from '../lib/prisma.js';
import { logAudit } from '../services/audit.js';

// ==============================================
// Validation Schemas
// ==============================================

// Character limits for catalog display
const CHAR_LIMITS = {
  name: 30,
  subtitle: 40,
  description: 500,
  duration: 20,
  feature: 60, // per feature item
};

const billingTypeEnum = z.enum(['ONE_TIME', 'SUBSCRIPTION']);
const billingIntervalEnum = z.enum(['MONTHLY', 'YEARLY']);

const createProductSchema = z.object({
  // Basic Info
  name: z.string().min(1).max(CHAR_LIMITS.name),
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/),
  subtitle: z.string().max(CHAR_LIMITS.subtitle).optional(),
  description: z.string().max(CHAR_LIMITS.description).optional(),
  
  // User Journey
  userJourneyLevel: z.number().int().min(1).max(6),
  levelName: z.string().min(1),
  
  // Styling
  levelColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  textColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).default('#000000'),
  icon: z.string().default('Zap'),
  
  // Pricing
  priceNet: z.number().min(0),
  originalPrice: z.number().positive().optional().nullable(),
  currency: z.string().length(3).default('EUR'),
  billingType: billingTypeEnum.default('ONE_TIME'),
  billingInterval: billingIntervalEnum.optional().nullable(),
  
  // Course Content
  duration: z.string().max(CHAR_LIMITS.duration).optional(),
  modulesCount: z.number().int().min(0).optional().nullable(),
  lessonsCount: z.number().int().min(0).optional().nullable(),
  features: z.array(z.string().max(CHAR_LIMITS.feature)).max(10).default([]),
  
  // Flags
  isPopular: z.boolean().default(false),
  isExclusive: z.boolean().default(false),
  isActive: z.boolean().default(true),
  sortOrder: z.number().int().default(0),
  
  // Stripe
  stripeProductId: z.string().optional(),
  stripePriceId: z.string().optional(),
  
  // Campus Integration
  campusCourseId: z.string().optional(),
  
  // Metadata & Entitlements
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
  // Basic Info
  name: z.string().min(1).max(CHAR_LIMITS.name).optional(),
  subtitle: z.string().max(CHAR_LIMITS.subtitle).optional().nullable(),
  description: z.string().max(CHAR_LIMITS.description).optional().nullable(),
  
  // Styling
  levelColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  textColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  icon: z.string().optional(),
  
  // Pricing
  priceNet: z.number().min(0).optional(),
  originalPrice: z.number().positive().optional().nullable(),
  billingType: billingTypeEnum.optional(),
  billingInterval: billingIntervalEnum.optional().nullable(),
  
  // Course Content
  duration: z.string().max(CHAR_LIMITS.duration).optional().nullable(),
  modulesCount: z.number().int().min(0).optional().nullable(),
  lessonsCount: z.number().int().min(0).optional().nullable(),
  features: z.array(z.string().max(CHAR_LIMITS.feature)).max(10).optional(),
  
  // Flags
  isPopular: z.boolean().optional(),
  isExclusive: z.boolean().optional(),
  isActive: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
  
  // Stripe
  stripeProductId: z.string().optional().nullable(),
  stripePriceId: z.string().optional().nullable(),
  
  // Campus Integration
  campusCourseId: z.string().optional().nullable(),
  
  // Metadata
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
    textColor: '#000000',
    icon: 'Zap',
    subtitle: 'Finde dein MOJO (wieder)',
    description: 'Der perfekte Einstieg in deine Transformation. Lerne die Grundlagen der Regeneration und finde zurück zu deiner natürlichen Lebensenergie.',
    priceNet: 497,
    originalPrice: 997,
    billingType: 'ONE_TIME' as const,
    duration: '8 Wochen',
    modulesCount: 6,
    lessonsCount: 42,
    features: ['6 umfassende Module', '42+ Videolektionen', 'Workbooks & Checklisten', 'Community-Zugang', 'Live Q&A Sessions', 'Lebenslanger Zugang'],
    isPopular: false,
    isExclusive: false,
  },
  {
    userJourneyLevel: 2,
    name: 'CAMPUS',
    slug: 'campus',
    levelName: 'CAMPUS',
    levelColor: '#ffffff',
    textColor: '#000000',
    icon: 'Users',
    subtitle: 'Vernetze dich und optimiere',
    description: 'Werde Teil der exklusiven MOJO Community. Vertiefe dein Wissen, vernetze dich mit Gleichgesinnten und optimiere deine Regeneration auf dem nächsten Level.',
    priceNet: 997,
    originalPrice: 1997,
    billingType: 'ONE_TIME' as const,
    duration: '12 Wochen',
    modulesCount: 6,
    lessonsCount: 34,
    features: ['6 fortgeschrittene Module', '34+ Videolektionen', 'Mastermind-Gruppen', 'Exklusive Community', 'Monatliche Live-Calls', 'Biohacking-Toolkit'],
    isPopular: true,
    isExclusive: false,
  },
  {
    userJourneyLevel: 3,
    name: 'BUSINESS BOOTCAMP',
    slug: 'business-bootcamp',
    levelName: 'BUSINESS BOOTCAMP',
    levelColor: '#0d63bf',
    textColor: '#ffffff',
    icon: 'Briefcase',
    subtitle: 'Starte dein Gesundheitsbusiness',
    description: 'Transformiere dein Wissen in ein profitables Business. Das intensive Programm für angehende Gesundheits-Unternehmer.',
    priceNet: 2497,
    originalPrice: 4997,
    billingType: 'ONE_TIME' as const,
    duration: '10 Wochen',
    modulesCount: 6,
    lessonsCount: 42,
    features: ['6 Business-Module', '42+ Videolektionen', 'Business-Templates', 'Marketing-Playbook', 'Verkaufstraining', '1:1 Coaching-Session'],
    isPopular: false,
    isExclusive: false,
  },
  {
    userJourneyLevel: 4,
    name: 'RegenerationsmedizinOS',
    slug: 'regenerationsmedizin-os',
    levelName: 'RegenerationsmedizinOS',
    levelColor: '#873acf',
    textColor: '#ffffff',
    icon: 'Cpu',
    subtitle: 'Werde zum Experten',
    description: 'Das komplette Betriebssystem der Regenerationsmedizin. Für alle, die tiefgreifendes Expertenwissen aufbauen wollen.',
    priceNet: 4997,
    originalPrice: 9997,
    billingType: 'ONE_TIME' as const,
    duration: '16 Wochen',
    modulesCount: 6,
    lessonsCount: 66,
    features: ['6 Experten-Module', '66+ Videolektionen', 'Diagnostik-Protokolle', 'Interventions-Guides', 'Fallstudien-Bibliothek', 'Zertifizierung'],
    isPopular: false,
    isExclusive: false,
  },
  {
    userJourneyLevel: 5,
    name: 'Praxiszirkel',
    slug: 'praxiszirkel',
    levelName: 'Praxiszirkel',
    levelColor: '#f5bb00',
    textColor: '#000000',
    icon: 'Target',
    subtitle: 'Behandle unter Fachleuten',
    description: 'Der exklusive Zirkel für praktizierende Experten. Lernen Sie krankheitsspezifische Behandlungsstrategien von den Besten.',
    priceNet: 9997,
    originalPrice: 19997,
    billingType: 'SUBSCRIPTION' as const,
    billingInterval: 'MONTHLY' as const,
    duration: 'Fortlaufend',
    modulesCount: 6,
    lessonsCount: 45,
    features: ['6 Spezialisierungs-Module', '45+ Videolektionen', 'Live-Fallbesprechungen', 'Supervisions-Sessions', 'Protokoll-Entwicklung', 'Mentor-Programm'],
    isPopular: false,
    isExclusive: true,
  },
  {
    userJourneyLevel: 6,
    name: 'MOJO Inkubator',
    slug: 'mojo-inkubator',
    levelName: 'MOJO Inkubator',
    levelColor: '#000000',
    textColor: '#ffffff',
    icon: 'Building2',
    subtitle: 'Eröffne dein Institut',
    description: 'Der Gipfel der MOJO Journey. Werden Sie Franchisepartner und eröffnen Sie Ihr eigenes MOJO Institut.',
    priceNet: 0, // Preis auf Anfrage
    originalPrice: null,
    billingType: 'ONE_TIME' as const,
    duration: '6 Monate',
    modulesCount: 6,
    lessonsCount: 33,
    features: ['Komplettes Franchise-System', 'Standort-Analyse', 'Team-Aufbau Coaching', 'Marketing-Paket', 'Ongoing Support', 'Exklusives Territorium'],
    isPopular: false,
    isExclusive: true,
  },
];

// ==============================================
// Routes
// ==============================================

export default async function platformProductsRoutes(fastify: FastifyInstance) {
  
  // GET /api/platform-products - Liste aller Produkte
  fastify.get('/api/platform-products', async (request: FastifyRequest, _reply: FastifyReply) => {
    const { active } = request.query as { active?: string };
    
    const where: any = {};
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
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
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

  // GET /api/platform-products/:id - Einzelnes Produkt
  fastify.get('/api/platform-products/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    
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

  // GET /api/platform-products/by-level/:level - Nach Level
  fastify.get('/api/platform-products/by-level/:level', async (request: FastifyRequest, reply: FastifyReply) => {
    const { level } = request.params as { level: string };
    
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
          data: { 
            id: `default-${level}`, 
            ...defaultProduct, 
            currency: 'EUR', 
            isActive: true,
            sortOrder: parseInt(level, 10) - 1,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            entitlements: [] 
          },
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

  // POST /api/platform-products - Neues Produkt erstellen
  fastify.post('/api/platform-products', async (request: FastifyRequest, reply: FastifyReply) => {
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

  // PATCH /api/platform-products/:id - Produkt aktualisieren
  fastify.patch('/api/platform-products/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    const input = updateProductSchema.parse(request.body);
    
    const existing = await prisma.platformProduct.findUnique({ where: { id } });
    if (!existing) {
      return reply.status(404).send({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Platform product not found' },
      });
    }
    
    // Build update object with all supported fields
    const updateData: Record<string, any> = {};
    
    // Basic Info
    if (input.name !== undefined) updateData.name = input.name;
    if (input.subtitle !== undefined) updateData.subtitle = input.subtitle;
    if (input.description !== undefined) updateData.description = input.description;
    
    // Styling
    if (input.levelColor !== undefined) updateData.levelColor = input.levelColor;
    if (input.textColor !== undefined) updateData.textColor = input.textColor;
    if (input.icon !== undefined) updateData.icon = input.icon;
    
    // Pricing
    if (input.priceNet !== undefined) updateData.priceNet = input.priceNet;
    if (input.originalPrice !== undefined) updateData.originalPrice = input.originalPrice;
    if (input.billingType !== undefined) updateData.billingType = input.billingType;
    if (input.billingInterval !== undefined) updateData.billingInterval = input.billingInterval;
    
    // Course Content
    if (input.duration !== undefined) updateData.duration = input.duration;
    if (input.modulesCount !== undefined) updateData.modulesCount = input.modulesCount;
    if (input.lessonsCount !== undefined) updateData.lessonsCount = input.lessonsCount;
    if (input.features !== undefined) updateData.features = input.features;
    
    // Flags
    if (input.isPopular !== undefined) updateData.isPopular = input.isPopular;
    if (input.isExclusive !== undefined) updateData.isExclusive = input.isExclusive;
    if (input.isActive !== undefined) updateData.isActive = input.isActive;
    if (input.sortOrder !== undefined) updateData.sortOrder = input.sortOrder;
    
    // Stripe
    if (input.stripeProductId !== undefined) updateData.stripeProductId = input.stripeProductId;
    if (input.stripePriceId !== undefined) updateData.stripePriceId = input.stripePriceId;
    
    // Campus Integration
    if (input.campusCourseId !== undefined) updateData.campusCourseId = input.campusCourseId;
    
    // Metadata
    if (input.metadata !== undefined) updateData.metadata = input.metadata;
    
    const product = await prisma.platformProduct.update({
      where: { id },
      data: updateData,
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

  // POST /api/platform-products/:id/entitlements - Entitlement hinzufügen
  fastify.post('/api/platform-products/:id/entitlements', async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
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

  // DELETE /api/platform-products/:id/entitlements/:entitlementId - Entitlement entfernen
  fastify.delete('/api/platform-products/:id/entitlements/:entitlementId', async (request: FastifyRequest, reply: FastifyReply) => {
    const { id, entitlementId } = request.params as { id: string; entitlementId: string };
    
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

  // POST /api/platform-products/seed - Seed default products
  fastify.post('/api/platform-products/seed', async (request: FastifyRequest, reply: FastifyReply) => {
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

  // GET /api/platform-products/char-limits - Character limits for UI validation
  fastify.get('/api/platform-products/char-limits', async () => {
    return {
      success: true,
      data: CHAR_LIMITS,
    };
  });
}

