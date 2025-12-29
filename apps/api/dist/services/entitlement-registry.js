/**
 * Entitlement Registry Service
 * Central registry for all available entitlements in the MOJO ecosystem
 *
 * This service maintains a list of all entitlements that can be assigned
 * to platform products. Only entitlements that are actually implemented
 * should be registered here.
 */
import { logger } from '../lib/logger.js';
import { EntitlementCategory, ResourceType, } from '../types/entitlement.js';
/**
 * Registry of all available entitlements
 * Only entitlements that are actually implemented should be registered
 */
class EntitlementRegistryService {
    registry = {
        entitlements: new Map(),
        byCategory: new Map(),
        byResourceType: new Map(),
    };
    constructor() {
        this.initializeRegistry();
    }
    /**
     * Initialize the registry with all available entitlements
     * Only register entitlements that are actually implemented
     */
    initializeRegistry() {
        // Initialize category maps
        Object.values(EntitlementCategory).forEach((category) => {
            this.registry.byCategory.set(category, []);
        });
        // Initialize resource type maps
        Object.values(ResourceType).forEach((resourceType) => {
            this.registry.byResourceType.set(resourceType, []);
        });
        // Register all implemented entitlements
        this.registerAppAccessEntitlements();
        // Future: registerFeatureFlags(), registerCourses(), etc.
    }
    /**
     * Register App Access Entitlements
     * These are entitlements that grant access to specific apps
     */
    registerAppAccessEntitlements() {
        const appEntitlements = [
            {
                id: 'app:pos',
                resourceType: ResourceType.APP_ACCESS,
                category: EntitlementCategory.APP_ACCESS,
                name: 'POS Access',
                description: 'Zugriff auf das Kassensystem (Point of Sale) für Kartenzahlungen',
                navEntitlement: 'pos:access',
                isDynamic: false,
                metadata: {
                    app: 'pos.mojo',
                    implemented: true,
                },
            },
            {
                id: 'app:payments',
                resourceType: ResourceType.APP_ACCESS,
                category: EntitlementCategory.APP_ACCESS,
                name: 'Payments Admin',
                description: 'Admin-Zugriff auf den Payment Hub für Zahlungen und Abonnements',
                navEntitlement: 'payments:admin',
                isDynamic: false,
                metadata: {
                    app: 'payments.mojo',
                    implemented: true,
                },
            },
            {
                id: 'app:kontakte',
                resourceType: ResourceType.APP_ACCESS,
                category: EntitlementCategory.APP_ACCESS,
                name: 'Kontakte Admin',
                description: 'Admin-Zugriff auf die Kontaktverwaltung (CRM)',
                navEntitlement: 'kontakte:admin',
                isDynamic: false,
                metadata: {
                    app: 'kontakte.mojo',
                    implemented: true,
                },
            },
            {
                id: 'app:checkin',
                resourceType: ResourceType.APP_ACCESS,
                category: EntitlementCategory.APP_ACCESS,
                name: 'Check-in Access',
                description: 'Zugriff auf das Check-in System für 10er-Karten',
                navEntitlement: 'checkin:access',
                isDynamic: false,
                metadata: {
                    app: 'checkin.mojo',
                    implemented: true,
                },
            },
            {
                id: 'app:connect',
                resourceType: ResourceType.APP_ACCESS,
                category: EntitlementCategory.APP_ACCESS,
                name: 'Connect Admin',
                description: 'Admin-Zugriff auf Workflow Automation und Connect',
                navEntitlement: 'connect:admin',
                isDynamic: false,
                metadata: {
                    app: 'connect.mojo',
                    implemented: true,
                },
            },
            {
                id: 'app:mailer',
                resourceType: ResourceType.APP_ACCESS,
                category: EntitlementCategory.APP_ACCESS,
                name: 'Mailer Admin',
                description: 'Admin-Zugriff auf E-Mail Marketing und Mailserien',
                navEntitlement: 'mailer:admin',
                isDynamic: false,
                metadata: {
                    app: 'mailer.mojo',
                    implemented: true,
                },
            },
            {
                id: 'app:design',
                resourceType: ResourceType.APP_ACCESS,
                category: EntitlementCategory.APP_ACCESS,
                name: 'Design System Access',
                description: 'Zugriff auf das Design System und Developer-Dokumentation',
                navEntitlement: 'platform:developer',
                isDynamic: false,
                metadata: {
                    app: 'design.mojo',
                    implemented: true,
                },
            },
        ];
        appEntitlements.forEach((entitlement) => {
            this.register(entitlement);
        });
        logger.info('Registered app access entitlements', {
            count: appEntitlements.length,
        });
    }
    /**
     * Register a single entitlement
     */
    register(entitlement) {
        // Add to main registry
        this.registry.entitlements.set(entitlement.id, entitlement);
        // Add to category map
        const categoryList = this.registry.byCategory.get(entitlement.category);
        if (categoryList) {
            categoryList.push(entitlement);
        }
        // Add to resource type map
        const resourceTypeList = this.registry.byResourceType.get(entitlement.resourceType);
        if (resourceTypeList) {
            resourceTypeList.push(entitlement);
        }
    }
    /**
     * Get all entitlements
     */
    getAll() {
        return Array.from(this.registry.entitlements.values());
    }
    /**
     * Get entitlements by category
     */
    getByCategory(category) {
        return this.registry.byCategory.get(category) || [];
    }
    /**
     * Get entitlements by resource type
     */
    getByResourceType(resourceType) {
        return this.registry.byResourceType.get(resourceType) || [];
    }
    /**
     * Get a specific entitlement by ID
     */
    getById(id) {
        return this.registry.entitlements.get(id);
    }
    /**
     * Check if an entitlement exists
     */
    exists(id) {
        return this.registry.entitlements.has(id);
    }
    /**
     * Validate entitlement IDs
     * Returns array of invalid IDs
     */
    validateIds(ids) {
        return ids.filter((id) => !this.exists(id));
    }
    /**
     * Get registry statistics
     */
    getStats() {
        return {
            total: this.registry.entitlements.size,
            byCategory: Object.fromEntries(Array.from(this.registry.byCategory.entries()).map(([category, list]) => [
                category,
                list.length,
            ])),
            byResourceType: Object.fromEntries(Array.from(this.registry.byResourceType.entries()).map(([resourceType, list]) => [
                resourceType,
                list.length,
            ])),
        };
    }
}
// Export singleton instance
export const entitlementRegistry = new EntitlementRegistryService();
//# sourceMappingURL=entitlement-registry.js.map