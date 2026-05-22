export const RETIE_R_SPT_SCHEMA = {
  "hoja": "R. SPT",
  "titulo": "MEDIDA RESISTENCIA DE PUESTA A TIERRA",
  "proceso": "GESTION DE INSPECCION",
  "codigo": "F-GI-17",
  "version": "1",
  "fecha_formato": "30/01/2018",
  "tipo_principal": "formulario_medicion_spt",
  "descripcion_tipo_respuesta": "Formulario técnico con campos de texto/fecha, tablas de medición, campos numéricos, radios SI/NO, checklist SI/NO/N/A, imagen de método y observaciones.",
  "campos_contexto": [
    {
      "id": "codigo_servicio",
      "label": "Código servicio",
      "tipo": "text",
      "valor_excel": "R&F-0467-10-20"
    },
    {
      "id": "fecha_inspeccion",
      "label": "Fecha de la inspeccion",
      "tipo": "date",
      "valor_excel": "2020-10-29 00:00:00"
    },
    {
      "id": "codigo_equipo",
      "label": "Código del equipo",
      "tipo": "text",
      "valor_excel": "R&F-MI2088-01"
    },
    {
      "id": "metodo_utilizado",
      "label": "Metodo utilizado",
      "tipo": "text",
      "valor_excel": "CAIDA DE TENSION"
    }
  ],
  "recursos_visuales_hoja": [
    {
      "id": "r_spt_imagen_1",
      "tipo": "image",
      "file": "R_SPT_IMAGEN_1.png",
      "anchor": {
        "row": 71,
        "column": 3
      },
      "width": 373,
      "height": 170,
      "format": "png",
      "rol": "encabezado_pagina",
      "descripcion": "Imagen de encabezado de página de la hoja R. SPT."
    },
    {
      "id": "r_spt_imagen_2",
      "tipo": "image",
      "file": "R_SPT_IMAGEN_2.png",
      "anchor": {
        "row": 2,
        "column": 3
      },
      "width": 373,
      "height": 170,
      "format": "png",
      "rol": "encabezado_pagina",
      "descripcion": "Imagen de encabezado de página de la hoja R. SPT."
    }
  ],
  "imagenes_embebidas": [
    {
      "id": "r_spt_imagen_1",
      "tipo": "image",
      "file": "R_SPT_IMAGEN_1.png",
      "anchor": {
        "row": 71,
        "column": 3
      },
      "width": 373,
      "height": 170,
      "format": "png",
      "rol": "encabezado_pagina",
      "descripcion": "Imagen de encabezado de página de la hoja R. SPT."
    },
    {
      "id": "r_spt_imagen_2",
      "tipo": "image",
      "file": "R_SPT_IMAGEN_2.png",
      "anchor": {
        "row": 2,
        "column": 3
      },
      "width": 373,
      "height": 170,
      "format": "png",
      "rol": "encabezado_pagina",
      "descripcion": "Imagen de encabezado de página de la hoja R. SPT."
    },
    {
      "id": "r_spt_imagen_3",
      "tipo": "image",
      "file": "R_SPT_IMAGEN_3.png",
      "anchor": {
        "row": 9,
        "column": 3
      },
      "width": 628,
      "height": 284,
      "format": "png",
      "rol": "recurso_visual_metodo_medicion",
      "descripcion": "Imagen/diagrama de apoyo ubicada en la zona de definición del método de medición de resistencia de puesta a tierra."
    }
  ],
  "secciones": [
    {
      "titulo": "Definiciones del método utilizado",
      "tipo": "informativo_con_imagen",
      "campos": [
        {
          "id": "definicion_d",
          "label": "d",
          "tipo": "textarea",
          "valor_excel": "d : Es la distancia de ubicación del electrodo (estaca) auxiliar de corriente, la cual debe ser 6,5 veces la mayor dimensión de la puesta a tierra a medir."
        },
        {
          "id": "definicion_x",
          "label": "x",
          "tipo": "textarea",
          "valor_excel": "x: Es la distancia del electrodo (estaca) auxiliar de tensión."
        }
      ],
      "recursos_visuales": [
        {
          "id": "r_spt_imagen_3",
          "tipo": "image",
          "file": "R_SPT_IMAGEN_3.png",
          "anchor": {
            "row": 9,
            "column": 3
          },
          "width": 628,
          "height": 284,
          "format": "png",
          "rol": "recurso_visual_metodo_medicion",
          "descripcion": "Imagen/diagrama de apoyo ubicada en la zona de definición del método de medición de resistencia de puesta a tierra."
        }
      ]
    },
    {
      "titulo": "Valores medidos - TERRENO REGULAR",
      "tipo": "dynamic-table",
      "descripcion": "Tabla optimizada para interfaz: una fila por SPT y columnas explícitas para las mediciones 61,8%, 52% y 72% de d.",
      "columnas": [
        {
          "field": "spt_de",
          "label": "SPT de",
          "tipo": "text"
        },
        {
          "field": "distancia_d_m",
          "label": "Distancia \"d\" (m)",
          "tipo": "number"
        },
        {
          "field": "distancia_x_61_8",
          "label": "Distancia x 61,8% (m)",
          "tipo": "number"
        },
        {
          "field": "valor_medido_61_8",
          "label": "Valor medido 61,8% (Ω)",
          "tipo": "number"
        },
        {
          "field": "distancia_x_52",
          "label": "Distancia x 52% (m)",
          "tipo": "number"
        },
        {
          "field": "valor_medido_52",
          "label": "Valor medido 52% (Ω)",
          "tipo": "number"
        },
        {
          "field": "distancia_x_72",
          "label": "Distancia x 72% (m)",
          "tipo": "number"
        },
        {
          "field": "valor_medido_72",
          "label": "Valor medido 72% (Ω)",
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
          "spt_de": "PUNTO NEUTRO DE ACOMETIDA EN BT",
          "distancia_d_m": "15.6",
          "distancia_x_61_8": "9.6408",
          "valor_medido_61_8": "12.6",
          "distancia_x_52": "8.112",
          "valor_medido_52": "12.54",
          "distancia_x_72": "11.232",
          "valor_medido_72": "12.62",
          "cumple": "SI"
        },
        {
          "spt_de": "",
          "distancia_d_m": "",
          "distancia_x_61_8": "",
          "valor_medido_61_8": "",
          "distancia_x_52": "",
          "valor_medido_52": "",
          "distancia_x_72": "",
          "valor_medido_72": "",
          "cumple": ""
        }
      ]
    },
    {
      "titulo": "TERRENO IRREGULAR",
      "tipo": "dynamic-table-grouped",
      "descripcion": "Si la medida varia más del 30%, es necesario aumentar las distancias y volver a realizar las medidas, tomando el registro en la siguiente tabla para luego graficar los resultados R vs D",
      "grupos": [
        {
          "id": 1,
          "columnas": [
            { "field": "porcentaje_d", "label": "Porcentaje de 'd'", "tipo": "label" },
            { "field": "distancia_d_m", "label": "Distancia 'd' (m)", "tipo": "number" },
            { "field": "resistencia_ohm", "label": "Resistencia (Ω)", "tipo": "number" }
          ],
          "filas": [
            { "porcentaje_d": "10 % de \"d\"", "distancia_d_m": "", "resistencia_ohm": "" },
            { "porcentaje_d": "20 % de \"d\"", "distancia_d_m": "", "resistencia_ohm": "" },
            { "porcentaje_d": "30 % de \"d\"", "distancia_d_m": "", "resistencia_ohm": "" },
            { "porcentaje_d": "40 % de \"d\"", "distancia_d_m": "", "resistencia_ohm": "" },
            { "porcentaje_d": "80 % de \"d\"", "distancia_d_m": "", "resistencia_ohm": "" },
            { "porcentaje_d": "90 % de \"d\"", "distancia_d_m": "", "resistencia_ohm": "" }
          ]
        },
        {
          "id": 2,
          "columnas": [
            { "field": "porcentaje_d", "label": "Porcentaje de 'd'", "tipo": "label" },
            { "field": "distancia_d_m", "label": "Distancia 'd' (m)", "tipo": "number" },
            { "field": "resistencia_ohm", "label": "Resistencia (Ω)", "tipo": "number" }
          ],
          "filas": [
            { "porcentaje_d": "10 % de \"d\"", "distancia_d_m": "", "resistencia_ohm": "" },
            { "porcentaje_d": "20 % de \"d\"", "distancia_d_m": "", "resistencia_ohm": "" },
            { "porcentaje_d": "30 % de \"d\"", "distancia_d_m": "", "resistencia_ohm": "" },
            { "porcentaje_d": "40 % de \"d\"", "distancia_d_m": "", "resistencia_ohm": "" },
            { "porcentaje_d": "80 % de \"d\"", "distancia_d_m": "", "resistencia_ohm": "" },
            { "porcentaje_d": "90 % de \"d\"", "distancia_d_m": "", "resistencia_ohm": "" }
          ]
        },
        {
          "id": 3,
          "columnas": [
            { "field": "porcentaje_d", "label": "Porcentaje de 'd'", "tipo": "label" },
            { "field": "distancia_d_m", "label": "Distancia 'd' (m)", "tipo": "number" },
            { "field": "resistencia_ohm", "label": "Resistencia (Ω)", "tipo": "number" }
          ],
          "filas": [
            { "porcentaje_d": "10 % de \"d\"", "distancia_d_m": "", "resistencia_ohm": "" },
            { "porcentaje_d": "20 % de \"d\"", "distancia_d_m": "", "resistencia_ohm": "" },
            { "porcentaje_d": "30 % de \"d\"", "distancia_d_m": "", "resistencia_ohm": "" },
            { "porcentaje_d": "40 % de \"d\"", "distancia_d_m": "", "resistencia_ohm": "" },
            { "porcentaje_d": "80 % de \"d\"", "distancia_d_m": "", "resistencia_ohm": "" },
            { "porcentaje_d": "90 % de \"d\"", "distancia_d_m": "", "resistencia_ohm": "" }
          ]
        },
        {
          "id": 4,
          "columnas": [
            { "field": "porcentaje_d", "label": "Porcentaje de 'd'", "tipo": "label" },
            { "field": "distancia_d_m", "label": "Distancia 'd' (m)", "tipo": "number" },
            { "field": "resistencia_ohm", "label": "Resistencia (Ω)", "tipo": "number" }
          ],
          "filas": [
            { "porcentaje_d": "10 % de \"d\"", "distancia_d_m": "", "resistencia_ohm": "" },
            { "porcentaje_d": "20 % de \"d\"", "distancia_d_m": "", "resistencia_ohm": "" },
            { "porcentaje_d": "30 % de \"d\"", "distancia_d_m": "", "resistencia_ohm": "" },
            { "porcentaje_d": "40 % de \"d\"", "distancia_d_m": "", "resistencia_ohm": "" },
            { "porcentaje_d": "80 % de \"d\"", "distancia_d_m": "", "resistencia_ohm": "" },
            { "porcentaje_d": "90 % de \"d\"", "distancia_d_m": "", "resistencia_ohm": "" }
          ]
        }
      ],
      "grafica": {
        "observacion_excel": "se puede observar que existe una zona de potencial plano, equivalente a un valor constante de resistencia el cual es la resistencia del terreno",
        "valor_resistencia_constante": {
          "label": "valor de resistencia constante",
          "tipo": "number"
        },
        "cumple": {
          "tipo": "radio",
          "opciones": ["SI", "NO"]
        }
      }
    },
    {
      "titulo": "Las pruebas que deben realizarse como parte de la inspeccion son",
      "tipo": "checklist",
      "opciones": [
        "SI",
        "NO",
        "N/A"
      ],
      "preguntas": [
        {
          "id": "RSPT-CHK-001",
          "numero": 1,
          "pregunta": "Se realizan ensayos de equipotencialidad \nRetie Numeral 15.6.1.a",
          "valor_excel": "SI"
        },
        {
          "id": "RSPT-CHK-002",
          "numero": 2,
          "pregunta": "Se miden resistencia de puesta a tierra y los resultados quedan consignados Retie Numeral 15.6.1.b",
          "valor_excel": "SI"
        },
        {
          "id": "RSPT-CHK-003",
          "numero": 3,
          "pregunta": "Se miden corrientes espurias o de modo comun\nRetie Numeral 15.6.1.c",
          "valor_excel": "N/A"
        }
      ]
    },
    {
      "titulo": "La inspeccion del SPT debe documentar y evidenciar mediante Registro, com minimo la siguiente informacion",
      "tipo": "checklist",
      "opciones": [
        "SI",
        "NO",
        "N/A"
      ],
      "preguntas": [
        {
          "id": "RSPT-CHK-004",
          "numero": 4,
          "pregunta": "Las condiciones generales de los conductores del sistema\nRetie Numeral 15.6.2 a)",
          "valor_excel": "SI"
        },
        {
          "id": "RSPT-CHK-005",
          "numero": 5,
          "pregunta": "Ausencia de corrosión en elementos del SPT\nRetie Numeral 15.6.2 b)",
          "valor_excel": "SI"
        },
        {
          "id": "RSPT-CHK-006",
          "numero": 6,
          "pregunta": "Estado de las uniones de los conductores y componentes \nRetie Numeral 15.6.2 c)",
          "valor_excel": "SI"
        },
        {
          "id": "RSPT-CHK-007",
          "numero": 7,
          "pregunta": "Ausencia de desviaciones a los requisitos respecto del RETIE\nRetie Numeral 15.6.2 e)",
          "valor_excel": "SI"
        },
        {
          "id": "RSPT-CHK-008",
          "numero": 8,
          "pregunta": "Si se presentan cambios de la construcción del SPT respecto a planos (diseño) o respecto a la anterior inspección, están documentados?\nRetie Numeral 15.6.2 f)",
          "valor_excel": "N/A"
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
