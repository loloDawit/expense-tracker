
import { auth, firestore } from '@/config/firebase';
import logger from '@/utils/logger';
import { onAuthStateChanged, User } from 'firebase/auth';
import {
  collection,
  DocumentData,
  FirestoreError,
  onSnapshot,
  query,
  QueryConstraint,
  QuerySnapshot,
  where,
} from 'firebase/firestore';
import { useCallback, useEffect, useState } from 'react';

const useFetchData = <T>(
  collectionName: string,
  constraints: QueryConstraint[] = [],
) => {
  logger.info(`[useFetchData] Hook initiated for collection: ${collectionName}`, {
    constraints,
  });

  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(
    (user: User | null) => {
      if (!user) {
        logger.info('[useFetchData] No authenticated user, clearing data.');
        setData([]);
        setLoading(false);
        return () => {}; // Return an empty unsubscribe function
      }

      const userId = user.uid;
      logger.info(
        `[useFetchData] Starting fetch for user: ${userId}, collection: ${collectionName}`,
      );
      setLoading(true);

      const collectionRef = collection(firestore, collectionName);

      // Start with base filters
      const finalConstraints: QueryConstraint[] = [
        where('uid', '==', userId),
      ];

      // Add special filters before any sorting
      if (collectionName === 'wallets') {
        finalConstraints.push(where('isDeleted', '==', false));
        logger.info('[useFetchData] Added constraint for non-deleted wallets.');
      }

      // Add the component-level constraints (like orderBy) at the end
      finalConstraints.push(...constraints);

      const q = query(collectionRef, ...finalConstraints);

      const unsubscribe = onSnapshot(
        q,
        (snapshot: QuerySnapshot<DocumentData>) => {
          const fetchedData = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as T[];

          logger.info(
            `[useFetchData] ✅ Success: Fetched ${fetchedData.length} items from ${collectionName}.`,
          );
          setData(fetchedData);
          setLoading(false);
          setError(null);
        },
        (err: FirestoreError) => {
          logger.error(
            `[useFetchData] ❌ Firestore error for ${collectionName}:`,
            {
              code: err.code,
              message: err.message,
              details: err,
              userId,
              collectionName,
            },
          );
          setError(err.message);
          setLoading(false);
        },
      );

      return unsubscribe;
    },
    [collectionName, JSON.stringify(constraints)],
  );

  useEffect(() => {
    logger.info(
      `[useFetchData] useEffect triggered for ${collectionName}. Setting up auth listener.`,
    );
    let unsubscribeFromFirestore: (() => void) | undefined;

    const unsubscribeFromAuth = onAuthStateChanged(auth, (user) => {
      // Always unsubscribe from the previous listener first.
      if (unsubscribeFromFirestore) {
        logger.info(
          `[useFetchData] Cleaning up previous Firestore listener for ${collectionName}.`,
        );
        unsubscribeFromFirestore();
      }

      if (user) {
        logger.info(
          `[useFetchData] Auth state changed: User signed in. Fetching ${collectionName}.`,
        );
        unsubscribeFromFirestore = fetchData(user);
      } else {
        logger.info(
          `[useFetchData] Auth state changed: User signed out. Clearing data for ${collectionName}.`,
        );
        fetchData(null); // Clears data and sets loading to false
      }
    });

    return () => {
      logger.info(
        `[useFetchData] Cleaning up auth and Firestore listeners for ${collectionName}.`,
      );
      unsubscribeFromAuth();
      if (unsubscribeFromFirestore) {
        unsubscribeFromFirestore();
      }
    };
  }, [fetchData, collectionName]);

  return { data, loading, error };
};

export default useFetchData;
