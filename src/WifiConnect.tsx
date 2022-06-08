import type { LegalTerms } from '@abl-solutions/wifi-connect';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Switch, Text } from 'react-native-paper';
import WifiConnectLegalTerms from './WifiConnectLegalTerms';

export interface WifiConnectProperties {
  isWifiConfigured: boolean;
  legalTerms?: LegalTerms;
  legalTermsAccepted?: boolean;
  onAcceptLegalTerms: () => void;
  onConnectToWifi: () => void;
  onDisconnectFromWifi: () => void;
}

export default function WifiConnect(props: WifiConnectProperties) {
  const onChangeWifiState = (newValue: boolean) => {
    if (newValue) {
      props.onConnectToWifi();
    } else {
      props.onDisconnectFromWifi();
    }
  };

  let content;
  if (props.legalTermsAccepted === undefined || !props.legalTerms) {
    content = (
      <View>
        <Text>Loading...</Text>
      </View>
    );
  } else if (props.legalTermsAccepted) {
    content = (
      <View style={styles.container}>
        <View style={styles.item}>
          <Text style={styles.itemText}>WiFi Connect</Text>
          <Switch
            value={props.isWifiConfigured}
            onValueChange={onChangeWifiState}
          />
        </View>
      </View>
    );
  } else {
    content = (
      <WifiConnectLegalTerms
        onAccept={props.onAcceptLegalTerms}
        legalTerms={props.legalTerms.legalTerms}
      />
    );
  }

  return content;
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    margin: 20,
  },
  itemText: {
    fontSize: 16,
  },
});
