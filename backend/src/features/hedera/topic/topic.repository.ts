import { db } from "@/db";
import { Topic, TopicInsertType, TopicCreateSchema } from "./topic.model";
import { z } from "zod";
import { eq } from "drizzle-orm";

export const TopicCreate = async (validatedData: z.infer<typeof TopicCreateSchema>): Promise<TopicInsertType[]> => {
    
    let params: TopicInsertType = {
        topicId: validatedData.topicId || '',
        topicName: validatedData.topicName,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'system', // TODO: Get from authenticated user
        updatedBy: 'system' // TODO: Get from authenticated user
    };

    return await db.insert(Topic).values(params).returning() as unknown as TopicInsertType[];
};

export const findTopicByTopicId = async (topicId: string): Promise<TopicInsertType | null> => {
    const result = await db.select().from(Topic).where(eq(Topic.topicId, topicId)).limit(1);
    return result.length > 0 ? (result[0] as TopicInsertType) : null;
};

export const findTopicByName = async (topicName: string): Promise<TopicInsertType | null> => {
    const result = await db.select().from(Topic).where(eq(Topic.topicName, topicName)).limit(1);
    return result.length > 0 ? (result[0] as TopicInsertType) : null;
};