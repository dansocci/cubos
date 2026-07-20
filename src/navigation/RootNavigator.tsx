import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { CubeDetailScreen } from '../screens/CubeDetailScreen';
import { CubeFormScreen } from '../screens/CubeFormScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { colors } from '../theme/colors';
import type { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: colors.surface },
          headerTintColor: colors.text,
          headerShadowVisible: false,
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen name="CubeDetail" component={CubeDetailScreen} />
        <Stack.Screen name="CubeForm" component={CubeFormScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
