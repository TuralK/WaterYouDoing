import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Modal, PermissionsAndroid, Platform } from 'react-native';
// import { RNCamera } from 'react-native-camera';
import Icon from 'react-native-vector-icons/Ionicons';
import { launchImageLibrary, ImagePickerResponse, Asset } from 'react-native-image-picker';

const CameraScreen = () => {
  // const [cameraRef, setCameraRef] = useState<RNCamera | null>(null);
  const [photos, setPhotos] = useState<string[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // const takePicture = async () => {
  //   if (cameraRef) {
  //     const options = { quality: 0.5, base64: true };
  //     const data = await cameraRef.takePictureAsync(options);
  //     setPhotos([data.uri, ...photos]);
  //   }
  // };

  const openGallery = () => {
    launchImageLibrary({ mediaType: 'photo' }, (response: ImagePickerResponse) => {
        if (response.didCancel) return;
        if (response.errorMessage) {
        console.log('ImagePicker Error: ', response.errorMessage);
        return;
        }

        if (response.assets && response.assets.length > 0) {
        const uri = response.assets[0].uri;
        if (uri) {
            setPhotos([uri, ...photos]);
        }
        }
    });
  };

  return (
    <View style={styles.container}>
      {/* Camera Preview */}
      {/* <RNCamera
        ref={ref => setCameraRef(ref)}
        style={styles.preview}
        type={RNCamera.Constants.Type.back}
        captureAudio={false}
      /> */}

      {/* Capture Controls */}
      <View style={styles.controlsContainer}>
        {/* <TouchableOpacity onPress={takePicture} style={styles.captureButton}> */}
        <TouchableOpacity style={styles.captureButton}>

          <Icon name="camera" size={40} color="white" />
        </TouchableOpacity>

        <TouchableOpacity onPress={openGallery} style={styles.galleryButton}>
          <Icon name="images" size={30} color="white" />
        </TouchableOpacity>
      </View>

      {/* Photo Gallery */}
      <View style={styles.galleryContainer}>
        {photos.map((uri, index) => (
          <TouchableOpacity 
            key={index} 
            onPress={() => setSelectedImage(uri)}
          >
            <Image source={{ uri }} style={styles.thumbnail} />
          </TouchableOpacity>
        ))}
      </View>

      {/* Image Preview Modal */}
      <Modal visible={!!selectedImage} transparent={true}>
        <View style={styles.modalContainer}>
          <TouchableOpacity 
            style={styles.closeButton}
            onPress={() => setSelectedImage(null)}
          >
            <Icon name="close" size={30} color="white" />
          </TouchableOpacity>
          <Image source={{ uri: selectedImage || '' }} style={styles.fullImage} />
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  preview: {
    flex: 1,
  },
  controlsContainer: {
    position: 'absolute',
    bottom: 30,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  captureButton: {
    backgroundColor: 'rgba(255,255,255,0.3)',
    padding: 20,
    borderRadius: 50,
    marginHorizontal: 20,
  },
  galleryButton: {
    position: 'absolute',
    right: 20,
    backgroundColor: 'rgba(255,255,255,0.3)',
    padding: 10,
    borderRadius: 25,
  },
  galleryContainer: {
    position: 'absolute',
    bottom: 100,
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 5,
  },
  thumbnail: {
    width: 50,
    height: 50,
    margin: 2,
    borderRadius: 4,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullImage: {
    width: '95%',
    height: '80%',
    borderRadius: 10,
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 1,
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'black',
  },
  permissionText: {
    color: 'white',
    fontSize: 18,
  },
});

export default CameraScreen;