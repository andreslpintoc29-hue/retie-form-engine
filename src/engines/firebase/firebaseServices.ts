// ============================================
// FIREBASE SERVICES - REAL INTEGRATION
// ============================================

import { initializeApp, FirebaseApp } from 'firebase/app';
import {
  getAuth,
  Auth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
  GoogleAuthProvider,
  signInWithPopup,
  updateProfile,
  sendPasswordResetEmail
} from 'firebase/auth';
import {
  getFirestore,
  Firestore,
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp,
  Timestamp,
  WriteBatch,
  runTransaction,
  QueryConstraint,
  DocumentData
} from 'firebase/firestore';
import {
  getStorage,
  FirebaseStorage,
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
  listAll,
  UploadTask,
  StorageReference
} from 'firebase/storage';
import { v4 as uuidv4 } from 'uuid';

// ============================================
// CONFIGURATION
// ============================================

export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  measurementId?: string;
}

const DEFAULT_CONFIG: FirebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '',
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || ''
};

// ============================================
// TYPES
// ============================================

export interface User {
  id: string;
  email: string;
  displayName: string;
  role: 'inspector' | 'supervisor' | 'admin';
  tenantId?: string;
  permissions: string[];
  photoURL?: string;
  phone?: string;
  licenseNumber?: string;
  createdAt: string;
  lastLoginAt?: string;
  isActive: boolean;
}

export interface Tenant {
  id: string;
  name: string;
  logo?: string;
  primaryColor?: string;
  secondaryColor?: string;
  settings: TenantSettings;
  createdAt: string;
  isActive: boolean;
}

export interface TenantSettings {
  allowCustomSchemas: boolean;
  maxInspectionsPerMonth: number;
  maxStorageGB: number;
  enableOfflineMode: boolean;
  enableAttachments: boolean;
  enableDigitalSignatures: boolean;
  defaultSchemaVersion: string;
}

export interface InspectionDocument {
  id: string;
  inspectionCode: string;
  tenantId: string;
  status: 'draft' | 'in_progress' | 'submitted' | 'under_review' | 'approved' | 'rejected' | 'closed' | 'archived';
  siteName: string;
  siteAddress: string;
  siteType?: string;
  inspectionDate: string;
  inspectorId: string;
  inspectorName: string;
  schemaVersion: string;
  compliancePercentage?: number;
  complianceGrade?: string;
  score?: number;
  noConformitiesCount?: number;
  criticalCount?: number;
  answers: Record<string, unknown>;
  attachments: string[];
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  approvedBy?: string;
  approvedAt?: string;
  rejectedBy?: string;
  rejectedAt?: string;
  rejectionReason?: string;
}

export interface AttachmentDocument {
  id: string;
  inspectionId: string;
  fieldId?: string;
  tenantId: string;
  type: 'photo' | 'video' | 'document' | 'signature';
  fileName: string;
  fileSize: number;
  mimeType: string;
  storagePath: string;
  downloadURL: string;
  thumbnailURL?: string;
  uploadedBy: string;
  uploadedAt: string;
  metadata?: Record<string, unknown>;
}

export interface AuditDocument {
  id: string;
  inspectionId: string;
  fieldId?: string;
  action: string;
  previousValue?: unknown;
  newValue?: unknown;
  userId: string;
  userName: string;
  userRole: string;
  timestamp: string;
  deviceInfo?: any;
  sessionId?: string;
}

// ============================================
// FIREBASE SERVICE CLASS
// ============================================

export class FirebaseService {
  private app: any = null;
  private auth: any = null;
  private db: any = null;
  private storage: any = null;
  private config: FirebaseConfig;
  private currentUser: User | null = null;
  private authUnsubscribe: (() => void) | null = null;

  constructor(config: FirebaseConfig = DEFAULT_CONFIG) {
    this.config = config;
  }

  // ============================================
  // INITIALIZATION
  // ============================================

