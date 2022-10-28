/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * Generated with the TypeScript template
 * https://github.com/react-native-community/react-native-template-typescript
 *
 * @format
 */

import React from 'react';
import {Image, SafeAreaView, View} from 'react-native';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import Pincher from './Pincher';

const App = () => {
  return (
    <GestureHandlerRootView style={{flex: 1}}>
      <Pincher>
        <Image
          source={require('./uv-map.png')}
          style={{width: 400, height: 400, backgroundColor: 'red'}}
          resizeMode="stretch"
        />
        {/* <View
            style={{backgroundColor: 'red', width: 500, height: 500}}></View> */}
      </Pincher>
    </GestureHandlerRootView>
  );
};

export default App;
