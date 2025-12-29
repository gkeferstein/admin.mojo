/**
 * Entitlement Registry Routes
 * API endpoints for querying available entitlements
 */
import { z } from 'zod';
import { entitlementRegistry } from '../services/entitlement-registry.js';
import { EntitlementCategory, ResourceType } from '../types/entitlement.js';
export default async function entitlementRegistryRoutes(fastify) {
    // GET /api/v1/entitlement-registry - Get all entitlements
    fastify.get('/api/v1/entitlement-registry', async (request, _reply) => {
        const entitlements = entitlementRegistry.getAll();
        return {
            success: true,
            data: entitlements,
            meta: {
                total: entitlements.length,
            },
        };
    });
    // GET /api/v1/entitlement-registry/stats - Get registry statistics
    fastify.get('/api/v1/entitlement-registry/stats', async (request, _reply) => {
        const stats = entitlementRegistry.getStats();
        return {
            success: true,
            data: stats,
        };
    });
    // GET /api/v1/entitlement-registry/by-category/:category - Get entitlements by category
    fastify.get('/api/v1/entitlement-registry/by-category/:category', async (request, reply) => {
        const { category } = request.params;
        // Validate category
        if (!Object.values(EntitlementCategory).includes(category)) {
            return reply.status(400).send({
                success: false,
                error: {
                    code: 'INVALID_CATEGORY',
                    message: `Invalid category. Must be one of: ${Object.values(EntitlementCategory).join(', ')}`,
                },
            });
        }
        const entitlements = entitlementRegistry.getByCategory(category);
        return {
            success: true,
            data: entitlements,
            meta: {
                category,
                total: entitlements.length,
            },
        };
    });
    // GET /api/v1/entitlement-registry/by-resource-type/:resourceType - Get entitlements by resource type
    fastify.get('/api/v1/entitlement-registry/by-resource-type/:resourceType', async (request, reply) => {
        const { resourceType } = request.params;
        // Validate resource type
        if (!Object.values(ResourceType).includes(resourceType)) {
            return reply.status(400).send({
                success: false,
                error: {
                    code: 'INVALID_RESOURCE_TYPE',
                    message: `Invalid resource type. Must be one of: ${Object.values(ResourceType).join(', ')}`,
                },
            });
        }
        const entitlements = entitlementRegistry.getByResourceType(resourceType);
        return {
            success: true,
            data: entitlements,
            meta: {
                resourceType,
                total: entitlements.length,
            },
        };
    });
    // GET /api/v1/entitlement-registry/:id - Get specific entitlement
    fastify.get('/api/v1/entitlement-registry/:id', async (request, reply) => {
        const { id } = request.params;
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
    // POST /api/v1/entitlement-registry/validate - Validate entitlement IDs
    fastify.post('/api/v1/entitlement-registry/validate', async (request, _reply) => {
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
//# sourceMappingURL=entitlement-registry.js.map