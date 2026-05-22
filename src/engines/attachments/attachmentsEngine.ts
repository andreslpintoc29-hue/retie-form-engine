// ============================================
// FILE/EVIDENCE ENGINE - COMPLETE
// ============================================

import { v4 as uuidv4 } from 'uuid';
import { eventBus } from '@/core/integration/eventBus';

export type AttachmentType = 'photo' | 'video' | 'document' | 'signature';

export interface Attachment {
  id: string;
  inspectionId: string;
  fieldId?: string;
  type: AttachmentType;
  fileName: string;
  fileSize: number;
  mimeType: string;
  url: string;
  thumbnailUrl?: string;
  compressedUrl?: string;
  uploadedBy: string;
  uploadedAt: string;
  localPath?: string;
  uploadStatus: 'pending' | 'uploading' | 'completed' | 'failed';
  uploadProgress?: number;
  error?: string;
  metadata?: {
    width?: number;
    height?: number;
    duration?: number;
    originalName?: string;
  };
}

export interface UploadOptions {
  inspectionId: string;
  fieldId?: string;
  type: AttachmentType;
  generateThumbnail?: boolean;
  compress?: boolean;
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  maxFileSizeMB?: number;
  allowedTypes?: string[];
}

export interface UploadQueueItem {
  id: string;
  file: File;
  options: UploadOptions;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  progress: number;
  error?: string;
  retryCount: number;
  createdAt: number;
}

export interface AttachmentConfig {
  maxFileSizeMB: number;
  maxUploadQueue: number;
  thumbnailWidth: number;
  thumbnailHeight: number;
  compressionQuality: number;
  allowedImageTypes: string[];
  allowedVideoTypes: string[];
  allowedDocumentTypes: string[];
  enableAutoCompress: boolean;
  enableThumbnail: boolean;
}

const DEFAULT_CONFIG: AttachmentConfig = {
  maxFileSizeMB: 50,
  maxUploadQueue: 10,
  thumbnailWidth: 200,
  thumbnailHeight: 200,
  compressionQuality: 0.7,
  allowedImageTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/heic'],
  allowedVideoTypes: ['video/mp4', 'video/webm', 'video/quicktime'],
  allowedDocumentTypes: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  enableAutoCompress: true,
  enableThumbnail: true
};

export class AttachmentsEngine {
  private config: AttachmentConfig;
  private uploadQueue: UploadQueueItem[] = [];
  private attachments: Map<string, Attachment> = new Map();
  private uploadProgressListeners: Set<(progress: UploadProgress) => void> = new Set();
  private isProcessing = false;

