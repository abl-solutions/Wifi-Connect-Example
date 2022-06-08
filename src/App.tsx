import 'react-native-get-random-values';
import * as React from 'react';
import { StyleSheet, View, Alert } from 'react-native';
import { Appbar } from 'react-native-paper';
import { Buffer } from 'buffer';
import { v4 as uuidv4 } from 'uuid';
import { ErrorCode, LegalTerms } from '@abl-solutions/wifi-connect';
import Login from './Login';
import { Authorization, login } from './service/authorization.service';
import WifiConnect from './WifiConnect';
import {
  createWifiConnectService,
  getWifiConnectService,
} from './service/wifi-connect.factory';

// randomly create a device id for demo purposes
const deviceId = uuidv4();

export default function App() {
  /* eslint-disable prettier/prettier */
  const [authorization, setAuthorization] = React.useState<Authorization | undefined>(undefined);
  const [isWifiConfigured, setIsWifiConfigured] = React.useState<boolean>(false);
  const [legalTerms, setLegalTerms] = React.useState<LegalTerms>();
  const [legalTermsAccepted, setLegalTermsAccepted] = React.useState<boolean | undefined>(undefined);
  const [periodicallyCheckConfigurationState, setPeriodicallyCheckConfigurationState] = React.useState<boolean>(true);
  /* eslint-enable prettier/prettier */

  React.useEffect(() => {
    if (authorization) {
      // initialize abl's WiFi-Connect SDK
      createWifiConnectService(authorization.accessToken);

      getWifiConnectService()
        .legalTermsAccepted()
        .then(async newLegalTermsAccepted => {
          setLegalTermsAccepted(newLegalTermsAccepted);

          const newLegalTerms =
            await getWifiConnectService().getLatestLegalTerms();
          setLegalTerms(newLegalTerms);
        });

      getWifiConnectService()
        .isWifiConfigured()
        .then(value => setIsWifiConfigured(value));
    }
  }, [authorization]);

  React.useEffect(() => {
    const interval = setInterval(async () => {
      if (authorization && periodicallyCheckConfigurationState) {
        const isConfigured = await getWifiConnectService().isWifiConfigured();
        setIsWifiConfigured(isConfigured);
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [authorization, periodicallyCheckConfigurationState]);

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
    await getWifiConnectService().acceptLegalTerms(legalTerms.version);
    setLegalTermsAccepted(true);
  };

  const onConnectToWifi = async () => {
    setIsWifiConfigured(true);
    setPeriodicallyCheckConfigurationState(false);

    try {
      await getWifiConnectService().connectToWifi(deviceId, 'de-DE');
      setPeriodicallyCheckConfigurationState(true);
    } catch (e: any) {
      if (e.code === ErrorCode.USER_REJECTED) {
        Alert.alert(
          'Permission Required',
          'You need to grant permission to change WiFi configurations for this app. Go to Settings > Apps & notifications > ... > Special access > Wi-Fi control > WifiConnect Example and enable "Allow app to control Wi-Fi".',
        );
      }

      setPeriodicallyCheckConfigurationState(true);
    }
  };

  const onDisconnectFromWifi = async () => {
    setIsWifiConfigured(false);
    setPeriodicallyCheckConfigurationState(false);

    try {
      await getWifiConnectService().deleteWifiConfiguration(deviceId);
      setPeriodicallyCheckConfigurationState(true);
    } catch (e: any) {
      setPeriodicallyCheckConfigurationState(true);
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
