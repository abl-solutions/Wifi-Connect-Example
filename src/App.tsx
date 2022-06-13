import 'react-native-get-random-values';
import * as React from 'react';
import { StyleSheet, View, Alert, Platform } from 'react-native';
import { Appbar } from 'react-native-paper';
import { Buffer } from 'buffer';
import { v4 as uuidv4 } from 'uuid';
import {
  ErrorCode,
  LegalTerms,
  WifiConnectService,
} from '@abl-solutions/wifi-connect';
import Login from './Login';
import { Authorization, login } from './service/authorization.service';
import WifiConnect from './WifiConnect';
import { createWifiConnectService } from './service/wifi-connect.factory';

// randomly create a device id for demo purposes
const deviceId = uuidv4();

let wifiConnectService: WifiConnectService;

export default function App() {
  /* eslint-disable prettier/prettier */
  const [authorization, setAuthorization] = React.useState<Authorization | undefined>(undefined);
  const [isWifiConfigured, setIsWifiConfigured] = React.useState<boolean>(false);
  const [legalTerms, setLegalTerms] = React.useState<LegalTerms>();
  const [legalTermsAccepted, setLegalTermsAccepted] = React.useState<boolean | undefined>(undefined);
  /* eslint-enable prettier/prettier */

  const refreshIsWifiConfigured = async () => {
    setIsWifiConfigured(await wifiConnectService.isWifiConfigured());
  };

  const refreshLegalTerms = async () => {
    setLegalTermsAccepted(await wifiConnectService.legalTermsAccepted());
    setLegalTerms(await wifiConnectService.getLatestLegalTerms());
  };

  React.useEffect(() => {
    if (authorization) {
      // initialize abl's WiFi-Connect SDK
      wifiConnectService = createWifiConnectService(authorization.accessToken);
      wifiConnectService.registerOnPermissionRejectedListener(() => {
        Alert.alert('Permission rejected', 'Please accept...');
      });

      refreshLegalTerms();
      refreshIsWifiConfigured();
    }

    // return a clean up function to unregister the listener
    return () => wifiConnectService?.unregisterOnPermissionRejectedListener();
  }, [authorization]);

  const onLogin = async () => {
    try {
      const auth = await login();
      setAuthorization(auth);
    } catch (error: any) {
      Alert.alert('Failed to log in', error.message);
    }
  };

  const onAcceptLegalTerms = async () => {
    if (!legalTerms) {
      return;
    }
    await wifiConnectService.acceptLegalTerms(legalTerms.version);
    setLegalTermsAccepted(true);
  };

  const onConnectToWifi = async () => {
    setIsWifiConfigured(true);

    try {
      await wifiConnectService.connectToWifi(deviceId, 'de-DE');
      console.log('Wifi configured');
    } catch (e: any) {
      if (Platform.OS === 'android' && e.code === ErrorCode.USER_REJECTED) {
        Alert.alert(
          'Permission Required',
          'You need to grant permission to change WiFi configurations for this app. Go to Settings > Apps & notifications > ... > Special access > Wi-Fi control > WifiConnect Example and enable "Allow app to control Wi-Fi".',
        );
      }

      setIsWifiConfigured(false);
      console.log(e);
    }
  };

  const onDisconnectFromWifi = async () => {
    setIsWifiConfigured(false);

    try {
      await wifiConnectService.deleteWifiConfiguration(deviceId);
      console.log('Disconnected from Wifi');
    } catch (e: any) {
      console.log(e);
    }
  };

  const mainContent = authorization ? (
    <WifiConnect
      isWifiConfigured={isWifiConfigured}
      legalTerms={legalTerms}
      legalTermsAccepted={legalTermsAccepted}
      onAcceptLegalTerms={onAcceptLegalTerms}
      onConnectToWifi={onConnectToWifi}
      onDisconnectFromWifi={onDisconnectFromWifi}
    />
  ) : (
    <View style={styles.center}>
      <Login onLogin={onLogin} />
    </View>
  );

  const title = authorization
    ? `Hello ${getUsername(authorization.idToken)}!`
    : 'Hello!';

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.Content
          title={title}
          subtitle="abl WiFi Connect - Sample App"
        />
      </Appbar.Header>

      {mainContent}
    </View>
  );
}

const getUsername = (idToken: string) => {
  const tokenBody = idToken.split('.')[1];
  const userStr = Buffer.from(tokenBody, 'base64').toString('utf-8');
  const user = JSON.parse(userStr);
  return user.nickname;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 70,
    height: 70,
  },
});
