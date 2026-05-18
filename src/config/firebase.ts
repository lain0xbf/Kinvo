import { initializeApp, getApps, getApp } from 'firebase/app';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Auth, getAuth, getReactNativePersistence, initializeAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: 'AIzaSyAGI4OOgAmMpbT0GAtUn7LVUsOugNCh0gI',
  authDomain: 'dev-set.firebaseapp.com',
  databaseURL: 'https://dev-set-default-rtdb.firebaseio.com',
  projectId: 'dev-set',
  storageBucket: 'dev-set.firebasestorage.app',
  messagingSenderId: '88218333381',
  appId: '1:88218333381:web:4a5499c08ceaba5d8140ac',
  measurementId: 'G-Q6VHCCLVS0',
};
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// Evita inicializar o Auth duas vezes
let auth: Auth;
try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
} catch {
  auth = getAuth(app);
}

export const database = getDatabase();
export const get = getAuth();

export { app, auth };