  constructor(config: Partial<AttachmentConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  setConfig(config: Partial<AttachmentConfig>): void {
    this.config = { ...this.config, ...config };
  }

  // ============================================
  // FILE VALIDATION
  // ============================================

  validateFile(file: File, options: Partial<UploadOptions> = {}): { valid: boolean; error?: string } {
    const maxSize = (options.maxFileSizeMB || this.config.maxFileSizeMB) * 1024 * 1024;
    
    if (file.size > maxSize) {
      return { 
        valid: false, 
        error: `Archivo demasiado grande. Máximo: ${options.maxFileSizeMB || this.config.maxFileSizeMB}MB` 
      };
    }

    const allowedTypes = this.getAllowedTypes(options.type || 'photo');
    if (!allowedTypes.includes(file.type)) {
      return { 
        valid: false, 
        error: `Tipo de archivo no permitido. Tipos permitidos: ${allowedTypes.join(', ')}` 
      };
    }

    return { valid: true };
  }

  private getAllowedTypes(type: AttachmentType): string[] {
    switch (type) {
      case 'photo':
        return this.config.allowedImageTypes;
      case 'video':
        return this.config.allowedVideoTypes;
      case 'document':
        return this.config.allowedDocumentTypes;
      default:
        return [...this.config.allowedImageTypes, ...this.config.allowedVideoTypes, ...this.config.allowedDocumentTypes];
    }
  }

  // ============================================
  // IMAGE PROCESSING
  // ============================================

  async compressImage(file: File, options: {
    maxWidth?: number;
    maxHeight?: number;
    quality?: number;
  } = {}): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      img.onload = () => {
        let { width, height } = img;
        const maxWidth = options.maxWidth || 1920;
        const maxHeight = options.maxHeight || 1080;

        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width *= ratio;
          height *= ratio;
        }

        canvas.width = width;
        canvas.height = height;
        ctx?.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Failed to compress image'));
            }
          },
          'image/jpeg',
          options.quality || this.config.compressionQuality
        );
      };

      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = URL.createObjectURL(file);
    });
  }

  async generateThumbnail(file: File, options: {
    width?: number;
    height?: number;
  } = {}): Promise<Blob> {
    return this.compressImage(file, {
      maxWidth: options.width || this.config.thumbnailWidth,
      maxHeight: options.height || this.config.thumbnailHeight,
      quality: 0.5
    });
  }

  getImageDimensions(file: File): Promise<{ width: number; height: number }> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        resolve({ width: img.width, height: img.height });
        URL.revokeObjectURL(img.src);
      };
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = URL.createObjectURL(file);
    });
  }

  // ============================================
  // UPLOAD QUEUE
  // ============================================

  async addToQueue(file: File, options: UploadOptions): Promise<Attachment> {
    const validation = this.validateFile(file, options);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    if (this.uploadQueue.length >= this.config.maxUploadQueue) {
      throw new Error('Cola de uploads llena. Espere a que termine.');
    }

    const queueItem: UploadQueueItem = {
      id: uuidv4(),
      file,
      options,
      status: 'queued',
      progress: 0,
      retryCount: 0,
      createdAt: Date.now()
    };

    this.uploadQueue.push(queueItem);

    const attachment: Attachment = {
      id: queueItem.id,
      inspectionId: options.inspectionId,
      fieldId: options.fieldId,
      type: options.type,
      fileName: file.name,
      fileSize: file.size,
      mimeType: file.type,
      url: '',
      uploadedBy: '',
      uploadedAt: new Date().toISOString(),
      uploadStatus: 'pending',
      metadata: {
        originalName: file.name
      }
    };

    this.attachments.set(attachment.id, attachment);
    this.notifyProgress({ type: 'queued', attachment });

    this.processQueue();
    return attachment;
  }

  private async processQueue(): Promise<void> {
    if (this.isProcessing) return;
    
    const pending = this.uploadQueue.find(item => item.status === 'queued');
    if (!pending) return;

    this.isProcessing = true;
    pending.status = 'processing';

    try {
      const attachment = await this.uploadFile(pending);
      
      pending.status = 'completed';
      this.updateAttachment(attachment.id, { 
        ...attachment, 
        uploadStatus: 'completed',
        uploadProgress: 100
      });
      
      this.notifyProgress({ type: 'completed', attachment });
      eventBus.emit('ATTACHMENT_UPLOADED', attachment);

    } catch (error) {
      pending.status = 'failed';
      pending.error = (error as Error).message;
      pending.retryCount++;

      const attachment = this.attachments.get(pending.id);
      if (attachment) {
        this.updateAttachment(attachment.id, {
          uploadStatus: 'failed',
          error: pending.error
        });
      }

      this.notifyProgress({ type: 'failed', error: pending.error, attachmentId: pending.id });

      if (pending.retryCount < 3) {
        setTimeout(() => {
          pending.status = 'queued';
          this.processQueue();
        }, 2000);
      }
    }

    this.isProcessing = false;
    this.processQueue();
  }

  private async uploadFile(queueItem: UploadQueueItem): Promise<Attachment> {
    const { file, options } = queueItem;
    const attachment = this.attachments.get(queueItem.id)!;

    this.updateAttachment(attachment.id, { uploadStatus: 'uploading', uploadProgress: 10 });

    let processedFile = file;

    if (options.type === 'photo' && this.config.enableAutoCompress) {
      processedFile = new File(
        [await this.compressImage(file, { quality: options.quality })],
        file.name.replace(/\.[^.]+$/, '.jpg'),
        { type: 'image/jpeg' }
      );
      this.updateAttachment(attachment.id, { uploadProgress: 30, fileSize: processedFile.size });
    }

    const formData = new FormData();
    formData.append('file', processedFile);
    formData.append('inspectionId', options.inspectionId);
    formData.append('type', options.type);
    if (options.fieldId) formData.append('fieldId', options.fieldId);

    const response = await fetch('/api/attachments/upload', {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.status}`);
    }

    const result = await response.json();
    this.updateAttachment(attachment.id, { uploadProgress: 90 });

    const updatedAttachment: Attachment = {
      ...attachment,
      url: result.url,
      thumbnailUrl: result.thumbnailUrl,
      compressedUrl: result.compressedUrl,
      uploadStatus: 'completed',
      uploadProgress: 100,
      metadata: {
        ...attachment.metadata,
        ...result.metadata
      }
    };

    return updatedAttachment;
  }

  // ============================================
  // ATTACHMENT MANAGEMENT
  // ============================================

  getAttachment(id: string): Attachment | undefined {
    return this.attachments.get(id);
  }

  getAttachmentsByInspection(inspectionId: string): Attachment[] {
    return Array.from(this.attachments.values()).filter(a => a.inspectionId === inspectionId);
  }

  getAttachmentsByField(inspectionId: string, fieldId: string): Attachment[] {
    return Array.from(this.attachments.values()).filter(
      a => a.inspectionId === inspectionId && a.fieldId === fieldId
    );
  }

  getAttachmentsByType(inspectionId: string, type: AttachmentType): Attachment[] {
    return Array.from(this.attachments.values()).filter(
      a => a.inspectionId === inspectionId && a.type === type
    );
  }

  updateAttachment(id: string, updates: Partial<Attachment>): void {
    const existing = this.attachments.get(id);
    if (existing) {
      this.attachments.set(id, { ...existing, ...updates });
    }
  }

  removeAttachment(id: string): void {
    const attachment = this.attachments.get(id);
    if (attachment?.url) {
      fetch('/api/attachments/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, url: attachment.url })
      });
    }
    this.attachments.delete(id);
    eventBus.emit('ATTACHMENT_REMOVED', { id });
  }

  // ============================================
  // QUEUE STATUS
  // ============================================

  getQueueStatus(): {
    total: number;
    queued: number;
    processing: number;
    completed: number;
    failed: number;
  } {
    return {
      total: this.uploadQueue.length,
      queued: this.uploadQueue.filter(i => i.status === 'queued').length,
      processing: this.uploadQueue.filter(i => i.status === 'processing').length,
      completed: this.uploadQueue.filter(i => i.status === 'completed').length,
      failed: this.uploadQueue.filter(i => i.status === 'failed').length
    };
  }

  retryFailed(id: string): void {
    const item = this.uploadQueue.find(i => i.id === id);
    if (item && item.status === 'failed') {
      item.status = 'queued';
      item.error = undefined;
      this.processQueue();
    }
  }

  cancelUpload(id: string): void {
    const index = this.uploadQueue.findIndex(i => i.id === id);
    if (index !== -1) {
      const item = this.uploadQueue[index];
      if (item.status === 'queued' || item.status === 'processing') {
        this.uploadQueue.splice(index, 1);
        this.attachments.delete(id);
      }
    }
  }

  clearCompleted(): void {
    this.uploadQueue = this.uploadQueue.filter(i => i.status !== 'completed');
  }

  // ============================================
  // PROGRESS LISTENERS
  // ============================================

  onProgress(callback: (progress: UploadProgress) => void): () => void {
    this.uploadProgressListeners.add(callback);
    return () => this.uploadProgressListeners.delete(callback);
  }

  private notifyProgress(progress: UploadProgress): void {
    this.uploadProgressListeners.forEach(cb => cb(progress));
  }

  // ============================================
  // LOCAL STORAGE (OFFLINE)
  // ============================================

  async saveToLocalStorage(attachment: Attachment): Promise<void> {
    const key = `attachment_${attachment.id}`;
    localStorage.setItem(key, JSON.stringify(attachment));
  }

  async loadFromLocalStorage(id: string): Promise<Attachment | null> {
    const key = `attachment_${id}`;
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  }

  // ============================================
  // DRAG AND DROP HELPERS
  // ============================================

  isValidDragEvent(event: DragEvent): boolean {
    return event.dataTransfer?.types.includes('Files') ?? false;
  }

  extractFilesFromDragEvent(event: DragEvent): File[] {
    if (!event.dataTransfer?.files) return [];
    return Array.from(event.dataTransfer.files);
  }

  formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  getFileIcon(mimeType: string): string {
    if (mimeType.startsWith('image/')) return '🖼️';
    if (mimeType.startsWith('video/')) return '🎬';
    if (mimeType === 'application/pdf') return '📄';
    return '📎';
  }
}

export interface UploadProgress {
  type: 'queued' | 'processing' | 'completed' | 'failed';
  attachment?: Attachment;
  attachmentId?: string;
  error?: string;
}

export const attachmentsEngine = new AttachmentsEngine();

export default AttachmentsEngine;