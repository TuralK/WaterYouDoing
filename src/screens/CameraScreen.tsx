import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Modal,
  PermissionsAndroid,
  Platform,
  Alert,
  Dimensions,
  ActivityIndicator,
  Linking,
  ScrollView,
  FlatList
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { WebView, WebViewNavigation } from 'react-native-webview';
import RNFS from 'react-native-fs';
import { BACKEND_URL, CAMERA_PORT, CAMERA_URL } from '@env';
import { uploadToBackend, getPictures } from '../api/pictureAPIs';

const ESP32_HOST = CAMERA_URL;
const STREAM_PORT = CAMERA_PORT;
const SCREEN_WIDTH = Dimensions.get('window').width;
const THUMBNAIL_SIZE = SCREEN_WIDTH / 4 - 16;
const BACKGROUND_COLOR = '#F5F9FC';
const CARD_COLOR = '#FFFFFF';

// Resolution options derived from the ESP32 camera's HTML page
const resolutionOptions = [
  { label: 'UXGA(1600x1200)', value: '15' },
  { label: 'SXGA(1280x1024)', value: '14' },
  { label: 'HD(1280x720)', value: '13' },
  { label: 'XGA(1024x768)', value: '12' },
  { label: 'SVGA(800x600)', value: '11' },
  { label: 'VGA(640x480)', value: '10' },
  { label: 'HVGA(480x320)', value: '9' },
  { label: 'CIF(400x296)', value: '8' },
  { label: 'QVGA(320x240)', value: '6' },
  { label: '240x240', value: '5' },
  { label: 'HQVGA(240x176)', value: '4' },
  { label: 'QCIF(176x144)', value: '3' },
  { label: '128x128', value: '2' },
  { label: 'QQVGA(160x120)', value: '1' },
  { label: '96x96', value: '0' },
];

