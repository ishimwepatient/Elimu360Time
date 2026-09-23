import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const clientEnv = typeof import.meta !== 'undefined' && (import.meta as any).env ? (import.meta as any).env : {};

export const firebaseConfig = {
  projectId: clientEnv.VITE_FIREBASE_PROJECT_ID || "velvety-button-z5xj8",
  appId: clientEnv.VITE_FIREBASE_APP_ID || "1:682693340903:web:8a5ea08b88fde33bfd7c42",
  apiKey: clientEnv.VITE_FIREBASE_API_KEY || "AIzaSyB1h1XIPB9EO0qaka4NO7EIm63R-1UrGVs",
  authDomain: clientEnv.VITE_FIREBASE_AUTH_DOMAIN || "velvety-button-z5xj8.firebaseapp.com",
  firestoreDatabaseId: clientEnv.VITE_FIREBASE_DATABASE_ID || "ai-studio-elimu360sims-8e612420-5a43-449a-aa85-2f5bf3416585",
  storageBucket: clientEnv.VITE_FIREBASE_STORAGE_BUCKET || "velvety-button-z5xj8.firebasestorage.app",
  messagingSenderId: clientEnv.VITE_FIREBASE_MESSAGING_SENDER_ID || "682693340903",
};

// Initialize Firebase App singleton
export const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);

// Initialize Firestore on target database
export const db = firebaseConfig.firestoreDatabaseId && firebaseConfig.firestoreDatabaseId !== '(default)'
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);


