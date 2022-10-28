import React from 'react';
import {Dimensions, StyleSheet, View} from 'react-native';

import {Gesture, GestureDetector} from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';

const Pincher = (props: React.PropsWithChildren<any>) => {
  const width = useSharedValue(Dimensions.get('screen').width);
  const height = useSharedValue(Dimensions.get('screen').height);
  const dragOffset = useSharedValue({x: 0, y: 0});
  const start = useSharedValue({x: 0, y: 0});
  const rotation = useSharedValue(0);
  const savedRotation = useSharedValue(0);

  //
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const xCenter = useSharedValue(0);
  const yCenter = useSharedValue(0);
  const xFocal = useSharedValue(0);
  const yFocal = useSharedValue(0);
  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);

  const animatedStyles = useAnimatedStyle(() => {
    return {
      position: 'relative',

      transform: [
        {translateX: dragOffset.value.x},
        {translateY: dragOffset.value.y},

        {translateX: translateX.value},
        {translateY: translateY.value},
        {scale: scale.value},
        {translateX: -translateX.value},
        {translateY: -translateY.value},

        {rotateZ: `${rotation.value}rad`},
      ],
    };
  });

  const dragGesture = Gesture.Pan()
    .averageTouches(true)
    .onUpdate(e => {
      dragOffset.value = {
        x: e.translationX + start.value.x,
        y: e.translationY + start.value.y,
      };
    })
    .onEnd(() => {
      start.value = {
        x: dragOffset.value.x,
        y: dragOffset.value.y,
      };
    });

  const xOrigin = useSharedValue(0);
  const yOrigin = useSharedValue(0);
  const zoomGesture = Gesture.Pinch()
    .onStart(event => {
      xFocal.value = event.focalX;
      yFocal.value = event.focalY;
    })
    .onUpdate(event => {
      scale.value = savedScale.value * event.scale;
      translateX.value = xFocal.value - xCenter.value;
      translateY.value = yFocal.value - yCenter.value;
    })
    .onEnd(() => {
      savedScale.value = scale.value;
      xOrigin.value = xFocal.value;
      yOrigin.value = yFocal.value;
    });

  const rotateGesture = Gesture.Rotation()
    .onUpdate(event => {
      rotation.value = savedRotation.value + event.rotation;
    })
    .onEnd(() => {
      savedRotation.value = rotation.value;
    });

  const composed = Gesture.Simultaneous(
    dragGesture,
    Gesture.Simultaneous(rotateGesture, zoomGesture),
  );

  const middleStyles = useAnimatedStyle(() => ({
    position: 'absolute',
    left: width.value / 2,
    top: height.value / 2,
    width: 10,
    height: 10,
    backgroundColor: 'red',
    borderRadius: 10,
    transform: [{translateX: -5}, {translateY: -5}],
  }));

  const focalStyles = useAnimatedStyle(() => ({
    position: 'absolute',
    left: xFocal.value,
    top: yFocal.value,
    width: 10,
    height: 10,
    backgroundColor: 'yellow',
    transform: [{translateX: -5}, {translateY: -5}],
  }));
  const offsetStyles = useAnimatedStyle(() => ({
    position: 'absolute',
    left: xCenter.value,
    top: yCenter.value,
    width: 10,
    height: 10,
    backgroundColor: 'blue',
    transform: [{translateX: -5}, {translateY: -5}],
  }));

  return (
    <GestureDetector gesture={zoomGesture}>
      <Animated.View
        style={styles.container}
        onLayout={event => {
          width.value = event.nativeEvent.layout.width;
          height.value = event.nativeEvent.layout.height;
          xCenter.value = event.nativeEvent.layout.width / 2;
          yCenter.value = event.nativeEvent.layout.height / 2;
        }}>
        <Animated.View collapsable={false} style={animatedStyles}>
          {props.children}
        </Animated.View>
        <Animated.View style={middleStyles}></Animated.View>
        <Animated.View style={focalStyles}></Animated.View>
        <Animated.View style={offsetStyles}></Animated.View>
      </Animated.View>
    </GestureDetector>
  );
};
export default Pincher;

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
    flex: 1,
    backgroundColor: 'gray',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
