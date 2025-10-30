import apiInstance from '@/lib/axios-v1';
import { SAGResponse, SAGApiParams } from '@/types/sag';

export async function fetchSAGs(params: SAGApiParams = {}): Promise<SAGResponse> {
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

    const url = `/sag${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    console.log('📡 Fetching SAGs from:', url);
    
    const response = await apiInstance.get<SAGResponse>(url);
    return response.data;
  } catch (error) {
    console.error('❌ Error fetching SAGs:', error);
    throw error;
  }
}

export async function fetchSAGById(id: string) {
  try {
    const response = await apiInstance.get(`/sag/${id}`);
    return response.data;
  } catch (error) {
    console.error(`❌ Error fetching SAG ${id}:`, error);
    throw error;
  }
}
