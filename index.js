import * as React from 'react';
import { AppRegistry } from 'react-native';
import { Provider as PaperProvider } from 'react-native-paper';
import App from './src/App';
import messaging from '@react-native-firebase/messaging';
import { name as appName } from './app.json';

export default function Main() {
  return (
    <PaperProvider>
      <App />
    </PaperProvider>
  );
}

// Register background handler
messaging().setBackgroundMessageHandler(async remoteMessage => {
  console.log('Message handled in the background!', remoteMessage);
});

AppRegistry.registerComponent(appName, () => Main);
