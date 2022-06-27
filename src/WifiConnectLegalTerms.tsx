import React from 'react';
import { Button, StyleSheet, Text, View } from 'react-native';

export interface WifiConnectLegalTermsProperties {
  legalTerms: string;
  onAccept: () => void;
}

export default function WifiConnectLegalTerms(
  props: WifiConnectLegalTermsProperties,
) {
  return (
    <View style={styles.center}>
      <Text>{props.legalTerms}</Text>
      <Button
        onPress={props.onAccept}
        title="Accept"
        color="#841584"
        accessibilityLabel="Accept Legal Terms"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
