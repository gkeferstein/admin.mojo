/**
 * Entitlement Registry Service
 * Central registry for all available entitlements in the MOJO ecosystem
 *
 * This service maintains a list of all entitlements that can be assigned
 * to platform products. Only entitlements that are actually implemented
 * should be registered here.
 */
import { EntitlementDefinition, EntitlementCategory, ResourceType } from '../types/entitlement.js';
/**
 * Registry of all available entitlements
 * Only entitlements that are actually implemented should be registered
 */
declare class EntitlementRegistryService {
    private registry;
    constructor();
    /**
     * Initialize the registry with all available entitlements
     * Only register entitlements that are actually implemented
     */
    private initializeRegistry;
    /**
     * Register App Access Entitlements
     * These are entitlements that grant access to specific apps
     */
    private registerAppAccessEntitlements;
    /**
     * Register a single entitlement
     */
    private register;
    /**
     * Get all entitlements
     */
    getAll(): EntitlementDefinition[];
    /**
     * Get entitlements by category
     */
    getByCategory(category: EntitlementCategory): EntitlementDefinition[];
    /**
     * Get entitlements by resource type
     */
    getByResourceType(resourceType: ResourceType): EntitlementDefinition[];
    /**
     * Get a specific entitlement by ID
     */
    getById(id: string): EntitlementDefinition | undefined;
    /**
     * Check if an entitlement exists
     */
    exists(id: string): boolean;
    /**
     * Validate entitlement IDs
     * Returns array of invalid IDs
     */
    validateIds(ids: string[]): string[];
    /**
     * Get registry statistics
     */
    getStats(): {
        total: number;
        byCategory: {
            [k: string]: number;
        };
        byResourceType: {
            [k: string]: number;
        };
    };
}
export declare const entitlementRegistry: EntitlementRegistryService;
export {};
//# sourceMappingURL=entitlement-registry.d.ts.map