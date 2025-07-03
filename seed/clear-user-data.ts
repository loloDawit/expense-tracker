import dotenv from 'dotenv';
import admin from 'firebase-admin';

dotenv.config();
admin.initializeApp({
  credential: admin.credential.cert(require('../serviceAccountKey.json')),
});

const db = admin.firestore();
const targetUid = 'Wuj9kuZ9lBfauohLd0auZGA2dWC3';

const deleteCollection = async (
  collectionName: string,
  field: string = 'uid',
) => {
  const snapshot = await db
    .collection(collectionName)
    .where(field, '==', targetUid)
    .get();

  if (snapshot.empty) {
    console.log(`No documents found in ${collectionName}`);
    return;
  }

  const batch = db.batch();
  snapshot.docs.forEach((doc) => batch.delete(doc.ref));
  await batch.commit();

  console.log(`✅ Deleted ${snapshot.size} documents from ${collectionName}`);
};

const deleteUserDocument = async () => {
  const docRef = db.collection('users').doc(targetUid);
  const doc = await docRef.get();
  if (doc.exists) {
    await docRef.delete();
    console.log(`✅ Deleted user document: ${targetUid}`);
  } else {
    console.log(`No user document found: ${targetUid}`);
  }
};

const run = async () => {
  await deleteCollection('transactions');
  await deleteCollection('wallets');
  await deleteCollection('budgets');
  await deleteUserDocument();

  console.log('🧹 Done clearing all data for target user');
};

run().catch(console.error);
