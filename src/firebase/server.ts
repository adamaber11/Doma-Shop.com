import * as admin from 'firebase-admin';

// This is the service account JSON, stored as a string.
// It's safe to be here as it's only used on the server.
const serviceAccountString = process.env.FIREBASE_ADMIN_SERVICE_ACCOUNT_JSON;

if (!serviceAccountString) {
  throw new Error("The FIREBASE_ADMIN_SERVICE_ACCOUNT_JSON environment variable is not set. It's required for server-side Firebase operations.");
}

let firestore: admin.firestore.Firestore;

try {
  const serviceAccount = JSON.parse(serviceAccountString);

  // Check if the app is already initialized
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  }

  firestore = admin.firestore();

} catch (error) {
  console.error("Failed to initialize Firebase Admin SDK:", error);
  // Create a mock firestore object on error to prevent the app from crashing,
  // though server-side operations will fail.
  firestore = {} as admin.firestore.Firestore;
}

export { firestore };
