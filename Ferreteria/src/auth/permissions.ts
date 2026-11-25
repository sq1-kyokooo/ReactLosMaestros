import { jwtDecode } from 'jwt-decode';

export const Permission = {
  manageProducts: 'manage:products',
  manageUsers: 'manage:users',
  writePayments: 'write:payments',
  writeContractorPayments: 'write:contractor_payments',
  readSells: 'read:sells',
  readProfile: 'read:profile',
  readContractor: 'read:contractor',
} as const;

export type PermissionName = (typeof Permission)[keyof typeof Permission];

export const ADMIN_PERMISSIONS: PermissionName[] = [Permission.manageProducts, Permission.manageUsers];
export const PURCHASE_PERMISSIONS: PermissionName[] = [Permission.writePayments, Permission.writeContractorPayments];

export function permissionsFromToken(accessToken: string | undefined): string[] {
  if (!accessToken) return [];
  try {
    const { permissions } = jwtDecode<{ permissions?: unknown }>(accessToken);
    return Array.isArray(permissions) ? permissions.filter((p): p is string => typeof p === 'string') : [];
  } catch {
    return [];
  }
}

export function hasAnyPermission(granted: string[], required: PermissionName[]): boolean {
  return required.some((permission) => granted.includes(permission));
}
