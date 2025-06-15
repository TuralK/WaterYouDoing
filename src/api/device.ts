import apiClient from './apiClient';
import { Device } from '../types/models';

interface DeviceQueryParams {
  page?: number;
  limit?: number;
  sortBy?: string;
}

export const deviceApi = {
  getDevices: async (params?: DeviceQueryParams): Promise<Device[]> => {
    const response = await apiClient.get<Device[]>('/devices', { params });
    return response.data;
  },

  getDeviceById: async (id: string): Promise<Device> => {
    const response = await apiClient.get<Device>(`/devices/${id}`);
    return response.data;
  },

  turnOnDevice: async (id: string): Promise<Device> => {
    const response = await apiClient.post<Device>(`/device/${id}/on`);
    return response.data;
  },

  turnOffDevice: async (id: string): Promise<Device> => {
    const response = await apiClient.post<Device>(`/device/${id}/off`);
    return response.data;
  },

  updateDeviceAutomation: async (id: string, isAutomated: number): Promise<Device> => {
    const response = await apiClient.put<Device>(`/device/${id}/automation`, { isAutomated });
    return response.data;
  }
};