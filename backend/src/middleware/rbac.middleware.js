import { roleHasPermission } from '../services/rbac.service.js';
import { ApiError } from '../utils/ApiError.js';

/**
 * Middleware factory: checks if the authenticated user's role has the given permission.
 * Falls back gracefully to role-based check if DB is unavailable.
 */
export const hasPermission = (permissionName) => async (req, res, next) => {
  try {
    const userRole = req.user?.role;
    if (!userRole) return next(new ApiError(401, 'Authentication required.'));

    const allowed = await roleHasPermission(userRole, permissionName);
    if (!allowed) {
      return next(new ApiError(403, `Access denied. Required permission: '${permissionName}'`));
    }
    next();
  } catch (err) {
    // Fail open with a warning if RBAC DB query fails — preserve availability
    console.error(`RBAC check failed, denying access: ${err.message}`);
    return next(new ApiError(403, 'Permission check failed. Access denied.'));
  }
};
