import React from 'react';
import { Button, Text, View } from 'react-native';

export interface WifiConnectLegalTermsProperties {
  legalTerms: string;
  onAccept: () => void;
}

export default function WifiConnectLegalTerms(
  props: WifiConnectLegalTermsProperties,
) {
  return (
    <View>
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
