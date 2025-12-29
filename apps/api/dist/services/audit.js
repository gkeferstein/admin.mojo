import prisma from '../lib/prisma.js';
/**
 * Logs an audit event to the database
 */
export async function logAudit(params) {
    try {
        // Extract user info from request if available
        let actorUserId;
        let actorEmail;
        let actorRole;
        let ipAddress;
        let userAgent;
        if (params.request) {
            // Get IP address
            ipAddress = params.request.ip ||
                params.request.headers['x-forwarded-for']?.split(',')[0]?.trim();
            userAgent = params.request.headers['user-agent'];
            // Get user info from Clerk JWT if available
            // @ts-ignore - Custom property from Clerk middleware
            const user = params.request.user;
            if (user) {
                actorUserId = user.id;
                actorEmail = user.email;
                actorRole = user.role;
            }
        }
        await prisma.auditLog.create({
            data: {
                action: params.action,
                resource: params.resource,
                resourceId: params.resourceId,
                actorUserId,
                actorEmail,
                actorRole,
                oldValue: params.oldValue ? JSON.parse(JSON.stringify(params.oldValue)) : undefined,
                newValue: params.newValue ? JSON.parse(JSON.stringify(params.newValue)) : undefined,
                metadata: params.metadata ? JSON.parse(JSON.stringify(params.metadata)) : undefined,
                ipAddress,
                userAgent,
            },
        });
    }
    catch (error) {
        // Don't throw - audit failures shouldn't break the main operation
        console.error('[Audit] Failed to log audit event:', error);
    }
}
/**
 * Query audit logs with filters
 */
export async function queryAuditLogs(params) {
    const where = {};
    if (params.resource) {
        where.resource = params.resource;
    }
    if (params.resourceId) {
        where.resourceId = params.resourceId;
    }
    if (params.actorUserId) {
        where.actorUserId = params.actorUserId;
    }
    if (params.action) {
        where.action = params.action;
    }
    if (params.fromDate || params.toDate) {
        where.createdAt = {};
        if (params.fromDate) {
            where.createdAt.gte = params.fromDate;
        }
        if (params.toDate) {
            where.createdAt.lte = params.toDate;
        }
    }
    const [logs, total] = await Promise.all([
        prisma.auditLog.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            take: params.limit || 50,
            skip: params.offset || 0,
        }),
        prisma.auditLog.count({ where }),
    ]);
    return { logs, total };
}
//# sourceMappingURL=audit.js.map