  initialize(config?: Partial<FirebaseConfig>): void {
    const finalConfig = { ...this.config, ...config };
    
    if (!finalConfig.apiKey) {
      console.warn('⚠️ Firebase not configured - running in offline mode');
      return;
    }

    this.app = initializeApp(finalConfig);
    this.auth = getAuth(this.app);
    this.db = getFirestore(this.app);
    this.storage = getStorage(this.app);

    console.log('✅ Firebase initialized');
  }

  isInitialized(): boolean {
    return this.app !== null;
  }

  // ============================================
  // AUTH OPERATIONS
  // ============================================

  async signIn(email: string, password: string): Promise<User> {
    if (!this.auth) throw new Error('Firebase not initialized');

    const result = await signInWithEmailAndPassword(this.auth, email, password);
    const firebaseUser = result.user;

    const user = await this.getUserProfile(firebaseUser.uid);
    this.currentUser = user || this.createUserFromFirebase(firebaseUser);

    await this.updateLastLogin(this.currentUser.id);

    return this.currentUser;
  }

  async signInWithGoogle(): Promise<User> {
    if (!this.auth) throw new Error('Firebase not initialized');

    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(this.auth, provider);
    const firebaseUser = result.user;

    const user = await this.getUserProfile(firebaseUser.uid);
    if (user) {
      this.currentUser = user;
      return user;
    }

    this.currentUser = this.createUserFromFirebase(firebaseUser);
    await this.createUserProfile(this.currentUser);

    return this.currentUser;
  }

  async signUp(email: string, password: string, displayName: string, role: User['role'] = 'inspector'): Promise<User> {
    if (!this.auth) throw new Error('Firebase not initialized');

    const result = await createUserWithEmailAndPassword(this.auth, email, password);
    const firebaseUser = result.user;

    if (displayName) {
      await updateProfile(firebaseUser, { displayName });
    }

    const user: User = {
      id: firebaseUser.uid,
      email,
      displayName: displayName || email,
      role,
      permissions: this.getRolePermissions(role),
      createdAt: new Date().toISOString(),
      isActive: true
    };

    await this.createUserProfile(user);
    this.currentUser = user;

    return user;
  }

  async signOut(): Promise<void> {
    if (!this.auth) return;
    await signOut(this.auth);
    this.currentUser = null;
  }

  async resetPassword(email: string): Promise<void> {
    if (!this.auth) throw new Error('Firebase not initialized');
    await sendPasswordResetEmail(this.auth, email);
  }

  onAuthChange(callback: (user: User | null) => void): () => void {
    if (!this.auth) {
      callback(null);
      return () => {};
    }

    this.authUnsubscribe = onAuthStateChanged(this.auth, async (firebaseUser: any) => {
      if (firebaseUser) {
        const user = await this.getUserProfile(firebaseUser.uid);
        this.currentUser = user;
        callback(user);
      } else {
        this.currentUser = null;
        callback(null);
      }
    });

    return () => this.authUnsubscribe?.();
  }

  getCurrentUser(): User | null {
    return this.currentUser;
  }

  private createUserFromFirebase(firebaseUser: any): User {
    return {
      id: firebaseUser.uid,
      email: firebaseUser.email || '',
      displayName: firebaseUser.displayName || 'User',
      role: 'inspector',
      permissions: ['inspector:read', 'inspection:create'],
      photoURL: firebaseUser.photoURL || undefined,
      createdAt: new Date().toISOString(),
      isActive: true
    };
  }

  private getRolePermissions(role: string): string[] {
    const permissions: Record<string, string[]> = {
      inspector: ['inspection:create', 'inspection:read', 'inspection:update', 'attachment:upload'],
      supervisor: [
        'inspection:create', 'inspection:read', 'inspection:update', 'inspection:approve',
        'inspection:reject', 'attachment:upload', 'report:generate', 'user:read'
      ],
      admin: [
        'inspection:*', 'attachment:*', 'report:*', 'user:*', 'tenant:*', 'schema:*'
      ]
    };
    return permissions[role] || permissions.inspector;
  }

