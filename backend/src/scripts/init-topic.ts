import { TopicCreateTransaction } from '@hashgraph/sdk';
import { getHederaClient } from '@/features/hedera/hedera.client.js';
import { TopicCreate, findTopicByName } from '@/features/hedera/topic/topic.repository.js';

/**
 * Helper function to create a topic on Hedera and store it in database
 */
export async function createTopicOnHedera(topicName: string): Promise<string | null> {
  try {
    const client = getHederaClient();
    if (!client) {
      console.error(`Failed to get Hedera client for topic: ${topicName}`);
      return null;
    }

    // Create the topic transaction
    const transaction = new TopicCreateTransaction()
      .setSubmitKey(client.getOperatorKey());
    
    // Execute the transaction
    const txResponse = await transaction.execute(client.getClient());
    
    // Get the receipt
    const receipt = await txResponse.getReceipt(client.getClient());
    
    // Get the topic ID
    const topicId = receipt.topicId?.toString() || '';
    
    if (!topicId) {
      console.error(`Failed to create topic on Hedera: ${topicName}`);
      return null;
    }
    
    console.log(`✓ Created topic on Hedera: ${topicName} with ID ${topicId}`);
    
    // Store in database
    const createdTopic = await TopicCreate({
      topicId,
      topicName,
    });
    
    console.log(`✓ Stored topic in database: ${createdTopic[0].topicName}`);
    
    return topicId;
  } catch (error) {
    console.error(`Error creating topic ${topicName} on Hedera:`, error);
    return null;
  }
}

/**
 * Helper function to load or initialize a topic ID
 * First checks environment variable, then database, then creates new topic if needed
 */
export async function loadOrInitializeTopic(envKey: string, topicName: string): Promise<string | null> {
  // If already set in env, use it
  if (process.env[envKey]) {
    console.log(`✓ Using ${envKey} from environment: ${process.env[envKey]}`);
    return process.env[envKey];
  }
  
  try {
    const topic = await findTopicByName(topicName);
    
    if (topic) {
      process.env[envKey] = topic.topicId;
      console.log(`✓ Loaded ${envKey} from database: ${topic.topicId}`);
      return topic.topicId;
    }
    
    console.log(`⚠️  Topic ${topicName} not found in database, creating new topic...`);
    const topicId = await createTopicOnHedera(topicName);
    
    if (topicId) {
      process.env[envKey] = topicId;
      console.log(`✓ Created and set ${envKey}: ${topicId}`);
      return topicId;
    }
    
    console.warn(`⚠️  Failed to create topic: ${topicName}`);
    return null;
  } catch (error) {
    console.error(`⚠️  Could not load/initialize ${envKey}:`, error);
    return null;
  }
}
