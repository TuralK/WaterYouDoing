import PushNotification, { Importance } from 'react-native-push-notification';
import PushNotificationIOS from '@react-native-community/push-notification-ios';
import { navigate } from '../navigation/navigationRef'

export const configureNotifications = () => {
  PushNotification.configure({
    onNotification: function (notification) {
        console.log('NOTIFICATION:', notification);

        // Handle default notification tap
        if (notification.userInteraction) {
            navigate('Notifications');
        }

        notification.finish(PushNotificationIOS.FetchResult.NoData);
    },

    onAction: function (notification) {
        console.log('ACTION:', notification.action);
        if (notification.action === 'tap') {
            navigate('Notifications');
        }
    },

    permissions: {
        alert: true,
        badge: true,
        sound: true,
    },

    popInitialNotification: true,
    requestPermissions: true,
    });

};

export const showLocalNotification = (title: string, message: string) => {
  PushNotification.localNotification({
    channelId: 'plant-alerts',
    title: title,
    message: message,
    vibrate: true,
    vibration: 300,
    playSound: true,
    soundName: 'default',
    importance: 'high',
  });
};