import { Notification, WebSocketMessage } from '../types/types';

const MockWebSocket = () => {
  let listeners: ((message: WebSocketMessage) => void)[] = [];
  
  // Simulate notifications
  setInterval(() => {
    const mockNotification: Notification = {
      id: Date.now().toString(),
      message: Math.random() > 0.5 
        ? `Low soil moisture (${Math.floor(Math.random() * 20)}%) detected!` 
        : `Temperature alert: ${Math.floor(20 + Math.random() * 20)}°C`,
      type: Math.random() > 0.7 ? 'alert' : 'warning',
      timestamp: new Date().toISOString(),
    };

    listeners.forEach(cb => cb({
      type: 'notification',
      payload: mockNotification
    }));
  }, 10000);

  return {
    addEventListener: (callback: (message: WebSocketMessage) => void) => {
      listeners.push(callback);
    },
    removeEventListener: (callback: (message: WebSocketMessage) => void) => {
      listeners = listeners.filter(cb => cb !== callback);
    },
    close: () => {
      listeners = [];
      console.log('[MOCK] WebSocket closed');
    }
  };
};

export default MockWebSocket;