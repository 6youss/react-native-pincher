import React from 'react';
import {Dimensions, StyleSheet} from 'react-native';

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
  const focalX = useSharedValue(0);
  const focalY = useSharedValue(0);
  const xCurrent = useSharedValue(0);
  const yCurrent = useSharedValue(0);
  const xPrevious = useSharedValue(0);
  const yPrevious = useSharedValue(0);
  const scaleCurrent = useSharedValue(1);
  const scalePrevious = useSharedValue(1);

  const animatedStyles = useAnimatedStyle(() => {
    return {
      transform: [
        {translateX: dragOffset.value.x},
        {translateY: dragOffset.value.y},
        {translateX: xCurrent.value},
        {translateY: yCurrent.value},
        {scale: scaleCurrent.value},
        {translateX: xPrevious.value},
        {translateY: yPrevious.value},
        {scale: scalePrevious.value},
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

  const zoomGesture = Gesture.Pinch()
    .onStart(event => {
      if (event.numberOfPointers === 2) {
        focalX.value = event.focalX;
        focalY.value = event.focalY;
      }
    })
    .onUpdate(event => {
      scaleCurrent.value = event.scale;

      xCurrent.value =
        (1 - scaleCurrent.value) * (focalX.value - width.value / 2);
      yCurrent.value =
        (1 - scaleCurrent.value) * (focalY.value - height.value / 2);
    })
    .onEnd(() => {
      // savedScale.value = scale.value;

      scalePrevious.value = scalePrevious.value * scaleCurrent.value;

      xPrevious.value = scaleCurrent.value * xPrevious.value + xCurrent.value;
      yPrevious.value = scaleCurrent.value * yPrevious.value + yCurrent.value;

      xCurrent.value = 0;
      yCurrent.value = 0;

      scaleCurrent.value = 1;
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

  return (
    <GestureDetector gesture={composed}>
      <Animated.View
        style={styles.container}
        onLayout={event => {
          width.value = event.nativeEvent.layout.width;
          height.value = event.nativeEvent.layout.height;
        }}>
        <Animated.View collapsable={false} style={animatedStyles}>
          {props.children}
        </Animated.View>
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
  },
});
