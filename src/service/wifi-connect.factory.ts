import {
  CampaignService,
  initCampaignService,
  initWifiConnectService,
  WifiConnectService,
} from '@abl-solutions/wifi-connect';

export function createWifiConnectService(
  accessToken: string,
): WifiConnectService {
  return initWifiConnectService({
    accessToken: accessToken,
    ignoreNetworkErrorOnSimulator: true,
    wifiApiEndpoint: 'https://dev.api.wifi.connectivity.abl-solutions.io',
    android: {
      timeSpanToWaitForPermissionDialogConfirmationInSeconds: 30,
    },
  });
}

export function createWifiCampaignService(
  accessToken: string,
): CampaignService {
  return initCampaignService({
    accessToken: accessToken,
    campaignApiEndpoint:
      'https://dev.api.wifi-connect.campaign-manager.ads.abl-solutions.io',
  });
}
