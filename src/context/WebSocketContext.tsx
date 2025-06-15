import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { WEBSOCKET_URL } from '@env';
import uuid from 'react-native-uuid';
import PushNotification from 'react-native-push-notification';
import { SensorData } from '../types/types';
import { showLocalNotification } from '../services/notificationService';
import { deviceApi } from '../api/device';
import { notificationApi } from '../api/notification';

type WebSocketContextType = {
  sendMessage: (action: string, data: any) => void;
  notifications: any[];
  sensorData: SensorData;
  heatingEnabled: boolean;
  coolingEnabled: boolean;
  wateringEnabled: boolean;
  updateSensorData: (newData: Partial<SensorData>) => void;
  refetchNotifications: () => Promise<void>;
};

const WebSocketContext = createContext<WebSocketContextType>({
  sendMessage: () => {},
  notifications: [],
  sensorData: {
    soilMoisture: 0,
    temperature: 0,
    plantHeight: 0,
    growthRate: 0,
    timestamp: '',
  },
  heatingEnabled: false,
  coolingEnabled: false,
  wateringEnabled: false,
  updateSensorData: () => {},
  refetchNotifications: async () => {},
});

export const WebSocketProvider = ({ children }: { children: React.ReactNode }) => {
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [sensorData, setSensorData] = useState<SensorData>({
    soilMoisture: 0,
    temperature: 0,
    plantHeight: 0,
    growthRate: 0,
    timestamp: '',
  });
  const updateSensorData = (newData: Partial<SensorData>) => {
    setSensorData(prev => ({
      ...prev,
      ...newData,
    }));
  };
  const wsRef = useRef<WebSocket | null>(null);

  const [heatingEnabled, setHeatingEnabled] = useState(false);
  const [coolingEnabled, setCoolingEnabled] = useState(false);
  const [wateringEnabled, setWateringEnabled] = useState(false);

  const notificationCountRef = useRef(0);
  const MAX_NOTIFICATIONS = 50;

  const fetchNotifications = useCallback(async () => {
    try {
      const fetchedNotifications = await notificationApi.getNotifications();
      // Sort by timestamp descending to keep the list consistent
      const sorted = fetchedNotifications.sort((a, b) => new Date(b.timestamp as string).getTime() - new Date(a.timestamp as string).getTime());
      setNotifications(sorted.slice(0, MAX_NOTIFICATIONS));
      notificationCountRef.current = sorted.length;
    } catch (e) {
      console.error('Failed to fetch notifications:', e);
    }
  }, []);

  useEffect(() => {
    const fetchInitialDeviceStatus = async () => {
      try {
        const devices = await deviceApi.getDevices();
        setHeatingEnabled(devices.find(d => d.name === 'heater')?.status === 'on' || false);
        setCoolingEnabled(devices.find(d => d.name === 'cooler')?.status === 'on' || false);
        setWateringEnabled(devices.find(d => d.name === 'pump')?.status === 'on' || false);
      } catch (e) {
        console.error('Failed to fetch initial device states:', e);
      }
    };

    fetchInitialDeviceStatus();
    fetchNotifications();
  }, [fetchNotifications]);

  useEffect(() => {
    if (notifications.length > notificationCountRef.current) {
      const newNotification = notifications[notifications.length - 1];
      showLocalNotification('Plant Alert', newNotification.message);
      PushNotification.setApplicationIconBadgeNumber(notifications.length);
    }
    notificationCountRef.current = notifications.length;
  }, [notifications.length]);

  useEffect(() => {
    const handleNotifications = () => {
      if (notifications.length > 0) {
        const lastNotification = notifications[notifications.length - 1];
        showLocalNotification('Plant Alert', lastNotification.message);
        // setNotifications(prev => [lastNotification]);
        PushNotification.setApplicationIconBadgeNumber(1);
      }
    };
    
    handleNotifications();
  }, [notifications.length]);
  // Updated WebSocketProvider useEffect
  useEffect(() => {
    let reconnectTimeout: NodeJS.Timeout;

    const connect = () => {
      const websocket = new WebSocket(WEBSOCKET_URL);
      wsRef.current = websocket;

      websocket.onopen = () => {
        console.log('WebSocket connected');
        setWs(websocket);
      };

      websocket.onmessage = (event) => {
        const rawData = event.data;

        if (rawData === 'WebSocket connection established') {
          console.log('WebSocket connection confirmed');
          return;
        }

        try {
          const message = JSON.parse(rawData);
          console.log('Received message:', message);

          if (message.status === 'info') {
            const text = message.message.toLowerCase();

            if (text.includes('heater is stopped')) {
              setHeatingEnabled(false);
            }

            if (text.includes('cooler is stopped')) {
              setCoolingEnabled(false);
            }

            if (text.includes('pump is stopped')) {
              setWateringEnabled(false);
            }

            if (text.includes('heater is started')) {
              setHeatingEnabled(true);
            }

            if (text.includes('cooler is started')) {
              setCoolingEnabled(true);
            }

            if (text.includes('pump is started')) {
              setWateringEnabled(true);
            }

            setNotifications(prev => [
              ...prev,
              {
                id: uuid.v4(),
                type: 'info',
                message: message.message,
                timestamp: Date.now()
              }
            ].slice(-MAX_NOTIFICATIONS));
          } else if (message.status === 'updateTemperature') {
            setSensorData((prev) => ({
              ...prev,
              temperature: message.value,
            }));
          } else if (message.status === 'updateSoilMoisture') {
            setSensorData((prev) => ({
              ...prev,
              soilMoisture: message.value,
            }));
          }
        } catch (error) {
          console.error('JSON parse error:', error, 'Raw data:', rawData);
        }
      };

      websocket.onclose = () => {
        console.log('WebSocket disconnected. Reconnecting in 2 seconds...');
        reconnectTimeout = setTimeout(connect, 2000);
      };

      websocket.onerror = (error) => {
        console.error('WebSocket error:', error);
        websocket.close();
      };
    };

    connect();

    return () => {
      clearTimeout(reconnectTimeout);
      wsRef.current?.close(); // Close the active socket on cleanup
    };
  }, []);

  const sendMessage = (action: string, data: any) => {
    if (ws?.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ action, ...data }));
    }
  };

  return (
    <WebSocketContext.Provider value={{
      sendMessage,
      notifications,
      sensorData,
      heatingEnabled,
      coolingEnabled,
      wateringEnabled,
      updateSensorData,
      refetchNotifications: fetchNotifications,
    }}>
      {children}
    </WebSocketContext.Provider>
  );
};


export const useWebSocket = () => useContext(WebSocketContext);