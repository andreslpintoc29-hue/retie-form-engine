// ============================================
// RETIE SCHEMA - R. AISLAMIENTO
// ============================================

export const RETIE_R_AISLAMIENTO_SCHEMA = {
  "hoja": "R. AISLAMIENTO",
  "titulo": "MEDIDA RESISTENCIA DE AISLAMIENTO",
  "proceso": "GESTIÓN DE INSPECCIÓN",
  "codigo": "F-GI-18",
  "version": "3",
  "fecha_formato": "11/03/2019",
  "tipo_principal": "formulario_medicion_aislamiento",
  "descripcion_tipo_respuesta": "Formulario técnico de medición de resistencia de aislamiento con campos de contexto, tabla de circuitos (1 y 3 fases), criterios de aceptación y observaciones.",
  "campos_contexto": [
    {
      "id": "codigo_servicio",
      "label": "Código servicio",
      "tipo": "text",
      "valor_excel": "R&F-0467-10-20"
    },
    {
      "id": "fecha_inspeccion",
      "label": "Fecha de la inspección",
      "tipo": "date",
      "valor_excel": "2020-10-29 00:00:00"
    },
    {
      "id": "codigo_equipo",
      "label": "Código del equipo",
      "tipo": "text",
      "valor_excel": "R&F-MI2088-01"
    }
  ],
  "recursos_visuales_hoja": [
    {
      "id": "r_aislamiento_imagen_1",
      "tipo": "image",
      "file": "R_AISLAMIENTO_IMAGEN_1.png",
      "anchor": {
        "row": 2,
        "column": 2
      },
      "width": 350,
      "height": 100,
      "format": "png",
      "rol": "encabezado_pagina",
      "descripcion": "Encabezado de página de la hoja R. AISLAMIENTO."
    }
  ],
  "secciones": [
    {
      "titulo": "Valores medidos (MΩ)",
      "tipo": "dynamic-table",
      "descripcion": "Resistencia de aislamiento medida para cada circuito. Las mediciones deben registrarse en Megaohmios (MΩ).",
      "columnas": [
        {
          "field": "circuito",
          "label": "Medida realizada en:",
          "tipo": "text"
        },
        {
          "field": "fases",
          "label": "Fases",
          "tipo": "number"
        },
        {
          "field": "l1_t",
          "label": "L1-T (MΩ)",
          "tipo": "number"
        },
        {
          "field": "l2_t",
          "label": "L2-T (MΩ)",
          "tipo": "number"
        },
        {
          "field": "l3_t",
          "label": "L3-T (MΩ)",
          "tipo": "number"
        },
        {
          "field": "l1_l2",
          "label": "L1-L2 (MΩ)",
          "tipo": "number"
        },
        {
          "field": "l1_l3",
          "label": "L1-L3 (MΩ)",
          "tipo": "number"
        },
        {
          "field": "l2_l3",
          "label": "L2-L3 (MΩ)",
          "tipo": "number"
        },
        {
          "field": "cumple",
          "label": "Cumple",
          "tipo": "radio",
          "opciones": [
            "SI",
            "NO"
          ]
        }
      ],
      "filas": [
        {
          "circuito": "CIRCUITO ALIMENTADOR APARTAMENTO 401 C",
          "fases": "1",
          "l1_t": "396",
          "l2_t": "",
          "l3_t": "",
          "l1_l2": "",
          "l1_l3": "",
          "l2_l3": "",
          "cumple": "SI"
        },
        {
          "circuito": "CIRCUITO ALIMENTADOR APARTAMENTO 402 C",
          "fases": "1",
          "l1_t": "651",
          "l2_t": "",
          "l3_t": "",
          "l1_l2": "",
          "l1_l3": "",
          "l2_l3": "",
          "cumple": "SI"
        },
        {
          "circuito": "CIRCUITO ALIMENTADOR APARTAMENTO 403 C",
          "fases": "1",
          "l1_t": "414",
          "l2_t": "",
          "l3_t": "",
          "l1_l2": "",
          "l1_l3": "",
          "l2_l3": "",
          "cumple": "SI"
        },
        {
          "circuito": "CIRCUITO ALIMENTADOR APARTAMENTO 404 C",
          "fases": "1",
          "l1_t": "686",
          "l2_t": "",
          "l3_t": "",
          "l1_l2": "",
          "l1_l3": "",
          "l2_l3": "",
          "cumple": "SI"
        },
        {
          "circuito": "CIRCUITO ALIMENTADOR APARTAMENTO 501 C",
          "fases": "1",
          "l1_t": "509",
          "l2_t": "",
          "l3_t": "",
          "l1_l2": "",
          "l1_l3": "",
          "l2_l3": "",
          "cumple": "SI"
        },
        {
          "circuito": "CIRCUITO ALIMENTADOR APARTAMENTO 502 C",
          "fases": "1",
          "l1_t": "426",
          "l2_t": "",
          "l3_t": "",
          "l1_l2": "",
          "l1_l3": "",
          "l2_l3": "",
          "cumple": "SI"
        },
        {
          "circuito": "CIRCUITO ALIMENTADOR APARTAMENTO 503 C",
          "fases": "1",
          "l1_t": "557",
          "l2_t": "",
          "l3_t": "",
          "l1_l2": "",
          "l1_l3": "",
          "l2_l3": "",
          "cumple": "SI"
        },
        {
          "circuito": "CIRCUITO ALIMENTADOR APARTAMENTO 504 C",
          "fases": "1",
          "l1_t": "451",
          "l2_t": "",
          "l3_t": "",
          "l1_l2": "",
          "l1_l3": "",
          "l2_l3": "",
          "cumple": "SI"
        },
        {
          "circuito": "CIRCUITO ALIMENTADOR APARTAMENTO 601 C",
          "fases": "1",
          "l1_t": "642",
          "l2_t": "",
          "l3_t": "",
          "l1_l2": "",
          "l1_l3": "",
          "l2_l3": "",
          "cumple": "SI"
        },
        {
          "circuito": "CIRCUITO ALIMENTADOR APARTAMENTO 602 C",
          "fases": "1",
          "l1_t": "389",
          "l2_t": "",
          "l3_t": "",
          "l1_l2": "",
          "l1_l3": "",
          "l2_l3": "",
          "cumple": "SI"
        },
        {
          "circuito": "CIRCUITO ALIMENTADOR ZONAS COMUNES",
          "fases": "3",
          "l1_t": "840",
          "l2_t": "743",
          "l3_t": "764",
          "l1_l2": "1010",
          "l1_l3": "1110",
          "l2_l3": "1060",
          "cumple": "SI"
        },
        {
          "circuito": "",
          "fases": "",
          "l1_t": "",
          "l2_t": "",
          "l3_t": "",
          "l1_l2": "",
          "l1_l3": "",
          "l2_l3": "",
          "cumple": ""
        }
      ]
    },
    {
      "titulo": "Criterio de Aceptación",
      "tipo": "informativo_con_imagen",
      "campos": [
        {
          "id": "criterio_norma",
          "label": "Norma técnica",
          "tipo": "textarea",
          "valor_excel": "El valor mínimo exigido en la prueba de resistencia de aislamiento se define teniendo en cuenta lo establecido en la norma IEC 60364-6 numeral 61.3.3, Tabla 6A. El valor de resistencia de aislamiento debe ser: mayor a 1 MΩ por cada 250V de tensión de trabajo."
        }
      ],
      "recursos_visuales": [
        {
          "id": "r_aislamiento_imagen_criterio",
          "tipo": "image",
          "file": "R_AISLAMIENTO_IMAGEN_CRITERIO.png",
          "anchor": {
            "row": 27,
            "column": 2
          },
          "width": 500,
          "height": 180,
          "format": "png",
          "rol": "recurso_visual_criterio",
          "descripcion": "Tabla de Criterios de Aceptación según IEC 60364-6 y RETIE."
        }
      ]
    },
    {
      "titulo": "Observaciones",
      "tipo": "textarea",
      "campo": {
        "id": "observaciones",
        "label": "Observaciones",
        "tipo": "textarea"
      }
    }
  ]
};
