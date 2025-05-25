import React, { useContext, useEffect } from 'react';
import { View, FlatList, Text, StyleSheet } from 'react-native';
import { Notification } from '../types/types';
import { useWebSocket } from '../context/WebSocketContext';

const NotificationItem = ({ item }: { item: Notification }) => (
  <View style={[styles.notification, styles[item.type]]}>
    <Text style={styles.message}>{item.message}</Text>
    <Text style={styles.time}>{new Date(item.timestamp).toLocaleTimeString()}</Text>
  </View>
);

const NotificationsScreen = () => {
  const { notifications } = useWebSocket();

  console.log('Notifications in component:', notifications); 
  return (
    // In NotificationsScreen component
    <FlatList
      data={notifications}
      renderItem={NotificationItem}
      keyExtractor={(item) => item?.id || Math.random().toString()}
      contentContainerStyle={styles.container}
      ListEmptyComponent={<Text>No notifications yet</Text>}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 8,
  },
  notification: {
    padding: 16,
    borderRadius: 8,
    marginVertical: 4,
  },
  alert: {
    backgroundColor: '#ffcccc',
  },
  warning: {
    backgroundColor: '#ffe4cc',
  },
  info: {
    backgroundColor: '#ccffcc',
  },
  message: {
    fontSize: 16,
  },
  time: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
});

export default NotificationsScreen;