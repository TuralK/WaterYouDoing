import React, { useEffect } from 'react';
import PushNotification from 'react-native-push-notification';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { WebSocketProvider } from './src/context/WebSocketContext';
import HomeScreen from './src/screens/HomeScreen';
import NotificationsScreen from './src/screens/NotificationsScreen';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { StyleSheet, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { navigationRef } from './src/navigation/navigationRef';
import {PermissionsAndroid} from 'react-native';
import messaging from '@react-native-firebase/messaging';
import { configureNotifications } from './src/services/notificationService';
import SettingsScreen from './src/screens/SettingsScreen';
import { SettingsProvider } from './src/context/SettingsContext';
import { ControlsProvider } from './src/context/ControlsContext';
import AutomationHandler from './src/components/AutomationHandler';
import CameraScreen from './src/screens/CameraScreen';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context'; // Keep these imports

const Tab = createBottomTabNavigator();

PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS);

// New component to encapsulate the navigation and consume safe area insets
function MainAppContent() {
  const insets = useSafeAreaInsets(); // <--- Call useSafeAreaInsets() here!

  return (
    <NavigationContainer ref={navigationRef}>
      <LinearGradient
        colors={['#E8F5E9', '#F1F8E9']}
        style={styles.background}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Tab.Navigator
          screenOptions={({ route }) => ({
            tabBarIcon: ({ focused, color, size }) => {
              const icons = {
                Home: 'leaf',
                Notifications: 'notifications-outline',
                Settings: 'settings',
                Camera: 'camera',
              } as const;

              const iconName = icons[route.name as keyof typeof icons] || 'help-circle-outline';

              return (
                <View style={focused ? styles.activeTab : null}>
                  <Ionicons
                    name={iconName}
                    size={focused ? 28 : 24}
                    color={focused ? '#00C853' : '#757575'}
                  />
                </View>
              );
            },
            tabBarActiveTintColor: '#00C853',
            tabBarInactiveTintColor: '#757575',
            tabBarStyle: {
              ...styles.tabBar,
              // Apply bottom inset here
              paddingBottom: insets.bottom > 0 ? insets.bottom + 4 : 4, // Add 4 if insets.bottom is present
              height: 60 + insets.bottom, // Adjust height
            },
            tabBarLabelStyle: {
              fontSize: 12,
              marginBottom: 4,
              fontWeight: '500',
            },
            headerStyle: styles.header,
            headerTitleStyle: styles.headerTitle,
            headerBackground: () => (
              <LinearGradient
                colors={['#1B5E20', '#2E7D32']}
                style={StyleSheet.absoluteFill}
              />
            ),
          })}
        >
          <Tab.Screen
            name="Home"
            component={HomeScreen}
            options={{ title: 'Plant Dashboard' }}
          />
          <Tab.Screen
            name="Notifications"
            component={NotificationsScreen}
            options={{
              title: 'Alerts',
              tabBarBadgeStyle: { backgroundColor: '#D32F2F' }
            }}
          />
          <Tab.Screen
            name="Settings"
            component={SettingsScreen}
            options={{
              title: 'Settings',
              tabBarIcon: ({ focused, color, size }) => (
                <Ionicons
                  name={focused ? 'settings' : 'settings-outline'}
                  size={focused ? 28 : 24}
                  color={focused ? '#00C853' : '#757575'}
                />
              )
            }}
          />
          <Tab.Screen
            name="Camera"
            component={CameraScreen}
            options={{
              title: 'Plant Cam',
              tabBarIcon: ({ focused, color, size }) => (
                <Ionicons
                  name={focused ? 'camera' : 'camera-outline'}
                  size={focused ? 28 : 24}
                  color={focused ? '#00C853' : '#757575'}
                />
              )
            }}
          />
        </Tab.Navigator>
      </LinearGradient>
    </NavigationContainer>
  );
}

export default function App() {
  useEffect(() => {
    configureNotifications();
    PushNotification.setApplicationIconBadgeNumber(0);
  }, []);

  useEffect(() => {
    messaging()
      .getToken()
      .then(token => {
        console.log('FCM token:', token)
      })
      .catch(err => console.warn('FCM token error', err))

    return messaging().onTokenRefresh(newToken => {
      console.log('FCM token refreshed:', newToken)
    })
  }, [])

  return (
    <SafeAreaProvider>
      <SettingsProvider>
        <ControlsProvider>
          <AutomationHandler />
          <WebSocketProvider>
            {/* Render the new component here */}
            <MainAppContent />
          </WebSocketProvider>
        </ControlsProvider>
      </SettingsProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  tabBar: {
    backgroundColor: 'rgba(255, 255, 255, 0.98)',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    elevation: 8,
    shadowColor: '#1B5E20',
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  header: {
    elevation: 4,
    shadowColor: '#00000030',
  },
  headerTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  activeTab: {
    paddingBottom: 6,
    marginBottom: -6,
  },
});