import { z } from 'zod';
import { createHash } from 'crypto';
import prisma from '../lib/prisma.js';
import { logAudit } from '../services/audit.js';
// ==============================================
// Contract Templates
// ==============================================
const CONTRACT_TEMPLATES = {
    REGIONAL_DISTRIBUTOR: {
        version: '1.0',
        title: 'Regionaler Distributionsvertrag - MOJO LLC',
        sections: [
            {
                id: 'intro',
                title: 'Präambel',
                content: `Dieser Vertrag regelt die exklusiven Vertriebsrechte und Provisionszahlungen zwischen 
der MOJO LLC (im Folgenden "Platform Owner") und dem Regionalen Distributor (im Folgenden "Distributor").`,
            },
            {
                id: 'exclusive_rights',
                title: '1. Exklusive Vertriebsrechte',
                content: `Der Distributor erhält das exklusive Recht, die 6 MOJO Basis-Produkte (User Journey Levels) 
in der zugewiesenen Region zu vertreiben. Eine Liste der betroffenen Länder (ISO-Codes) ist Anhang A 
dieses Vertrages zu entnehmen.`,
            },
            {
                id: 'commissions',
                title: '2. Provisionen',
                content: `Für jeden erfolgreichen Verkauf eines Platform-Produkts an einen Kunden mit 
Rechnungsadresse in der zugewiesenen Region erhält der Distributor eine Provision von 30% des 
Netto-Verkaufspreises. Diese Provision wird vom Platform Owner gezahlt.`,
            },
            {
                id: 'affiliate',
                title: '3. Affiliate-Provisionen',
                content: `Sollte der Distributor selbst als Affiliate einen Kunden für ein Platform-Produkt 
in seiner Region werben, so ist die maximale Provision auf 30% gedeckelt. Es erfolgt keine 
zusätzliche Affiliate-Provision. Für Cross-Tenant-Empfehlungen gelten die allgemeinen 
Affiliate-Regelungen.`,
            },
            {
                id: 'payment',
                title: '4. Zahlungsbedingungen',
                content: `Provisionen werden 30 Tage nach dem Kauf monatlich ausgezahlt, sofern ein 
Mindestbetrag von 50€ erreicht wurde. Die Auszahlung erfolgt über Stripe Connect. Bei Refunds 
werden Provisionen zurückgebucht.`,
            },
            {
                id: 'own_products',
                title: '5. Eigene Produkte des Distributors',
                content: `Der Distributor ist berechtigt, eigene Produkte über das MOJO Ökosystem zu verkaufen. 
Für diese Verkäufe erhält der Platform Owner 2% über Stripe Connect. Regionale Exklusivprovisionen 
gelten hierfür nicht.`,
            },
            {
                id: 'duration',
                title: '6. Laufzeit und Kündigung',
                content: `Dieser Vertrag hat eine unbefristete Laufzeit, kann jedoch von beiden Parteien 
mit einer Frist von 3 Monaten zum Ende eines Kalenderquartals schriftlich gekündigt werden.`,
            },
            {
                id: 'confidentiality',
                title: '7. Vertraulichkeit',
                content: `Beide Parteien verpflichten sich zur Vertraulichkeit über die Bedingungen dieses Vertrages.`,
            },
            {
                id: 'law',
                title: '8. Anwendbares Recht',
                content: `Es gilt das Recht des Bundesstaates Delaware, USA. Gerichtsstand ist Wilmington, Delaware.`,
            },
        ],
    },
    TENANT_AFFILIATE: {
        version: '1.0',
        title: 'Tenant- & Affiliate-Vertrag - MOJO LLC',
        sections: [
            {
                id: 'intro',
                title: 'Präambel',
                content: `Dieser Vertrag regelt die Nutzung des MOJO Ökosystems als Tenant und Affiliate 
zwischen der MOJO LLC (im Folgenden "Platform Owner") und dem Tenant/Affiliate (im Folgenden "Partner").`,
            },
            {
                id: 'own_products',
                title: '1. Eigene Produkte des Partners',
                content: `Der Partner ist berechtigt, eigene Produkte über das MOJO Ökosystem zu verkaufen. 
Für diese Verkäufe erhält der Platform Owner 2% des Netto-Verkaufspreises über Stripe Connect.`,
            },
            {
                id: 'affiliate',
                title: '2. Affiliate-Provisionen',
                content: `a) Für den ersten Kauf eines über den Partner-Affiliate-Code geworbenen Neukunden 
im MOJO Ökosystem erhält der Partner 20% des Netto-Verkaufspreises vom Verkäufer.

b) Für jeden weiteren Kauf desselben Kunden innerhalb von 3 Jahren ab dem ersten Konto-Eintritt 
erhält der Partner 10% des Netto-Verkaufspreises vom Verkäufer.

c) Die Attribution erfolgt nach dem "First Click Wins"-Prinzip und ist für 3 Jahre ab 
Kontoerstellung des Kunden fixiert.`,
            },
            {
                id: 'payment',
                title: '3. Zahlungsbedingungen',
                content: `Provisionen werden 30 Tage nach dem Kauf monatlich ausgezahlt, sofern ein 
Mindestbetrag von 50€ erreicht wurde. Die Auszahlung erfolgt über Stripe Connect. Bei Refunds 
werden Provisionen zurückgebucht.`,
            },
            {
                id: 'duration',
                title: '4. Laufzeit und Kündigung',
                content: `Dieser Vertrag hat eine unbefristete Laufzeit, kann jedoch von beiden Parteien 
mit einer Frist von 30 Tagen schriftlich gekündigt werden.`,
            },
            {
                id: 'confidentiality',
                title: '5. Vertraulichkeit',
                content: `Beide Parteien verpflichten sich zur Vertraulichkeit über die Bedingungen dieses Vertrages.`,
            },
            {
                id: 'law',
                title: '6. Anwendbares Recht',
                content: `Es gilt das Recht des Bundesstaates Delaware, USA. Gerichtsstand ist Wilmington, Delaware.`,
            },
        ],
    },
};
// ==============================================
// Validation Schemas
// ==============================================
const signContractSchema = z.object({
    contractType: z.enum(['REGIONAL_DISTRIBUTOR', 'TENANT_AFFILIATE']),
    tenantId: z.string(),
    tenantName: z.string().optional(),
    signerUserId: z.string(),
    signerName: z.string().min(3),
    signerEmail: z.string().email(),
    signatureText: z.string().min(3), // Typed name as signature
    additionalData: z.record(z.any()).optional(), // For region codes etc.
});
// ==============================================
// Helper Functions
// ==============================================
function generateContractHash(contractType, version, additionalData) {
    const template = CONTRACT_TEMPLATES[contractType];
    const content = JSON.stringify({
        type: contractType,
        version,
        sections: template.sections,
        additionalData,
    });
    return createHash('sha256').update(content).digest('hex');
}
function renderContract(contractType, variables = {}) {
    const template = CONTRACT_TEMPLATES[contractType];
    if (!template) {
        throw new Error(`Unknown contract type: ${contractType}`);
    }
    let content = `# ${template.title}\n\nVersion: ${template.version}\n\n`;
    for (const section of template.sections) {
        content += `## ${section.title}\n\n`;
        let sectionContent = section.content;
        // Replace variables
        for (const [key, value] of Object.entries(variables)) {
            sectionContent = sectionContent.replace(new RegExp(`\\{${key}\\}`, 'g'), value);
        }
        content += sectionContent + '\n\n';
    }
    return content;
}
// ==============================================
// Routes
// ==============================================
export default async function contractsRoutes(fastify) {
    // GET /api/v1/contracts/templates - Verfügbare Vertragsvorlagen
    fastify.get('/api/v1/contracts/templates', async (request, reply) => {
        return {
            success: true,
            data: Object.entries(CONTRACT_TEMPLATES).map(([type, template]) => ({
                type,
                title: template.title,
                version: template.version,
                sectionCount: template.sections.length,
            })),
        };
    });
    // GET /api/v1/contracts/templates/:type - Einzelne Vorlage
    fastify.get('/api/v1/contracts/templates/:type', async (request, reply) => {
        const { type } = request.params;
        const template = CONTRACT_TEMPLATES[type];
        if (!template) {
            return reply.status(404).send({
                success: false,
                error: { code: 'NOT_FOUND', message: 'Contract template not found' },
            });
        }
        return {
            success: true,
            data: {
                type,
                ...template,
            },
        };
    });
    // GET /api/v1/contracts/render/:type - Vertrag rendern (Preview)
    fastify.get('/api/v1/contracts/render/:type', async (request, reply) => {
        const { type } = request.params;
        const variables = request.query;
        try {
            const content = renderContract(type, variables);
            return {
                success: true,
                data: {
                    type,
                    content,
                    hash: generateContractHash(type, CONTRACT_TEMPLATES[type].version),
                },
            };
        }
        catch (error) {
            return reply.status(400).send({
                success: false,
                error: { code: 'RENDER_ERROR', message: error.message },
            });
        }
    });
    // POST /api/v1/contracts/sign - Vertrag unterzeichnen
    fastify.post('/api/v1/contracts/sign', async (request, reply) => {
        const input = signContractSchema.parse(request.body);
        const template = CONTRACT_TEMPLATES[input.contractType];
        if (!template) {
            return reply.status(400).send({
                success: false,
                error: { code: 'INVALID_TYPE', message: 'Invalid contract type' },
            });
        }
        // Check if tenant already signed this contract type
        const existing = await prisma.contractSignature.findFirst({
            where: {
                tenantId: input.tenantId,
                contractType: input.contractType,
            },
        });
        if (existing) {
            return reply.status(409).send({
                success: false,
                error: {
                    code: 'ALREADY_SIGNED',
                    message: 'This contract type has already been signed by this tenant',
                    details: {
                        signedAt: existing.signedAt,
                        signedBy: existing.signerName,
                        version: existing.contractVersion,
                    },
                },
            });
        }
        // Generate contract hash for integrity
        const contractHash = generateContractHash(input.contractType, template.version, input.additionalData);
        // Get IP and user agent
        const ipAddress = request.ip ||
            request.headers['x-forwarded-for']?.split(',')[0]?.trim();
        const userAgent = request.headers['user-agent'];
        // Create signature
        const signature = await prisma.contractSignature.create({
            data: {
                contractType: input.contractType,
                contractVersion: template.version,
                tenantId: input.tenantId,
                tenantName: input.tenantName,
                signerUserId: input.signerUserId,
                signerName: input.signerName,
                signerEmail: input.signerEmail,
                signatureText: input.signatureText,
                contractHash,
                ipAddress,
                userAgent,
                metadata: input.additionalData,
            },
        });
        // If this is a regional distributor contract, activate the agreement
        if (input.contractType === 'REGIONAL_DISTRIBUTOR' && input.additionalData?.agreementId) {
            await prisma.regionalAgreement.update({
                where: { id: input.additionalData.agreementId },
                data: {
                    contractSignedAt: signature.signedAt,
                    contractSignedBy: signature.signerName,
                    contractVersion: signature.contractVersion,
                    status: 'ACTIVE',
                },
            });
        }
        await logAudit({
            action: 'sign',
            resource: 'contract',
            resourceId: signature.id,
            newValue: {
                contractType: input.contractType,
                tenantId: input.tenantId,
                signedAt: signature.signedAt,
            },
            request,
        });
        return reply.status(201).send({
            success: true,
            data: signature,
            message: 'Contract signed successfully',
        });
    });
    // GET /api/v1/contracts/signatures - Liste aller Signaturen
    fastify.get('/api/v1/contracts/signatures', async (request, reply) => {
        const { tenantId, contractType, limit = '50', offset = '0' } = request.query;
        const where = {};
        if (tenantId) {
            where.tenantId = tenantId;
        }
        if (contractType) {
            where.contractType = contractType;
        }
        const [signatures, total] = await Promise.all([
            prisma.contractSignature.findMany({
                where,
                orderBy: { signedAt: 'desc' },
                take: parseInt(limit),
                skip: parseInt(offset),
            }),
            prisma.contractSignature.count({ where }),
        ]);
        return {
            success: true,
            data: signatures,
            meta: { total, limit: parseInt(limit), offset: parseInt(offset) },
        };
    });
    // GET /api/v1/contracts/signatures/:id - Einzelne Signatur
    fastify.get('/api/v1/contracts/signatures/:id', async (request, reply) => {
        const { id } = request.params;
        const signature = await prisma.contractSignature.findUnique({
            where: { id },
        });
        if (!signature) {
            return reply.status(404).send({
                success: false,
                error: { code: 'NOT_FOUND', message: 'Signature not found' },
            });
        }
        return { success: true, data: signature };
    });
    // GET /api/v1/contracts/verify/:tenantId/:type - Vertragsstatus prüfen
    fastify.get('/api/v1/contracts/verify/:tenantId/:type', async (request, reply) => {
        const { tenantId, type } = request.params;
        const signature = await prisma.contractSignature.findFirst({
            where: {
                tenantId,
                contractType: type,
            },
            orderBy: { signedAt: 'desc' },
        });
        if (!signature) {
            return {
                success: true,
                verified: false,
                hasSignature: false,
            };
        }
        // Verify contract hash hasn't changed
        const template = CONTRACT_TEMPLATES[type];
        const currentHash = generateContractHash(type, template.version, signature.metadata);
        const hashValid = signature.contractHash === currentHash;
        return {
            success: true,
            verified: hashValid,
            hasSignature: true,
            signature: {
                id: signature.id,
                signedAt: signature.signedAt,
                signerName: signature.signerName,
                version: signature.contractVersion,
            },
            currentVersion: template.version,
            needsResign: !hashValid || signature.contractVersion !== template.version,
        };
    });
}
//# sourceMappingURL=contracts.js.map