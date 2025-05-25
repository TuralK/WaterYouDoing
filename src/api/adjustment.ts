import apiClient from './apiClient';
import { Adjustment } from '../types/models';

interface AdjustmentQueryParams {
  page?: number;
  limit?: number;
  sortBy?: string;
}

export const adjustmentApi = {
  getAdjustments: async (params?: AdjustmentQueryParams): Promise<Adjustment[]> => {
    const response = await apiClient.get<Adjustment[]>('/adjustments', { params });
    return response.data;
  },

  getAdjustmentById: async (id: string): Promise<Adjustment> => {
    const response = await apiClient.get<Adjustment>(`/adjustments/${id}`);
    return response.data;
  },

  createAdjustment: async (adjustmentData: Omit<Adjustment, 'id'>): Promise<Adjustment> => {
    const response = await apiClient.post<Adjustment>('/adjustments', adjustmentData);
    return response.data;
  },

  updateAdjustment: async (id: string, adjustmentData: Partial<Adjustment>): Promise<Adjustment> => {
    const response = await apiClient.put<Adjustment>(`/adjustments/${id}`, adjustmentData);
    return response.data;
  }
};