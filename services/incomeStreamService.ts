import { firestore } from '@/config/firebase';
import { IncomeStreamType } from '@/types';
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  setDoc,
  Timestamp,
} from 'firebase/firestore';

export const fetchIncomeStreams = async (uid: string) => {
  try {
    const snapshot = await getDocs(
      query(
        collection(firestore, `users/${uid}/incomeStreams`),
        orderBy('createdAt', 'desc'),
      ),
    );

    const data = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as IncomeStreamType[];

    return { success: true, data };
  } catch (err) {
    console.error('Error fetching income streams', err);
    return { success: false, msg: 'Failed to fetch income streams' };
  }
};

export const createOrUpdateIncomeStream = async (
  uid: string,
  stream: Partial<IncomeStreamType> & { id?: string },
) => {
  try {
    if (!stream.label || !stream.amount) {
      return { success: false, msg: 'Missing income stream data' };
    }

    const ref = stream.id
      ? doc(firestore, `users/${uid}/incomeStreams`, stream.id)
      : doc(collection(firestore, `users/${uid}/incomeStreams`));

    await setDoc(
      ref,
      {
        ...stream,
        createdAt: Timestamp.now(),
      },
      { merge: true },
    );

    return { success: true, data: { ...stream, id: ref.id } };
  } catch (err) {
    console.error('Error saving income stream', err);
    return { success: false, msg: 'Failed to save income stream' };
  }
};

export const deleteIncomeStream = async (uid: string, streamId: string) => {
  try {
    await deleteDoc(doc(firestore, `users/${uid}/incomeStreams`, streamId));
    return { success: true };
  } catch (err) {
    console.error('Error deleting income stream', err);
    return { success: false, msg: 'Failed to delete income stream' };
  }
};
