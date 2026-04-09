import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.kron',
  appName: 'Kron',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
  },
  plugins: {
    SplashScreen: {
      launchAutoHide: true,
      backgroundColor: '#111111',
      showSpinner: false,
    },
    StatusBar: {
      style: 'dark',
      backgroundColor: '#111111',
    },
    CapacitorHttp: {
      enabled: true,
    },
  },
};

export default config;
