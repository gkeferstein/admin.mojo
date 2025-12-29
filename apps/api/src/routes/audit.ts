import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { queryAuditLogs } from '../services/audit.js';

// ==============================================
// Validation Schemas
// ==============================================

const querySchema = z.object({
  resource: z.string().optional(),
  resourceId: z.string().optional(),
  actorUserId: z.string().optional(),
  action: z.string().optional(),
  fromDate: z.string().optional(),
  toDate: z.string().optional(),
  limit: z.string().transform(Number).default('50'),
  offset: z.string().transform(Number).default('0'),
});

// ==============================================
// Routes
// ==============================================

export default async function auditRoutes(fastify: FastifyInstance) {
  
  // GET /api/v1/audit - Audit Logs abfragen
  fastify.get('/api/v1/audit', async (request: FastifyRequest, reply: FastifyReply) => {
    const query = querySchema.parse(request.query);
    
    const { logs, total } = await queryAuditLogs({
      resource: query.resource,
      resourceId: query.resourceId,
      actorUserId: query.actorUserId,
      action: query.action,
      fromDate: query.fromDate ? new Date(query.fromDate) : undefined,
      toDate: query.toDate ? new Date(query.toDate) : undefined,
      limit: query.limit,
      offset: query.offset,
    });
    
    return {
      success: true,
      data: logs,
      meta: {
        total,
        limit: query.limit,
        offset: query.offset,
        hasMore: query.offset + logs.length < total,
      },
    };
  });

  // GET /api/v1/audit/resources - Verfügbare Ressourcen
  fastify.get('/api/v1/audit/resources', async (request: FastifyRequest, reply: FastifyReply) => {
    return {
      success: true,
      data: [
        { resource: 'regional_agreement', description: 'Regionale Exklusivverträge' },
        { resource: 'platform_product', description: 'Platform-Produkte (6 Levels)' },
        { resource: 'customer_attribution', description: 'Kunden-Affiliate-Zuordnung' },
        { resource: 'commission', description: 'Provisionsbuchungen' },
        { resource: 'payout', description: 'Auszahlungen' },
        { resource: 'contract', description: 'Vertragsunterzeichnungen' },
      ],
    };
  });

  // GET /api/v1/audit/actions - Verfügbare Aktionen
  fastify.get('/api/v1/audit/actions', async (request: FastifyRequest, reply: FastifyReply) => {
    return {
      success: true,
      data: [
        { action: 'create', description: 'Erstellen' },
        { action: 'update', description: 'Aktualisieren' },
        { action: 'delete', description: 'Löschen' },
        { action: 'sign', description: 'Vertrag unterzeichnen' },
        { action: 'sign_contract', description: 'Vertrag aktivieren' },
        { action: 'terminate', description: 'Beenden' },
        { action: 'process_order', description: 'Order verarbeiten' },
        { action: 'refund', description: 'Stornieren' },
        { action: 'approve_batch', description: 'Batch-Genehmigung' },
        { action: 'process', description: 'Auszahlung verarbeiten' },
        { action: 'complete', description: 'Abschließen' },
        { action: 'fail', description: 'Fehlgeschlagen markieren' },
        { action: 'seed', description: 'Seed-Daten erstellen' },
        { action: 'add_entitlement', description: 'Entitlement hinzufügen' },
        { action: 'remove_entitlement', description: 'Entitlement entfernen' },
      ],
    };
  });
}

