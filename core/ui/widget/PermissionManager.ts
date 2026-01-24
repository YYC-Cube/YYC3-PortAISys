/**
 * @file 权限管理器
 * @description 管理widget权限
 * @module ui/widget/PermissionManager
 * @author YYC³
 * @version 1.0.0
 * @created 2025-01-05
 */

import { EventEmitter } from 'events';

export type Permission = 'read' | 'write' | 'execute' | 'delete' | 'admin';

export class PermissionManager extends EventEmitter {
  private permissions: Map<string, Set<Permission>>;
  private roles: Map<string, Set<Permission>>;

  constructor() {
    super();
    this.permissions = new Map();
    this.roles = new Map();
    this.initializeRoles();
  }

  private initializeRoles(): void {
    this.roles.set('admin', new Set(['read', 'write', 'execute', 'delete', 'admin']));
    this.roles.set('user', new Set(['read', 'write', 'execute']));
    this.roles.set('guest', new Set(['read']));
  }

  grantPermission(userId: string, permission: Permission): void {
    if (!this.permissions.has(userId)) {
      this.permissions.set(userId, new Set());
    }
    this.permissions.get(userId)!.add(permission);
    this.emit('permission:granted', { userId, permission });
  }

  revokePermission(userId: string, permission: Permission): void {
    const userPermissions = this.permissions.get(userId);
    if (userPermissions) {
      userPermissions.delete(permission);
      this.emit('permission:revoked', { userId, permission });
    }
  }

  hasPermission(userId: string, permission: Permission): boolean {
    const userPermissions = this.permissions.get(userId);
    return userPermissions ? userPermissions.has(permission) : false;
  }

  assignRole(userId: string, roleName: string): void {
    const rolePermissions = this.roles.get(roleName);
    if (rolePermissions) {
      if (!this.permissions.has(userId)) {
        this.permissions.set(userId, new Set());
      }
      rolePermissions.forEach(perm => {
        this.permissions.get(userId)!.add(perm);
      });
      this.emit('role:assigned', { userId, roleName });
    }
  }

  removeRole(userId: string, roleName: string): void {
    const rolePermissions = this.roles.get(roleName);
    if (rolePermissions) {
      const userPermissions = this.permissions.get(userId);
      if (userPermissions) {
        rolePermissions.forEach(perm => {
          userPermissions.delete(perm);
        });
        this.emit('role:removed', { userId, roleName });
      }
    }
  }

  getPermissions(userId: string): Set<Permission> {
    return new Set(this.permissions.get(userId) || []);
  }

  clearPermissions(userId: string): void {
    this.permissions.delete(userId);
    this.emit('permissions:cleared', userId);
  }

  destroy(): void {
    this.permissions.clear();
    this.roles.clear();
    this.removeAllListeners();
  }
}
