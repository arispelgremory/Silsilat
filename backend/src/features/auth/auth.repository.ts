// DB
// Model
import { CompanyAdmin, CompanyAdminType, SuperAdmin, SuperAdminType, User, UserType, UserRole, UserRoleType, RolePermission, RolePermissionType } from './auth.model.js';
import { db } from '@/db/index';
import { eq, ExtractTablesWithRelations, sql } from 'drizzle-orm';
// JWT
import { verifyToken } from '@/features/jwt/jwt.controller.js';
import { NodePgQueryResultHKT } from 'drizzle-orm/node-postgres/index.js';
import { PgTransaction } from 'drizzle-orm/pg-core/index.js';
import { AccountInfoResponse } from '../hedera/account/account.model.js';
import { HederaAccountRepository } from '../hedera/account/account.repository.js';

// User
// Get User by token
export const getUserDataByToken = async (token: string): Promise<UserType | null> => {
  try {
    const decodedToken = verifyToken(token);

    if (!decodedToken.username) {
      throw new Error('(getUserByToken) Invalid token: username not found');
    }

    const loginType = decodedToken.loginType;
    let user: UserType | null = null;
    let hederaAccount: AccountInfoResponse | null = null;

    if (loginType === 'EMAIL') {
      user = await getUserByEmail(decodedToken.username);
      if (!user) {
        throw new Error('User not found');
      }
      hederaAccount = await new HederaAccountRepository().getAccount(user?.accountId);
    } else if (loginType === 'CONTACT_NO') {
      user = await getUserByContactNo(decodedToken.username);
      if (!user) {
        throw new Error('User not found');
      }
      hederaAccount = await new HederaAccountRepository().getAccount(user?.accountId);
    }

    return user ? user : null;
  } catch (error) {
    console.error('Error getting user from token:', error);
    return null;
  }
};

export const getUserByEmail = async (email: string): Promise<UserType | null> => { 
  const users = await db.select().from(User).where(eq(User.userEmail, email)).limit(1);
  return users.length > 0 && users[0].userId ? { ...users[0], balance: 0 } as UserType : null;
};
  
export const getUserByContactNo = async (contactNo: string): Promise<UserType | null> => { 
  const users = await db.select().from(User).where(eq(User.userContactNo, contactNo)).limit(1);
  return users.length > 0 && users[0].userId ? { ...users[0], balance: 0 } as UserType : null;
};

export const createUser = async (userData: UserType, tx?: PgTransaction<NodePgQueryResultHKT, Record<string, never>, ExtractTablesWithRelations<Record<string, never>>>) => {
  if (!userData) {
    throw new Error('Create User: User data is required');
  }
  
  // await db.insert(User).values({
  //   ...userData,
  //   userId: sql`'USR_' || substr(gen_random_uuid()::text, 1, 32)`
  // }).returning();

  if (tx) {
    return await tx.insert(User).values({
      ...userData,
        userId: sql`'USR_' || substr(gen_random_uuid()::text, 1, 32)`
      }).returning();
  }
  return await db.insert(User).values({
    ...userData,
    userId: sql`'USR_' || substr(gen_random_uuid()::text, 1, 32)`
  }).returning();

}

export const updateUser = async (userId: string, userData: Partial<UserType>, tx?: PgTransaction<NodePgQueryResultHKT, Record<string, never>, ExtractTablesWithRelations<Record<string, never>>>) => {
  if (!userId || !userData) {
    throw new Error('Update User: User ID and user data are required');
  }
  
  if (tx) {
    return await tx.update(User).set(userData).where(eq(User.userId, userId)).returning();
  }
  return await db.update(User).set(userData).where(eq(User.userId, userId)).returning();
}

// Company Admin
export const getCompanyAdminDataByToken = async (token: string): Promise<CompanyAdminType | null> => { // Added return type
  try {
    const decodedToken = verifyToken(token);
    
    if (!decodedToken.username) {
      throw new Error('(getCompanyAdminByToken) Invalid token: username not found');
    }

    const loginType = decodedToken.loginType;
    let user: CompanyAdminType | null = null; // Change to CompanyAdminType | null

    if (loginType === 'EMAIL') {
      user = await getCompanyAdminByEmail(decodedToken.username);
    } else if (loginType === 'CONTACT_NO') {
      user = await getCompanyAdminByContactNo(decodedToken.username);
    }
    
    return user ? user : null; // Simplified return
  } catch (error) {
    console.error('Error getting company admin from token:', error);
    return null;
  }
};

export const getCompanyAdminByEmail = async (email: string): Promise<CompanyAdminType | null> => { 
  const companyAdmins = await db.select().from(CompanyAdmin).where(eq(CompanyAdmin.companyAdminEmail, email)).limit(1);
  return companyAdmins.length > 0 && companyAdmins[0].companyAdminId ? companyAdmins[0] : null;
};

