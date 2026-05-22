// ============================================
// FIRESTORE COLLECTIONS - ACTUAL SCHEMAS
// ============================================

/**
 * TENANTS COLLECTION
 * ============================================
 * Purpose: Multi-tenant configuration
 * 
 * Document: /tenants/{tenantId}
 * 
 * Example document:
 * {
 *   "id": "tenant_retie_colombia",
 *   "name": "RETIE Colombia",
 *   "logo": "https://...",
 *   "primaryColor": "#1a365d",
 *   "secondaryColor": "#4a5568",
 *   "settings": {
 *     "allowCustomSchemas": true,
 *     "maxInspectionsPerMonth": 1000,
 *     "maxStorageGB": 50,
 *     "enableOfflineMode": true,
 *     "enableAttachments": true,
 *     "enableDigitalSignatures": false,
 *     "defaultSchemaVersion": "1.0.0"
 *   },
 *   "createdAt": "2024-01-01T00:00:00Z",
 *   "isActive": true
 * }
 */
export interface TenantDocument {
  id: string;
  name: string;
  logo?: string;
  primaryColor?: string;
  secondaryColor?: string;
  settings: {
    allowCustomSchemas: boolean;
    maxInspectionsPerMonth: number;
    maxStorageGB: number;
    enableOfflineMode: boolean;
    enableAttachments: boolean;
    enableDigitalSignatures: boolean;
    defaultSchemaVersion: string;
  };
  createdAt: string;
  isActive: boolean;
}

/**
 * USERS COLLECTION
 * ============================================
 * Purpose: User authentication and authorization
 * 
 * Document: /users/{userId}
 * 
 * Example document:
 * {
 *   "id": "user_123",
 *   "email": "inspector@retie.com",
 *   "displayName": "Juan Pérez",
 *   "role": "inspector",
 *   "tenantId": "tenant_retie_colombia",
 *   "permissions": [
 *     "inspection:create",
 *     "inspection:read",
 *     "inspection:update",
 *     "attachment:upload"
 *   ],
 *   "photoURL": "https://...",
 *   "phone": "+573001234567",
 *   "licenseNumber": "RET-2024-001",
 *   "createdAt": "2024-01-01T00:00:00Z",
 *   "lastLoginAt": "2024-05-18T10:30:00Z",
 *   "isActive": true
 * }
 */
export interface UserDocument {
  id: string;
  email: string;
  displayName: string;
  role: 'inspector' | 'supervisor' | 'admin';
  tenantId: string;
  permissions: string[];
  photoURL?: string;
  phone?: string;
  licenseNumber?: string;
  createdAt: string;
  lastLoginAt?: string;
  isActive: boolean;
}

