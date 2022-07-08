import 'react-native-get-random-values';
import * as React from 'react';
import { StyleSheet, View, Alert, Platform } from 'react-native';
import { Appbar } from 'react-native-paper';
import { Buffer } from 'buffer';
import messaging from '@react-native-firebase/messaging';
import {
  Campaign,
  CampaignService,
  ErrorCode,
  LegalTerms,
  WifiConnectService,
} from '@abl-solutions/wifi-connect';
import Login from './Login';
import {
  Authorization,
  getEmail,
  login,
} from './service/authorization.service';
import WifiConnect from './WifiConnect';
import {
  createWifiConnectService,
  createWifiCampaignService,
} from './service/wifi-connect.factory';
import WebView from 'react-native-webview';
import { useCallback } from 'react';

let wifiConnectService: WifiConnectService;
let campaignService: CampaignService;

export default function App() {
  /* eslint-disable prettier/prettier */
  const [authorization, setAuthorization] = React.useState<Authorization | undefined>(undefined);
  const [isWifiConfigured, setIsWifiConfigured] = React.useState<boolean>(false);
  const [legalTerms, setLegalTerms] = React.useState<LegalTerms>();
  const [legalTermsAccepted, setLegalTermsAccepted] = React.useState<boolean | undefined>(undefined);
  const [campaign, setCampaign] = React.useState<Campaign | undefined>(undefined);
  const [deviceId, setDeviceId] = React.useState<string | undefined>(undefined);
  /* eslint-enable prettier/prettier */

  const refreshIsWifiConfigured = async () => {
    setIsWifiConfigured(await wifiConnectService.isWifiConfigured());
  };

  const refreshLegalTerms = async () => {
    setLegalTermsAccepted(await wifiConnectService.legalTermsAccepted());
    setLegalTerms(await wifiConnectService.getLatestLegalTerms());
  };

  const getFcmToken = useCallback(async () => {
    setDeviceId(await messaging().getToken());
    console.log('DeviceId: ', deviceId);
  }, [deviceId]);

  React.useEffect(() => {
    if (authorization) {
      // initialize abl's WiFi-Connect SDK
      wifiConnectService = createWifiConnectService(authorization.accessToken);
      wifiConnectService.registerOnPermissionRejectedListener(() => {
        Alert.alert('Permission rejected', 'Please accept...');
      });

      refreshLegalTerms();
      refreshIsWifiConfigured();

      campaignService = createWifiCampaignService(authorization.accessToken);
    }

    // return a clean up function to unregister the listener
    return () => wifiConnectService?.unregisterOnPermissionRejectedListener();
  }, [authorization, campaign]);

  React.useEffect(() => {
    getFcmToken();
  }, [getFcmToken]);

  React.useEffect(() => {
    // User interacts with your notification by pressing on it
    messaging().onNotificationOpenedApp(async remoteMessage => {
      console.log(
        'Notification caused app to open from background state:',
        remoteMessage.notification,
      );
      const campaignUrl = remoteMessage.notification?.body;

      if (campaignUrl) {
        setCampaign({
          required: false,
          campaignUrl,
        });
      }
    });

    messaging().onMessage(async remoteMessage => {
      console.log('A new FCM message arrived!', JSON.stringify(remoteMessage));
      const campaignUrl = remoteMessage.notification?.body;

      if (campaignUrl) {
        setCampaign({
          required: false,
          campaignUrl,
        });
      }
    });
  }, []);

  const onLogin = async () => {
    try {
      const auth = await login();
      setAuthorization(auth);
    } catch (error: any) {
      Alert.alert('Failed to log in', error.message);
      console.log(JSON.stringify(error));
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
      await wifiConnectService.connectToWifi(deviceId!, {
        email: getEmail(authorization!!.idToken),
        preferredLocale: 'de-DE',
      });
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
      await wifiConnectService.deleteWifiConfiguration(deviceId!);
      console.log('Disconnected from Wifi');
    } catch (e: any) {
      console.log(e);
    }
  };

  const onShowCampaign = async () => {
    try {
      const c = await campaignService.getNextCampaign(deviceId!);
      setCampaign(c);
      console.log(
        `showing campaign with url ${c.campaignUrl} - campaign required = ${c.required}`,
      );
    } catch (ex: any) {
      console.log(JSON.stringify(ex));
    }
  };

  const onNavigationStateChange = (navigationState: { url: string }) => {
    if (navigationState?.url?.includes('close_campaign=true')) {
      setCampaign(undefined);
      console.log('campaign viewed - closing webview');
    }
  };

  let mainContent;

  if (authorization) {
    if (!campaign) {
      mainContent = (
        <WifiConnect
          isWifiConfigured={isWifiConfigured}
          legalTerms={legalTerms}
          legalTermsAccepted={legalTermsAccepted}
          onAcceptLegalTerms={onAcceptLegalTerms}
          onConnectToWifi={onConnectToWifi}
          onDisconnectFromWifi={onDisconnectFromWifi}
          onShowCampaign={onShowCampaign}
        />
      );
    } else {
      mainContent = (
        <WebView
          // @ts-ignore
          source={{ uri: campaign?.campaignUrl }}
          onNavigationStateChange={onNavigationStateChange}
        />
      );
    }
  } else {
    mainContent = (
      <View style={styles.center}>
        <Login onLogin={onLogin} />
      </View>
    );
  }

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
});
