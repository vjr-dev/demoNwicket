import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image, SafeAreaView, Animated, StatusBar } from 'react-native';


import { Camera, CameraType, Orientation, CameraApi } from 'react-native-camera-kit';

 type CaptureData = {
    uri: string;
    name: string;
    // Android only
    id?: string;
    path?: string;
    height?: number;
    width?: number;
    // iOS only
    size?: number;
  };


const flashImages = {
  on: require('./images/flashOn.png'),
  off: require('./images/flashOff.png'),
  auto: require('./images/flashAuto.png'),
};

const flashArray = [
  {
    mode: 'auto',
    image: flashImages.auto,
  },
  {
    mode: 'on',
    image: flashImages.on,
  },
  {
    mode: 'off',
    image: flashImages.off,
  },
] as const;

const CameraExample = ({ onBack }: { onBack: () => void }) => {
  const cameraRef = useRef<CameraApi>(null);
  const [currentFlashArrayPosition, setCurrentFlashArrayPosition] = useState(0);
  const [captureImages, setCaptureImages] = useState<CaptureData[]>([]);
  const [flashData, setFlashData] = useState(flashArray[currentFlashArrayPosition]);
  const [torchMode, setTorchMode] = useState(false);
  const [captured, setCaptured] = useState(false);
  const [cameraType, setCameraType] = useState(CameraType.Front);
  const [showImageUri, setShowImageUri] = useState<string>('');
  const [zoom, setZoom] = useState<number | undefined>();
  const [orientationAnim] = useState(new Animated.Value(3));

  // iOS will error out if capturing too fast,
  // so block capturing until the current capture is done
  // This also minimizes issues of delayed capturing
  const isCapturing = useRef(false);
//   useEffect(() => {
//     // Start the camera when the component mounts
//     const startCamera = async () => {
//     //   try {
//     //     await cameraRef.current.startCamera();
//     //     cameraRef.current.startDetectingFaces(onFacesDetected);
//     //   } catch (e) {
//     //     console.error('Error starting camera:', e);
//     //   }

//     console.log("DFGHGDD",cameraRef.current)
//     };

//     startCamera();

//     return () => {
//       // Stop the camera when the component unmounts
//       cameraRef.current.stopCamera();
//     };
//   }, []);

  const numberOfImagesTaken = () => {
    const numberTook = captureImages.length;
    if (numberTook >= 2) {
      return numberTook;
    } else if (captured) {
      return '1';
    } else {
      return '';
    }
  };

  const onSwitchCameraPressed = () => {
    const direction = cameraType === CameraType.Back ? CameraType.Front : CameraType.Back;
    setCameraType(direction);
    setZoom(1); // When changing camera type, reset to default zoom for that camera
  };





  const onCaptureImagePressed = async () => {
    if (showImageUri) {
      setShowImageUri('');
      return;
    }
    if (!cameraRef.current || isCapturing.current) return;
    let image: CaptureData | undefined;
    try {
      isCapturing.current = true;
      image = await cameraRef.current.capture();
    } catch (e) {
      console.log('error', e);
    } finally {
      isCapturing.current = false;
    }
    if (!image) return;

    setCaptured(true);
    setCaptureImages([...captureImages, image]);
    console.log('image', image);
  };

  function CaptureButton({ onPress, children }: { onPress: () => void, children?: React.ReactNode }) {
    const w = 80, brdW = 4, spc = 6;
    const cInner = 'white', cOuter = 'white';
    return (
      <TouchableOpacity onPress={onPress} style={{ width: w, height: w }}>
        <View style={{ position: 'absolute', left: 0, top: 0, width: w, height: w, borderColor: cOuter, borderWidth: brdW, borderRadius: w / 2 }} />
        <View style={{ position: 'absolute', left: brdW + spc, top: brdW + spc, width: w - ((brdW + spc) * 2), height: w - ((brdW + spc) * 2), backgroundColor: cInner, borderRadius: (w - ((brdW + spc) * 2)) / 2 }} />
        {children}
      </TouchableOpacity>
    );
  }

  // Counter-rotate the icons to indicate the actual orientation of the captured photo.
  // For this example, it'll behave incorrectly since UI orientation is allowed (and already-counter rotates the entire screen)
  // For real phone apps, lock your UI orientation using a library like 'react-native-orientation-locker'
  const rotateUi = true;
  const uiRotation = orientationAnim.interpolate({
    inputRange: [1, 4],
    outputRange: ['180deg', '-90deg'],
  });
  const uiRotationStyle = rotateUi ? {transform: [{ rotate: uiRotation }]} : undefined;

  function rotateUiTo(rotationValue: number) {
    Animated.timing(orientationAnim, {
      toValue: rotationValue,
      useNativeDriver: true,
      duration: 200,
      isInteraction: false,
    }).start();
  }

  return (
    <View style={styles.screen}>
      <StatusBar hidden />
      <SafeAreaView style={styles.topButtons}>
        

      

       
      </SafeAreaView>

      <View style={styles.cameraContainer}>
        {showImageUri ? (
          <Image source={{ uri: showImageUri }} style={styles.cameraPreview} resizeMode="contain" />
        ) : (
          <Camera
            ref={cameraRef}
            style={styles.cameraPreview}
            cameraType={cameraType}
            flashMode={flashData?.mode}
            resetFocusWhenMotionDetected
            zoom={zoom}
            maxZoom={10}
            onZoom={(e) => {
              console.log('zoom', e.nativeEvent.zoom);
              setZoom(e.nativeEvent.zoom);
            }}
            torchMode={torchMode ? 'on' : 'off'}
            shutterPhotoSound
            onOrientationChange={(e) => {
              // We recommend locking the camera UI to portrait (using a different library)
              // and rotating the UI elements counter to the orientation
              // However, we include onOrientationChange so you can match your UI to what the camera does
              switch (e.nativeEvent.orientation) {
                case Orientation.PORTRAIT_UPSIDE_DOWN:
                  console.log('orientationChange', 'PORTRAIT_UPSIDE_DOWN');
                  rotateUiTo(1);
                  break;
                case Orientation.LANDSCAPE_LEFT:
                  console.log('orientationChange', 'LANDSCAPE_LEFT');
                  rotateUiTo(2);
                  break;
                case Orientation.PORTRAIT:
                  console.log('orientationChange', 'PORTRAIT');
                  rotateUiTo(3);
                  break;
                case Orientation.LANDSCAPE_RIGHT:
                  console.log('orientationChange', 'LANDSCAPE_RIGHT');
                  rotateUiTo(4);
                  break;
                default:
                  console.log('orientationChange', e.nativeEvent);
                  break;
              }
            }}
            onFacesDetected = {(event) => {
                console.log("hi",event)

            }}
          />
        )}
      </View>

      <SafeAreaView style={styles.bottomButtons}>
        <View style={styles.backBtnContainer}>
          <TouchableOpacity onPress={onBack}>
            <Animated.Text style={[styles.backTextStyle, uiRotationStyle]}>Back</Animated.Text>
          </TouchableOpacity>
        </View>

        <View style={styles.captureButtonContainer}>
          <CaptureButton onPress={onCaptureImagePressed}>
            <View style={styles.textNumberContainer}>
              <Text>{numberOfImagesTaken()}</Text>
            </View>
          </CaptureButton>
        </View>

        <View style={styles.thumbnailContainer}>
          {captureImages.length > 0 && (
            <TouchableOpacity
              onPress={() => {
                if (showImageUri) {
                  setShowImageUri('');
                } else {
                  setShowImageUri(captureImages[captureImages.length - 1].uri);
                }
              }}
            >
              <Image source={{ uri: captureImages[captureImages.length - 1].uri }} style={styles.thumbnail} />
            </TouchableOpacity>
          )}
        </View>
      </SafeAreaView>
    </View>
  );
};

export default CameraExample;

const styles = StyleSheet.create({
  screen: {
    height: '100%',
    backgroundColor: 'black',
  },
  topButtons: {
    margin: 10,
    zIndex: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  topButton: {
    backgroundColor: '#222',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  topButtonImg: {
    margin: 10,
    width: 24,
    height: 24,
  },
  cameraContainer: {
    justifyContent: 'center',
    flex: 1,
  },
  cameraPreview: {
    aspectRatio: 3 / 4,
    width: '100%',
  },
  bottomButtons: {
    margin: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backBtnContainer: {
    flex: 1,
    alignItems: 'flex-start',
  },
  backTextStyle: {
    padding: 10,
    color: 'white',
    fontSize: 20,
  },
  captureButtonContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textNumberContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  zoomFactor: {
    color: '#ffffff',
  },
  thumbnailContainer: {
    flex: 1,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  thumbnail: {
    width: 48,
    height: 48,
    borderRadius: 4,
    marginEnd: 10,
  },
});