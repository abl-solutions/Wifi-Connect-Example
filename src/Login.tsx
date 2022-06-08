import React from 'react';
import { Button, StyleSheet, View } from 'react-native';

export interface LoginProperties {
  onLogin: () => void;
}

export default function Login(props: LoginProperties) {
  return (
    <View style={styles.bottomBar}>
      <View style={styles.bottomButton}>
        <Button
          onPress={props.onLogin}
          title="Login"
          color="#841584"
          accessibilityLabel="Login with your user account"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
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
});
