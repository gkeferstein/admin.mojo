/**
 * Entitlement Registry Types
 * Defines the structure for entitlement definitions in the registry
 */
export var ResourceType;
(function (ResourceType) {
    ResourceType["COURSE"] = "course";
    ResourceType["MEMBERSHIP"] = "membership";
    ResourceType["BUNDLE"] = "bundle";
    ResourceType["SERVICE"] = "service";
    ResourceType["FEATURE"] = "feature";
    ResourceType["APP_ACCESS"] = "app_access";
})(ResourceType || (ResourceType = {}));
export var EntitlementCategory;
(function (EntitlementCategory) {
    EntitlementCategory["APP_ACCESS"] = "app_access";
    EntitlementCategory["FEATURE_FLAG"] = "feature_flag";
    EntitlementCategory["COURSE"] = "course";
    EntitlementCategory["PLATFORM_ROLE"] = "platform_role";
    EntitlementCategory["MEMBERSHIP"] = "membership";
    EntitlementCategory["SERVICE"] = "service";
})(EntitlementCategory || (EntitlementCategory = {}));
//# sourceMappingURL=entitlement.js.map