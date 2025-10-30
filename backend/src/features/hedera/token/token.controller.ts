import { Request, Response } from 'express';
import { hederaTokenRepository, updateFungibleTokenAmount } from './token.repository.js';
import { 
  CreateTokenSchema, 
  MintTokenSchema, 
  MintFungibleTokenSchema,
  FreezeTokenSchema, 
  UnfreezeTokenSchema,
  BurnTokenSchema,
  WipeTokenSchema,
  AssociateTokenSchema,
  TransferTokenSchema,
  CreateTokenResponse,
  MintTokenResponse,
  MintFungibleTokenResponse,
  FreezeTokenResponse,
  BurnTokenResponse,
  WipeTokenResponse,
  AssociateTokenResponse,
  TransferTokenResponse,
  GetTokenResponse,
  CreateFungibleTokenSchema,
  FungibleToken,
  CreateFungibleTokenResponse,
} from './token.model.js';
import { PrivateKey, PublicKey, TokenCreateTransaction, TokenSupplyType, TokenType } from '@hashgraph/sdk';
import { getUserDataByToken } from '../../auth/auth.repository.js';
import { HederaAccountRepository } from '../account/account.repository.js';
import { decryptPrivateKey } from '../../../util/encryption.js';
import { uploadJsonToIpfs } from '../../../util/ipfs-upload.js';
import { mirrorNodeService } from '../mirror-node/mirror-node.service.js';
import { addMonthsToHederaTimestamp } from '../../../util/timestamp-utils.js';
import { getHederaClient } from '../hedera.client.js';
import { db } from '@/db/index.js';

export async function uploadMetadata(req: Request, res: Response): Promise<void> {
  try {
    const validatedData = req.body;
    const result = await uploadJsonToIpfs(validatedData);
    res.status(200).json({ success: true, data: result });
    return;
  } catch (error) {
    console.error('Error uploading metadata:', error);
    res.status(400).json({ success: false, error: error instanceof Error ? error.message : 'Unknown error occurred' });
    return;
  }
}

