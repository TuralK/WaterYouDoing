import apiClient from './apiClient';
import { Sensor } from '../types/models';

interface SensorQueryParams {
  page?: number;
  limit?: number;
  sortBy?: string;
}

export const sensorApi = {
  getSensors: async (params?: SensorQueryParams): Promise<Sensor[]> => {
    const response = await apiClient.get<Sensor[]>('/sensors', { params });
    return response.data;
  },

  getSensorById: async (id: string): Promise<Sensor> => {
    const response = await apiClient.get<Sensor>(`/sensors/${id}`);
    return response.data;
  },

  createSensor: async (sensorData: Omit<Sensor, 'id'>): Promise<Sensor> => {
    const response = await apiClient.post<Sensor>('/sensors', sensorData);
    return response.data;
  },

  updateSensor: async (id: string, sensorData: Partial<Sensor>): Promise<Sensor> => {
    const response = await apiClient.put<Sensor>(`/sensors/${id}`, sensorData);
    return response.data;
  }
};