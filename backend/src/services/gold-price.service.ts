/**
 * Gold Price Service
 * Fetches gold prices from external APIs and stores them in the database
 */

interface GoldPriceData {
  pricePerGramUsd: number;
  pricePerGramMyr: number;
  exchangeRate: number;
  source: string;
}

/**
 * Fetch gold price in USD per troy ounce from MetalPriceAPI
 * @returns Promise<number> - Gold price in USD per troy ounce
 */
export async function fetchGoldPriceUsd(): Promise<number> {
  const apiKey = process.env.METALPRICE_API_KEY;
  
  if (!apiKey) {
    throw new Error('METALPRICE_API_KEY is not set in environment variables');
  }

  const url = `https://api.metalpriceapi.com/v1/latest?api_key=${apiKey}&base=USD&currencies=XAU`;

  try {
    // Create AbortController for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    const response = await fetch(url, { 
      method: 'GET',
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Pawnshop-NFT-Backend/1.0'
      }
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    // The API returns something like {"rates": {"XAU": 0.00044}, "base": "USD"}
    const rateXau = data.rates.XAU;
    if (rateXau === 0) {
      throw new Error('Invalid XAU rate (0)');
    }
    
    const goldPriceUsdPerOz = 1.0 / rateXau;
    return goldPriceUsdPerOz;
  } catch (error) {
    console.error('Error fetching gold price from MetalPriceAPI:', error);
    throw new Error(`Failed to fetch gold price: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Fetch USD to MYR exchange rate from FastForex
 * @returns Promise<number> - Exchange rate (1 USD = ? MYR)
 */
export async function fetchUsdToMyrRate(): Promise<number> {
  const apiKey = process.env.FASTFOREX_API_KEY;
  
  if (!apiKey) {
    throw new Error('FASTFOREX_API_KEY is not set in environment variables');
  }

  const url = `https://api.fastforex.io/fetch-one?from=USD&to=MYR&api_key=${apiKey}`;

  try {
    // Create AbortController for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(url, { 
      method: 'GET',
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Pawnshop-NFT-Backend/1.0'
      }
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    const rate = parseFloat(data.result.MYR);
    return rate;
  } catch (error) {
    console.error('Error fetching USD/MYR rate from FastForex:', error);
    // Return a safe default rate
    return 4.70;
  }
}

/**
 * Calculate gold price in MYR per gram
 * @param usdPerOz - Gold price in USD per troy ounce
 * @param usdToMyr - USD to MYR exchange rate
 * @returns number - Gold price in MYR per gram
 */
export function calculateGoldPriceMyrPerGram(usdPerOz: number, usdToMyr: number): number {
  // 1 troy ounce = 31.1034768 grams
  const troyOzToGrams = 31.1034768;
  const myrPerGram = (usdPerOz * usdToMyr) / troyOzToGrams;
  return Math.round(myrPerGram * 100) / 100; // Round to 2 decimal places
}

/**
 * Fetch complete gold price data from external APIs
 * @returns Promise<GoldPriceData> - Complete gold price data
 */
export async function fetchGoldPriceData(): Promise<GoldPriceData> {
  try {
    console.log('Fetching gold price data from external APIs...');
    
    // Fetch gold price and exchange rate in parallel
    const [usdPerOz, usdToMyr] = await Promise.all([
      fetchGoldPriceUsd(),
      fetchUsdToMyrRate()
    ]);
    
    const myrPerGram = calculateGoldPriceMyrPerGram(usdPerOz, usdToMyr);
    
    console.log(`Gold price data fetched - USD/oz: ${usdPerOz}, MYR/gram: ${myrPerGram}, USD/MYR: ${usdToMyr}`);
    
    return {
      pricePerGramUsd: Math.round((usdPerOz / 31.1034768) * 100) / 100, // Convert to per gram
      pricePerGramMyr: myrPerGram,
      exchangeRate: Math.round(usdToMyr * 10000) / 10000, // Round to 4 decimal places
      source: 'api'
    };
  } catch (error) {
    console.error('Error fetching gold price data:', error);
    throw error;
  }
}
