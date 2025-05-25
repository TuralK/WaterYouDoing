import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';

type Settings = {
  moistureThreshold: number;
  minTemperature: number;
  maxTemperature: number;
  autoWatering: boolean;
  autoClimate: boolean;
};

type SettingsContextType = {
  settings: Settings;
  saveSettings: (settings: Settings) => void;
};

const defaultSettings: Settings = {
  moistureThreshold: 40,
  minTemperature: 18,
  maxTemperature: 28,
  autoWatering: true,
  autoClimate: true,
};

export const SettingsContext = createContext<SettingsContextType>({
  settings: defaultSettings,
  saveSettings: () => {},
});

export const SettingsProvider = ({ children }: { children: React.ReactNode }) => {
  const [settings, setSettings] = useState<Settings>(defaultSettings);

  useEffect(() => {
    const loadSettings = async () => {
      const savedSettings = await AsyncStorage.getItem('settings');
      if (savedSettings) setSettings(JSON.parse(savedSettings));
    };
    loadSettings();
  }, []);

  const saveSettings = async (newSettings: Settings) => {
    const validatedSettings = {
      ...newSettings,
      moistureThreshold: Math.max(0, Math.min(100, newSettings.moistureThreshold)),
      minTemperature: Math.max(-10, Math.min(newSettings.maxTemperature - 1, newSettings.minTemperature)),
      maxTemperature: Math.min(50, Math.max(newSettings.minTemperature + 1, newSettings.maxTemperature)),
    };
    await AsyncStorage.setItem('settings', JSON.stringify(validatedSettings));
    setSettings(validatedSettings);
    Alert.alert('Success', 'Settings saved successfully!', [
      { text: 'OK', onPress: () => {} }
    ]);
  };


  return (
    <SettingsContext.Provider value={{ settings, saveSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => useContext(SettingsContext);