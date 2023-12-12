/* eslint-disable react-native/no-inline-styles */
import { runOnJS } from 'react-native-reanimated';
import * as React from 'react';
import { StyleSheet, View, Image } from 'react-native';
import { useCameraDevices, useFrameProcessor } from 'react-native-vision-camera';
import { Camera } from 'react-native-vision-camera';
import { scanFaces, Face } from 'vision-camera-face-detector';
import RNFS from 'react-native-fs';

export default function App() {
  const [hasPermission, setHasPermission] = React.useState(false);
  const [faces, setFaces] = React.useState<Face[]>();
  const [faceDetected, setFaceDetected] = React.useState(false);
  const cameraRef = React.useRef<Camera | null>(null);
  const devices = useCameraDevices();
  const device = devices.front;

  React.useEffect(() => {
    console.log("faces");

    // Check if faces are detected and set the state accordingly
    setFaceDetected(faces && faces.length > 0);

    // If faces are detected, capture the photo and convert it to base64
    if (faceDetected && cameraRef.current) {
      capturePhoto();
    }
  }, [faces]);

  React.useEffect(() => {
    (async () => {
      const status = await Camera.requestCameraPermission();
      setHasPermission(status === 'authorized');
    })();
  }, []);

  const frameProcessor = useFrameProcessor((frame) => {
    'worklet';
    const scannedFaces = scanFaces(frame);
    runOnJS(setFaces)(scannedFaces);
  }, []);

  const capturePhoto = async () => {
    try {
      const photo = await cameraRef.current?.takePhoto();

      if (photo) {
        // Read the image file and convert it to base64
        console.log('Captured photo:', photo);
        const imagePath = `file://${photo.path}`;
        const base64 = await RNFS.readFile(imagePath, 'base64');

        console.log('Captured photo base64:', base64);
      }
    } catch (error) {
      console.error('Error capturing photo:', error);
    }
  };

  return device != null && hasPermission ? (
    <>
      <View style={styles.container}>
        <Camera
          style={StyleSheet.absoluteFill}
          photo={true}
          device={device}
          isActive={true}
          frameProcessor={frameProcessor}
          frameProcessorFps={5}
          ref={(ref) => (cameraRef.current = ref)}
        />
        {faceDetected && <View style={styles.faceBox} />}
      </View>
    </>
  ) : null;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  faceBox: {
    position: 'absolute',
    width: '60%',
    aspectRatio: 1,
    borderWidth: 2,
    borderColor: 'green',
    padding: 30,
  },
});
