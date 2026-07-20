import 'react-native-gesture-handler';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { CubesProvider, useCubes } from './src/context/CubesContext';
import { RootNavigator } from './src/navigation/RootNavigator';

SplashScreen.preventAutoHideAsync().catch(() => {
  // Ignora se a splash já tiver sido escondida.
});

function AppContent() {
  const { loading } = useCubes();

  useEffect(() => {
    if (!loading) {
      SplashScreen.hideAsync().catch(() => undefined);
    }
  }, [loading]);

  return (
    <>
      <RootNavigator />
      <StatusBar style="dark" />
    </>
  );
}

export default function App() {
  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <CubesProvider>
          <AppContent />
        </CubesProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
