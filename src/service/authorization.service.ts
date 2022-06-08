import { AuthConfiguration, authorize } from 'react-native-app-auth';

const authorizationConfig: AuthConfiguration = {
  issuer: 'https://ISSUER_DOMAIN',
  clientId: '<client-id>',
  redirectUrl: 'com.example.abl.wificonnectivity.login:/callback',
  additionalParameters: {
    audience: 'https://api.wifi.connectivity.abl-solutions.io',
  },
  scopes: ['openid', 'profile', 'email'],
  usePKCE: true,
  useNonce: true,
};

export type Authorization = {
  accessToken: string;
  accessTokenExpirationDate: string;
  refreshToken: string;
  idToken: string;
};

export async function login(): Promise<Authorization> {
  const authorizeResult = await authorize(authorizationConfig);

  return {
    accessToken: authorizeResult.accessToken,
    accessTokenExpirationDate: authorizeResult.accessTokenExpirationDate,
    refreshToken: authorizeResult.refreshToken,
    idToken: authorizeResult.idToken,
  };
}
