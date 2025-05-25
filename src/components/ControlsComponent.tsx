// ControlsComponent.tsx (updated)
import React, { useState } from 'react';
import { View, Switch, Text, StyleSheet, Alert } from 'react-native';
import { sendControlCommand } from '../api/mockApi';
import { useControls } from '../context/ControlsContext';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const ControlRow = ({ label, value, onValueChange, icon, color }: {
  label: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  icon: string;
  color: string;
}) => (
  <View style={styles.controlCard}>
    <View style={styles.controlHeader}>
      <Icon name={icon} size={22} color={color} />
      <Text style={styles.controlLabel}>{label}</Text>
    </View>
    <Switch
      value={value}
      onValueChange={onValueChange}
      trackColor={{ false: '#BDC3C7', true: '#BDC3C7' }}
      thumbColor={value ? color : '#F4F3F4'}
    />
  </View>
);

const ControlsComponent = () => {
  const { controls, setControls } = useControls();

   const handleControl = async (control: keyof typeof controls, value: boolean) => {
    let newControls = { ...controls };

    if ((control === 'heating' || control === 'cooling') && value) {
      const otherControl = control === 'heating' ? 'cooling' : 'heating';
      
      if (newControls[otherControl]) {
        Alert.alert(
          'System Conflict',
          `Heating and cooling cannot run simultaneously. Turning off ${otherControl} system.`,
          [{ text: 'OK' }]
        );
        newControls[otherControl] = false;
      }
    }

    newControls[control] = value;
    setControls(newControls);
    await sendControlCommand(newControls);
  };

  return (
    <View style={styles.container}>
      <ControlRow
        icon="water"
        label="Watering System"
        value={controls.watering}
        onValueChange={(v) => handleControl('watering', v)}
        color="#2980B9"
      />
      <ControlRow
        icon="fire"
        label="Heating System"
        value={controls.heating}
        onValueChange={(v) => handleControl('heating', v)}
        color="#E74C3C"
      />
      <ControlRow
        icon="snowflake"
        label="Cooling System"
        value={controls.cooling}
        onValueChange={(v) => handleControl('cooling', v)}
        color="#4A90E2"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  controlCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#2C3E50',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  controlHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  controlLabel: {
    fontSize: 16,
    color: '#2C3E50',
    marginLeft: 12,
  },
});

export default ControlsComponent;