import { prisma } from '../utils/db.js';
import { cache } from '../utils/redis.js';
import { logger } from '../utils/logger.js';

const PERMISSION_CACHE_TTL = 300; // 5 minutes

// Default RBAC permission matrix
const DEFAULT_PERMISSIONS = [
  { name: 'trip:create', roles: ['ADMIN'] },
  { name: 'trip:edit', roles: ['ADMIN'] },
  { name: 'trip:delete', roles: ['ADMIN'] },
  { name: 'trip:view_all', roles: ['ADMIN', 'LEADER'] },
  { name: 'trip:update_location', roles: ['LEADER'] },
  { name: 'trip:view_attendees', roles: ['ADMIN', 'LEADER'] },
  { name: 'booking:view_all', roles: ['ADMIN'] },
  { name: 'booking:update_status', roles: ['ADMIN', 'LEADER'] },
  { name: 'booking:cancel', roles: ['ADMIN'] },
  { name: 'payment:view', roles: ['ADMIN'] },
  { name: 'review:delete', roles: ['ADMIN'] },
  { name: 'admin:view_stats', roles: ['ADMIN'] },
  { name: 'admin:view_audit', roles: ['ADMIN'] },
  { name: 'package:create', roles: ['ADMIN'] },
  { name: 'package:edit', roles: ['ADMIN'] },
  { name: 'package:delete', roles: ['ADMIN'] },
  { name: 'contact:view_all', roles: ['ADMIN'] },
  { name: 'newsletter:view_all', roles: ['ADMIN'] },
  { name: 'sos:trigger', roles: ['LEADER'] },
  { name: 'sos:resolve', roles: ['LEADER', 'ADMIN'] },
  { name: 'photos:upload', roles: ['LEADER'] },
];

/**
 * Seed permissions into DB on startup — idempotent (upsert)
 */
export const seedPermissions = async () => {
  try {
    for (const perm of DEFAULT_PERMISSIONS) {
      const permission = await prisma.permission.upsert({
        where: { name: perm.name },
        update: {},
        create: { name: perm.name, description: `Permission: ${perm.name}` },
      });

      for (const role of perm.roles) {
        await prisma.rolePermission.upsert({
          where: { role_permissionId: { role, permissionId: permission.id } },
          update: {},
          create: { role, permissionId: permission.id },
        });
      }
    }
    logger.info(`RBAC: Seeded ${DEFAULT_PERMISSIONS.length} permission definitions.`);
  } catch (err) {
    logger.error(`RBAC seed error: ${err.message}`);
  }
};

/**
 * Check if a role has a given permission (cache-first)
 */
export const roleHasPermission = async (role, permissionName) => {
  const cacheKey = `rbac:${role}:${permissionName}`;
  const cached = await cache.get(cacheKey);
  if (cached !== null) return cached === '1';

  const rolePermission = await prisma.rolePermission.findFirst({
    where: { role, permission: { name: permissionName } },
  });

  const hasIt = !!rolePermission;
  await cache.set(cacheKey, hasIt ? '1' : '0', PERMISSION_CACHE_TTL);
  return hasIt;
};

/**
 * Get all permissions for a given role (for documentation/UI)
 */
export const getPermissionsForRole = async (role) => {
  return prisma.rolePermission.findMany({
    where: { role },
    include: { permission: true },
  });
};
