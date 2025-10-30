import { timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { MainSchema } from "@/db/db.schema";

// Role
export const Role = MainSchema.table('role', {
  roleId:       uuid('role_id').defaultRandom().notNull(),
  roleName:     varchar('role_name', { length: 40 }).notNull(),
  permissionId: varchar('permission_id', { length: 40 }).array(),
  status:       varchar('status', { length: 20 }).notNull(),
  createdAt:    timestamp('created_at').defaultNow().notNull(),
  updatedAt:    timestamp('updated_at').defaultNow().notNull(),
  createdBy:    varchar('created_by', { length: 40 }).notNull(),
  updatedBy:    varchar('updated_by', { length: 40 }).notNull(),
});

// Permission
export const Permission = MainSchema.table('permission', {
  permissionId: uuid('permission_id').defaultRandom().notNull(),
  permissionName: varchar('permission_name', { length: 40 }).notNull(),
  status: varchar('status', { length: 20 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  createdBy: varchar('created_by', { length: 40 }).notNull(),
  updatedBy: varchar('updated_by', { length: 40 }).notNull(),
});

