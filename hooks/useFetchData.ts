import { auth, firestore } from '@/config/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import {
  collection,
  getDocs,
  query,
  QueryConstraint,
} from 'firebase/firestore';
import { useCallback, useEffect, useState } from 'react';

const useFetchData = <T>(
  collectionName: string,
  constraints: QueryConstraint[] = [],
) => {
  console.log('[useFetchData] fetchData triggered for:', collectionName);
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    console.log('[useFetchData] Running fetch for:', collectionName);
    const user = auth.currentUser;
    if (!user) {
      console.info('🛑 Skipping fetch — user not signed in');
      setData([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const collectionRef = collection(firestore, collectionName);
      const q = query(collectionRef, ...constraints);
      const snapshot = await getDocs(q);

      const fetchedData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as T[];

      console.log(`[useFetchData] Fetched ${fetchedData.length} items from ${collectionName}`);
      

      setData(fetchedData);
    } catch (err: any) {
      console.error('Error fetching data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [collectionName, constraints]);

  // ✅ Track when auth is ready before fetching
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user && collectionName) {
        fetchData();
      } else {
        console.info('🛑 Auth state changed — user signed out or not ready');
        setData([]);
        setLoading(false);
      }
    });
    console.log('[useFetchData] useEffect triggered for:', collectionName);
    return () => unsubscribe();
  }, [collectionName, fetchData]);

  return { data, loading, error, refetch: fetchData };
};

export default useFetchData;
