/**
 * =====================================================
 * SCHEMA VERSIONING - VERSIONADO DE SCHEMAS
 * =====================================================
 */

import { Sheet, Field, MasterSchema } from '@/schemas/masterSchema';

export interface SchemaVersion {
  version: string;
  createdAt: string;
  changes: SchemaChange[];
  isBreaking: boolean;
  migratedFrom: string | null;
}

export interface SchemaChange {
  type: 'added' | 'removed' | 'modified' | 'renamed';
  path: string;
  description: string;
  before?: unknown;
  after?: unknown;
}

export class SchemaVersioning {
  private versions: Map<string, SchemaVersion> = new Map();
  private currentVersion: string = '1.0.0';

  // Registrar nueva versión
  registerVersion(version: string, changes: SchemaChange[], migratedFrom?: string): void {
    const isBreaking = this.detectBreakingChanges(changes);
    
    this.versions.set(version, {
      version,
      createdAt: new Date().toISOString(),
      changes,
      isBreaking,
      migratedFrom: migratedFrom || null
    });
    
    this.currentVersion = version;
  }

  // Detectar breaking changes
  private detectBreakingChanges(changes: SchemaChange[]): boolean {
    return changes.some(c => 
      c.type === 'removed' || 
      (c.type === 'modified' && c.before !== undefined && c.after === undefined)
    );
  }

  // Migrar datos de versión anterior
  migrateData(data: unknown, fromVersion: string, toVersion: string): unknown {
    const migrationPath = this.findMigrationPath(fromVersion, toVersion);
    
    if (!migrationPath) return data;

    let migratedData = data;
    for (const version of migrationPath) {
      migratedData = this.applyMigration(migratedData, version);
    }

    return migratedData;
  }

  private findMigrationPath(from: string, to: string): string[] | null {
    // Simple path finding - en producción usar grafo dirigida
    const versions = Array.from(this.versions.keys());
    const fromIdx = versions.indexOf(from);
    const toIdx = versions.indexOf(to);

    if (fromIdx === -1 || toIdx === -1) return null;
    if (fromIdx > toIdx) return null; // Solo migraciones hacia adelante

    return versions.slice(fromIdx, toIdx + 1);
  }

  private applyMigration(data: unknown, version: string): unknown {
    const schemaVersion = this.versions.get(version);
    if (!schemaVersion) return data;

    // Aplicar cambios específicos de esta versión
    for (const change of schemaVersion.changes) {
      // Implementar lógica de migración específica
    }

    return data;
  }

  getVersionInfo(version: string): SchemaVersion | null {
    return this.versions.get(version) || null;
  }

  getAllVersions(): SchemaVersion[] {
    return Array.from(this.versions.values());
  }

  getLatestVersion(): string {
    return this.currentVersion;
  }

  getBreakingVersions(): SchemaVersion[] {
    return Array.from(this.versions.values()).filter(v => v.isBreaking);
  }
}

export const schemaVersioning = new SchemaVersioning();
export default SchemaVersioning;