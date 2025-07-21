// HomeScreen.tsx (updated)
import React, { use, useEffect, useState } from 'react';
import { ScrollView, RefreshControl, StyleSheet, Text, View } from 'react-native';
import SensorCard from '../components/SensorCard';
import { fetchSensorData } from '../api/mockApi';
import { SensorData } from '../types/types';
import ControlsComponent from '../components/ControlsComponent';
import { useWebSocket } from '../context/WebSocketContext';
import { Sensor } from '../types/models';
import { sensorApi } from '../api/sensor';
import { navigate } from '../navigation/navigationRef';

const HomeScreen = () => {
  const { sensorData, updateSensorData } = useWebSocket();
  // const [sensorData, setSensorData] = useState<SensorData>();
  const [refreshing, setRefreshing] = useState(false);
  const [lastNotification, setLastNotification] = useState<string | null>(null);
  const { notifications, sortedNotifications } = useWebSocket();
  const [sensors, setSensors] = useState<Sensor[]>([]);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await sensorApi.getSensors();
        setSensors(response);
        const tempSensor = response.at(0);
        const soilMoistureSensor = response.at(1);
        if (tempSensor) {
          updateSensorData({ temperature: tempSensor.value });
        }
        if (soilMoistureSensor) {
          updateSensorData({ soilMoisture: soilMoistureSensor.value });
        }
      } catch (error) {
        console.error('Error fetching sensor data:', error);
      } finally {
        console.log('Sensor data fetch completed');
      }
      console.log('Sensors:', sensors);
    };
    fetchData();
  }, []);


  // const loadData = async () => {
  //   setRefreshing(true);
  //   const data = await fetchSensorData();
  //   setSensorData(data);
  //   setRefreshing(false);
  // };

  useEffect(() => {
    if (sortedNotifications.length > 0) {
      setLastNotification(sortedNotifications[0].message);
      // Clear after 5 seconds
      const timer = setTimeout(() => setLastNotification(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [sortedNotifications]);

  // useEffect(() => {
  //   const interval = setInterval(loadData, 5000);
  //   return () => clearInterval(interval);
  // }, []);

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          // onRefresh={loadData}
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