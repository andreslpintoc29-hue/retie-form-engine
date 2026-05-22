// ============================================
// RETIE SCHEMA: INSTALACIÓN ELÉCTRICA
// Schema RETIE real y completo para inspección de instalaciones eléctricas
// ============================================

import { RETIEMasterSchema, RETIEFieldSchema, RETIESheetSchema, RETIESectionSchema } from '../masterSchema';

export const RETIE_ELECTRICA_SCHEMA: RETIEMasterSchema = {
  version: '1.0.0',
  lastUpdated: '2024-01-15',
  sheets: [
    {
      codigo: 'GENERAL',
      nombre: 'Información General',
      titulo: '1. DATOS GENERALES DE LA INSTALACIÓN',
      type: 'inspection',
      sections: [
        {
          id: 'gen_1',
          titulo: '1.1 Identificación del Proyecto',
          fields: [
            { id: 'project_name', label: 'Nombre del Proyecto', type: 'text', required: true },
            { id: 'project_address', label: 'Dirección del Proyecto', type: 'text', required: true },
            { id: 'city', label: 'Ciudad/Municipio', type: 'text', required: true },
            { id: 'department', label: 'Departamento', type: 'text', required: true },
            { id: 'latitude', label: 'Latitud', type: 'decimal' },
            { id: 'longitude', label: 'Longitud', type: 'decimal' }
          ]
        },
        {
          id: 'gen_2',
          titulo: '1.2 Datos del Solicitante',
          fields: [
            { id: 'applicant_name', label: 'Nombre/Razón Social', type: 'text', required: true },
            { id: 'applicant_id', label: 'NIT/CC', type: 'text', required: true },
            { id: 'applicant_address', label: 'Dirección', type: 'text' },
            { id: 'applicant_phone', label: 'Teléfono', type: 'text' },
            { id: 'applicant_email', label: 'Correo Electrónico', type: 'text' }
          ]
        },
        {
          id: 'gen_3',
          titulo: '1.3 Categoría de la Instalación',
          fields: [
            { id: 'category', label: 'Categoría', type: 'select', required: true, options: [
              { label: 'Residencial', value: 'residential' },
              { label: 'Comercial', value: 'commercial' },
              { label: 'Industrial', value: 'industrial' },
              { label: 'Institucional', value: 'institutional' },
              { label: 'Rural', value: 'rural' },
              { label: 'Especial', value: 'special' }
            ]},
            { id: 'risk_level', label: 'Nivel de Riesgo', type: 'select', required: true, options: [
              { label: 'Bajo', value: 'low' },
              { label: 'Medio', value: 'medium' },
              { label: 'Alto', value: 'high' }
            ]},
            { id: 'power_demand_kw', label: 'Demanda de Potencia (kW)', type: 'decimal', required: true },
            { id: 'voltage_level', label: 'Nivel de Tensión', type: 'select', required: true, options: [
              { label: '120V', value: '120' },
              { label: '208V', value: '208' },
              { label: '240V', value: '240' },
              { label: '480V', value: '480' }
            ]}
          ]
        }
      ]
    },
    {
      codigo: 'ACOMETIDA',
      nombre: 'Acometida y-Medición',
      titulo: '2. ACOMETIDA Y MEDICIÓN',
      type: 'inspection',
      sections: [
        {
          id: 'acometida_1',
          titulo: '2.1 Tipo de Acometida',
          fields: [
            { id: 'acometida_type', label: 'Tipo de Acometida', type: 'select', required: true, options: [
              { label: 'Aérea', value: 'aerea' },
              { label: 'Subterránea', value: 'subterranea' },
              { label: 'Mixta', value: 'mixta' }
            ]},
            { id: 'acometida_conductor_type', label: 'Tipo de Conductor', type: 'select', options: [
              { label: 'Cobre', value: 'copper' },
              { label: 'Aluminio', value: 'aluminum' }
            ]},
            { id: 'acometida_caliber', label: 'Calibre (AWG/kcmil)', type: 'text' },
            { id: 'acometida_fases', label: 'Número de Fases', type: 'select', options: [
              { label: 'Monofásico (1φ)', value: '1' },
              { label: 'Trifásico (3φ)', value: '3' }
            ]},
            { id: 'acometida_conductors_count', label: 'Número de Conductores', type: 'number' }
          ]
        },
        {
          id: 'acometida_2',
          titulo: '2.2 Medidor y Equipo de Medición',
          fields: [
            { id: 'has_meter', label: '¿Tiene medidor?', type: 'radio', required: true, options: [
              { label: 'SI', value: 'SI' },
              { label: 'NO', value: 'NO' }
            ]},
            { id: 'meter_type', label: 'Tipo de Medidor', type: 'select', options: [
              { label: 'Electromecánico', value: 'electromechanical' },
              { label: 'Electrónico', value: 'electronic' },
              { label: 'Inteligente/Smart', value: 'smart' }
            ]},
            { id: 'meter_brand', label: 'Marca del Medidor', type: 'text' },
            { id: 'meter_serial', label: 'Número de Serie', type: 'text' },
            { id: 'meter_reading', label: 'Lectura Inicial', type: 'decimal' },
            { id: 'has_ct', label: '¿Tiene Transformador de Corriente?', type: 'radio', options: [
              { label: 'SI', value: 'SI' },
              { label: 'NO', value: 'NO' }
            ]},
            { id: 'ct_ratio', label: 'Relación TC (XXX/5A)', type: 'text' }
          ]
        },
        {
          id: 'acometida_3',
          titulo: '2.3 Protección de Acometida',
          fields: [
            { id: 'has_acometida_protection', label: '¿Tiene protección en acometida?', type: 'radio', required: true, options: [
              { label: 'SI', value: 'SI' },
              { label: 'NO', value: 'NO' }
            ]},
            { id: 'acometida_protection_type', label: 'Tipo de Protección', type: 'select', options: [
              { label: 'Interruptor Automático', value: 'breaker' },
              { label: 'Fusible', value: 'fuse' },
              { label: 'Interruptor Diferencial', value: 'dif' }
            ]},
            { id: 'acometida_protection_rating', label: 'Capacidad (A)', type: 'number' },
            { id: 'acometida_protection_brand', label: 'Marca', type: 'text' },
            { id: 'acometida_protection_cert', label: '¿Certificado RETIE?', type: 'radio', options: [
              { label: 'SI', value: 'SI' },
              { label: 'NO', value: 'NO' },
              { label: 'N/A', value: 'N/A' }
            ]}
          ]
        }
      ]
    },
    {
      codigo: 'TABLERO',
      nombre: 'Tablero General',
      titulo: '3. TABLERO GENERAL',
      type: 'inspection',
      sections: [
        {
          id: 'tablero_1',
          titulo: '3.1 Características del Tablero',
          fields: [
            { id: 'panel_location', label: 'Ubicación del Tablero', type: 'select', required: true, options: [
              { label: 'Interior', value: 'interior' },
              { label: 'Exterior', value: 'exterior' },
              { label: 'Enchufe', value: 'socket' }
            ]},
            { id: 'panel_type', label: 'Tipo de Tablero', type: 'select', options: [
              { label: 'Empotrado', value: 'empotrado' },
              { label: 'Superficial', value: 'superficial' },
              { label: 'Rack/Cabinet', value: 'cabinet' }
            ]},
            { id: 'panel_material', label: 'Material', type: 'select', options: [
              { label: 'Metálico', value: 'metal' },
              { label: 'Plástico', value: 'plastic' }
            ]},
            { id: 'panel_enclosure_type', label: 'Tipo de Gabinete', type: 'select', options: [
              { label: 'IP20', value: 'IP20' },
              { label: 'IP65', value: 'IP65' },
              { label: 'NEMA 1', value: 'NEMA1' },
              { label: 'NEMA 4X', value: 'NEMA4X' }
            ]},
            { id: 'panel_rating_v', label: 'Tensión Nominal (V)', type: 'number' },
            { id: 'panel_rating_a', label: 'Corriente Nominal (A)', type: 'number' }
          ]
        },
        {
          id: 'tablero_2',
          titulo: '3.2 Interruptor Principal',
          fields: [
            { id: 'has_main_breaker', label: '¿Tiene interruptor principal?', type: 'radio', required: true, options: [
              { label: 'SI', value: 'SI' },
              { label: 'NO', value: 'NO' }
            ]},
            { id: 'main_breaker_type', label: 'Tipo', type: 'select', options: [
              { label: 'Termomagnético', value: 'thermal_magnetic' },
              { label: 'Electrónico/Digital', value: 'electronic' },
              { label: 'Diferencial', value: 'dif' }
            ]},
            { id: 'main_breaker_rating', label: 'Capacidad (A)', type: 'number', required: true },
            { id: 'main_breaker_poles', label: 'Polos', type: 'select', options: [
              { label: '1 polo', value: '1' },
              { label: '2 polos', value: '2' },
              { label: '3 polos', value: '3' }
            ]},
            { id: 'main_breaker_brand', label: 'Marca', type: 'text' },
            { id: 'main_breaker_cert', label: '¿Certificado RETIE?', type: 'radio', options: [
              { label: 'SI', value: 'SI' },
              { label: 'NO', value: 'NO' }
            ]},
            { id: 'main_breaker_icc', label: 'Icc (kA)', type: 'decimal' }
          ]
        },
        {
          id: 'tablero_3',
          titulo: '3.3 Protección Diferencial (si aplica)',
          fields: [
            { id: 'has_grounding', label: '¿Sistema de Puesta a Tierra?', type: 'radio', required: true, options: [
              { label: 'SI', value: 'SI' },
              { label: 'NO', value: 'NO' }
            ]},
            { id: 'grounding_type', label: 'Tipo de Malla', type: 'select', options: [
              { label: 'Placa', value: 'plate' },
              { label: 'Varilla', value: 'rod' },
              { label: 'Malla', value: 'mesh' }
            ]},
            { id: 'grounding_resistance', label: 'Resistencia de Puesta a Tierra (Ω)', type: 'decimal', required: true },
            { id: 'grounding_conductor_caliber', label: 'Conductor de Tierra (AWG)', type: 'text' },
            { id: 'grounding_continuity', label: '¿Continuidad verificada?', type: 'radio', options: [
              { label: 'SI', value: 'SI' },
              { label: 'NO', value: 'NO' }
            ]}
          ]
        },
        {
          id: 'tablero_4',
          titulo: '3.4 Circuitos Derivados',
          fields: [
            { id: 'circuit_count', label: 'Número de Circuitos', type: 'number', required: true },
            { id: 'circuits_detail', label: 'Detalle de Circuitos', type: 'dynamic-table', columns: [
              { field: 'circuit', label: 'Circuito', type: 'text' },
              { field: 'amp_rating', label: 'Capacidad (A)', type: 'number' },
              { field: 'wire_caliber', label: 'Calibre (AWG)', type: 'text' },
              { field: 'phase', label: 'Fase', type: 'select', options: [
                { label: 'L1', value: 'L1' },
                { label: 'L2', value: 'L2' },
                { label: 'L3', value: 'L3' },
                { label: 'N', value: 'N' }
              ]},
              { field: 'load_description', label: 'Carga', type: 'text' }
            ]}
          ]
        }
      ]
    },
    {
      codigo: 'MEDICIONES',
      nombre: 'Mediciones Eléctricas',
      titulo: '4. MEDICIONES ELÉCTRICAS',
      type: 'inspection',
      sections: [
        {
          id: 'med_1',
          titulo: '4.1 Tensiones en Tablero',
          fields: [
            { id: 'voltage_l1_n', label: 'Tensión L1-N (V)', type: 'decimal' },
            { id: 'voltage_l2_n', label: 'Tensión L2-N (V)', type: 'decimal' },
            { id: 'voltage_l3_n', label: 'Tensión L3-N (V)', type: 'decimal' },
            { id: 'voltage_l1_l2', label: 'Tensión L1-L2 (V)', type: 'decimal' },
            { id: 'voltage_l2_l3', label: 'Tensión L2-L3 (V)', type: 'decimal' },
            { id: 'voltage_l3_l1', label: 'Tensión L3-L1 (V)', type: 'decimal' },
            { id: 'voltage_avg', label: 'Tensión Promedio (V)', type: 'decimal', computed: true },
            { id: 'voltage_unbalance', label: 'Desequilibrio (%)', type: 'decimal', computed: true },
            { id: 'voltage_ok', label: '¿Tensiones dentro de rango?', type: 'radio', options: [
              { label: 'SI', value: 'SI' },
              { label: 'NO', value: 'NO' }
            ]}
          ]
        },
        {
          id: 'med_2',
          titulo: '4.2 Corrientes en Interruptor Principal',
          fields: [
            { id: 'current_l1', label: 'Corriente L1 (A)', type: 'decimal' },
            { id: 'current_l2', label: 'Corriente L2 (A)', type: 'decimal' },
            { id: 'current_l3', label: 'Corriente L3 (A)', type: 'decimal' },
            { id: 'current_neutral', label: 'Corriente Neutro (A)', type: 'decimal' },
            { id: 'current_avg', label: 'Corriente Promedio (A)', type: 'decimal', computed: true },
            { id: 'current_max', label: 'Corriente Máxima (A)', type: 'decimal', computed: true },
            { id: 'current_overload', label: '¿Sobre carga?', type: 'radio', options: [
              { label: 'SI', value: 'SI' },
              { label: 'NO', value: 'NO' }
            ]}
          ]
        },
        {
          id: 'med_3',
          titulo: '4.3 Resistencia de Aislamiento',
          fields: [
            { id: 'insulation_l1_ground', label: 'L1-Tierra (MΩ)', type: 'decimal' },
            { id: 'insulation_l2_ground', label: 'L2-Tierra (MΩ)', type: 'decimal' },
            { id: 'insulation_l3_ground', label: 'L3-Tierra (MΩ)', type: 'decimal' },
            { id: 'insulation_neutral_ground', label: 'N-Tierra (MΩ)', type: 'decimal' },
            { id: 'insulation_l1_l2', label: 'L1-L2 (MΩ)', type: 'decimal' },
            { id: 'insulation_l2_l3', label: 'L2-L3 (MΩ)', type: 'decimal' },
            { id: 'insulation_l3_l1', label: 'L3-L1 (MΩ)', type: 'decimal' },
            { id: 'insulation_ok', label: '¿Valores OK? (≥1MΩ)', type: 'radio', options: [
              { label: 'SI', value: 'SI' },
              { label: 'NO', value: 'NO' }
            ]}
          ]
        },
        {
          id: 'med_4',
          titulo: '4.4 Prueba de Continuidad de Tierra',
          fields: [
            { id: 'ground_continuity_panel', label: 'Continuidad Panel-Tierra (Ω)', type: 'decimal' },
            { id: 'ground_continuity_outlets', label: 'Continuidad Tomacorrientes (Ω)', type: 'decimal' },
            { id: 'ground_continuity_equipment', label: 'Continuidad Equipos (Ω)', type: 'decimal' },
            { id: 'ground_ok', label: '¿Continuidad OK?', type: 'radio', options: [
              { label: 'SI', value: 'SI' },
              { label: 'NO', value: 'NO' }
            ]}
          ]
        }
      ]
    },
    {
      codigo: 'RESULTADOS',
      nombre: 'Resultados y Observaciones',
      titulo: '5. RESULTADOS DE LA INSPECCIÓN',
      type: 'inspection',
      sections: [
        {
          id: 'res_1',
          titulo: '5.1 Cumplimiento General',
          fields: [
            { id: 'total_fields', label: 'Total de Campos', type: 'number', computed: true },
            { id: 'answered_fields', label: 'Campos Respondidos', type: 'number', computed: true },
            { id: 'compliant_fields', label: 'Campos Conformes', type: 'number', computed: true },
            { id: 'non_compliant_fields', label: 'No Conformes', type: 'number', computed: true },
            { id: 'compliance_percentage', label: 'Porcentaje de Cumplimiento (%)', type: 'decimal', computed: true },
            { id: 'compliance_grade', label: 'Grado', type: 'text', computed: true }
          ]
        },
        {
          id: 'res_2',
          titulo: '5.2 Observaciones',
          fields: [
            { id: 'observations', label: 'Observaciones Generales', type: 'textarea' },
            { id: 'recommendations', label: 'Recomendaciones', type: 'textarea' },
            { id: 'technician_notes', label: 'Notas del Técnico', type: 'textarea' }
          ]
        },
        {
          id: 'res_3',
          titulo: '5.3 Información del Inspector',
          fields: [
            { id: 'inspector_name', label: 'Nombre del Inspector', type: 'text', required: true },
            { id: 'inspector_license', label: 'Número de Licencia', type: 'text', required: true },
            { id: 'inspection_date', label: 'Fecha de Inspección', type: 'date', required: true },
            { id: 'inspection_time', label: 'Hora de Inspección', type: 'text' },
            { id: 'weather_condition', label: 'Condición Climática', type: 'select', options: [
              { label: 'Soleado', value: 'sunny' },
              { label: 'Nublado', value: 'cloudy' },
              { label: 'Lluvioso', value: 'rainy' }
            ]}
          ]
        }
      ]
    }
  ]
};

export default RETIE_ELECTRICA_SCHEMA;