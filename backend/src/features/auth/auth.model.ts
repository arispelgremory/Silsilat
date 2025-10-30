import { timestamp, uuid, varchar, text, boolean, numeric } from 'drizzle-orm/pg-core';
import { MainSchema } from '@/db/db.schema';

// User Login
export type UserLogin = {
  username: string;
  password: string;
}

// User Type
export type UserType = {
  userId?:        string; // UUID type
  userEmail:      string;
  userContactNo:  string;
  userPassword:   string;
  icNo:           string;
  icFrontPicture: string;
  icBackPicture:  string;
  userFirstName:  string;
  userLastName:   string;
  gender:         string;
  accountId:      string;
  addressId:      string;
  companyId:      string;
  vehicleId:      string | null;
  walletId:       string;
  userSkillId:    string | null;
  jobReviewId:    string | null;
  roleId:         string | null;
  sessionId:      string | null;
  balance:        number;
  status:         string;
  createdAt?:     Date; // Timestamp type
  updatedAt?:     Date; // Timestamp type
  createdBy:      string;
  updatedBy:      string;
}

// User
export const User = MainSchema.table('user', {
  userId:         varchar('user_id', { length: 40 }).notNull(),
  userEmail:      varchar('user_email', { length: 100 }).unique().notNull(),
  userContactNo:  varchar('user_contact_no', { length: 20 }).unique().notNull(),
  userPassword:   varchar('user_password', { length: 100 }).notNull(),
  icNo:           varchar('ic_no', { length: 12 }).notNull(),
  icFrontPicture: text('ic_front_picture').notNull(),
  icBackPicture:  text('ic_back_picture').notNull(),
  userFirstName:  varchar('user_first_name', { length: 50 }).notNull(),
  userLastName:   varchar('user_last_name', { length: 50 }).notNull(),
  gender:         varchar('gender', { length: 10 }).notNull(),
  accountId:      varchar('account_id', { length: 40 }).notNull(),
  addressId:      varchar('address_id', { length: 40 }).notNull(),
  companyId:      varchar('company_id', { length: 40 }).notNull(),
  vehicleId:      varchar('vehicle_id', { length: 40 }),
  walletId:       varchar('wallet_id', { length: 40 }).notNull(),
  userSkillId:    varchar('user_skill_id', { length: 40 }),
  jobReviewId:    varchar('job_review_id', { length: 40 }),
  roleId:         varchar('role_id', { length: 40 }),
  sessionId:      varchar('session_id', { length: 40 }),
  status:         varchar('status', { length: 20 }).notNull(),
  createdAt:      timestamp('created_at').defaultNow().notNull(),
  updatedAt:      timestamp('updated_at').defaultNow().notNull(),
  createdBy:      varchar('created_by', { length: 40 }).notNull(),
  updatedBy:      varchar('updated_by', { length: 40 }).notNull(),
});

// Company Admin Type
export type CompanyAdminType = {
  companyAdminId?:       string; // UUID type
  companyAdminFirstName: string;
  companyAdminLastName:  string;
  companyAdminEmail:     string;
  companyAdminContactNo: string;
  companyAdminPassword:  string;
  companyId:             string;
  boolModule:            boolean;
  moduleAccessId:        string[] | null;
  boolPermission:        boolean;
  roleId:                string | null; 
  sessionId:             string | null;
  status:                string;
  createdAt?:            Date; // Timestamp type
  updatedAt?:            Date; // Timestamp type
  createdBy:             string;
  updatedBy:             string;
}

// Company Admin
export const CompanyAdmin = MainSchema.table('company_admin', {
  companyAdminId:        uuid('company_admin_id').defaultRandom().notNull(),
  companyAdminFirstName: varchar('company_admin_first_name', { length: 50 }).notNull(),
  companyAdminLastName:  varchar('company_admin_last_name', { length: 50 }).notNull(),
  companyAdminEmail:     varchar('company_admin_email', { length: 100 }).unique().notNull(),
  companyAdminContactNo: varchar('company_admin_contact_no', { length: 20 }).notNull(),
  companyAdminPassword:  varchar('company_admin_password', { length: 100 }).notNull(),
  companyId:             varchar('company_id', { length: 40 }).notNull(),
  boolModule:            boolean('bool_module').notNull(),
  moduleAccessId:        varchar('module_access_id', { length: 40 }).array(),
  boolPermission:        boolean('bool_permission').notNull(),
  roleId:                varchar('role_id', { length: 40 }),
  sessionId:             varchar('session_id', { length: 40 }),
  status:                varchar('status', { length: 20 }).notNull(),
  createdAt:             timestamp('created_at').defaultNow().notNull(),
  updatedAt:             timestamp('updated_at').defaultNow().notNull(),
  createdBy:             varchar('created_by', { length: 40 }).notNull(),
  updatedBy:             varchar('updated_by', { length: 40 }).notNull(),
});