  // ============================================
  // USER PROFILE OPERATIONS
  // ============================================

  private async createUserProfile(user: User): Promise<void> {
    if (!this.db) throw new Error('Firestore not initialized');
    await setDoc(doc(this.db, 'users', user.id), user);
  }

  private async getUserProfile(userId: string): Promise<User | null> {
    if (!this.db) throw new Error('Firestore not initialized');
    const docSnap = await getDoc(doc(this.db, 'users', userId));
    return docSnap.exists() ? docSnap.data() as User : null;
  }

  private async updateLastLogin(userId: string): Promise<void> {
    if (!this.db) return;
    await updateDoc(doc(this.db, 'users', userId), {
      lastLoginAt: new Date().toISOString()
    });
  }

  async updateUserProfile(userId: string, updates: Partial<User>): Promise<void> {
    if (!this.db) throw new Error('Firestore not initialized');
    await updateDoc(doc(this.db, 'users', userId), updates);
  }

  async getUsers(): Promise<User[]> {
    if (!this.db) throw new Error('Firestore not initialized');
    const querySnapshot = await getDocs(collection(this.db, 'users'));
    return querySnapshot.docs.map((doc: any) => doc.data() as User);
  }

  // ============================================
  // INSPECTION OPERATIONS
  // ============================================

  async createInspection(inspection: Omit<InspectionDocument, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    if (!this.db) throw new Error('Firestore not initialized');
    
    const id = uuidv4();
    const now = new Date().toISOString();
    
    const docData: InspectionDocument = {
      ...inspection,
      id,
      createdAt: now,
      updatedAt: now
    };

    await setDoc(doc(this.db, 'inspections', id), docData);
    
    await this.logAudit({
      inspectionId: id,
      action: 'INSPECTION_CREATED',
      userId: this.currentUser?.id || '',
      userName: this.currentUser?.displayName || '',
      userRole: this.currentUser?.role || '',
      timestamp: now
    });

    return id;
  }

  async getInspection(id: string): Promise<InspectionDocument | null> {
    if (!this.db) throw new Error('Firestore not initialized');
    const docSnap = await getDoc(doc(this.db, 'inspections', id));
    return docSnap.exists() ? docSnap.data() as InspectionDocument : null;
  }

  async updateInspection(id: string, updates: Partial<InspectionDocument>): Promise<void> {
    if (!this.db) throw new Error('Firestore not initialized');
    
    const updatesWithTimestamp = {
      ...updates,
      updatedAt: new Date().toISOString()
    };

    await updateDoc(doc(this.db, 'inspections', id), updatesWithTimestamp);

    await this.logAudit({
      inspectionId: id,
      action: 'INSPECTION_UPDATED',
      newValue: updates,
      userId: this.currentUser?.id || '',
      userName: this.currentUser?.displayName || '',
      userRole: this.currentUser?.role || '',
      timestamp: new Date().toISOString()
    });
  }

  async deleteInspection(id: string): Promise<void> {
    if (!this.db) throw new Error('Firestore not initialized');
    await deleteDoc(doc(this.db, 'inspections', id));

    await this.logAudit({
      inspectionId: id,
      action: 'INSPECTION_DELETED',
      userId: this.currentUser?.id || '',
      userName: this.currentUser?.displayName || '',
      userRole: this.currentUser?.role || '',
      timestamp: new Date().toISOString()
    });
  }

  async getInspections(constraints: any[] = []): Promise<InspectionDocument[]> {
    if (!this.db) throw new Error('Firestore not initialized');
    
    const q = query(collection(this.db, 'inspections'), ...constraints);
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map((doc: any) => doc.data() as InspectionDocument);
  }

  async getInspectionsByStatus(status: InspectionDocument['status'], tenantId?: string): Promise<InspectionDocument[]> {
    const constraints = [where('status', '==', status)];
    if (tenantId) constraints.push(where('tenantId', '==', tenantId));
    return this.getInspections(constraints);
  }

