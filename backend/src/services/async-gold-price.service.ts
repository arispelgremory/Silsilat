import { Job } from 'bullmq';
import { fetchGoldPriceData } from './gold-price.service.js';
import { createGoldPrice } from '../features/gold-price/gold-price.repository.js';

/**
 * Gold Price Job Data Interface
 */
export interface GoldPriceJobData {
  manual?: boolean;
  force?: boolean;
}

/**
 * Gold Price Job Result Interface
 */
export interface GoldPriceJobResult {
  success: boolean;
  message: string;
  goldPriceData?: {
    pricePerGramUsd: number;
    pricePerGramMyr: number;
    exchangeRate: number;
    source: string;
  };
  error?: string;
  isManual?: boolean;
  force?: boolean;
}

/**
 * Process gold price fetching job
 * Fetches gold price from external APIs and stores it in the database
 */
export async function processGoldPriceJob(job: Job<GoldPriceJobData>): Promise<GoldPriceJobResult> {
  const isManual = job.data?.manual === true;
  const force = job.data?.force === true;
  
  console.log(`[${new Date().toISOString()}] Starting ${isManual ? 'manual' : 'automatic'} gold price fetch...`);
  
  try {
    // Fetch gold price data from external APIs
    const goldPriceData = await fetchGoldPriceData();
    
    // Check if we already have a gold price entry for today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Create gold price entry
    const goldPriceEntry = {
      date: today,
      pricePerGramUsd: goldPriceData.pricePerGramUsd.toString(),
      pricePerGramMyr: goldPriceData.pricePerGramMyr.toString(),
      exchangeRate: goldPriceData.exchangeRate.toString(),
      source: goldPriceData.source
    };
    
    // Store in database
    const result = await createGoldPrice(goldPriceEntry);
    
    console.log(`Gold price data stored successfully:`, {
      id: result[0]?.id,
      date: goldPriceEntry.date,
      pricePerGramUsd: goldPriceEntry.pricePerGramUsd,
      pricePerGramMyr: goldPriceEntry.pricePerGramMyr,
      exchangeRate: goldPriceEntry.exchangeRate
    });
    
    return {
      success: true,
      message: 'Gold price data fetched and stored successfully',
      goldPriceData: goldPriceData,
      isManual,
      force
    };
    
  } catch (error) {
    console.error('Error processing gold price job:', error);
    
    return {
      success: false,
      message: 'Failed to fetch and store gold price data',
      error: error instanceof Error ? error.message : 'Unknown error',
      isManual,
      force
    };
  }
}
