/**
 * Entitlement Registry Routes
 * API endpoints for querying available entitlements
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { entitlementRegistry } from '../services/entitlement-registry.js';
import { EntitlementCategory, ResourceType } from '../types/entitlement.js';

export default async function entitlementRegistryRoutes(fastify: FastifyInstance) {
  
  // GET /api/entitlement-registry - Get all entitlements
  fastify.get('/api/entitlement-registry', async (request: FastifyRequest, _reply: FastifyReply) => {
    const entitlements = entitlementRegistry.getAll();
    
    return {
      success: true,
      data: entitlements,
      meta: {
        total: entitlements.length,
      },
    };
  });

  // GET /api/entitlement-registry/stats - Get registry statistics
  fastify.get('/api/entitlement-registry/stats', async (request: FastifyRequest, _reply: FastifyReply) => {
    const stats = entitlementRegistry.getStats();
    
    return {
      success: true,
      data: stats,
    };
  });

  // GET /api/entitlement-registry/by-category/:category - Get entitlements by category
  fastify.get('/api/entitlement-registry/by-category/:category', async (request: FastifyRequest, reply: FastifyReply) => {
    const { category } = request.params as { category: string };
    
    // Validate category
    if (!Object.values(EntitlementCategory).includes(category as EntitlementCategory)) {
      return reply.status(400).send({
        success: false,
        error: {
          code: 'INVALID_CATEGORY',
          message: `Invalid category. Must be one of: ${Object.values(EntitlementCategory).join(', ')}`,
        },
      });
    }
    
    const entitlements = entitlementRegistry.getByCategory(category as EntitlementCategory);
    
    return {
      success: true,
      data: entitlements,
      meta: {
        category,
        total: entitlements.length,
      },
    };
  });

  // GET /api/entitlement-registry/by-resource-type/:resourceType - Get entitlements by resource type
  fastify.get('/api/entitlement-registry/by-resource-type/:resourceType', async (request: FastifyRequest, reply: FastifyReply) => {
    const { resourceType } = request.params as { resourceType: string };
    
    // Validate resource type
    if (!Object.values(ResourceType).includes(resourceType as ResourceType)) {
      return reply.status(400).send({
        success: false,
        error: {
          code: 'INVALID_RESOURCE_TYPE',
          message: `Invalid resource type. Must be one of: ${Object.values(ResourceType).join(', ')}`,
        },
      });
    }
    
    const entitlements = entitlementRegistry.getByResourceType(resourceType as ResourceType);
    
    return {
      success: true,
      data: entitlements,
      meta: {
        resourceType,
        total: entitlements.length,
      },
    };
  });

  // GET /api/entitlement-registry/:id - Get specific entitlement
  fastify.get('/api/entitlement-registry/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    
    const entitlement = entitlementRegistry.getById(id);
    
    if (!entitlement) {
      return reply.status(404).send({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: `Entitlement with id "${id}" not found`,
        },
      });
    }
    
    return {
      success: true,
      data: entitlement,
    };
  });

  // POST /api/entitlement-registry/validate - Validate entitlement IDs
  fastify.post('/api/entitlement-registry/validate', async (request: FastifyRequest, _reply: FastifyReply) => {
    const schema = z.object({
      ids: z.array(z.string()).min(1),
    });
    
    const { ids } = schema.parse(request.body);
    
    const invalidIds = entitlementRegistry.validateIds(ids);
    const validIds = ids.filter((id) => !invalidIds.includes(id));
    
    return {
      success: true,
      data: {
        valid: validIds,
        invalid: invalidIds,
        allValid: invalidIds.length === 0,
      },
    };
  });
}




