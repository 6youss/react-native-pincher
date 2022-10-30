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
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const x = useSharedValue(0);
  const y = useSharedValue(0);
  const xFocal = useSharedValue(0);
  const yFocal = useSharedValue(0);
  const scale = useSharedValue(1);
  const lastScale = useSharedValue(1);
  const xPreviousOffset = useSharedValue(0);
  const yPreviousOffset = useSharedValue(0);
  const xNewOffset = useSharedValue(0);
  const yNewOffset = useSharedValue(0);
  const xOffset = useSharedValue(0);
  const yOffset = useSharedValue(0);

  const animatedStyles = useAnimatedStyle(() => {
    return {
      position: 'relative',

      transform: [
        {translateX: dragOffset.value.x},
        {translateY: dragOffset.value.y},

        {translateX: xOffset.value},
        {translateY: yOffset.value},
        {scale: scale.value},
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
      x.value = x.value + dragOffset.value.x - start.value.x;
      y.value = y.value + dragOffset.value.y - start.value.y;
      start.value = {
        x: dragOffset.value.x,
        y: dragOffset.value.y,
      };
    });

  const zoomGesture = Gesture.Pinch()
    .onStart(event => {
      xFocal.value = event.focalX;
      yFocal.value = event.focalY;
      translateX.value = (xFocal.value - x.value) / lastScale.value;
      translateY.value = (yFocal.value - y.value) / lastScale.value;
    })
    .onUpdate(event => {
      scale.value = lastScale.value * event.scale;
      xNewOffset.value = (1 - event.scale) * translateX.value;
      xOffset.value =
        lastScale.value * xNewOffset.value + xPreviousOffset.value;
      yNewOffset.value = (1 - event.scale) * translateY.value;
      yOffset.value =
        lastScale.value * yNewOffset.value + yPreviousOffset.value;
    })
    .onEnd(() => {
      xPreviousOffset.value = xOffset.value;
      yPreviousOffset.value = yOffset.value;
      x.value = x.value + xNewOffset.value * lastScale.value;
      y.value = y.value + yNewOffset.value * lastScale.value;
      lastScale.value = scale.value;
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
    display: 'none',
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
    left: x.value,
    top: y.value,
    width: 10,
    height: 10,
    backgroundColor: 'blue',
    transform: [{translateX: -5}, {translateY: -5}],
  }));

  return (
    <GestureDetector gesture={composed}>
      <Animated.View
        style={styles.container}
        onLayout={event => {
          width.value = event.nativeEvent.layout.width;
          height.value = event.nativeEvent.layout.height;
          x.value = event.nativeEvent.layout.width / 2;
          y.value = event.nativeEvent.layout.height / 2;
        }}>
        <Animated.View collapsable={false} style={animatedStyles}>
          {props.children}
        </Animated.View>
        <Animated.View style={middleStyles}></Animated.View>
        <Animated.View style={focalStyles}></Animated.View>
        <Animated.View style={offsetStyles}></Animated.View>

        <Animated.View style={styles.test}></Animated.View>
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

  test: {
    display: 'none',
    backgroundColor: 'red',
    width: 30,
    height: 30,
    transform: [{translateX: 15}, {translateY: 15}, {scale: 10}],
  },
});
