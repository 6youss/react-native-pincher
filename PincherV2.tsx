import React from 'react';
import {StyleSheet} from 'react-native';

import {Gesture, GestureDetector} from 'react-native-gesture-handler';
import Animated, {useAnimatedStyle, useDerivedValue, useSharedValue} from 'react-native-reanimated';

interface PincherProps extends React.PropsWithChildren<any> {
  minScale?: number;
  maxScale?: number;
  defaultScale?: number;
  padding?: number;
}

const Pincher = (props: PincherProps) => {
  const {defaultScale = 1} = props;
  const viewPortWidth = useSharedValue(0);
  const viewPortHeight = useSharedValue(0);

  const mapWidth = useSharedValue(0);
  const mapHeight = useSharedValue(0);
  const rotation = useSharedValue(0);
  const savedRotation = useSharedValue(0);

  const center = useDerivedValue(() => {
    return {x: viewPortWidth.value / 2, y: viewPortHeight.value / 2};
  });

  const origin = useSharedValue({x: 0, y: 0});
  const anchor = useSharedValue({x: 0, y: 0});

  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);

  const pan = useSharedValue({x: 0, y: 0});

  const savedTranslation = useSharedValue({x: 0, y: 0});

  const translation = useDerivedValue(() => {
    return {
      x: pan.value.x + origin.value.x - origin.value.x * scale.value,
      y: pan.value.y + origin.value.y - origin.value.y * scale.value,
    };
  });

  const dragGesture = Gesture.Pan()
    .averageTouches(true)
    .onUpdate(e => {
      pan.value = {
        x: e.translationX,
        y: e.translationY,
      };
    })
    .onEnd(() => {
      savedTranslation.value = {
        x: savedTranslation.value.x + pan.value.x,
        y: savedTranslation.value.y + pan.value.y,
      };
      pan.value = {
        x: 0,
        y: 0,
      };
    });

  const zoomGesture = Gesture.Pinch()
    .onStart(event => {
      origin.value = {
        x: event.focalX - (center.value.x + savedTranslation.value.x),
        y: event.focalY - (center.value.y + savedTranslation.value.y),
      };
    })
    .onUpdate(event => {
      scale.value = event.scale;
    })
    .onEnd(() => {
      savedTranslation.value = {
        x: savedTranslation.value.x + origin.value.x - origin.value.x * scale.value,
        y: savedTranslation.value.y + origin.value.y - origin.value.y * scale.value,
      };

      savedScale.value = savedScale.value * scale.value;

      scale.value = 1;
      origin.value = {
        x: 0,
        y: 0,
      };
    });

  const anchorOffset = useSharedValue({x: 0, y: 0});

  const rotateGesture = Gesture.Rotation()
    .onBegin(event => {
      anchor.value = {
        x: event.anchorX - (center.value.x + anchorOffset.value.x),
        y: event.anchorY - (center.value.y + anchorOffset.value.y),
      };
    })
    .onUpdate(event => {
      rotation.value = savedRotation.value + event.rotation;
    })
    .onEnd(() => {
      savedRotation.value = rotation.value;
      anchorOffset.value = {
        x: 0,
        y: 0,
      };
    });

  const composed = Gesture.Simultaneous(rotateGesture);

  const animatedStyles = useAnimatedStyle(() => {
    return {
      transform: [
        {translateX: savedTranslation.value.x + translation.value.x},
        {translateY: savedTranslation.value.y + translation.value.y},
        {scale: savedScale.value * scale.value},

        {translateX: anchor.value.x},
        {translateY: anchor.value.y},
        {rotateZ: `${rotation.value}rad`},
        {translateX: -anchor.value.x},
        {translateY: -anchor.value.y},
      ],
    };
  });

  return (
    <GestureDetector gesture={composed}>
      <Animated.View
        style={styles.container}
        onLayout={event => {
          // because the flex is centered, the children coordinates are in the center of the container
          viewPortWidth.value = event.nativeEvent.layout.width;
          viewPortHeight.value = event.nativeEvent.layout.height;
        }}>
        <Animated.View
          collapsable={false}
          style={animatedStyles}
          onLayout={event => {
            mapWidth.value = event.nativeEvent.layout.width;
            mapHeight.value = event.nativeEvent.layout.height;
          }}>
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
