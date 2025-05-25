import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import PushNotification from 'react-native-push-notification';
import { showLocalNotification } from '../services/notificationService';
import { SettingsContext } from '../context/SettingsContext';

type WebSocketContextType = {
  sendMessage: (action: string, data: any) => void;
  notifications: any[];
  sensorData: any;
};

const WebSocketContext = createContext<WebSocketContextType>({
  sendMessage: () => {},
  notifications: [],
  sensorData: null,
});

export const WebSocketProvider = ({ children }: { children: React.ReactNode }) => {
  const { settings, saveSettings } = useContext(SettingsContext);

  const [ws, setWs] = useState<WebSocket | null>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [sensorData, setSensorData] = useState<any>(null);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const handleNotifications = () => {
      if (notifications.length > 0) {
        const lastNotification = notifications[notifications.length - 1];
        showLocalNotification('Plant Alert', lastNotification.message);
        setNotifications(prev => [lastNotification]);
        PushNotification.setApplicationIconBadgeNumber(1);
      }
    };
    
    handleNotifications();
  }, [notifications.length]);
  // Updated WebSocketProvider useEffect
  useEffect(() => {
    let reconnectTimeout: NodeJS.Timeout;

    const connect = () => {
      const websocket = new WebSocket('ws://192.168.0.152:3000');
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
            setNotifications(prev => [...prev, {
              id: Date.now().toString(),
              type: 'info',
              message: message.message,
              timestamp: Date.now()
            }]);
          } else if (message.sensorData) {
            setSensorData(message.sensorData);
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
    <WebSocketContext.Provider value={{ sendMessage, notifications, sensorData }}>
      {children}
    </WebSocketContext.Provider>
  );
};


export const useWebSocket = () => useContext(WebSocketContext);