export const ROLES = ['admin', 'operator', 'viewer'] as const;

export type Role = (typeof ROLES)[number];

export const ROLE_HIERARCHY: Record<Role, number> = {
  viewer: 0,
  operator: 1,
  admin: 2,
};

export function hasRole(userRole: Role, required: Role): boolean {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[required];
}