/**
 * INSPECTIONS COLLECTION
 * ============================================
 * Purpose: Main inspection records
 * 
 * Document: /inspections/{inspectionId}
 * 
 * Indexes required:
 * - tenantId + status
 * - inspectorId + createdAt
 * - tenantId + createdAt
 * 
 * Example document:
 * {
 *   "id": "ins_2024_001",
 *   "inspectionCode": "INS-2024-00001",
 *   "tenantId": "tenant_retie_colombia",
 *   "status": "approved",
 *   "siteName": "Edificio Central",
 *   "siteAddress": "Carrera 10 # 20-30, Bogotá",
 *   "siteType": "commercial",
 *   "inspectionDate": "2024-05-15",
 *   "inspectorId": "user_123",
 *   "inspectorName": "Juan Pérez",
 *   "schemaCode": "ELECTRICA",
 *   "schemaVersion": "1.0.0",
 *   "compliancePercentage": 85.5,
 *   "complianceGrade": "B",
 *   "score": 82,
 *   "noConformitiesCount": 3,
 *   "criticalCount": 0,
 *   "answers": {
 *     "has_service": "SI",
 *     "service_voltage": 220,
 *     "voltage_l1": 218.5,
 *     "voltage_l2": 219.2,
 *     "voltage_l3": 217.8,
 *     "has_main_breaker": "SI",
 *     "breaker_rating": 60,
 *     "has_grounding": "SI",
 *     "grounding_resistance": 5.2
 *   },
 *   "attachments": ["att_001", "att_002"],
 *   "noConformities": [
 *     {
 *       "id": "nc_001",
 *       "fieldId": "breaker_rating",
 *       "severity": "major",
 *       "description": "Interruptor de capacidad insuficiente",
 *       "status": "open"
 *     }
 *   ],
 *   "createdAt": "2024-05-15T08:00:00Z",
 *   "updatedAt": "2024-05-18T14:30:00Z",
 *   "completedAt": "2024-05-16T16:00:00Z",
 *   "approvedBy": "user_456",
 *   "approvedAt": "2024-05-18T14:30:00Z"
 * }
 */
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
  schemaCode: string;
  schemaVersion: string;
  compliancePercentage?: number;
  complianceGrade?: string;
  score?: number;
  noConformitiesCount?: number;
  criticalCount?: number;
  answers: Record<string, any>;
  attachments: string[];
  noConformities?: NoConformity[];
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  approvedBy?: string;
  approvedAt?: string;
  rejectedBy?: string;
  rejectedAt?: string;
  rejectionReason?: string;
}

export interface NoConformity {
  id: string;
  fieldId: string;
  severity: 'critical' | 'major' | 'minor';
  description: string;
  status: 'open' | 'corrected' | 'validated' | 'closed';
  createdAt: string;
  correctedAt?: string;
  validatedBy?: string;
  validatedAt?: string;
  evidence?: string[];
}

/**
 * ATTACHMENTS COLLECTION
 * ============================================
 * Purpose: File storage references
 * 
 * Document: /attachments/{attachmentId}
 * 
 * Example document:
 * {
 *   "id": "att_001",
 *   "inspectionId": "ins_2024_001",
 *   "fieldId": "service_photo",
 *   "tenantId": "tenant_retie_colombia",
 *   "type": "photo",
 *   "fileName": "IMG_20240515_001.jpg",
 *   "fileSize": 2456789,
 *   "mimeType": "image/jpeg",
 *   "storagePath": "tenant_retie_colombia/ins_2024_001/photos/att_001.jpg",
 *   "downloadURL": "https://firebasestorage...",
 *   "thumbnailURL": "https://firebasestorage.../thumb_att_001.jpg",
 *   "uploadedBy": "user_123",
 *   "uploadedAt": "2024-05-15T09:30:00Z",
 *   "metadata": {
 *     "width": 1920,
 *     "height": 1080,
 *     "location": { "lat": 4.6, "lng": -74.1 }
 *   }
 * }
 */
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
  metadata?: {
    width?: number;
    height?: number;
    duration?: number;
    location?: { lat: number; lng: number };
  };
}

/**
 * AUDIT COLLECTION
 * ============================================
 * Purpose: Complete audit trail
 * 
 * Document: /audit/{auditId}
 * 
 * Indexes required:
 * - inspectionId + timestamp
 * - userId + timestamp
 * 
 * Example document:
 * {
 *   "id": "audit_001",
 *   "inspectionId": "ins_2024_001",
 *   "fieldId": "has_service",
 *   "action": "FIELD_CHANGED",
 *   "previousValue": "NO",
 *   "newValue": "SI",
 *   "userId": "user_123",
 *   "userName": "Juan Pérez",
 *   "userRole": "inspector",
 *   "timestamp": "2024-05-15T09:15:00Z",
 *   "deviceInfo": {
 *     "deviceId": "device_001",
 *     "deviceName": "iPhone 14",
 *     "os": "iOS 17.2",
 *     "appVersion": "1.0.0"
 *   },
 *   "sessionId": "session_001"
 * }
 */