// Super Admin Type
export type SuperAdminType = {
  superAdminId?:       string; // UUID type
  superAdminNickname:  string;
  superAdminFirstName: string;
  superAdminLastName:  string;
  superAdminEmail:     string;
  superAdminContactNo: string;
  superAdminPassword:  string;
  boolModule:          boolean;
  moduleAccessId:      string[] | null;
  boolPermission:      boolean;
  roleId:              string | null;
  sessionId:           string | null;
  status:              string;
  createdAt?:          Date; // Timestamp type
  updatedAt?:          Date; // Timestamp type
  createdBy:           string;
  updatedBy:           string;
}

// Super Admin
export const SuperAdmin = MainSchema.table('super_admin', {
  superAdminId:        uuid('super_admin_id').defaultRandom().notNull(),
  superAdminNickname:  varchar('super_admin_nickname', { length: 50 }).notNull(),
  superAdminFirstName: varchar('super_admin_first_name', { length: 50 }).notNull(),
  superAdminLastName:  varchar('super_admin_last_name', { length: 50 }).notNull(),
  superAdminEmail:     varchar('super_admin_email', { length: 100 }).unique().notNull(),
  superAdminContactNo: varchar('super_admin_contact_no', { length: 20 }).notNull(),
  superAdminPassword:  varchar('super_admin_password', { length: 100 }).notNull(),
  boolModule:          boolean('bool_module').notNull(),
  moduleAccessId:      varchar('module_access_id', { length: 40 }).array(),
  boolPermission:      boolean('bool_permission').notNull(),
  roleId:              varchar('role_id', { length: 40 }),
  sessionId:           varchar('session_id', { length: 40 }),
  status:              varchar('status', { length: 20 }).notNull(),
  createdAt:           timestamp('created_at').defaultNow().notNull(),
  updatedAt:           timestamp('updated_at').defaultNow().notNull(),
  createdBy:           varchar('created_by', { length: 40 }).notNull(),
  updatedBy:           varchar('updated_by', { length: 40 }).notNull(),
});

// User Role Type
export type UserRoleType = {
  roleId?:       string; // UUID type
  roleName:      string;
  permissionId:  string;
  status:        string;
  createdAt?:    Date; // Timestamp type
  updatedAt?:    Date; // Timestamp type
  createdBy:     string;
  updatedBy:     string;
}

// User Role
export const UserRole = MainSchema.table('user_role', {
  roleId:       uuid('role_id').defaultRandom().notNull(), // UUID type
  roleName:     varchar('role_name', { length: 50 }).notNull(),
  permissionId: varchar('permission_id', { length: 50 }).notNull(),
  status:       varchar('status', { length: 50 }).notNull(),
  createdAt:    timestamp('created_at').defaultNow().notNull(), // Timestamp type
  updatedAt:    timestamp('updated_at').defaultNow().notNull(), // Timestamp type
  createdBy:    varchar('created_by', { length: 40 }).notNull(),
  updatedBy:    varchar('updated_by', { length: 40 }).notNull(),
});

// User Permission Type
export type RolePermissionType = {
  permissionId?:  string; // UUID type
  permissionName: string;
  policy:         string;
  status:         string;
  createdAt?:     Date; // Timestamp type
  updatedAt?:     Date; // Timestamp type
  createdBy:      string;
  updatedBy:      string;
}

// Role Permission
export const RolePermission = MainSchema.table('role_permission', {
  permissionId:   uuid('permission_id').defaultRandom().notNull(), // UUID type
  permissionName: varchar('permission_name', { length: 50 }).notNull(),
  policy:         varchar('policy', { length: 50 }).notNull(),
  status:         varchar('status', { length: 50 }).notNull(),
  createdAt:      timestamp('created_at').defaultNow().notNull(), // Timestamp type
  updatedAt:      timestamp('updated_at').defaultNow().notNull(), // Timestamp type
  createdBy:      varchar('created_by', { length: 40 }).notNull(),
  updatedBy:      varchar('updated_by', { length: 40 }).notNull(),
});



