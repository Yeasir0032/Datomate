import * as admin from "firebase-admin";

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "",
      clientEmail: process.env.NEXT_PUBLIC_FIREBASE_CLIENT_EMAIL || "",
      privateKey: process.env.NEXT_PUBLIC_FIREBASE_PRIVATE_KEY?.replace(
        /\\n/g,
        "\n"
      ),
    }),
  });
}

const adminAuth = admin.auth();
const db = admin.firestore();
const AdminFieldValue = admin.firestore.FieldValue;
const adminIncrement = admin.firestore.FieldValue.increment;

export { adminAuth, db, AdminFieldValue, adminIncrement };