export class HederaTokenController {
  /**
   * Create a new NFT token
   */
  private hederaClient = getHederaClient();
  async createToken(req: Request, res: Response): Promise<void> {
    try {
      // Validate request body
      const validatedData = CreateTokenSchema.parse(req.body);

      const userInfo = await getUserDataByToken(req.headers.authorization?.split(' ')[1] || '');
      const hederaInfo = await new HederaAccountRepository().getAccount(userInfo?.accountId || '');
      const privateKey = await new HederaAccountRepository().getAccountByHederaId(hederaInfo?.hederaAccountId || '');

      // Decrypt the private key first
      const decryptedPrivateKey = PrivateKey.fromStringECDSA(decryptPrivateKey(privateKey!.privateKey || '', process.env.ENCRYPTION_MASTER_KEY || ''));
      
      // Convert string keys to PrivateKey objects if provided
      const createTokenParams = {
        ...validatedData,
        treasuryPrivateKey: decryptedPrivateKey,
        treasuryAccountId: hederaInfo?.hederaAccountId || '',
        adminKey: decryptedPrivateKey.publicKey,
        supplyKey: decryptedPrivateKey.publicKey,
        freezeKey: decryptedPrivateKey.publicKey,
        wipeKey: decryptedPrivateKey.publicKey,
        expiredAt: validatedData.expiredAt.toISOString(),
      };  

      // Create the token
      const result = await hederaTokenRepository.createToken(createTokenParams, userInfo?.accountId || '');

      const response: CreateTokenResponse = {
        success: true,
        data: {
          tokenId: result.tokenId,
          transactionId: result.transactionId,
          receipt: result.receipt
        }
      };

      res.status(201).json(response);
    } catch (error) {
      console.error('Error creating token:', error);
      
      const response: CreateTokenResponse = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };

      res.status(400).json(response);
    }
  }

  /**
   * Mint new NFTs to an existing token
   */
  async mintToken(req: Request, res: Response): Promise<void> {
    try {
      // Validate request body
      const validatedData = MintTokenSchema.parse(req.body);
      const userInfo = await getUserDataByToken(req.headers.authorization?.split(' ')[1] || '');
      const hederaInfo = await new HederaAccountRepository().getAccount(userInfo?.accountId || '');
      const privateKeyData = await new HederaAccountRepository().getAccountByHederaId(hederaInfo?.hederaAccountId || '');

      // Process metadata: upload object to IPFS and get single URL string
      let processedMetadata: string | undefined;
      
      if (validatedData.metadata) {
        console.log('Processing metadata for IPFS upload...');
        
        if (typeof validatedData.metadata === 'string') {
          // If it's already a string (could be a URL), keep it as-is
          processedMetadata = validatedData.metadata;
        } else {
          // If it's an object, upload to IPFS and get the URL
          try {
            console.log('Uploading metadata to IPFS:', validatedData.metadata);
            processedMetadata = await uploadJsonToIpfs(validatedData.metadata);
            console.log('Metadata uploaded successfully. URL:', processedMetadata);
          } catch (ipfsError) {
            console.error('Failed to upload metadata to IPFS:', ipfsError);
            // Fallback: convert to JSON string if IPFS fails
            processedMetadata = JSON.stringify(validatedData.metadata);
            console.warn('Using JSON string as fallback for metadata');
          }
        }
      }

      // Convert string supply key to PrivateKey object
      const mintTokenParams = {
        ...validatedData,
        metadata: processedMetadata,
        supplyKey: PrivateKey.fromStringECDSA(decryptPrivateKey(privateKeyData!.privateKey || '', process.env.ENCRYPTION_MASTER_KEY || ''))
      };

      // Mint the tokens
      const result = await hederaTokenRepository.mintToken(mintTokenParams);

      const response: MintTokenResponse = {
        success: true,
        data: {
          serialNumbers: result.serialNumbers,
          transactionId: result.transactionId,
          receipt: result.receipt
        }
      };

      res.status(200).json(response);
    } catch (error) {
      console.error('Error minting token:', error);
      
      const response: MintTokenResponse = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };

      res.status(400).json(response);
    }
  }

  /**
   * Freeze an account's token holdings
   */
  async freezeToken(req: Request, res: Response): Promise<void> {
    try {
      // Validate request body
      const validatedData = FreezeTokenSchema.parse(req.body);

      // Convert string freeze key to PrivateKey object
      const freezeTokenParams = {
        ...validatedData,
        freezeKey: PrivateKey.fromStringECDSA(validatedData.freezeKey)
      };

      // Freeze the token
      const result = await hederaTokenRepository.freezeToken(freezeTokenParams);

      const response: FreezeTokenResponse = {
        success: true,
        data: {
          transactionId: result.transactionId,
          receipt: result.receipt
        }
      };

      res.status(200).json(response);
    } catch (error) {
      console.error('Error freezing token:', error);
      
      const response: FreezeTokenResponse = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };

      res.status(400).json(response);
    }
  }

  /**
   * Unfreeze an account's token holdings
   */
  async unfreezeToken(req: Request, res: Response): Promise<void> {
    try {
      // Validate request body
      const validatedData = UnfreezeTokenSchema.parse(req.body);

      // Convert string freeze key to PrivateKey object
      const unfreezeTokenParams = {
        ...validatedData,
        freezeKey: PrivateKey.fromStringECDSA(validatedData.freezeKey)
      };

      // Unfreeze the token
      const result = await hederaTokenRepository.unfreezeToken(unfreezeTokenParams);

      const response: FreezeTokenResponse = {
        success: true,
        data: {
          transactionId: result.transactionId,
          receipt: result.receipt
        }
      };

      res.status(200).json(response);
    } catch (error) {
      console.error('Error unfreezing token:', error);
      
      const response: FreezeTokenResponse = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };

      res.status(400).json(response);
    }
  }

  /**
   * Burn NFT serials from an existing token
   */
  async burnToken(req: Request, res: Response): Promise<void> {
    try {
      // Validate request body
      const validatedData = BurnTokenSchema.parse(req.body);

      // Convert string supply key to PrivateKey object
      const burnTokenParams = {
        ...validatedData,
        supplyKey: PrivateKey.fromStringECDSA(validatedData.supplyKey)
      };

      // Burn the tokens
      const result = await hederaTokenRepository.burnToken(burnTokenParams);

      const response: BurnTokenResponse = {
        success: true,
        data: {
          transactionId: result.transactionId,
          receipt: result.receipt
        }
      };

      res.status(200).json(response);
    } catch (error) {
      console.error('Error burning token:', error);
      
      const response: BurnTokenResponse = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };

      res.status(400).json(response);
    }
  }

  /**
   * Wipe NFT serials from an account (requires wipe key)
   */
  async wipeToken(req: Request, res: Response): Promise<void> {
    try {
      // Validate request body
      const validatedData = WipeTokenSchema.parse(req.body);

      // Convert string wipe key to PrivateKey object
      const wipeTokenParams = {
        ...validatedData,
        wipeKey: PrivateKey.fromStringECDSA(validatedData.wipeKey)
      };

      // Wipe the tokens
      const result = await hederaTokenRepository.wipeToken(wipeTokenParams);

      const response: WipeTokenResponse = {
        success: true,
        data: {
          transactionId: result.transactionId,
          receipt: result.receipt
        }
      };

      res.status(200).json(response);
    } catch (error) {
      console.error('Error wiping token:', error);
      
      const response: WipeTokenResponse = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };

      res.status(400).json(response);
    }
  }

  /**
   * Associate an account with a token
   */
  async associateToken(req: Request, res: Response): Promise<void> {
    try {
      // Validate request body
      const validatedData = AssociateTokenSchema.parse(req.body);

      // Convert string private key to PrivateKey object
      const associateTokenParams = {
        ...validatedData,
        privateKey: PrivateKey.fromString(validatedData.privateKey)
      };

      // Associate the token
      const result = await hederaTokenRepository.associateToken(associateTokenParams);

      const response: AssociateTokenResponse = {
        success: true,
        data: {
          transactionId: result.transactionId,
          receipt: result.receipt
        }
      };

      res.status(200).json(response);
    } catch (error) {
      console.error('Error associating token:', error);
      
      const response: AssociateTokenResponse = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };

      res.status(400).json(response);
    }
  }

  /**
   * Transfer an NFT from one account to another
   */
  async transferToken(req: Request, res: Response): Promise<void> {
    try {
      // Validate request body
      const validatedData = TransferTokenSchema.parse(req.body);

      // Convert string private key to PrivateKey object
      const transferTokenParams = {
        ...validatedData,
        senderPrivateKey: PrivateKey.fromString(validatedData.senderPrivateKey)
      };

      // Transfer the token
      const result = await hederaTokenRepository.transferToken(transferTokenParams);

      const response: TransferTokenResponse = {
        success: true,
        data: {
          transactionId: result.transactionId,
          receipt: result.receipt
        }
      };

      res.status(200).json(response);
    } catch (error) {
      console.error('Error transferring token:', error);
      
      const response: TransferTokenResponse = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };

      res.status(400).json(response);
    }
  }

  async getToken(req: Request, res: Response): Promise<void> {
    try {
      const tokenId = req.params.tokenId;
      const token = await mirrorNodeService.getTokenInfo(tokenId);

      const remainingToken = await mirrorNodeService.getTokenNFTs(
        tokenId,
        token.treasury_account_id,
        token.total_supply,
        'asc'
      );

      const remainingSupply = remainingToken.nfts.length.toString();
      
      // Add 6 months to the created timestamp
      const expiredAt = addMonthsToHederaTimestamp(token.created_timestamp, 6);
      
      const response: GetTokenResponse = {
        success: true,
        data: {
          tokenId: token.token_id,
          remainingSupply: remainingSupply,
          totalSupply: token.total_supply,
          treasuryAccountId: token.treasury_account_id,
          createdAt: token.created_timestamp,
          expiredAt: expiredAt,
        }
      };

      res.status(200).json(response);
    } catch (error) {
      console.error('Error getting token:', error);
      
      const response: GetTokenResponse = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };

      res.status(400).json(response);
    }
  }

  async createFungibleToken(req: Request, res: Response): Promise<void> {
    try {
      const validatedData = CreateFungibleTokenSchema.parse(req.body);
      const privateKey = await new HederaAccountRepository().getAccountByHederaId(process.env.ADMIN_HEDERA_ACCOUNT_ID || '');
      const hashedPrivateKey = decryptPrivateKey(privateKey?.privateKey || '', process.env.ENCRYPTION_MASTER_KEY || '');
      const hashedPublicKey = PublicKey.fromString(privateKey?.publicKey || '');

      const result = await hederaTokenRepository.createFungibleToken({...validatedData, treasuryAccountId: privateKey?.hederaAccountId || '', supplyKey: hashedPublicKey, treasuryPrivateKey: PrivateKey.fromStringECDSA(hashedPrivateKey), expiredAt: validatedData.expiredAt?.toISOString() || new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString(), adminKey: hashedPublicKey, freezeKey: hashedPublicKey, wipeKey: hashedPublicKey});
      
      const response: CreateFungibleTokenResponse = {
        success: true,
        data: {
          tokenId: result.tokenId,
          transactionId: result.transactionId,
          receipt: result.receipt
        }
      };
      
      res.status(200).json(response);
      
    }
    catch (error) {
      console.error('Error creating fungible token:', error);
      res.status(400).json({ success: false, error: error instanceof Error ? error.message : 'Unknown error occurred' });
    }
  }

  /**
   * Mint additional supply to an existing fungible token
   */
  async mintFungibleToken(req: Request, res: Response): Promise<void> {
    try {
      // Validate request body
      const validatedData = MintFungibleTokenSchema.parse(req.body);
      
      // Get user and account information
      const privateKeyData = await new HederaAccountRepository().getAccountByHederaId(process.env.ADMIN_HEDERA_ACCOUNT_ID || '');
      
      // Decrypt the private key (supply key)
      const decryptedPrivateKey = decryptPrivateKey(
        privateKeyData?.privateKey || '', 
        process.env.ENCRYPTION_MASTER_KEY || ''
      );

      // Prepare parameters for minting
      const mintParams = {
        tokenId: validatedData.tokenId,
        amount: validatedData.amount,
        supplyKey: PrivateKey.fromStringECDSA(decryptedPrivateKey)
      };

      // Mint the fungible tokens
      const result = await hederaTokenRepository.mintFungibleToken(mintParams);

      // Update the database with the new supply
      await db.transaction(async (tx) => {
        await updateFungibleTokenAmount(validatedData.tokenId, result.newTotalSupply, tx);
      });

      const response: MintFungibleTokenResponse = {
        success: true,
        data: {
          newTotalSupply: result.newTotalSupply,
          transactionId: result.transactionId,
          receipt: result.receipt
        }
      };

      res.status(200).json(response);
    } catch (error) {
      console.error('Error minting fungible token:', error);
      
      const response: MintFungibleTokenResponse = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };

      res.status(400).json(response);
    }
  }
}

export const hederaTokenController = new HederaTokenController();
