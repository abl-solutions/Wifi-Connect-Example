import 'react-native-get-random-values';
import * as React from 'react';
import { StyleSheet, View, Text, Button, Alert } from 'react-native';
import { Appbar } from 'react-native-paper';
import { authorize } from 'react-native-app-auth';
import { Buffer } from 'buffer';
import { v4 as uuidv4 } from 'uuid';
import {
  WifiConnectService,
  WifiConnectOptions,
  initWifiConnectService,
  CampaignOptions,
  initCampaignService,
} from '@abl-solutions/wifi-connect';
import { authorizationConfig } from './Login';

let wifiConnectService: WifiConnectService;

// usually, the device id should be a value that is uniquely assigned to a device. This identifier
// is also used to send push notification to the device (e.g. with Google Firebase Cloud Messaging).
const deviceId = uuidv4();

export default function App() {
  const [authorization, setAuthorization] =
    React.useState<AuthorizationState>(undefined);
  const [status, setStatus] = React.useState<string>('unknown');

  React.useEffect(() => {
    if (authorization) {
      // initialize abl's WiFi-Connect SDK
      console.log('Initilizing wifi connect');

      const wifiConnectOptions: WifiConnectOptions = {
        accessToken: authorization.accessToken,
        wifiApiEndpoint: 'https://dev.api.wifi.connectivity.abl-solutions.io',
      };
      wifiConnectService = initWifiConnectService(wifiConnectOptions);

      // check if the user needs to watch a campaign
      const campaignOptions: CampaignOptions = {
        accessToken: authorization.accessToken,
        campaignApiEndpoint:
          'https://dev.api.wifi-connect.campaign-manager.ads.abl-solutions.io',
      };
      const campaignService = initCampaignService(campaignOptions);
      campaignService.getNextCampaign(deviceId).then(campaign => {
        if (campaign.required) {
          Alert.alert('Campaign', 'Watch campaign...');
          // open webview that shows campaign.campaignUrl...
        } else {
          Alert.alert('Campaign', 'No campaign required...');
        }
      });
    }
  }, [authorization]);

  const onConnect = async () => {
    try {
      if (!authorization) {
        return;
      }

      const legalTermsAccepted = await wifiConnectService.legalTermsAccepted();
      if (!legalTermsAccepted) {
        const legalTerms = await wifiConnectService.getLatestLegalTerms();
        Alert.alert('Legal Terms', legalTerms.legalTerms, [
          {
            text: 'Reject',
            onPress: () => {
              setStatus('legal terms rejected');
            },
            style: 'cancel',
          },
          {
            text: 'Accept',
            onPress: async () => {
              // accept legal terms
              await wifiConnectService.acceptLegalTerms(legalTerms.version);

              // connect to wifi
              await wifiConnectService.connectToWifi(deviceId, 'de-DE');
              setStatus('connected');
            },
          },
        ]);
      } else {
        // legal terms already accepted - connect to wifi
        await wifiConnectService.connectToWifi(uuidv4(), 'de-DE');
        setStatus('connected');
      }
    } catch (e: any) {
      console.log('Connecting to the WiFi failed...');
      console.log(JSON.stringify(e));
      setStatus(e.message);
    }
  };

  const login = async () => {
    try {
      const authState = await authorize(authorizationConfig);
      setAuthorization({
        accessToken: authState.accessToken,
        accessTokenExpirationDate: authState.accessTokenExpirationDate,
        refreshToken: authState.refreshToken,
        idToken: authState.idToken,
      });

      console.log(authState.accessToken);
    } catch (error: any) {
      Alert.alert('Failed to log in', error.message);
    }
  };

  const mainContent = authorization ? (
    <View>
      <Button
        onPress={onConnect}
        title="Connect to WiFi"
        color="#841584"
        accessibilityLabel="Create a WiFi connection"
      />
      <Text>Status: {status}</Text>
    </View>
  ) : null;

  const title = authorization
    ? `Hello ${getUsername(authorization.idToken)}!`
    : 'Login to proceed';

  return (
    <View style={styles.container}>
      <Appbar style={styles.top}>
        <Appbar.Content title={title} />
      </Appbar>

      {mainContent}

      <View style={styles.bottomBar}>
        {!authorization && (
          <View style={styles.bottomButton}>
            <Button
              onPress={login}
              title="Login"
              color="#841584"
              accessibilityLabel="Login with your user account"
            />
          </View>
        )}
      </View>
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
    alignItems: 'center',
    justifyContent: 'center',
  },
  box: {
    width: 60,
    height: 60,
    marginVertical: 20,
  },
  top: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  bottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    alignSelf: 'flex-end',
    flexDirection: 'row',
    margin: 5,
  },
  bottomButton: {
    flex: 1,
  },
  logo: {
    width: 70,
    height: 70,
  },
});

type AuthorizationState =
  | {
      accessToken: string;
      accessTokenExpirationDate: string;
      refreshToken: string;
      idToken: string;
    }
  | undefined;
