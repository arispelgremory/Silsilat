import { Request, Response } from 'express';
import { createSag, getSag, updateSag, overrideFailureSag } from './sag.repository';
import { SagModel, SagModelInsertType, SagModelType, SagSchema, GoldEvaluatorOutputSchema, SagOverrideFailureSchema } from './sag.model';
import {TokenRepository} from '../hedera/token/token.repository';
import { PgTransaction } from 'drizzle-orm/pg-core';
import { NodePgQueryResultHKT } from 'drizzle-orm/node-postgres';
import { eq, ExtractTablesWithRelations } from 'drizzle-orm';
import { db } from '@/db/index.js';
import { getUserDataByToken } from '../auth/auth.repository';
import { HederaAccountRepository } from '../hedera/account/account.repository';
import { PrivateKey, PublicKey } from '@hashgraph/sdk';
import { decryptPrivateKey } from '@/util/encryption';
import { uploadJsonToIpfs } from '@/util/ipfs-upload';
import { callGoldEvaluator, GoldEvaluatorOutput } from '@/util/gold-evaluator';
import { sagCreationQueue, JOB_TYPES } from '../../bullmq/scheduler.js';
import { submitEncryptedMessageToTopic } from '../hedera/topic/topic.controller';

export const createSagController = async (req: Request, res: Response) => {
    try {
        const sagData = SagSchema.parse(req.body);
        const userInfo = await getUserDataByToken(req.headers.authorization?.split(' ')[1] || '');
        const goldEvaluateJson = {
            "principal_myr": sagData.sagProperties.loan,
            "gold_weight_g": sagData.sagProperties.weightG,
            "purity": sagData.sagProperties.purity,
            "tenure_days": sagData.sagProperties.tenorM * 30
        };
        
        if (!sagData) {
            return res.status(400).json({ error: 'SAG data is required' });
        }
        sagData.sagType = sagData.sagType || 'Conventional';

        const hederaInfo = await new HederaAccountRepository().getAccount(userInfo?.accountId || '');
        const privateKey = await new HederaAccountRepository().getAccountByHederaId(hederaInfo?.hederaAccountId || '');
        const hashedPrivateKey = decryptPrivateKey(privateKey?.privateKey || '', process.env.ENCRYPTION_MASTER_KEY || '');
        const hashedPublicKey = PublicKey.fromString(hederaInfo.publicKey);
        let goldEvaluateResult: GoldEvaluatorOutput | null = null;
        let sagResult: SagModelType[] | null = null;
        let tokenCreateResult: any = null;
        let tokenMintResult: any = null;
        const tokenRepository = new TokenRepository();
        await db.transaction(async (tx) => {
            sagResult = await createSag({...sagData, tokenId: ''}, tx);    
            tokenCreateResult = await tokenRepository.createToken({
                name: sagData.sagName,
                symbol: sagData.sagName.substring(0, 3).toUpperCase(),
                treasuryAccountId: hederaInfo?.hederaAccountId || '',
                treasuryPrivateKey: PrivateKey.fromStringECDSA(hashedPrivateKey),
                expiredAt: new Date(sagData.expiredAt || '').toISOString(),
                adminKey: hashedPublicKey,
                supplyKey: hashedPublicKey,
                freezeKey: hashedPublicKey,
                wipeKey: hashedPublicKey,
            }, userInfo?.accountId || '');
            const ipfsMetadata = await uploadJsonToIpfs(sagData.sagProperties);
            
            tokenMintResult = await tokenRepository.mintTokenConcurrently({
                tokenId: tokenCreateResult.tokenId,
                amount: sagData.sagProperties.mintShare,
                supplyKey: PrivateKey.fromStringECDSA(hashedPrivateKey),
                metadata: ipfsMetadata,
            });
            goldEvaluateResult = await callGoldEvaluator(goldEvaluateJson);
            await tx.update(SagModel).set({
                tokenId: tokenCreateResult?.tokenId || '',
                sagProperties: {
                    ...sagData.sagProperties,
                    risk_level: goldEvaluateResult!.metrics.risk_level,
                    ltv: goldEvaluateResult!.metrics.ltv,
                    action: goldEvaluateResult!.recommendation.action,
                    rationale: goldEvaluateResult!.recommendation.rationale,
                    eval_id: goldEvaluateResult!.eval_id
                }
            }).where(eq(SagModel.sagId, sagResult[0].sagId));    
        });

        res.status(201).json({
            success: true,
            message: 'SAG created successfully',
            data: {
                sag: sagResult,
                token: {
                    tokenId: tokenCreateResult?.tokenId,
                    transactionId: tokenCreateResult?.transactionId
                },
                minting: {
                    totalProcessed: tokenMintResult?.totalProcessed || 0,
                    totalFailed: tokenMintResult?.totalFailed || 0,
                    batches: tokenMintResult?.batches.length || 0,
                    serialNumbers: tokenMintResult?.serialNumbers || [],
                    summary: `Successfully minted ${tokenMintResult?.totalProcessed || 0} NFTs using ${tokenMintResult?.batches.length || 0} batches`
                },
                goldEvaluation: {
                    risk_level: goldEvaluateResult!.metrics.risk_level,
                    ltv: goldEvaluateResult!.metrics.ltv,
                    collateral_value_myr: goldEvaluateResult!.metrics.collateral_value_myr,
                    action: goldEvaluateResult!.recommendation.action,
                    rationale: goldEvaluateResult!.recommendation.rationale,
                    eval_id: goldEvaluateResult!.eval_id
                }
            }
        });
    } catch (error) {
        console.error('Error creating SAG:', error);
        
        // Provide more detailed error information
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        
        res.status(500).json({ 
            success: false,
            error: 'Failed to create SAG',
            details: errorMessage,
            timestamp: new Date().toISOString()
        });
    }
}

