import { prisma } from '../utils/db.js';
import { auditLogger } from '../utils/logger.js';

/**
 * Records an audit log entry for sensitive operations.
 * @param {object} options
 * @param {number|null} options.userId - Who performed the action
 * @param {string} options.action - Action name (e.g., 'BOOKING_CONFIRMED')
 * @param {string} options.entity - Model/resource affected (e.g., 'Booking')
 * @param {string|null} options.entityId - ID of the affected record
 * @param {object|null} options.oldValue - Previous state (before update)
 * @param {object|null} options.newValue - New state (after update)
 * @param {string|null} options.ipAddress - Request IP
 * @param {string|null} options.userAgent - Request user agent
 */
export const logAction = async ({
  userId = null,
  action,
  entity,
  entityId = null,
  oldValue = null,
  newValue = null,
  ipAddress = null,
  userAgent = null,
}) => {
  try {
    await prisma.auditLog.create({
      data: {
        userId,
        action,
        entity,
        entityId: entityId ? String(entityId) : null,
        oldValue,
        newValue,
        ipAddress,
        userAgent,
      },
    });

    auditLogger.info(`AUDIT | ${action} on ${entity}:${entityId} by user:${userId}`, {
      action, entity, entityId, userId, ipAddress,
    });
  } catch (err) {
    auditLogger.error(`Failed to write audit log: ${err.message}`, { action, entity, entityId });
  }
};

export const getAuditLogs = async ({ entity, entityId, userId, limit = 50, offset = 0 } = {}) => {
  const where = {};
  if (entity) where.entity = entity;
  if (entityId) where.entityId = String(entityId);
  if (userId) where.userId = parseInt(userId);

  return prisma.auditLog.findMany({
    where,
    include: { user: { select: { name: true, email: true } } },
    orderBy: { createdAt: 'desc' },
    take: limit,
    skip: offset,
  });
};
