import React from 'react';
import {StyleSheet} from 'react-native';

import {Gesture, GestureDetector} from 'react-native-gesture-handler';
import Animated, {useAnimatedStyle, useSharedValue} from 'react-native-reanimated';

interface PincherProps extends React.PropsWithChildren<any> {
  minScale?: number;
  maxScale?: number;
  defaultScale?: number;
  padding?: number;
}

const Pincher = (props: PincherProps) => {
  const {minScale = 0.5, maxScale = 3, defaultScale = 1, padding = 50} = props;
  const viewPortWidth = useSharedValue(0);
  const viewPortHeight = useSharedValue(0);
  const worldWidth = useSharedValue(0);
  const worldHeight = useSharedValue(0);

  const xDragOffset = useSharedValue(0);
  const yDragOffset = useSharedValue(0);
  const xPreviousDrag = useSharedValue(0);
  const yPreviousDrag = useSharedValue(0);

  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

  const xCenter = useSharedValue(0);
  const yCenter = useSharedValue(0);
  const xPrevCenter = useSharedValue(0);
  const yPrevCenter = useSharedValue(0);

  const xFocal = useSharedValue(0);
  const yFocal = useSharedValue(0);

  const scale = useSharedValue(defaultScale);
  const prevScale = useSharedValue(defaultScale);

  const xPreviousOffset = useSharedValue(0);
  const yPreviousOffset = useSharedValue(0);
  const xNewOffset = useSharedValue(0);
  const yNewOffset = useSharedValue(0);
  const xOffset = useSharedValue(0);
  const yOffset = useSharedValue(0);

  function getDistances(_xCenter: number, _yCenter: number) {
    'worklet';
    const extremeTop = _yCenter - ((worldHeight.value / 2) * scale.value + padding);
    const extremeRight = _xCenter + ((worldWidth.value / 2) * scale.value + padding);
    const extremeBottom = _yCenter + ((worldHeight.value / 2) * scale.value + padding);
    const extremeLeft = _xCenter - ((worldWidth.value / 2) * scale.value + padding);

    const distanceTop = 0 - extremeTop;
    const distanceRight = viewPortWidth.value - extremeRight;
    const distanceBottom = viewPortHeight.value - extremeBottom;
    const distanceLeft = 0 - extremeLeft;

    return {
      distanceTop,
      distanceRight,
      distanceBottom,
      distanceLeft,
    };
  }

  const animatedStyles = useAnimatedStyle(() => {
    return {
      position: 'relative',

      transform: [
        {translateX: xDragOffset.value},
        {translateY: yDragOffset.value},

        {translateX: xOffset.value},
        {translateY: yOffset.value},
        {scale: scale.value},
      ],
    };
  });

  const dragGesture = Gesture.Pan()
    .averageTouches(true)
    .onUpdate(e => {
      const nextXdrag = e.translationX + xPreviousDrag.value;
      const nextYdrag = e.translationY + yPreviousDrag.value;

      const nextXcenter = xPrevCenter.value + nextXdrag - xPreviousDrag.value;
      const nextYcenter = yPrevCenter.value + nextYdrag - yPreviousDrag.value;

      const {distanceRight, distanceLeft, distanceTop, distanceBottom} = getDistances(nextXcenter, nextYcenter);

      const isSparpou7i = distanceRight > 0 && distanceLeft < 0;
      const canDragFromRight = distanceRight <= 0 && e.translationX < 0;
      const canDragFromLeft = distanceLeft >= 0 && e.translationX > 0;

      if (isSparpou7i || canDragFromLeft || canDragFromRight) {
        xDragOffset.value = nextXdrag;
        xCenter.value = nextXcenter;
      }

      const isYzatat = distanceTop < 0 && distanceBottom > 0;
      const canDragFromBottom = distanceBottom <= 0 && e.translationY < 0;
      const canDragFromTop = distanceTop >= 0 && e.translationY > 0;

      if (isYzatat || canDragFromBottom || canDragFromTop) {
        yDragOffset.value = nextYdrag;
        yCenter.value = nextYcenter;
      }
    })
    .onEnd(() => {
      xPrevCenter.value = xCenter.value;
      xPreviousDrag.value = xDragOffset.value;
      yPrevCenter.value = yCenter.value;
      yPreviousDrag.value = yDragOffset.value;
    });

  function isScalable(nextScale: number) {
    'worklet';
    return nextScale >= minScale && nextScale <= maxScale;
  }

  const zoomGesture = Gesture.Pinch()
    .onStart(event => {
      xFocal.value = event.focalX;
      yFocal.value = event.focalY;
      translateX.value = (xFocal.value - xPrevCenter.value) / prevScale.value;
      translateY.value = (yFocal.value - yPrevCenter.value) / prevScale.value;
    })
    .onUpdate(event => {
      const nextScale = prevScale.value * event.scale;
      if (!isScalable(nextScale)) {
        return;
      }

      scale.value = nextScale;
      xNewOffset.value = (1 - event.scale) * translateX.value;
      yNewOffset.value = (1 - event.scale) * translateY.value;

      xOffset.value = xPreviousOffset.value + prevScale.value * xNewOffset.value;
      yOffset.value = yPreviousOffset.value + prevScale.value * yNewOffset.value;

      xCenter.value = xPrevCenter.value + xNewOffset.value * prevScale.value;
      yCenter.value = yPrevCenter.value + yNewOffset.value * prevScale.value;
    })
    .onEnd(() => {
      xPreviousOffset.value = xOffset.value;
      yPreviousOffset.value = yOffset.value;
      xPrevCenter.value = xCenter.value;
      yPrevCenter.value = yCenter.value;
      prevScale.value = scale.value;
    });

  const gesture = Gesture.Race(dragGesture, zoomGesture);

  const middleStyles = useAnimatedStyle(() => ({
    display: 'none',
    position: 'absolute',
    left: viewPortWidth.value / 2,
    top: viewPortHeight.value / 2,
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
    <GestureDetector gesture={gesture}>
      <Animated.View
        style={styles.container}
        onLayout={event => {
          // because the flex is centered, the children coordinates are in the center of the container
          viewPortWidth.value = event.nativeEvent.layout.width;
          viewPortHeight.value = event.nativeEvent.layout.height;
          xCenter.value = event.nativeEvent.layout.width / 2;
          yCenter.value = event.nativeEvent.layout.height / 2;
          xPrevCenter.value = event.nativeEvent.layout.width / 2;
          yPrevCenter.value = event.nativeEvent.layout.height / 2;
        }}>
        <Animated.View
          collapsable={false}
          style={animatedStyles}
          onLayout={event => {
            worldWidth.value = event.nativeEvent.layout.width;
            worldHeight.value = event.nativeEvent.layout.height;
          }}>
          {props.children}
        </Animated.View>
        <Animated.View style={middleStyles}></Animated.View>
        <Animated.View style={focalStyles}></Animated.View>
        <Animated.View style={offsetStyles}></Animated.View>

        {/* <Animated.View style={styles.test}></Animated.View> */}
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

  // test: {
  //   backgroundColor: 'red',
  //   width: 30,
  //   height: 30,
  //   transform: [{translateX: 15}, {translateY: 15}, {scale: 10}],
  // },
});