export default function CameraScreen() {
  const [photos, setPhotos] = useState<string[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [numColumns, setNumColumns] = useState(3);
  const [isSettingsVisible, setIsSettingsVisible] = useState(false); // New state for settings modal
  const [resolution, setResolution] = useState('10'); // Default resolution: VGA
  const webViewRef = useRef<WebView>(null);

  const toggleStream = () => setIsStreaming(s => !s);

  const captureStill = async () => {
    try {
      const captureUrl = `${ESP32_HOST}/capture?_cb=${Date.now()}`;
      const fileName = `esp32_${Date.now()}.jpg`;
      const localPath = `${RNFS.CachesDirectoryPath}/${fileName}`;

      // Download the image to local cache
      const { promise } = RNFS.downloadFile({
        fromUrl: captureUrl,
        toFile: localPath,
      });
      await promise;

      // Upload the file
      await uploadToBackend(localPath, fileName);

      // Update gallery
      setPhotos(prev => [captureUrl, ...prev]);
    } catch (err) {
      console.warn(err);
      Alert.alert('Error', 'Could not capture or upload photo');
    }
  };

  const downloadImage = async (imageUri: string) => {
    try {
      const fileName = `esp32_${Date.now()}.jpg`;
      const localPath = `${RNFS.PicturesDirectoryPath}/${fileName}`;

      const { promise } = RNFS.downloadFile({
        fromUrl: imageUri,
        toFile: localPath,
      });

      await promise;

      if (Platform.OS === 'android') {
        await RNFS.scanFile(localPath);
      }

      Alert.alert('Saved!', 'Photo has been saved to your gallery');
    } catch (err) {
      console.warn(err);
      Alert.alert('Error', 'Could not save the photo');
    }
  };

  // Function to change camera resolution
  const changeResolution = async (newResolution: string) => {
    try {
      const url = `${ESP32_HOST}/control?var=framesize&val=${newResolution}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to set resolution');

      setResolution(newResolution);
      Alert.alert('Resolution Updated', `Set to ${resolutionOptions.find(r => r.value === newResolution)?.label}. Restarting stream...`);
      
      // Restart stream to apply new resolution
      if (isStreaming) {
        setIsStreaming(false);
        setTimeout(() => setIsStreaming(true), 500);
      }
    } catch (error) {
      console.warn(error);
      Alert.alert('Error', 'Failed to update resolution.');
    } finally {
      setIsSettingsVisible(false);
    }
  };

  useEffect(() => {
    const fetchPictures = async () => {
      try {
        const pictureList = await getPictures(); // assumed to return [{ file_path: 'pictures/xyz.jpg' }, ...]
        console.log('Fetched pictures:', pictureList);
        const fullUrls = pictureList.map((p: { file_path: any; }) => `${BACKEND_URL}/${p.file_path}`);
        setPhotos(fullUrls);
      } catch (error) {
        console.warn(error);
        Alert.alert('Error', 'Failed to load existing pictures');
      }
    };

    fetchPictures();
  }, []);


  return (
    <View style={[styles.container, { backgroundColor: BACKGROUND_COLOR }]}>
      {isStreaming ? (
        <WebView
          key={resolution} // Re-mounts WebView when resolution changes
          ref={webViewRef}
          source={{ uri: `http://${ESP32_HOST.split('//')[1]}:${STREAM_PORT}/stream` }}
          style={styles.stream}
          onError={() => Alert.alert('Stream Error', 'Failed to load video stream')}
        />
      ) : (
        <View style={styles.placeholder}>
          <Icon name="camera" size={80} color="#D1E3F6" />
          <Text style={styles.placeholderText}>Stream is stopped</Text>
        </View>
      )}

      {/* Controls */}
      <View style={[styles.controlsContainer, { backgroundColor: CARD_COLOR }]}>
        <TouchableOpacity
          onPress={toggleStream}
          style={[styles.controlButton, isStreaming ? styles.stopButton : styles.startButton]}
        >
          <Icon
            name={isStreaming ? 'stop-circle' : 'play-circle'}
            size={24}
            color={isStreaming ? '#FF3B30' : '#4CD964'}
          />
          <Text style={styles.buttonLabel}>
            {isStreaming ? 'Stop Stream' : 'Start Stream'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={captureStill}
          style={[styles.controlButton, styles.captureButton]}
        >
          <Icon name="camera" size={24} color="#007AFF" />
          <Text style={styles.buttonLabel}>Capture</Text>
        </TouchableOpacity>

        {/* Settings Button */}
        <TouchableOpacity
          onPress={() => setIsSettingsVisible(true)}
          style={[styles.controlButton, styles.settingsButton]}
        >
          <Icon name="settings-outline" size={24} color="#5856D6" />
          <Text style={styles.buttonLabel}>Settings</Text>
        </TouchableOpacity>
      </View>

      {/* Thumbnail Gallery */}
      {photos.length > 0 && (
        <View style={styles.galleryContainer}>
          <Text style={styles.galleryTitle}>Captured Photos</Text>
          {isStreaming ? (
            <FlatList
              horizontal
              data={photos}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity onPress={() => setSelectedImage(item)}>
                  <Image source={{ uri: item }} style={styles.thumbnail} />
                </TouchableOpacity>
              )}
              contentContainerStyle={styles.horizontalGallery}
              showsHorizontalScrollIndicator={false}
            />
          ) : (
            <View style={styles.verticalGalleryWrapper}>
              <FlatList
                key={`columns-${numColumns}`}
                data={photos}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    onPress={() => setSelectedImage(item)}
                    style={styles.photoItem}
                  >
                    <Image source={{ uri: item }} style={styles.thumbnailLarge} />
                  </TouchableOpacity>
                )}
                numColumns={numColumns}
                contentContainerStyle={styles.verticalGallery}
                showsVerticalScrollIndicator={true}
              />
            </View>
          )}
        </View>
      )}

      {/* Single Image Modal */}
      <Modal visible={!!selectedImage} transparent>
        <View style={styles.modalContainer}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setSelectedImage(null)}
          >
            <Icon name="close" size={30} color="white" />
          </TouchableOpacity>
          <Image source={{ uri: selectedImage! }} style={styles.fullImage} />
          <TouchableOpacity
            style={styles.downloadButton}
            onPress={() => downloadImage(selectedImage!)}
          >
            <Icon name="download" size={24} color="white" />
            <Text style={styles.downloadButtonText}>Save to Gallery</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      {/* Settings Modal */}
      <Modal
        visible={isSettingsVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIsSettingsVisible(false)}
      >
        <View style={styles.settingsModalContainer}>
          <View style={styles.settingsContent}>
            <View style={styles.settingsHeader}>
              <Text style={styles.settingsTitle}>Camera Resolution</Text>
              <TouchableOpacity onPress={() => setIsSettingsVisible(false)}>
                <Icon name="close" size={28} color="#90A4AE" />
              </TouchableOpacity>
            </View>
            <FlatList
              data={resolutionOptions}
              keyExtractor={item => item.value}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.resolutionItem,
                    resolution === item.value && styles.resolutionItemSelected,
                  ]}
                  onPress={() => changeResolution(item.value)}
                >
                  <Text
                    style={[
                      styles.resolutionItemText,
                      resolution === item.value && styles.resolutionItemSelectedText,
                    ]}
                  >
                    {item.label}
                  </Text>
                  {resolution === item.value && (
                    <Icon name="checkmark-circle" size={24} color="#FFFFFF" />
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    stream: {
        flex: 1,
        backgroundColor: 'black',
    },
    placeholder: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: BACKGROUND_COLOR,
    },
    placeholderText: {
        marginTop: 16,
        fontSize: 18,
        color: '#90A4AE',
    },
    controlsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around', // Changed for even spacing
        paddingVertical: 12,
        paddingHorizontal: 8,
        borderRadius: 16,
        margin: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    controlButton: {
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 8,
        borderRadius: 8,
        flex: 1,
        marginHorizontal: 4,
    },
    startButton: { backgroundColor: '#E8F5E9' },
    stopButton: { backgroundColor: '#FFEBEE' },
    captureButton: { backgroundColor: '#E3F2FD' },
    settingsButton: { backgroundColor: '#EDE7F6' }, // Style for the new settings button
    buttonLabel: {
        color: '#455A64',
        marginTop: 6,
        fontSize: 12,
        fontWeight: '500',
        textAlign: 'center',
    },
    galleryContainer: {
      // display: 'none', // Hide gallery by default
        marginTop: 8,
        marginHorizontal: 16,
        marginBottom: 16,
        backgroundColor: CARD_COLOR,
        borderRadius: 16,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    galleryTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 12,
        color: '#37474F',
    },
    horizontalGallery: { paddingVertical: 4 },
    verticalGallery: { paddingTop: 8 },
    thumbnail: {
        width: THUMBNAIL_SIZE,
        height: THUMBNAIL_SIZE,
        margin: 6,
        borderRadius: 8,
        backgroundColor: '#ECEFF1',
    },
    thumbnailLarge: {
      width: (SCREEN_WIDTH / 3) - 24,
      height: (SCREEN_WIDTH / 3) - 24,
      margin: 6,
      borderRadius: 8,
      backgroundColor: '#ECEFF1',
    },
    photoItem: {
        flex: 1,
        alignItems: 'center',
    },
    modalContainer: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.95)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    fullImage: {
        width: '95%',
        height: '70%',
        resizeMode: 'contain',
        borderRadius: 10,
        backgroundColor: 'black',
    },
    closeButton: {
        position: 'absolute',
        top: 40,
        right: 20,
        zIndex: 1,
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 20,
        padding: 8,
    },
    downloadButton: {
        position: 'absolute',
        bottom: 40,
        backgroundColor: '#007AFF',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 30,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: '#007AFF',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 6,
    },
    downloadButtonText: {
        color: 'white',
        marginLeft: 8,
        fontSize: 16,
        fontWeight: '600',
    },
    // New styles for Settings Modal
    settingsModalContainer: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    settingsContent: {
        backgroundColor: BACKGROUND_COLOR,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 16,
        height: '60%',
    },
    settingsHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
    },
    settingsTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#37474F',
    },
    resolutionItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: 8,
        borderRadius: 8,
        marginVertical: 4,
    },
    resolutionItemSelected: {
        backgroundColor: '#007AFF',
    },
    resolutionItemText: {
        fontSize: 16,
        color: '#455A64',
    },
    resolutionItemSelectedText: {
        color: '#FFFFFF',
        fontWeight: '500',
    },
    verticalGalleryWrapper: {
      maxHeight: 300,
    },

});