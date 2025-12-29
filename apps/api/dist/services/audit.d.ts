import { FastifyRequest } from 'fastify';
export interface AuditParams {
    action: string;
    resource: string;
    resourceId?: string;
    oldValue?: any;
    newValue?: any;
    metadata?: Record<string, any>;
    request?: FastifyRequest;
}
/**
 * Logs an audit event to the database
 */
export declare function logAudit(params: AuditParams): Promise<void>;
/**
 * Query audit logs with filters
 */
export declare function queryAuditLogs(params: {
    resource?: string;
    resourceId?: string;
    actorUserId?: string;
    action?: string;
    fromDate?: Date;
    toDate?: Date;
    limit?: number;
    offset?: number;
}): Promise<{
    logs: {
        id: string;
        actorUserId: string | null;
        actorEmail: string | null;
        actorRole: string | null;
        action: string;
        resource: string;
        resourceId: string | null;
        oldValue: import("@prisma/client/runtime/library").JsonValue | null;
        newValue: import("@prisma/client/runtime/library").JsonValue | null;
        metadata: import("@prisma/client/runtime/library").JsonValue | null;
        ipAddress: string | null;
        userAgent: string | null;
        createdAt: Date;
    }[];
    total: number;
}>;
//# sourceMappingURL=audit.d.ts.map