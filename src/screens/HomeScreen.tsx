// HomeScreen.tsx (updated)
import React, { useEffect, useState } from 'react';
import { ScrollView, RefreshControl, StyleSheet, Text, View } from 'react-native';
import SensorCard from '../components/SensorCard';
import { fetchSensorData } from '../api/mockApi';
import { SensorData } from '../types/types';
import ControlsComponent from '../components/ControlsComponent';
import { useWebSocket } from '../context/WebSocketContext';

const HomeScreen = () => {
  const [sensorData, setSensorData] = useState<SensorData>();
  const [refreshing, setRefreshing] = useState(false);
  const [lastNotification, setLastNotification] = useState<string | null>(null);
  const { notifications } = useWebSocket();

  const loadData = async () => {
    setRefreshing(true);
    const data = await fetchSensorData();
    setSensorData(data);
    setRefreshing(false);
  };

   useEffect(() => {
    if (notifications.length > 0) {
      setLastNotification(notifications[notifications.length - 1].message);
      // Clear after 5 seconds
      const timer = setTimeout(() => setLastNotification(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [notifications]);

  useEffect(() => {
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={loadData}
          tintColor="#4A90E2"
        />
      }
    >
      <Text style={styles.header}>Status & Control</Text>
      <SensorCard data={sensorData} />
      <ControlsComponent />
       {lastNotification && (
        <View style={styles.notificationBanner}>
          <Text style={styles.notificationText}>{lastNotification}</Text>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F9FC',
  },
  header: {
    fontSize: 28,
    fontWeight: '700',
    color: '#2C3E50',
    padding: 20,
    paddingBottom: 10,
    fontFamily: 'Inter',
  },
   notificationBanner: {
    backgroundColor: '#D32F2F',
    padding: 12,
    marginHorizontal: 16,
    borderRadius: 8,
    marginTop: 16,
  },
  notificationText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
});

export default HomeScreen;