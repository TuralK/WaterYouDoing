import React, { useContext, useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TextInput, Switch, ScrollView, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SettingsContext } from '../context/SettingsContext';
import Button from '../components/Button';
import Icon from 'react-native-vector-icons/MaterialIcons';

const SettingsScreen = () => {
  const { settings, saveSettings } = useContext(SettingsContext);
  const [localSettings, setLocalSettings] = useState(settings);
  const navigation = useNavigation();

  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  const localSettingsRef = useRef(localSettings);
  const settingsRef = useRef(settings);

  useEffect(() => {
    localSettingsRef.current = localSettings;
    settingsRef.current = settings;
  }, [localSettings, settings]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', (e) => {
      const currentLocal = localSettingsRef.current;
      const currentContext = settingsRef.current;

      if (JSON.stringify(currentLocal) !== JSON.stringify(currentContext)) {
        // Prevent default navigation
        e.preventDefault();

        Alert.alert(
          'Unsaved Changes',
          'You have unsaved changes. Are you sure you want to discard them?',
          [
            {
              text: 'Cancel',
              style: 'cancel',
              onPress: () => {
                // Do nothing, alert dismisses automatically
              },
            },
            {
              text: 'Discard',
              style: 'destructive',
              onPress: () => {
                // Allow navigation by dispatching the original action
                navigation.dispatch(e.data.action);
              },
            },
          ]
        );
      }
    });

    return unsubscribe;
  }, [navigation]);

  const handleSave = () => {
    saveSettings(localSettings);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          <Icon name="water" size={18} color="#2980B9" /> Soil Moisture
        </Text>
        
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Minimum Moisture (%):</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={String(localSettings.moistureThreshold)}
            onChangeText={(v) => setLocalSettings(prev => ({
              ...prev,
              moistureThreshold: Number(v)
            }))}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          <Icon name="device-thermostat" size={18} color="#E74C3C" /> Temperature
        </Text>
        
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Ideal Temp (°C):</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={String(localSettings.minTemperature)}
            onChangeText={(v) => setLocalSettings(prev => ({
              ...prev,
              minTemperature: Number(v)
            }))}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          <Icon name="auto-mode" size={18} color="#27AE60" /> Automation
        </Text>
        
        <View style={styles.switchRow}>
          <Text style={styles.label}>Enable Auto Watering</Text>
          <Switch
            value={localSettings.autoWatering}
            onValueChange={(v) => setLocalSettings(prev => ({
              ...prev,
              autoWatering: v
            }))}
            trackColor={{ false: "#767577", true: "#81b0ff" }}
          />
        </View>

        <View style={styles.switchRow}>
          <Text style={styles.label}>Enable Climate Control</Text>
          <Switch
            value={localSettings.autoClimate}
            onValueChange={(v) => setLocalSettings(prev => ({
              ...prev,
              autoClimate: v
            }))}
            trackColor={{ false: "#767577", true: "#81b0ff" }}
          />
        </View>
      </View>

       <View style={styles.buttonContainer}>
        <Button 
          title="Save Settings" 
          onPress={handleSave} 
          style={styles.saveButton}
          textStyle={styles.buttonText}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#F5F9FC',
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 12,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    color: '#7F8C8D',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#BDC3C7',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  saveButton: {
    backgroundColor: '#2E7D32',
    borderRadius: 8,
    paddingVertical: 14,
    elevation: 2,
  },
  buttonContainer: {
    marginTop: 30,
    paddingHorizontal: 16,
    marginBottom: 40, // Added bottom margin
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default SettingsScreen;