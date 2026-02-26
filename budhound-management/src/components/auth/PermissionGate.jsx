import { useAuth } from '../../contexts/AuthContext';

/**
 * Conditionally renders children based on permission.
 *
 * Usage:
 *   <PermissionGate permission="manage product pricing">
 *     <PriceEditButton />
 *   </PermissionGate>
 *
 *   <PermissionGate permission="process refunds" fallback={<span>Contact manager</span>}>
 *     <RefundButton />
 *   </PermissionGate>
 */
export default function PermissionGate({ children, permission, roles, fallback = null }) {
  const { hasPermission, hasAnyRole } = useAuth();

  if (permission && !hasPermission(permission)) return fallback;
  if (roles && !hasAnyRole(roles)) return fallback;

  return children;
}
