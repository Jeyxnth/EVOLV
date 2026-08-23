/**
 * Firebase app initialization.
 *
 * All config values come from environment variables (see .env.example).
 * Never hardcode real Firebase credentials in this file.
 *
 * This module only sets up the app + exports the SDK handles that later
 * phases (auth, Firestore persistence, etc.) will consume. It does not
 * implement any auth flows or data access itself — that belongs to
 * src/services/auth.ts, src/services/db.ts, etc. in later phases.
 */
import { initializeApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const hasFirebaseConfig = Boolean(
  firebaseConfig.apiKey && firebaseConfig.projectId && firebaseConfig.appId
);

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;

if (hasFirebaseConfig) {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
} else {
  // Expected during Phase 1 / local dev before real credentials are set.
  // Demo mode (Phase 3) should not depend on this being configured.
  console.warn(
    "[firebase] Config missing — running without a live Firebase app. " +
      "Set VITE_FIREBASE_* env vars to enable auth/persistence."
  );
}

export { app, auth, db, hasFirebaseConfig };
