import { initializeApp, getApps, getApp } from 'firebase/app';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Auth, getAuth, getReactNativePersistence, initializeAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyB_myLB92PM2WdOMMOcaQiylgjDAPXLreM",
  authDomain: "faculdade-firestore.firebaseapp.com",
  projectId: "faculdade-firestore",
  storageBucket: "faculdade-firestore.firebasestorage.app",
  messagingSenderId: "1048540152133",
  appId: "1:1048540152133:web:01399f7477229841127e2c"
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

export const firestore = getFirestore(app);
export const get = getAuth(app);

export { app, auth };
