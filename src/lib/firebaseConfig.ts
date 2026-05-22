// ============================================
// FIREBASE CONFIG LOADER - Environment Aware
// ============================================

import { FirebaseConfig } from '@/engines/firebase/firebaseServices';

export type Environment = 'local' | 'dev' | 'staging' | 'production';

interface EnvironmentConfig {
  environment: Environment;
  firebase: FirebaseConfig;
  features: FeatureFlags;
}

interface FeatureFlags {
  enableOfflineMode: boolean;
  enableAttachments: boolean;
  enableDigitalSignatures: boolean;
  enableAnalytics: boolean;
}

const getCurrentEnvironment = (): Environment => {
  const env = process.env.NEXT_PUBLIC_ENVIRONMENT || process.env.NODE_ENV;
  
  if (env === 'production') return 'production';
  if (env === 'staging') return 'staging';
  if (env === 'development') return 'local';
  
  return 'local';
};

const createFirebaseConfig = (env: Environment): FirebaseConfig => {
  const prefix = env === 'production' ? '' : `NEXT_PUBLIC_FIREBASE_${env.toUpperCase()}_`;
  
  return {
    apiKey: process.env[`${prefix}API_KEY`] || '',
    authDomain: process.env[`${prefix}AUTH_DOMAIN`] || '',
    projectId: process.env[`${prefix}PROJECT_ID`] || '',
    storageBucket: process.env[`${prefix}STORAGE_BUCKET`] || '',
    messagingSenderId: process.env[`${prefix}MESSAGING_SENDER_ID`] || '',
    appId: process.env[`${prefix}APP_ID`] || '',
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
  };
};

const createFeatureFlags = (): FeatureFlags => ({
  enableOfflineMode: process.env.NEXT_PUBLIC_ENABLE_OFFLINE_MODE !== 'false',
  enableAttachments: process.env.NEXT_PUBLIC_ENABLE_ATTACHMENTS !== 'false',
  enableDigitalSignatures: process.env.NEXT_PUBLIC_ENABLE_DIGITAL_SIGNATURES === 'true',
  enableAnalytics: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === 'true'
});

const environmentConfigs: Record<Environment, EnvironmentConfig> = {
  local: {
    environment: 'local',
    firebase: createFirebaseConfig('local'),
    features: createFeatureFlags()
  },
  dev: {
    environment: 'dev',
    firebase: createFirebaseConfig('dev'),
    features: createFeatureFlags()
  },
  staging: {
    environment: 'staging',
    firebase: createFirebaseConfig('staging'),
    features: createFeatureFlags()
  },
  production: {
    environment: 'production',
    firebase: createFirebaseConfig('production'),
    features: createFeatureFlags()
  }
};

export class FirebaseConfigLoader {
  private static instance: FirebaseConfigLoader;
  private currentConfig: EnvironmentConfig;

  private constructor() {
    const env = getCurrentEnvironment();
    this.currentConfig = environmentConfigs[env];
    
    console.log(`🚀 Firebase initialized for environment: ${env}`);
  }

  static getInstance(): FirebaseConfigLoader {
    if (!FirebaseConfigLoader.instance) {
      FirebaseConfigLoader.instance = new FirebaseConfigLoader();
    }
    return FirebaseConfigLoader.instance;
  }

  getConfig(): EnvironmentConfig {
    return this.currentConfig;
  }

  getFirebaseConfig(): FirebaseConfig {
    return this.currentConfig.firebase;
  }

  getEnvironment(): Environment {
    return this.currentConfig.environment;
  }

  getFeatureFlags(): FeatureFlags {
    return this.currentConfig.features;
  }

  isProduction(): boolean {
    return this.currentConfig.environment === 'production';
  }

  isDevelopment(): boolean {
    return this.currentConfig.environment === 'local' || this.currentConfig.environment === 'dev';
  }

  // Switch environment (for testing)
  setEnvironment(env: Environment): void {
    this.currentConfig = environmentConfigs[env];
  }
}

export const firebaseConfigLoader = FirebaseConfigLoader.getInstance();

export default FirebaseConfigLoader;