  async getInspectionsByInspector(inspectorId: string): Promise<InspectionDocument[]> {
    return this.getInspections([where('inspectorId', '==', inspectorId)]);
  }

  onInspectionSnapshot(
    inspectionId: string,
    callback: (inspection: InspectionDocument | null) => void
  ): () => void {
    if (!this.db) {
      callback(null);
      return () => {};
    }

    return onSnapshot(doc(this.db, 'inspections', inspectionId), (docSnap: any) => {
      callback(docSnap.exists() ? docSnap.data() as InspectionDocument : null);
    });
  }

  // ============================================
  // ATTACHMENT OPERATIONS
  // ============================================

  async uploadAttachment(
    inspectionId: string,
    file: File,
    type: AttachmentDocument['type'] = 'photo',
    fieldId?: string
  ): Promise<AttachmentDocument> {
    if (!this.storage || !this.db) throw new Error('Firebase not initialized');

    const tenantId = this.currentUser?.tenantId || 'default';
    const storagePath = `attachments/${tenantId}/${inspectionId}/${uuidv4()}_${file.name}`;
    const storageRef = ref(this.storage, storagePath);

    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);

    const attachment: AttachmentDocument = {
      id: uuidv4(),
      inspectionId,
      fieldId,
      tenantId,
      type,
      fileName: file.name,
      fileSize: file.size,
      mimeType: file.type,
      storagePath,
      downloadURL,
      uploadedBy: this.currentUser?.id || '',
      uploadedAt: new Date().toISOString()
    };

    await setDoc(doc(this.db, 'attachments', attachment.id), attachment);

    const inspection = await this.getInspection(inspectionId);
    if (inspection) {
      await this.updateInspection(inspectionId, {
        attachments: [...inspection.attachments, attachment.id]
      });
    }

    return attachment;
  }

  async deleteAttachment(attachmentId: string): Promise<void> {
    if (!this.db || !this.storage) throw new Error('Firebase not initialized');

    const docSnap = await getDoc(doc(this.db, 'attachments', attachmentId));
    if (!docSnap.exists()) return;

    const attachment = docSnap.data() as AttachmentDocument;

    const storageRef = ref(this.storage, attachment.storagePath);
    await deleteObject(storageRef);

    await deleteDoc(doc(this.db, 'attachments', attachmentId));
  }

  async getAttachments(inspectionId: string): Promise<AttachmentDocument[]> {
    if (!this.db) throw new Error('Firestore not initialized');
    return this.getInspections([where('inspectionId', '==', inspectionId)]).then(() => {
      return this.getAttachmentsList(inspectionId);
    }).then(() => []) as Promise<AttachmentDocument[]>;
  }

  private async getAttachmentsList(inspectionId: string): Promise<AttachmentDocument[]> {
    if (!this.db) return [];
    const q = query(collection(this.db, 'attachments'), where('inspectionId', '==', inspectionId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc: any) => doc.data() as AttachmentDocument);
  }

  // ============================================
  // AUDIT LOG
  // ============================================

  async logAudit(entry: Omit<AuditDocument, 'id'>): Promise<void> {
    if (!this.db) return;
    await setDoc(doc(this.db, 'audit', uuidv4()), entry);
  }

  async getAuditLog(inspectionId: string): Promise<AuditDocument[]> {
    if (!this.db) throw new Error('Firestore not initialized');
    const q = query(
      collection(this.db, 'audit'),
      where('inspectionId', '==', inspectionId),
      orderBy('timestamp', 'desc'),
      limit(100)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc: any) => doc.data() as AuditDocument);
  }

  // ============================================
  // TRANSACTIONS
  // ============================================

  async runTransaction<T>(operation: (transaction: any) => Promise<T>): Promise<T> {
    if (!this.db) throw new Error('Firestore not initialized');
    return runTransaction(this.db, async (transaction: any) => {
      return operation({
        set: (ref: any, data: any) => transaction.set(ref, data),
        update: (ref: any, data: any) => transaction.update(ref, data),
        delete: (ref: any) => transaction.delete(ref)
      } as any);
    });
  }

  // ============================================
  // TENANT OPERATIONS
  // ============================================

  async getTenant(tenantId: string): Promise<Tenant | null> {
    if (!this.db) throw new Error('Firestore not initialized');
    const docSnap = await getDoc(doc(this.db, 'tenants', tenantId));
    return docSnap.exists() ? docSnap.data() as Tenant : null;
  }

  async createTenant(tenant: Omit<Tenant, 'id' | 'createdAt'>): Promise<string> {
    if (!this.db) throw new Error('Firestore not initialized');
    const id = uuidv4();
    await setDoc(doc(this.db, 'tenants', id), {
      ...tenant,
      id,
      createdAt: new Date().toISOString()
    });
    return id;
  }
}

