import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.kron',
  appName: 'Kron',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
  },
  plugins: {
    CapacitorHttp: {
      enabled: true,
    },
    SplashScreen: {
      launchAutoHide: true,
      backgroundColor: '#111111',
      showSpinner: false,
    },
    StatusBar: {
      style: 'dark',
    },
  },
};

export default config;
