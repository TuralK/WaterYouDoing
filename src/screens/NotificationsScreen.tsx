import React, { useContext, useEffect, useMemo, useCallback } from 'react';
import { notificationApi } from '../api/notification';
import { View, FlatList, Text, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Notification } from '../types/types';
import { useWebSocket } from '../context/WebSocketContext';
import uuid from 'react-native-uuid';

const NotificationItem = ({ item }: { item: Notification }) => (
    <View style={[styles.notification, styles[item.type], styles[item.status]]}>
    <Text style={styles.message}>{item.message}</Text>
    <Text style={styles.time}>{new Date(item.timestamp).toLocaleTimeString()}</Text>
  </View>
);

const NotificationsScreen = () => {
  const { notifications, refetchNotifications } = useWebSocket();
  const sortedNotifications = useMemo(() => {
    return [...notifications]
      .map(n => ({
        ...n,
        timestamp: typeof n.timestamp === 'string' ? new Date(n.timestamp).getTime() : n.timestamp
      }))
      .sort((a, b) => b.timestamp - a.timestamp);
  }, [notifications]);

  useFocusEffect(
   useCallback(() => {
     return () => {
       refetchNotifications();
     };
   }, [])
  );

  useEffect(() => {
   const markAllRead = async () => {
     try {
       await notificationApi.markAllNotificationsAsRead();
     } catch (error) {
       console.error('Error marking notifications as read:', error);
     }
   }
   markAllRead();
  }, [notifications, refetchNotifications]);

  return (
    // In NotificationsScreen component
    <FlatList
      data={sortedNotifications}
      renderItem={NotificationItem}
      keyExtractor={(item) => item?.id || (uuid.v4() as string)}
      contentContainerStyle={styles.container}
      ListEmptyComponent={<Text>No notifications yet</Text>}
      onRefresh={refetchNotifications}
      refreshing={false}
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
 unread: {
    backgroundColor: '#ccffcc',
  },
  read: {
    backgroundColor: '#e0e0e0',
  },
  time: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
});

export default NotificationsScreen;