import {
  initWifiConnectService,
  WifiConnectService,
} from '@abl-solutions/wifi-connect';

let instance: WifiConnectService | null = null;

export function createWifiConnectService(accessToken: string) {
  instance = initWifiConnectService({
    accessToken: accessToken,
    ignoreNetworkErrorOnSimulator: false,
    wifiApiEndpoint: 'https://dev.api.wifi.connectivity.abl-solutions.io',
  });
}

export function getWifiConnectService(): WifiConnectService {
  if (!instance) {
    throw new Error('WifiConnectService not initialized');
  }

  return instance;
}
