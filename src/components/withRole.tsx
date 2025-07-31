import React from "react";
import { useAuthStore, Permission, Resource, Action } from "../store/AuthStore";

interface WithRoleProps {
  children: React.ReactNode;
  permission?: Permission;
  resource?: Resource;
  action?: Action;
  fallback?: React.ReactNode;
  mode?: "hide" | "disable" | "show-fallback";
  className?: string;
}

/**
 * Higher-Order Component for role-based access control
 *
 * @param permission - Specific permission to check
 * @param resource - Resource name (users, products, etc.)
 * @param action - Action type (create, read, update, delete, manage)
 * @param fallback - Component to show when access is denied
 * @param mode - How to handle unauthorized access:
 *   - 'hide': Don't render anything (default)
 *   - 'disable': Render but disable interaction
 *   - 'show-fallback': Show fallback component
 */
export function WithRole({
  children,
  permission,
  resource,
  action,
  fallback = null,
  mode = "hide",
  className,
}: WithRoleProps) {
  const { hasPermission, canAccess, isAuthenticated } = useAuthStore();

  // If not authenticated, hide by default
  if (!isAuthenticated) {
    return mode === "show-fallback" ? <>{fallback}</> : null;
  }

  let hasAccess = false;

  // Check permission directly if provided
  if (permission) {
    hasAccess = hasPermission(permission);
  }
  // Check resource + action combination
  else if (resource && action) {
    hasAccess = canAccess(resource, action);
  }
  // If neither permission nor resource+action provided, allow access
  else {
    hasAccess = true;
  }

  // Handle different modes based on access
  if (!hasAccess) {
    switch (mode) {
      case "hide":
        return null;
      case "show-fallback":
        return <>{fallback}</>;
      case "disable":
        return (
          <div className={`opacity-50 pointer-events-none ${className || ""}`}>
            {children}
          </div>
        );
      default:
        return null;
    }
  }

  return <div className={className}>{children}</div>;
}

/**
 * Hook version for conditional rendering in components
 */
export function useRoleAccess(
  permission?: Permission,
  resource?: Resource,
  action?: Action,
): boolean {
  const { hasPermission, canAccess, isAuthenticated } = useAuthStore();

  if (!isAuthenticated) return false;

  if (permission) {
    return hasPermission(permission);
  }

  if (resource && action) {
    return canAccess(resource, action);
  }

  return true;
}

/**
 * Component wrapper for easier usage
 */
interface RoleGuardProps extends WithRoleProps {}

export function RoleGuard(props: RoleGuardProps) {
  return <WithRole {...props} />;
}

/**
 * Button component with built-in role checking
 */
interface RoleButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  permission?: Permission;
  resource?: Resource;
  action?: Action;
  children: React.ReactNode;
}

export function RoleButton({
  permission,
  resource,
  action,
  children,
  disabled,
  ...props
}: RoleButtonProps) {
  const hasAccess = useRoleAccess(permission, resource, action);

  return (
    <button
      {...props}
      disabled={disabled || !hasAccess}
      className={`${props.className || ""} ${
        !hasAccess ? "opacity-50 cursor-not-allowed" : ""
      }`}
    >
      {children}
    </button>
  );
}

/**
 * Link component with built-in role checking
 */
interface RoleLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  permission?: Permission;
  resource?: Resource;
  action?: Action;
  children: React.ReactNode;
  to?: string;
}

export function RoleLink({
  permission,
  resource,
  action,
  children,
  to,
  ...props
}: RoleLinkProps) {
  const hasAccess = useRoleAccess(permission, resource, action);

  if (!hasAccess) {
    return (
      <span className="opacity-50 cursor-not-allowed text-gray-400">
        {children}
      </span>
    );
  }

  return (
    <a {...props} href={to}>
      {children}
    </a>
  );
}

export default WithRole;