export interface AuditDocument {
  id: string;
  inspectionId: string;
  fieldId?: string;
  action: string;
  previousValue?: any;
  newValue?: any;
  userId: string;
  userName: string;
  userRole: string;
  timestamp: string;
  deviceInfo?: {
    deviceId: string;
    deviceName: string;
    os: string;
    appVersion: string;
  };
  sessionId?: string;
}

/**
 * SCHEMAS COLLECTION
 * ============================================
 * Purpose: JSON schema registry
 * 
 * Document: /schemas/{schemaId}
 * 
 * Example document:
 * {
 *   "id": "schema_001",
 *   "name": "Instalación Eléctrica",
 *   "code": "ELECTRICA",
 *   "version": "1.0.0",
 *   "tenantId": "tenant_retie_colombia",
 *   "status": "active",
 *   "description": "Schema para inspección de instalaciones eléctricas según RETIE",
 *   "schema": { ... JSON schema ... },
 *   "createdBy": "user_admin",
 *   "createdAt": "2024-01-01T00:00:00Z",
 *   "updatedAt": "2024-01-01T00:00:00Z",
 *   "activatedAt": "2024-01-01T00:00:00Z",
 *   "migrationFrom": "0.9.0"
 * }
 */
export interface SchemaDocument {
  id: string;
  name: string;
  code: string;
  version: string;
  tenantId: string;
  status: 'draft' | 'active' | 'deprecated';
  description?: string;
  schema: any;
  createdBy: string;
  createdAt: string;
  updatedAt?: string;
  activatedAt?: string;
  migrationFrom?: string;
}

/**
 * DRAFTS COLLECTION (offline sync)
 * ============================================
 * Purpose: Local draft sync queue
 * 
 * Document: /syncQueue/{operationId}
 */
export interface SyncQueueDocument {
  id: string;
  type: 'CREATE' | 'UPDATE' | 'DELETE';
  entity: 'inspection' | 'answers' | 'attachment' | 'audit';
  entityId: string;
  payload: any;
  timestamp: string;
  retryCount: number;
  status: 'pending' | 'processing' | 'failed' | 'completed';
  error?: string;
  priority: 'high' | 'normal' | 'low';
}

// ============================================
// COLLECTION GROUPS FOR REPORTING
// ============================================

export const COLLECTION_GROUPS = {
  INSPECTIONS: 'inspections',
  ATTACHMENTS: 'attachments',
  AUDIT: 'audit',
  SCHEMAS: 'schemas'
} as const;

// ============================================
// FIRESTORE INDEXES (firebase.json)
// ============================================

export const FIRESTORE_INDEXES_CONFIG = {
  indexes: [
    {
      collectionGroup: 'inspections',
      fieldPath: 'tenantId',
      order: 'ASCENDING',
      arrayConfig: 'NOT_CONTAINS'
    },
    {
      collectionGroup: 'inspections',
      fieldPath: 'status',
      order: 'ASCENDING',
      arrayConfig: 'NOT_CONTAINS'
    },
    {
      collectionGroup: 'inspections',
      fieldPath: 'createdAt',
      order: 'DESCENDING',
      arrayConfig: 'NOT_CONTAINS'
    },
    {
      collectionGroup: 'inspections',
      fieldPath: 'inspectorId',
      order: 'ASCENDING',
      arrayConfig: 'NOT_CONTAINS'
    },
    {
      collectionGroup: 'audit',
      fieldPath: 'inspectionId',
      order: 'DESCENDING',
      arrayConfig: 'NOT_CONTAINS'
    },
    {
      collectionGroup: 'audit',
      fieldPath: 'timestamp',
      order: 'DESCENDING',
      arrayConfig: 'NOT_CONTAINS'
    },
    {
      collectionGroup: 'attachments',
      fieldPath: 'inspectionId',
      order: 'ASCENDING',
      arrayConfig: 'NOT_CONTAINS'
    }
  ]
};

export default COLLECTION_GROUPS;