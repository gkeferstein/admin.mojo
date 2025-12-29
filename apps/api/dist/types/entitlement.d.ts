/**
 * Entitlement Registry Types
 * Defines the structure for entitlement definitions in the registry
 */
export declare enum ResourceType {
    COURSE = "course",
    MEMBERSHIP = "membership",
    BUNDLE = "bundle",
    SERVICE = "service",
    FEATURE = "feature",
    APP_ACCESS = "app_access"
}
export declare enum EntitlementCategory {
    APP_ACCESS = "app_access",
    FEATURE_FLAG = "feature_flag",
    COURSE = "course",
    PLATFORM_ROLE = "platform_role",
    MEMBERSHIP = "membership",
    SERVICE = "service"
}
/**
 * Entitlement Definition
 * Represents a single entitlement that can be granted to users
 */
export interface EntitlementDefinition {
    /** Unique identifier for the entitlement (e.g., "app:pos", "campus:multitenancy") */
    id: string;
    /** Type of resource this entitlement grants access to */
    resourceType: ResourceType;
    /** Category for grouping entitlements in UI */
    category: EntitlementCategory;
    /** Human-readable name */
    name: string;
    /** Description of what this entitlement grants */
    description: string;
    /** Navigation entitlement string (used in Clerk JWT, e.g., "pos:access") */
    navEntitlement?: string;
    /** Whether this entitlement is dynamically loaded from external source */
    isDynamic: boolean;
    /** Source for dynamic entitlements (e.g., "campus" for courses) */
    source?: 'campus' | 'manual';
    /** Additional metadata */
    metadata?: {
        /** App this entitlement relates to (e.g., "pos.mojo") */
        app?: string;
        /** Required entitlements that must be granted first */
        requires?: string[];
        /** Icon identifier */
        icon?: string;
        /** Whether this is currently implemented/available */
        implemented?: boolean;
    };
}
/**
 * Entitlement Registry
 * Collection of all available entitlements in the system
 */
export interface EntitlementRegistry {
    /** All entitlements indexed by ID */
    entitlements: Map<string, EntitlementDefinition>;
    /** Entitlements grouped by category */
    byCategory: Map<EntitlementCategory, EntitlementDefinition[]>;
    /** Entitlements grouped by resource type */
    byResourceType: Map<ResourceType, EntitlementDefinition[]>;
}
//# sourceMappingURL=entitlement.d.ts.map