export type SensorData = {
  soilMoisture: number;
  temperature: number;
  plantHeight: number;
  growthRate: number;
  timestamp: string;
};

export interface Notification {
  id: string;
  type: 'info' | 'warning' | 'alert';
  message: string;
  timestamp: number;
  status: 'unread' | 'read'
}

export type ControlCommand = {
  watering: boolean;
  heating: boolean;
  cooling: boolean;
};

export type WebSocketMessage = {
  type: 'notification' | 'data_update';
  payload: Notification | SensorData;
};

export type RootStackParamList = {
  Home: undefined;
  Notifications: undefined;
  Controls: undefined;
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}