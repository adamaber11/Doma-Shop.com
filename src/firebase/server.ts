
import * as admin from 'firebase-admin';

// ملاحظة: تأكد من أن متغير البيئة هذا متاح في بيئة النشر (Vercel, etc.).
const serviceAccountString = process.env.FIREBASE_ADMIN_SERVICE_ACCOUNT_JSON;

let firestore: admin.firestore.Firestore;

function initializeFirebaseAdmin() {
  if (!serviceAccountString) {
    console.error("The FIREBASE_ADMIN_SERVICE_ACCOUNT_JSON environment variable is not set. It's required for server-side Firebase operations.");
    // في حالة عدم وجود متغير البيئة، نُنشئ كائنًا وهميًا لتجنب تعطل التطبيق بالكامل.
    // هذا يسمح لعملية البناء بالاستمرار حتى لو فشل جلب البيانات الديناميكية.
    return {
      collection: () => ({
        get: () => Promise.resolve({ docs: [], empty: true }),
      }),
    } as unknown as admin.firestore.Firestore;
  }
  
  // تحقق مما إذا كان التطبيق قد تم تهيئته بالفعل لمنع الخطأ
  if (!admin.apps.length) {
    try {
      const serviceAccount = JSON.parse(serviceAccountString);
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
    } catch (error) {
      console.error("Failed to parse service account JSON or initialize Firebase Admin SDK:", error);
      // في حالة الفشل، نقوم بإنشاء كائن وهمي لمنع تعطل التطبيق بالكامل.
      return {
        collection: () => ({
          get: () => Promise.resolve({ docs: [], empty: true }),
        }),
      } as unknown as admin.firestore.Firestore;
    }
  }

  return admin.firestore();
}

// قم بتهيئة firestore مرة واحدة فقط
firestore = initializeFirebaseAdmin();

// تصدير firestore instance لاستخدامه في جميع أنحاء الخادم.
export { firestore };
