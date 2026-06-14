import React from 'react';
import { Stack } from 'expo-router';
import { PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';

import { paperTheme } from '@/theme/paperTheme';
import { AuthProvider } from '@/context/AuthContext';
import { ToastProvider } from '@/hooks/useToast';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <PaperProvider
        theme={paperTheme}
        settings={{
          icon: (props: any) => <MaterialCommunityIcons {...props} />,
        }}
      >
        <AuthProvider>
          <ToastProvider>
            <StatusBar style="light" />
            <Stack
              screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: paperTheme.colors.background },
              }}
            />
          </ToastProvider>
        </AuthProvider>
      </PaperProvider>
    </SafeAreaProvider>
  );
}