// ============================================
// FIRESTORE COLLECTION STRUCTURE
// ============================================

export const FIRESTORE_COLLECTIONS = {
  USERS: 'users',
  TENANTS: 'tenants',
  INSPECTIONS: 'inspections',
  ATTACHMENTS: 'attachments',
  AUDIT: 'audit',
  SCHEMAS: 'schemas',
  SETTINGS: 'settings'
} as const;

// ============================================
// FIRESTORE INDEXES (for firebase.json)
// ============================================

export const FIRESTORE_INDEXES = `
{
  "indexes": [
    {
      "collectionGroup": "inspections",
      "fieldPath": "status",
      "order": "ASCENDING"
    },
    {
      "collectionGroup": "inspections",
      "fieldPath": "inspectorId",
      "order": "ASCENDING"
    },
    {
      "collectionGroup": "inspections",
      "fieldPath": "tenantId",
      "order": "ASCENDING"
    },
    {
      "collectionGroup": "attachments",
      "fieldPath": "inspectionId",
      "order": "ASCENDING"
    },
    {
      "collectionGroup": "audit",
      "fieldPath": "inspectionId",
      "order": "ASCENDING"
    }
  ]
}
`;

// ============================================
// SECURITY RULES TEMPLATE
// ============================================

export const SECURITY_RULES = `
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function hasRole(roles...) {
      return request.auth.token.role in roles;
    }
    
    function isOwner(userId) {
      return request.auth.uid == userId;
    }
    
    // Users - users can read/update their own profile
    match /users/{userId} {
      allow read: if isAuthenticated();
      allow write: if isOwner(userId) || hasRole('admin');
    }
    
    // Tenants - only admins can manage
    match /tenants/{tenantId} {
      allow read: if isAuthenticated();
      allow write: if hasRole('admin');
    }
    
    // Inspections
    match /inspections/{inspectionId} {
      allow read: if isAuthenticated();
      allow create: if isAuthenticated() && hasRole('inspector', 'supervisor', 'admin');
      allow update: if isAuthenticated() && (
        resource.data.inspectorId == request.auth.uid ||
        hasRole('supervisor', 'admin')
      );
      allow delete: if hasRole('admin');
    }
    
    // Attachments
    match /attachments/{attachmentId} {
      allow read: if isAuthenticated();
      allow create: if isAuthenticated() && hasRole('inspector', 'supervisor', 'admin');
      allow delete: if hasRole('inspector', 'supervisor', 'admin');
    }
    
    // Audit - only admins can read
    match /audit/{auditId} {
      allow read: if hasRole('admin');
      allow write: if true; // System-only
    }
  }
}
`;

// ============================================
// INSTANCE
// ============================================

export const firebaseService = new FirebaseService();

export const initFirebase = (config?: Partial<FirebaseConfig>) => {
  firebaseService.initialize(config);
  return firebaseService;
};

export const getFirebaseService = () => firebaseService;

export default FirebaseService;