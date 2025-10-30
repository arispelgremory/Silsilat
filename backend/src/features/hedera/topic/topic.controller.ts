import { Request, Response } from 'express';
import { TopicCreateTransaction, TopicMessageSubmitTransaction } from '@hashgraph/sdk';
import { getHederaClient } from '../hedera.client.js';
import { TopicCreate } from './topic.repository.js';
import { TopicCreateSchema } from './topic.model.js';
import { uploadJsonToIpfs } from '@/util/ipfs-upload.js';
import { encryptPrivateKey } from '../../../util/encryption.js';

/**
 * Utility function to submit encrypted message to topic without handling HTTP response
 * Can be used within transactions or other controller logic
 */
export async function submitEncryptedMessageToTopic(
  topicId: string, 
  message: any, 
  userId?: string
): Promise<{ status: string; transactionId: string; ipfsHash: string }> {
  const client = getHederaClient();
  
  if (!client) {
    throw new Error('Failed to get Hedera client');
  }

  if (!topicId) {
    throw new Error('Topic ID is required');
  }
  
  if (!message) {
    throw new Error('Message is required');
  }

  // Encrypt the message before uploading to IPFS
  const messageString = JSON.stringify({
    message,
    timestamp: new Date().toISOString(),
    updated_by: userId || ''
  });
  const encryptedMessage = encryptPrivateKey(messageString, process.env.ENCRYPTION_MASTER_KEY || '');

  // Upload encrypted message to IPFS
  const uploadIPFS = await uploadJsonToIpfs({ encryptedMessage });

  // Create the transaction
  const transaction = new TopicMessageSubmitTransaction()
    .setTopicId(topicId)
    .setMessage(uploadIPFS);

  // Execute transaction
  const txResponse = await transaction.execute(client.getClient());

  // Request the receipt
  const receipt = await txResponse.getReceipt(client.getClient());

  console.log("Transaction Status:", receipt.status);

  return {
    status: receipt.status.toString(),
    transactionId: txResponse.transactionId.toString(),
    ipfsHash: uploadIPFS
  };
}


export async function createTopic(req: Request, res: Response): Promise<void> {
    try {
      const client = getHederaClient();
      const validatedData = TopicCreateSchema.parse(req.body);

      if (!client) {
        res.status(400).json({ success: false, error: 'Failed to get Hedera client' });
        return;
      }

      if (!validatedData) {
        res.status(400).json({ success: false, error: 'Invalid topic data' });
        return;
      }
      
      // Create the transaction
      const transaction = new TopicCreateTransaction()
        .setSubmitKey(client.getOperatorKey()); // Optional: Only if you want to restrict who can submit messages
      
      // Sign with the client operator private key and submit the transaction
      const txResponse = await transaction.execute(client.getClient());
      
      // Request the receipt of the transaction
      const receipt = await txResponse.getReceipt(client.getClient());
      
      // Get the topic ID
      const newTopicId = receipt.topicId;
      
      console.log("The new topic ID is " + newTopicId);
      validatedData.topicId = newTopicId?.toString() || '';
      const createdTopic = await TopicCreate(validatedData);
      res.status(200).json({
        success: true,
        data: {
          topicId: newTopicId,
          topic: createdTopic[0]
        }
      });
    } catch (error) {
      console.error('Error creating topic:', error);
      res.status(400).json({ success: false, error: error instanceof Error ? error.message : 'Unknown error occurred' });
      return;
    }
  }

export async function setTopicMessage(req: Request, res: Response): Promise<void> {
    try {
      const client = getHederaClient();
      const validatedData = req.body;

      if (!client) {
        res.status(400).json({ success: false, error: 'Failed to get Hedera client' });
        return;
      }

      if (!validatedData.topicId) {
        res.status(400).json({ success: false, error: 'Topic ID is required' });
        return;
      }
      
      if (!validatedData.message) {
        res.status(400).json({ success: false, error: 'Message is required' });
        return;
      }

      const uploadIPFS = await uploadJsonToIpfs(validatedData.message);

      console.log("uploadIPFS", uploadIPFS);
      
      // Create the transaction
      const transaction = new TopicMessageSubmitTransaction()
      .setTopicId(validatedData.topicId)
      .setMessage(uploadIPFS);

      // Execute transaction
      const txResponse = await transaction.execute(client.getClient());

      // Request the receipt
      const receipt = await txResponse.getReceipt(client.getClient());

      // Get the transaction consensus status
      console.log("Transaction Status:", receipt.status);

      res.status(200).json({ 
        success: true, 
        data: { 
          status: receipt.status.toString(),
          transactionId: txResponse.transactionId.toString(),
          ipfsHash: uploadIPFS
        } 
      });
    } catch (error) {
      console.error('Error setting message:', error);
      res.status(400).json({ success: false, error: error instanceof Error ? error.message : 'Unknown error occurred' });
      return;
    }
  }