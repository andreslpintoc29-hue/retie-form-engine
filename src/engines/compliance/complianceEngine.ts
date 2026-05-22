// ============================================
// COMPLIANCE ENGINE - Percentage & Scoring
// ============================================

import type { FieldState, SheetState } from '../state/formStateEngine';

export interface ComplianceConfig {
  sheetCode: string;
  weight?: number;
  requiredFields?: string[];
  criticalFields?: string[];
  warningThreshold?: number;
  dangerThreshold?: number;
}

export interface ComplianceResult {
  totalFields: number;
  answeredFields: number;
  compliantFields: number;
  nonCompliantFields: number;
  criticalNonCompliant: number;
  percentage: number;
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  noConformities: NoConformity[];
  score: number;
}

export interface NoConformity {
  fieldId: string;
  fieldLabel: string;
  severity: 'critical' | 'major' | 'minor';
  currentValue: unknown;
  expectedValue?: string;
  description: string;
  recommendation: string;
}

export interface SheetCompliance {
  sheetCode: string;
  percentage: number;
  score: number;
  grade: string;
  noConformitiesCount: number;
  criticalCount: number;
  lastCalculated: string;
}

const GRADE_THRESHOLDS = {
  A: 90,
  B: 75,
  C: 60,
  D: 40,
  F: 0
};

function calculateGrade(percentage: number): 'A' | 'B' | 'C' | 'D' | 'F' {
  if (percentage >= GRADE_THRESHOLDS.A) return 'A';
  if (percentage >= GRADE_THRESHOLDS.B) return 'B';
  if (percentage >= GRADE_THRESHOLDS.C) return 'C';
  if (percentage >= GRADE_THRESHOLDS.D) return 'D';
  return 'F';
}

export class ComplianceEngine {
  private configs: Map<string, ComplianceConfig> = new Map();

  registerConfig(config: ComplianceConfig): void {
    this.configs.set(config.sheetCode, config);
  }

  calculateSheetCompliance(
    sheetState: SheetState,
    fieldStates: Map<string, FieldState>
  ): ComplianceResult {
    const stateAny = sheetState as any;
    const config = this.configs.get(stateAny.sheetCode);
    const fields = stateAny.fields || [];
    
    let totalFields = 0;
    let answeredFields = 0;
    let compliantFields = 0;
    let nonCompliantFields = 0;
    let criticalNonCompliant = 0;
    const noConformities: NoConformity[] = [];

    for (const fieldId of fields) {
      const fieldState = fieldStates.get(fieldId);
      if (!fieldState) continue;

      totalFields++;
      
      const isAnswered = this.isFieldAnswered(fieldState);
      if (isAnswered) {
        answeredFields++;
        
        const isCompliant = this.isFieldCompliant(fieldState, config);
        if (isCompliant) {
          compliantFields++;
        } else {
          nonCompliantFields++;
          
          const fieldStateAny = fieldState as any;
          const isCritical = config?.criticalFields?.includes(fieldId) || fieldStateAny.isCritical;
          if (isCritical) criticalNonCompliant++;

          noConformities.push({
            fieldId,
            fieldLabel: fieldStateAny.label || fieldId,
            severity: isCritical ? 'critical' : fieldStateAny.severity || 'minor',
            currentValue: fieldState.value,
            expectedValue: fieldStateAny.expectedValue,
            description: fieldStateAny.nonComplianceDescription || `Campo no cumple con los requisitos RETIE`,
            recommendation: fieldStateAny.recommendation || 'Revisar y corregir según normativa RETIE'
          });
        }
      }
    }

    const percentage = totalFields > 0 ? (compliantFields / totalFields) * 100 : 0;
    const grade = calculateGrade(percentage);
    const score = this.calculateScore(percentage, nonCompliantFields, criticalNonCompliant);

    return {
      totalFields,
      answeredFields,
      compliantFields,
      nonCompliantFields,
      criticalNonCompliant,
      percentage: Math.round(percentage * 100) / 100,
      grade,
      noConformities: noConformities.sort((a, b) => {
        const severityOrder = { critical: 0, major: 1, minor: 2 };
        return severityOrder[a.severity] - severityOrder[b.severity];
      }),
      score
    };
  }

  private isFieldAnswered(fieldState: FieldState): boolean {
    const value = fieldState.value;
    if (value === null || value === undefined) return false;
    if (typeof value === 'string') return value.trim().length > 0;
    if (Array.isArray(value)) return value.length > 0;
    return true;
  }

  private isFieldCompliant(fieldState: FieldState, config?: ComplianceConfig): boolean {
    const fieldStateAny = fieldState as any;
    if (fieldState.isValid === false) return false;
    if (fieldState.errors && fieldState.errors.length > 0) return false;
    if (fieldStateAny.compliant === true) return true;
    if (fieldStateAny.compliant === false) return false;
    return true;
  }

  private calculateScore(percentage: number, nonCompliant: number, critical: number): number {
    let score = percentage;
    score -= critical * 5;
    score -= nonCompliant * 2;
    return Math.max(0, Math.round(score * 100) / 100);
  }

  calculateOverallCompliance(sheetCompliances: Map<string, ComplianceResult>): {
    overallPercentage: number;
    overallScore: number;
    grade: 'A' | 'B' | 'C' | 'D' | 'F';
    totalNoConformities: number;
  } {
    let totalWeight = 0;
    let weightedSum = 0;
    let totalScore = 0;
    let totalNoConformities = 0;

    for (const result of Array.from(sheetCompliances.values())) {
      totalWeight++;
      weightedSum += result.percentage;
      totalScore += result.score;
      totalNoConformities += result.noConformities.length;
    }

    const overallPercentage = totalWeight > 0 ? weightedSum / totalWeight : 0;
    const overallScore = totalWeight > 0 ? totalScore / totalWeight : 0;

    return {
      overallPercentage: Math.round(overallPercentage * 100) / 100,
      overallScore: Math.round(overallScore * 100) / 100,
      grade: calculateGrade(overallPercentage),
      totalNoConformities
    };
  }

  generateNoConformitiesReport(complianceResult: ComplianceResult): string {
    const lines: string[] = [];
    lines.push(`## Reporte de No Conformidades`);
    lines.push(`\n**Porcentaje de Cumplimiento:** ${complianceResult.percentage}%`);
    lines.push(`**Grado:** ${complianceResult.grade}`);
    lines.push(`**Puntaje:** ${complianceResult.score}/100`);
    lines.push(`\n**Total de No Conformidades:** ${complianceResult.noConformities.length}`);
    lines.push(`**Críticas:** ${complianceResult.criticalNonCompliant}`);
    lines.push(`\n---\n`);

    for (const nc of complianceResult.noConformities) {
      lines.push(`### ${nc.severity.toUpperCase()}: ${nc.fieldLabel}`);
      lines.push(`- **ID:** ${nc.fieldId}`);
      lines.push(`- **Valor Actual:** ${JSON.stringify(nc.currentValue)}`);
      if (nc.expectedValue) lines.push(`- **Valor Esperado:** ${nc.expectedValue}`);
      lines.push(`- **Descripción:** ${nc.description}`);
      lines.push(`- **Recomendación:** ${nc.recommendation}`);
      lines.push('');
    }

    return lines.join('\n');
  }
}

export const complianceEngine = new ComplianceEngine();