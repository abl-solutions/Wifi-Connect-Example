import {
  initWifiConnectService,
  WifiConnectService,
} from '@abl-solutions/wifi-connect';

export function createWifiConnectService(
  accessToken: string,
): WifiConnectService {
  return initWifiConnectService({
    accessToken: accessToken,
    ignoreNetworkErrorOnSimulator: false,
    wifiApiEndpoint: 'https://dev.api.wifi.connectivity.abl-solutions.io',
    android: {
      timeSpanToWaitForPermissionDialogConfirmationInSeconds: 30,
    },
  });
}
