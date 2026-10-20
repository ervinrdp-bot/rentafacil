import { getApp, getApps, initializeApp } from 'firebase/app';
import { collection, doc, getFirestore, onSnapshot, setDoc, writeBatch, getDocs, deleteDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

export const isFirebaseConfigured = Object.values(firebaseConfig).every(Boolean);

const firebaseApp = isFirebaseConfigured
  ? getApps().length > 0
    ? getApp()
    : initializeApp(firebaseConfig)
  : null;

export const firestoreDb = firebaseApp ? getFirestore(firebaseApp) : null;

const serialize = <T,>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

export const subscribeToCollection = <T,>(
  collectionName: string,
  onData: (items: T[]) => void,
  onError?: (error: Error) => void
) => {
  if (!firestoreDb) return () => undefined;

  return onSnapshot(
    collection(firestoreDb, collectionName),
    (snapshot) => onData(snapshot.docs.map((item) => item.data() as T)),
    (error) => onError?.(error)
  );
};

export const clearCollection = async (collectionName: string) => {
  if (!firestoreDb) return;
  try {
    const snap = await getDocs(collection(firestoreDb, collectionName));
    const batch = writeBatch(firestoreDb);
    snap.docs.forEach((item) => {
      batch.delete(item.ref);
    });
    await batch.commit();
  } catch (err) {
    console.error(`Error clearing collection ${collectionName}`, err);
  }
};

export const deleteDocument = async (collectionName: string, id: string) => {
  if (!firestoreDb) return;
  try {
    await deleteDoc(doc(firestoreDb, collectionName, id));
  } catch (err) {
    console.error(`Error deleting doc ${id} from ${collectionName}:`, err);
  }
};

export const saveCollection = async <T extends { id: string }>(
  collectionName: string,
  items: T[]
) => {
  if (!firestoreDb) return;

  try {
    const existingSnap = await getDocs(collection(firestoreDb, collectionName));
    const currentIds = new Set(items.map((i) => i.id));
    const batch = writeBatch(firestoreDb);

    // Delete documents that no longer exist locally
    existingSnap.docs.forEach((docSnap) => {
      if (!currentIds.has(docSnap.id)) {
        batch.delete(docSnap.ref);
      }
    });

    // Upsert current items
    items.forEach((item) => {
      batch.set(doc(firestoreDb, collectionName, item.id), serialize(item));
    });

    await batch.commit();
  } catch (err) {
    console.error(`Error saving collection ${collectionName}:`, err);
    throw err;
  }
};

export const saveBusinessProfile = async <T,>(profile: T) => {
  if (!firestoreDb) return;
  await setDoc(
    doc(firestoreDb, 'settings', 'business'),
    serialize(profile) as Record<string, unknown>
  );
};

export const subscribeToBusinessProfile = <T,>(
  onData: (profile: T | null) => void,
  onError?: (error: Error) => void
) => {
  if (!firestoreDb) return () => undefined;

  return onSnapshot(
    doc(firestoreDb, 'settings', 'business'),
    (snapshot) => onData(snapshot.exists() ? snapshot.data() as T : null),
    (error) => onError?.(error)
  );
};
