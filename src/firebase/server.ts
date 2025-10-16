
import * as admin from 'firebase-admin';

const serviceAccountString = process.env.FIREBASE_ADMIN_SERVICE_ACCOUNT_JSON;

let firestoreInstance: admin.firestore.Firestore | null = null;
let isInitialized = false;

function initializeFirebaseAdmin(): admin.firestore.Firestore | null {
  if (isInitialized) {
    return firestoreInstance;
  }

  isInitialized = true; // Mark as initialized to prevent re-runs

  if (!serviceAccountString) {
    console.error("Firebase Admin SDK Error: The FIREBASE_ADMIN_SERVICE_ACCOUNT_JSON environment variable is not set. Server-side data fetching will be disabled.");
    firestoreInstance = null;
    return null;
  }

  if (admin.apps.length) {
    firestoreInstance = admin.firestore();
    return firestoreInstance;
  }

  try {
    const serviceAccount = JSON.parse(serviceAccountString);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    firestoreInstance = admin.firestore();
    return firestoreInstance;
  } catch (error) {
    console.error("Firebase Admin SDK Error: Failed to parse service account JSON or initialize.", error);
    firestoreInstance = null;
    return null;
  }
}

// Initialize on module load.
const firestore = initializeFirebaseAdmin();

// Export the potentially null instance.
// Code using this module must handle the case where it's null.
export { firestore };
