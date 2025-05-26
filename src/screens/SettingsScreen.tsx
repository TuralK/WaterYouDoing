import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    Switch,
    ScrollView,
    Alert,
    ActivityIndicator,
    RefreshControl
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import Button from '../components/Button';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { adjustmentApi } from '../api/adjustment';
import { Adjustment } from '../types/models';
import { useIsFocused } from '@react-navigation/native';


const SettingsScreen = () => {
    const navigation = useNavigation();
    const isFocused = useIsFocused();
    const prevIsFocusedRef = useRef(isFocused);

    // State for current settings values
    const [idealTemperature, setIdealTemperature] = useState<number | string>('');
    const [moistureThreshold, setMoistureThreshold] = useState<number | string>('');
    const [autoWatering, setAutoWatering] = useState<boolean>(false);
    const [autoClimate, setAutoClimate] = useState<boolean>(false);

    const [initialIdealTemperature, setInitialIdealTemperature] = useState<number | string>('');
    const [initialMoistureThreshold, setInitialMoistureThreshold] = useState<number | string>('');
    const [initialAutoWatering, setInitialAutoWatering] = useState<boolean>(false);
    const [initialAutoClimate, setInitialAutoClimate] = useState<boolean>(false);

    const [isLoading, setIsLoading] = useState<boolean>(false); // To manage loading state
    const [isRefreshing, setIsRefreshing] = useState<boolean>(false); // State for refresh control


    const fetchData = useCallback(async () => {
        setIsLoading(true);
        setIsRefreshing(true); 
        try {
            const response: Adjustment[] = await adjustmentApi.getAdjustments();

            const idealTempAdj = response.find(adj => adj.id === 1);
            const moistureAdj = response.find(adj => adj.id === 2);
            const autoWateringAdj = response.find(adj => adj.id === 3);
            const autoClimateAdj = response.find(adj => adj.id === 4);

            const currentIdealTemp = idealTempAdj?.value ?? 0;
            const currentMoisture = moistureAdj?.value ?? 0;
            const currentAutoWatering = (autoWateringAdj?.value === 1);
            const currentAutoClimate = (autoClimateAdj?.value === 1);

            setIdealTemperature(currentIdealTemp);
            setMoistureThreshold(currentMoisture);
            setAutoWatering(currentAutoWatering);
            setAutoClimate(currentAutoClimate);

            // Set initial values for comparison
            // Inside fetchData:
            setInitialIdealTemperature(currentIdealTemp);
            setInitialMoistureThreshold(currentMoisture);
            setInitialAutoWatering(currentAutoWatering);
            setInitialAutoClimate(currentAutoClimate);

        } catch (error) {
            console.error('Error fetching adjustment data:', error);
            Alert.alert('Error', 'Failed to fetch settings data. Please try again.');
        } finally {
            setIsLoading(false);
            // Set isRefreshing to false once data fetching is complete
            setIsRefreshing(false); 
        }
    }, []);

    // Fetch data when the screen focuses
    // useFocusEffect(
    //     useCallback(() => {
    //         fetchData();
    //     }, [fetchData])
    // );
    useEffect(() => {
        fetchData();
    }, []);

    const hasChanges = useCallback(() => {
      const currentIdealTemp = Number(idealTemperature);
      const currentMoisture = Number(moistureThreshold);
      const initialIdealTemp = Number(initialIdealTemperature);
      const initialMoisture = Number(initialMoistureThreshold);

      return (
        currentIdealTemp !== initialIdealTemp ||
        currentMoisture !== initialMoisture ||
        autoWatering !== initialAutoWatering ||
        autoClimate !== initialAutoClimate
      );
    }, [
      idealTemperature,
      moistureThreshold,
      autoWatering,
      autoClimate,
      initialIdealTemperature,
      initialMoistureThreshold,
      initialAutoWatering,
      initialAutoClimate
    ]);

    const revertChanges = useCallback(() => {
      setIdealTemperature(initialIdealTemperature);
      setMoistureThreshold(initialMoistureThreshold);
      setAutoWatering(initialAutoWatering);
      setAutoClimate(initialAutoClimate);
    }, [initialIdealTemperature, initialMoistureThreshold, initialAutoWatering, initialAutoClimate]);

    useEffect(() => {
      if (prevIsFocusedRef.current && !isFocused) {
        if (hasChanges()) {
          Alert.alert(
            'Unsaved Changes',
            'You have unsaved changes. Are you sure you want to discard them?',
            [
              { 
                text: 'Cancel', 
                style: 'cancel',
                onPress: () => navigation.navigate({ name: 'Settings' } as never)
              },
              {
                text: 'Discard',
                style: 'destructive',
                onPress: () => {
                  revertChanges();
                }
              }
            ]
          );
        }
      }
      prevIsFocusedRef.current = isFocused;
    }, [isFocused, hasChanges, revertChanges, navigation]);

    const handleSave = async () => {
        const parsedIdealTemperature = Number(idealTemperature);
        const parsedMoistureThreshold = Number(moistureThreshold);

        if (isNaN(parsedIdealTemperature) || isNaN(parsedMoistureThreshold)) {
            Alert.alert('Invalid Input', 'Please enter valid numeric values for temperature and moisture.');
            return;
        }

        if (parsedMoistureThreshold < 0 || parsedMoistureThreshold > 100) {
            Alert.alert('Invalid Input', 'Moisture threshold must be between 0 and 100%.');
            return;
        }

        try {
            await Promise.all([
                adjustmentApi.updateAdjustment('1', { id: 1, value: parsedIdealTemperature }),
                adjustmentApi.updateAdjustment('2', { id: 2, value: parsedMoistureThreshold }),
                // adjustmentApi.updateAdjustment('3', { id: 3, value: autoWatering ? 1 : 0 }),
                // adjustmentApi.updateAdjustment('4', { id: 4, value: autoClimate ? 1 : 0 }),
            ]);

            // Inside handleSave:
            setInitialIdealTemperature(parsedIdealTemperature);
            setInitialMoistureThreshold(parsedMoistureThreshold);
            setInitialAutoWatering(autoWatering);
            setInitialAutoClimate(autoClimate);

            Alert.alert('Success!', 'Settings saved successfully!', [{ text: 'OK' }]);
        } catch (error) {
            console.error('Error saving settings:', error);
            Alert.alert('Error', 'Failed to save settings. Please try again.');
        }
    };

    if (isLoading && !isRefreshing) { // Show loading indicator only on initial load
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#0000ff" />
                <Text style={styles.loadingText}>Loading settings...</Text>
            </View>
        );
    }

    return (
        <ScrollView
            style={styles.container}
            refreshControl={
                <RefreshControl
                    refreshing={isRefreshing}
                    onRefresh={fetchData}
                    colors={["#0000ff"]} // Android
                    tintColor={"#0000ff"} // iOS
                />
            }
        >
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>
                    <Icon name="water" size={18} color="#2980B9" /> Soil Moisture
                </Text>
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Minimum Moisture (%):</Text>
                    <TextInput
                        style={styles.input}
                        keyboardType="numeric"
                        value={String(moistureThreshold)}
                        onChangeText={(v) => {
                            if (v === '') {
                                setMoistureThreshold('');
                            } else {
                                const num = Number(v);
                                if (!isNaN(num)) {
                                    setMoistureThreshold(num);
                                }
                            }
                        }}
                        onBlur={() => {
                            if (moistureThreshold === '') {
                                setMoistureThreshold(0);
                            }
                        }}
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
                        value={String(idealTemperature)}
                        onChangeText={(v) => {
                            if (v === '') {
                                setIdealTemperature('');
                            } else {
                                const num = Number(v);
                                if (!isNaN(num)) {
                                    setIdealTemperature(num);
                                }
                            }
                        }}
                        onBlur={() => {
                            if (idealTemperature === '') {
                                setIdealTemperature(0);
                            }
                        }}
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
                        value={autoWatering}
                        onValueChange={setAutoWatering}
                        trackColor={{ false: "#767577", true: "#81b0ff" }}
                    />
                </View>
                <View style={styles.switchRow}>
                    <Text style={styles.label}>Enable Climate Control</Text>
                    <Switch
                        value={autoClimate}
                        onValueChange={setAutoClimate}
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
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F5F9FC',
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: '#555',
    },
    section: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.22,
        shadowRadius: 2.22,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#2C3E50',
        marginBottom: 12,
        flexDirection: 'row',
        alignItems: 'center',
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
        color: '#34495E',
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
        marginBottom: 40,
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
        textAlign: 'center',
    },
});

export default SettingsScreen;