export const getCompanyAdminByContactNo = async (contact: string): Promise<CompanyAdminType | null> => { 
  const companyAdmins = await db.select().from(CompanyAdmin).where(eq(CompanyAdmin.companyAdminContactNo, contact)).limit(1);
  return companyAdmins.length > 0 && companyAdmins[0].companyAdminId ? companyAdmins[0] : null;
};

export const createCompanyAdmin = async (userData: CompanyAdminType): Promise<void> => { 
  if (!userData) {
    throw new Error('Create Company Admin: User data is required');
  }
  
  await db.insert(CompanyAdmin).values(userData).returning();
}
// End Company Admin

// Super Admin
export const getSuperAdminDataByToken = async (token: string): Promise<SuperAdminType | null> => { // Updated return type
  try {
    const decodedToken = verifyToken(token);
    
    if (!decodedToken.username) {
      throw new Error('(getSuperAdminDataByToken) Invalid token: username not found');
    }

    const user = decodedToken.loginType === 'EMAIL' 
      ? await getSuperAdminByEmail(decodedToken.username) 
      : await getSuperAdminByContactNo(decodedToken.username); // Consolidated logic

    return user || null; // Simplified return
  } catch (error) {
    console.error('Error getting super admin from token:', error);
    return null;
  }
};

export const getSuperAdminByEmail = async (email: string): Promise<SuperAdminType | null> => { 
  const superAdmins = await db.select().from(SuperAdmin).where(eq(SuperAdmin.superAdminEmail, email)).limit(1);
  return superAdmins.length > 0 && superAdmins[0].superAdminId ? superAdmins[0] : null;
}

export const getSuperAdminByContactNo = async (contact: string): Promise<SuperAdminType | null> => { 
  const superAdmins = await db.select().from(SuperAdmin).where(eq(SuperAdmin.superAdminContactNo, contact)).limit(1);
  return superAdmins.length > 0 && superAdmins[0].superAdminId ? superAdmins[0] : null;
}
// End Super Admin

// User Role
export const getUserRoleByRoleId = async (roleId: string): Promise<UserRoleType | null> => {
  const userRoles = await db.select().from(UserRole).where(eq(UserRole.roleId, roleId)).limit(1);
  return userRoles.length > 0 && userRoles[0].roleId ? userRoles[0] : null;
}

export const getUserRole = async (roleName: string): Promise<UserRoleType | null> => { 
  const userRoles = await db.select().from(UserRole).where(eq(UserRole.roleName, roleName)).limit(1);
  return userRoles.length > 0 && userRoles[0].roleName ? userRoles[0] : null;
};

export const createUserRole = async (userRoleData: UserRoleType): Promise<void> => {
  if (!userRoleData) {
    throw new Error('Create User Role: User role data is required');
  }
  
  await db.insert(UserRole).values(userRoleData).returning();
}

export const updateUserRole = async (userRoleData: Partial<UserRoleType>): Promise<void> => {
  if (!userRoleData || !userRoleData.roleId) {
    throw new Error('Update User Role: User role data and roleId are required');
  }
  
  await db.update(UserRole)
    .set(userRoleData)
    .where(eq(UserRole.roleId, userRoleData.roleId))
    .returning();
}
// End User Role

// Role Permission
export const createRolePermission = async (rolePermissionData: RolePermissionType): Promise<void> => {
  if (!rolePermissionData) {
    throw new Error('Create Role Permission: Role permission data is required');
  }
  
  await db.insert(RolePermission).values(rolePermissionData).returning();
}

export const updateRolePermission = async (rolePermissionData: Partial<RolePermissionType>): Promise<void> => {
  if (!rolePermissionData || !rolePermissionData.permissionId) {
    throw new Error('Update Role Permission: Role permission data and permissionId are required');
  }
  
  await db.update(RolePermission)
    .set(rolePermissionData)
    .where(eq(RolePermission.permissionId, rolePermissionData.permissionId))
    .returning();
}

export const getRolePermision = async (permissionName: string): Promise<RolePermissionType | null> => { 
  const rolePermissions = await db.select().from(RolePermission).where(eq(RolePermission.permissionName, permissionName)).limit(1);
  return rolePermissions.length > 0 && rolePermissions[0].permissionName ? rolePermissions[0] : null;
};

export const getRolePermissionByRoleId = async (roleId: string): Promise<string | null> => {
  try {
    const result = await db.select({
      permissionId: UserRole.permissionId
    })
    .from(UserRole)
    .where(eq(UserRole.roleId, roleId))
    .execute();

    return result.length > 0 ? result[0].permissionId : null;
  } catch (error) {
    console.error('Error in getRolePermissionByRoleId:', error);
    throw error;
  }
};





