
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.9bb52d124e614a8fab49923e9277d6d8',
  appName: 'Bipolar Guardian',
  webDir: 'dist',
  server: {
    url: 'https://9bb52d12-4e61-4a8f-ab49-923e9277d6d8.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#6366f1',
      showSpinner: false
    }
  }
};

export default config;
