// SensorCard.tsx (updated)
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SensorData } from '../types/types';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const SensorCard = ({ data }: { data?: SensorData }) => (
  <View style={styles.card}>
    <View style={styles.header}>
      <Icon name="sprout" size={24} color="#27AE60" />
      <Text style={styles.title}>Plant Status</Text>
    </View>
    
    <StatusRow
      icon="water"
      label="Soil Moisture"
      value={`${data?.soilMoisture}%`}
      color="#2980B9"
    />
    <StatusRow
      icon="thermometer"
      label="Temperature"
      value={`${data?.temperature.toFixed(1)}°C`}
      color="#E74C3C"
    />
    <StatusRow
      icon="chart-line"
      label="Plant Height"
      value={`${data?.plantHeight.toFixed(1)}cm`}
      color="#27AE60"
    />
    <StatusRow
      icon="speedometer"
      label="Growth Rate"
      value={`${data?.growthRate.toFixed(2)}cm/day`}
      color="#9B59B6"
    />
  </View>
);

const StatusRow = ({ icon, label, value, color }: any) => (
  <View style={styles.row}>
    <View style={styles.labelContainer}>
      <Icon name={icon} size={20} color={color} style={styles.icon} />
      <Text style={styles.label}>{label}</Text>
    </View>
    <Text style={[styles.value, { color }]}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    margin: 16,
    shadowColor: '#2C3E50',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ECF0F1',
    paddingBottom: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2C3E50',
    marginLeft: 10,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 8,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: 12,
  },
  label: {
    fontSize: 16,
    color: '#7F8C8D',
  },
  value: {
    fontSize: 16,
    fontWeight: '700',
  },
});

export default SensorCard;