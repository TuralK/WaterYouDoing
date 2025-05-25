import { SensorData, ControlCommand } from '../types/types';

// Mock sensor data generator
const generateMockSensorData = (): SensorData => ({
  soilMoisture: Math.floor(Math.random() * 100),
  temperature: 20 + Math.random() * 15,
  plantHeight: 30 + Math.random() * 10,
  growthRate: 0.5 + Math.random() * 2,
  timestamp: new Date().toISOString(),
});

let mockSensorData = generateMockSensorData();

export const fetchSensorData = async (): Promise<SensorData> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  mockSensorData = generateMockSensorData();
  return mockSensorData;
};

export const sendControlCommand = async (command: ControlCommand): Promise<boolean> => {
  console.log('[MOCK] Control command sent:', command);
  await new Promise(resolve => setTimeout(resolve, 300));
  return true;
};
