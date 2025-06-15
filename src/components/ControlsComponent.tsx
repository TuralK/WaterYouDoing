// ControlsComponent.tsx (updated)
import React, { useState, useEffect } from 'react';
import { View, Switch, Text, StyleSheet, Alert } from 'react-native';
import { sendControlCommand } from '../api/mockApi';
import { useControls } from '../context/ControlsContext';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { deviceApi } from '../api/device';
import { Device } from '../types/models';
import { useWebSocket } from '../context/WebSocketContext';
import { events } from '../events/events';

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
  const [devices, setDevices] = useState<Device[]>([]);
  const { heatingEnabled, coolingEnabled, wateringEnabled } = useWebSocket();

  useEffect(() => {
    const fetchDevices = async () => {
      try {
        const response = await deviceApi.getDevices();
        setDevices(response);
        const updatedControls = {
          watering: response.find(device => device.name === 'pump')?.status === 'on' || false,
          heating: response.find(device => device.name === 'heater')?.status === 'on' || false,
          cooling: response.find(device => device.name === 'cooler')?.status === 'on' || false,
        };
        setControls(updatedControls);
      } catch (error) {
        console.error('Error fetching devices:', error);
      }
    };
    fetchDevices();
  }, []);

  useEffect(() => {
    setControls({
      watering: wateringEnabled,
      heating: heatingEnabled,
      cooling: coolingEnabled,
    });
  }, [wateringEnabled, heatingEnabled, coolingEnabled]);

  const handleControl = async (control: keyof typeof controls, value: boolean) => {
    let newControls = { ...controls };

    // Fetch current automation status
    try {
      const automationResponse = await deviceApi.getDevices();
      const isClimateAutomated = automationResponse[0]?.isAutomated === 1;
      const isWateringAutomated = automationResponse[2]?.isAutomated === 1;

      const isControlClimate = control === 'heating' || control === 'cooling';

      // Check if automated
      if (
        (isControlClimate && isClimateAutomated) ||
        (control === 'watering' && isWateringAutomated)
      ) {
        return Alert.alert(
          'Automation Enabled',
          `The ${control === 'watering' ? 'watering' : 'climate'} system is currently automated. Changing this manually will disable automation. Do you want to proceed?`,
          [
            {
              text: 'Cancel',
              style: 'cancel',
            },
            {
              text: 'Proceed',
              onPress: async () => {
                if (isControlClimate) {
                  await deviceApi.updateDeviceAutomation('1', 0); // disable climate automation
                } else {
                  await deviceApi.updateDeviceAutomation('3', 0); // disable watering automation
                }

                events.emit('automationDisabled');
                await proceedWithControlChange(control, value);
              },
            },
          ]
        );
      } else {
        await proceedWithControlChange(control, value);
      }
    } catch (error) {
      console.error('Error handling control change:', error);
    }
  };

   const proceedWithControlChange = async (control: keyof typeof controls, value: boolean) => {
    let newControls = { ...controls };

    if ((control === 'heating' || control === 'cooling') && value) {
      const otherControl = control === 'heating' ? 'cooling' : 'heating';
      
      if (newControls[otherControl]) {
        Alert.alert(
          'System Conflict',
          `Heating and cooling cannot run simultaneously. Turning off ${otherControl} system.`,
          [{ text: 'OK' }]
        );
        await deviceApi.turnOffDevice(otherControl === 'heating' ? '1' : '2'); // Assuming '1' is heater and '2' is cooler
        newControls[otherControl] = false;
      }
    }
    if(value === true) {
      await deviceApi.turnOnDevice(control === 'heating' ? '1' : control === 'cooling' ? '2' : '3');
    } else {
      await deviceApi.turnOffDevice(control === 'heating' ? '1' : control === 'cooling' ? '2' : '3');
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