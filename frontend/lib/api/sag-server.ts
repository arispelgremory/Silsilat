import { SAGResponse, SAGApiParams, SAG, TokenResponse, TokenData, SAGWithTokenData } from '@/types/sag';

// Server-side API function that doesn't require browser-specific features
export async function fetchSAGsServer(params: SAGApiParams = {}): Promise<SAGResponse> {
  try {
    const queryParams = new URLSearchParams();
    
    if (params.page !== undefined) {
      queryParams.append('page', params.page.toString());
    }
    if (params.page_size !== undefined) {
      queryParams.append('page_size', params.page_size.toString());
    }
    if (params.status) {
      queryParams.append('status', params.status);
    }
    
    if (params.sort_by) {
      queryParams.append('sort_by', params.sort_by);
    }
    if (params.sort_order) {
      queryParams.append('sort_order', params.sort_order);
    }

    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    const url = `${baseUrl}/v1/sag${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    
    console.log('🚀 Server-side fetching SAGs from:', url);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // Add any required server-side headers here
      },
      // Enable caching for better performance
      next: { revalidate: 300 }, // Revalidate every 5 minutes
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: SAGResponse = await response.json();
    console.log('🔍 API Response data:', JSON.stringify(data, null, 2));
    
    // Ensure data structure matches our interface
    if (data && data.success && data.data && Array.isArray(data.data)) {
      return data;
    } else {
      console.warn('⚠️ API response structure unexpected:', data);
      throw new Error('Invalid API response structure');
    }
  } catch (error) {
    console.error('❌ Error fetching SAGs on server:', error);
    
    // Return fallback data for better UX
    const fallbackData: SAGResponse = {
      success: false,
      message: 'Fallback data - API unavailable',
      data: [
        {
          sagId: 'fallback-1',
          tokenId: '0.0.fallback1',
          sagName: 'Gold Necklace (Demo)',
          sagDescription: 'Premium gold jewelry item',
          sagProperties: {
            loan: 1875,
            karat: 24,
            tenorM: 6,
            weightG: 10,
            currency: 'MYR',
            assetType: 'Gold',
            mintShare: 100,
            soldShare: 78,
            valuation: 2500,
            enableMinting: true,
            loanPercentage: 75,
            pawnerInterestP: 5,
            investorFinancingType: 'Conventional',
            investorRoiPercentage: 6,
            investorRoiFixedAmount: 0
          },
          sagType: 'Conventional',
          certNo: 'DEMO-001',
          status: 'active',
          approvalStatus: 'approved',
          createdAt: new Date().toISOString(),
          closedAt: null,
        },
        {
          sagId: 'fallback-2',
          tokenId: '0.0.fallback2',
          sagName: 'Platinum Ring (Demo)',
          sagDescription: 'Luxury platinum jewelry',
          sagProperties: {
            loan: 3000,
            karat: 18,
            tenorM: 12,
            weightG: 5,
            currency: 'MYR',
            assetType: 'Platinum',
            mintShare: 50,
            soldShare: 22,
            valuation: 4000,
            enableMinting: true,
            loanPercentage: 75,
            pawnerInterestP: 5,
            investorFinancingType: 'Conventional',
            investorRoiPercentage: 8,
            investorRoiFixedAmount: 0
          },
          sagType: 'Conventional',
          certNo: 'DEMO-002',
          status: 'active',
          approvalStatus: 'approved',
          createdAt: new Date().toISOString(),
          closedAt: null,
        },
      ],
      pagination: {
        count: 2,
        totalCount: 2,
        currentPage: 1,
        totalPages: 1,
        hasNextPage: false,
        hasPrevPage: false,
      },
    };

    return fallbackData;
  }
}

export async function fetchTokenDataServer(tokenId: string): Promise<TokenData | undefined> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    const url = `${baseUrl}/v1/token/${tokenId}`;
    
    console.log('🪙 Server-side fetching token data from:', url);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      next: { revalidate: 60 }, // Cache for 1 minute since token data changes more frequently
    });

    if (!response.ok) {
      console.warn(`⚠️ Token API error for ${tokenId}: ${response.status}`);
      return undefined;
    }

    const tokenResponse: TokenResponse = await response.json();
    
    if (tokenResponse.success && tokenResponse.data) {
      return tokenResponse.data;
    } else {
      console.warn('⚠️ Token response structure unexpected:', tokenResponse);
      return undefined;
    }
  } catch (error) {
    console.error(`❌ Error fetching token data for ${tokenId}:`, error);
    return undefined;
  }
}

export async function fetchSAGsWithTokenData(params: SAGApiParams = {}): Promise<SAGResponse> {
  try {
    // First fetch SAG data
    const sagResponse = await fetchSAGsServer(params);
    
    // Then fetch token data for each SAG
    const sagsWithTokenData = await Promise.all(
      sagResponse.data.map(async (sag): Promise<SAGWithTokenData> => {
        const tokenData = await fetchTokenDataServer(sag.tokenId);
        
        let actualMintedShares = 0;
        let actualRemainingShares = 0;
        
        if (tokenData) {
          const totalSupply = parseInt(tokenData.totalSupply);
          const remainingSupply = parseInt(tokenData.remainingSupply);
          actualMintedShares = totalSupply - remainingSupply;
          actualRemainingShares = remainingSupply;
        }
        
        return {
          ...sag,
          tokenData,
          actualMintedShares,
          actualRemainingShares,
        };
      })
    );
    
    return {
      ...sagResponse,
      data: sagsWithTokenData,
    };
  } catch (error) {
    console.error('❌ Error fetching SAGs with token data:', error);
    // Fallback to regular SAG data without token info
    return fetchSAGsServer(params);
  }
}

export async function fetchSAGByIdServer(id: string): Promise<SAG> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    const url = `${baseUrl}/v1/sag/${id}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      next: { revalidate: 300 },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`❌ Error fetching SAG ${id} on server:`, error);
    throw error;
  }
}
