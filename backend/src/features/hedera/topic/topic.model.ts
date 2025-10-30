import { timestamp, varchar, uuid } from 'drizzle-orm/pg-core';
import { MainSchema } from '@/db/db.schema';
import { z } from 'zod';

export const Topic = MainSchema.table('topic', {
  topicId:        varchar('topic_id', { length: 100 }).primaryKey(),
  topicName:      varchar('topic_name', { length: 100 }).notNull(),
  createdAt:      timestamp('created_at').defaultNow().notNull(),
  updatedAt:      timestamp('updated_at').defaultNow().notNull(),
  createdBy:      varchar('created_by', { length: 40 }).notNull(),
  updatedBy:      varchar('updated_by', { length: 40 }).notNull(),
});

export const TopicCreateSchema = z.object({
  topicId: z.string().min(1, 'Topic ID is required').max(100, 'Topic ID must be less than 100 characters').optional(),
  topicName: z.string().min(1, 'Topic name is required').max(100, 'Topic name must be less than 100 characters'),
});

export type TopicInsertType = typeof Topic.$inferInsert;