/**
 * Create SAG asynchronously using BullMQ and Socket.IO
 * This method queues the SAG creation job and returns immediately
 */
export const createSagAsyncController = async (req: Request, res: Response) => {
    try {
        // Validate request body
        const sagData = SagSchema.parse(req.body);
        
        if (!sagData) {
            return res.status(400).json({ error: 'SAG data is required' });
        }

        // Get user info from JWT token
        const userInfo = await getUserDataByToken(req.headers.authorization?.split(' ')[1] || '');
        if (!userInfo) {
            res.status(401).json({
                success: false,
                error: 'Unauthorized'
            });
            return;
        }


        console.log(`[${new Date().toISOString()}] Queuing async SAG creation for ${sagData.sagName} by user ${userInfo.accountId}`);

        // Queue the SAG creation job
        const job = await sagCreationQueue.add(
            JOB_TYPES.CREATE_SAG,
            {
                sagData,
                userId: userInfo.accountId || ''
            },
            {
                jobId: `async-sag-creation-${sagData.sagName}-${Date.now()}`,
                priority: 1, // Higher priority for manual SAG creation
                removeOnComplete: 10, // Keep last 10 completed jobs
                removeOnFail: 5,      // Keep last 5 failed jobs
            }
        );

        // Return immediately with job information
        const response = {
            success: true,
            message: 'SAG creation process queued successfully',
            data: {
                jobId: job.id,
                sagName: sagData.sagName,
                status: 'queued',
                timestamp: new Date().toISOString(),
                estimatedProcessingTime: '3-8 minutes', // Estimated time
            }
        };

        res.status(202).json(response); // 202 Accepted for async processing

    } catch (error) {
        console.error('Error queuing SAG creation:', error);
        
        const response = {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error occurred'
        };

        res.status(400).json(response);
    }
}

/**
 * Get SAG creation job status by job ID
 */
export const getSagCreationStatusController = async (req: Request, res: Response) => {
    try {
        const { jobId } = req.params;

        if (!jobId) {
            res.status(400).json({
                success: false,
                error: 'Job ID is required'
            });
            return;
        }

        // Get job from SAG creation queue
        const job = await sagCreationQueue.getJob(jobId);
        
        if (!job) {
            res.status(404).json({
                success: false,
                error: 'Job not found'
            });
            return;
        }

        const jobState = await job.getState();
        
        const response = {
            success: true,
            data: {
                jobId: job.id,
                state: jobState,
                progress: job.progress || 0,
                data: job.data,
                returnvalue: job.returnvalue,
                failedReason: job.failedReason,
                timestamp: job.timestamp,
                processedOn: job.processedOn,
                finishedOn: job.finishedOn,
                attemptsMade: job.attemptsMade,
            }
        };

        res.status(200).json(response);

    } catch (error) {
        console.error('Error getting SAG creation status:', error);
        
        res.status(400).json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error occurred'
        });
    }
}

export const getAllSagsController = async (req: Request, res: Response) => {
    try {        
        const result = await getSag(req.query);
        
        res.status(200).json({
            success: true,
            message: 'All SAGs fetched successfully',
            data: result.data,
            pagination: result.pagination
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to get SAGs' });
        console.error(error);
    }
}

export const getSagController = async (req: Request, res: Response) => {
    try {
        const sagId = req.params.id;
        if (!sagId) {
            return res.status(400).json({ error: 'SAG ID is required' });
        }
        const result = await getSag({ id: sagId });
        res.status(200).json({
            success: true,
            message: 'SAG fetched successfully',
            data: result.data
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to get SAG' });
    }
}

export const approveSagController = async (req: Request, res: Response) => {
    try {   
        const sagId = req.body.sagId;
        if (!sagId) {
            return res.status(400).json({ error: 'SAG ID is required' });
        }
        const result = await updateSag(sagId, { approvalStatus: 'active' });
        res.status(200).json({
            success: true,
            message: 'SAG updated approval status successfully',
            data: result
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update SAG approval status' });
        console.error(error);
    }
}

export const rejectSagController = async (req: Request, res: Response) => {
    try {   
        const sagId = req.body.sagId;
        if (!sagId) {
            return res.status(400).json({ error: 'SAG ID is required' });
        }
        const result = await updateSag(sagId, { approvalStatus: 'rejected' });
        res.status(200).json({
            success: true,
            message: 'SAG updated rejection status successfully',
            data: result
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update SAG rejection status' });
        console.error(error);
    }
}

export const overrideFailureSagController = async (req: Request, res: Response) => {
    try {
        const validatedData = SagOverrideFailureSchema.parse(req.body);
        const userInfo = await getUserDataByToken(req.headers.authorization?.split(' ')[1] || '');
        
        const result = await db.transaction(async (tx) => {
            // Submit encrypted message to topic (outside the response cycle)
            const topicResult = await submitEncryptedMessageToTopic(
                process.env.OVERRIDE_TOPIC_ID || '',
                {
                    sag_id: validatedData.sag_id,
                    risk_level: validatedData.risk_level,
                    recommended_action: validatedData.action,
                    ltv: validatedData.ltv
                },
                userInfo?.accountId
            );
            
            console.log('Topic message submitted:', topicResult);
            
            // Update SAG in database
            return await overrideFailureSag(validatedData, tx);
        });
        
        res.status(200).json({
            success: true,
            message: 'SAG failure status overridden successfully',
            data: result[0]
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to override SAG failure status' });
    }
}
