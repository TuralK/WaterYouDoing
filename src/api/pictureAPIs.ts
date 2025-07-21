import { BACKEND_URL } from '@env';
import axios from 'axios';
import { Alert } from 'react-native';

// Replace with your backend endpoint

export const uploadToBackend = async (filePath: string, fileName: string) => {
  try {
    const formData = new FormData();

    formData.append('picture', {
      uri: `file://${filePath}`,
      name: fileName,
      type: 'image/jpeg',
    } as any); // TS workaround for React Native

    const response = await axios.post(`${BACKEND_URL}/picture`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    console.log('Upload success:', response.data);
    Alert.alert('Uploaded!', 'Photo saved to server');
  } catch (err) {
    console.error('Upload failed:', err);
    Alert.alert('Upload Failed', 'Could not send image to server');
  }
};

export const getPictures = async () => {
  try {
    const response = await axios.get(`${BACKEND_URL}/pictures`);
    console.log('Pictures fetched:', response.data);
    return response.data;
  } catch (err) {
    console.error('Failed to fetch pictures:', err);
    Alert.alert('Fetch Failed', 'Could not retrieve pictures from server');
    return [];
  }
}
