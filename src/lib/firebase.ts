import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, collection, doc, setDoc, getDoc, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

// Configuración de Firebase - Reemplaza con tus credenciales
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'your-api-key',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'your-project.firebaseapp.com',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'your-project-id',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'your-project.appspot.com',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || 'your-sender-id',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || 'your-app-id',
};

// Inicializar Firebase solo una vez
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Servicios
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);

// ============================================
// FUNCIONES DE AUTENTICACIÓN
// ============================================

export const loginUser = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return { success: true, user: userCredential.user };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
};

export const logoutUser = async () => {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
};

export const checkAuth = () => {
  return new Promise((resolve) => {
    onAuthStateChanged(auth, (user: any) => {
      resolve(user);
    });
  });
};

// ============================================
// FUNCIONES DE INSPECCIONES
// ============================================

import { Inspection, InspectionAnswers, InspectionMetadata } from '@/types/schema';

const INSPECCIONES_COLLECTION = 'inspecciones';

// Guardar inspección
export const saveInspection = async (
  inspectionId: string,
  metadata: InspectionMetadata,
  respuestas: InspectionAnswers
): Promise<{ success: boolean; error?: string }> => {
  try {
    await setDoc(doc(db, INSPECCIONES_COLLECTION, inspectionId), {
      ...metadata,
      respuestas,
      updatedAt: new Date(),
    }, { merge: true });
    return { success: true };
  } catch (error) {
    console.error('Error guardando inspección:', error);
    return { success: false, error: (error as Error).message };
  }
};

// Cargar inspección
export const loadInspection = async (inspectionId: string): Promise<Inspection | null> => {
  try {
    const docSnap = await getDoc(doc(db, INSPECCIONES_COLLECTION, inspectionId));
    if (docSnap.exists()) {
      return docSnap.data() as Inspection;
    }
    return null;
  } catch (error) {
    console.error('Error cargando inspección:', error);
    return null;
  }
};

// Listar inspecciones
export const listInspections = async (
  limitCount: number = 50
): Promise<Inspection[]> => {
  try {
    const q = query(
      collection(db, INSPECCIONES_COLLECTION),
      orderBy('updatedAt', 'desc'),
      limit(limitCount)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc: any) => doc.data() as Inspection);
  } catch (error) {
    console.error('Error listando inspecciones:', error);
    return [];
  }
};

// Listar inspecciones por estado
export const listInspectionsByStatus = async (
  estado: 'borrador' | 'completa' | 'aprobada' | 'rechazada'
): Promise<Inspection[]> => {
  try {
    const q = query(
      collection(db, INSPECCIONES_COLLECTION),
      where('estado', '==', estado),
      orderBy('updatedAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc: any) => doc.data() as Inspection);
  } catch (error) {
    console.error('Error listando inspecciones:', error);
    return [];
  }
};

// ============================================
// FUNCIONES DE AUTOSAVE
// ============================================

export const autoSaveInspection = async (
  inspectionId: string,
  respuestas: InspectionAnswers
): Promise<{ success: boolean; timestamp?: Date; error?: string }> => {
  try {
    await setDoc(doc(db, INSPECCIONES_COLLECTION, inspectionId), {
      respuestas,
      updatedAt: new Date(),
      autoSavedAt: new Date(),
    }, { merge: true });
    
    return { success: true, timestamp: new Date() };
  } catch (error) {
    console.error('Error en autosave:', error);
    return { success: false, error: (error as Error).message };
  }
};