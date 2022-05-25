import { AuthConfiguration } from 'react-native-app-auth';

export const authorizationConfig: AuthConfiguration = {
  issuer: 'https://ISSUER_DOMAIN',
  clientId: '<client-id>',
  redirectUrl: 'com.example.abl.wificonnectivity.login:/callback',
  additionalParameters: {
    audience:
      'https://api.wifi.connectivity.abl-solutions.io https://api.wifi-connect.campaign-manager.ads.abl-solutions.io',
  },
  scopes: ['openid', 'profile', 'email'],
  usePKCE: true,
  useNonce: true,
};
