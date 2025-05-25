import React, { useEffect } from 'react';
import { useSettings } from '../context/SettingsContext';
import { useControls } from '../context/ControlsContext';

const AutomationHandler = () => {
  const { settings } = useSettings();
  const { controls, setControls } = useControls();

  // Mock sensor data - replace with real data source
  const mockSensorData = {
    moisture: 35,
    temperature: 25,
  };

  useEffect(() => {
    const newControls = { ...controls };

    // Auto watering logic
    if (settings.autoWatering) {
      if (mockSensorData.moisture < settings.moistureThreshold) {
        console.log('Moisture threshold met - Watering system ON');
        newControls.watering = true;
      } else {
        console.log('Moisture threshold not met - Watering system OFF');
        newControls.watering = false;
      }
    }

    // Auto climate logic
    if (settings.autoClimate) {
      if (mockSensorData.temperature < settings.minTemperature) {
        console.log('Temperature below min - Heating ON');
        newControls.heating = true;
        newControls.cooling = false;
      } else if (mockSensorData.temperature > settings.maxTemperature) {
        console.log('Temperature above max - Cooling ON');
        newControls.cooling = true;
        newControls.heating = false;
      } else {
        newControls.heating = false;
        newControls.cooling = false;
      }
    }

    setControls(newControls);
  }, [settings, mockSensorData.moisture, mockSensorData.temperature]);

  return null;
};

export default AutomationHandler;