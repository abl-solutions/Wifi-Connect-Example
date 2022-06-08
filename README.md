# abl solutions - Wifi Connect SDK Example App
This repository contains a sample application that shows how to use the
[WiFi Connect - React Native SDK of abl solutions](https://www.npmjs.com/package/@abl-solutions/wifi-connect).

## OS Requirements
- Android: minimum SDK version >= 24 (Android 7 - Nougat)
- iOS: minimum iOS version >= 11.0

## External Dependencies
To run this example you have to use an external OpenID Connect or OAuth 2.0 Authorization Server. If you
don't have one yet, you can register a free account at [https://auth0.com](auth0.com). This authorization
server needs to provide client credentials for a native application.

## Build and run
```bash
npm install
npm run start

# run on Android device
npm run android

# run on iOS device
cd ios && pod install
npm run ios
```

## Authentication
This example uses `react-native-app-auth` to obtain a OAuth 2.0 access token. This token is necessary
to use the `@abl-solutions/wifi-connect` library. `react-native-app-auth` requires to register a URI
scheme for the login redirect. See [android/app/build.gradle](./android/app/build.gradle) at 
`android > manifestPlaceholders > appAuthRedirectScheme` for registering the redirect URI scheme.

Also, you have to register a native application at your OpenID Connect / OAuth 2.0 Authorization Server.
The obtained credentials and parameters must be provided in [src/Login.ts](src/Login.ts). Make sure that
you allow the redirect URI in the client settings of your Authorization Server.

Make sure that the issued JSON Web Token (JWT) contains the 
[https://datatracker.ietf.org/doc/html/rfc7519#section-4.1.3](audience) claim with the value
`https://api.wifi.connect.abl-solutions.io`.

The issued JWT must be passed to the `@abl-solutions/wifi-connect` library, otherwise abl won't issue WiFi credentials.

Your OpenID Connect Authorization Server must be registered as a trusted Authorization Server by using the
[abl solutions - Third Party Authorization Server API](https://dev.api.third-party-authorization.iam.abl-solutions.io/api).
This registration is only required once. After registering, all tokens issued by your Authorization Server will be
accepted.