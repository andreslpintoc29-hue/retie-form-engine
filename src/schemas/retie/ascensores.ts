import { RETIEMasterSchema } from '../masterSchema';

export const RETIE_ASCENSORES_SCHEMA: any = {
  "hoja": "Ascensores",
  "titulo": "LISTA DE CHEQUEO ASCENSORES",
  "proceso": "GESTION DE INSPECCION",
  "codigo": "F-GI-09",
  "version": "1",
  "fecha_formato": "22/01/2018",
  "instruccion_excel": "Colocar X o ü según la evaluación a cada uno de los ítems",
  "tipo_principal": "radio",
  "opciones_principales": [
    "SI",
    "NO",
    "N/A"
  ],
  "respuesta_por_defecto": {
    "visita_1": {
      "tipo": "radio",
      "opciones": [
        "SI",
        "NO",
        "N/A"
      ]
    },
    "cierre": {
      "tipo": "radio",
      "opciones": [
        "SI",
        "NO"
      ]
    }
  },
  "campos_contexto": [
    {
      "id": "codigo_servicio",
      "label": "Código servicio",
      "tipo": "text"
    },
    {
      "id": "fecha_inspeccion",
      "label": "Fecha de la inspección",
      "tipo": "date"
    },
    {
      "id": "fecha_cierre_no_conformidades",
      "label": "Fecha de cierre no conformidades",
      "tipo": "text"
    },
    {
      "id": "tablero",
      "label": "Tablero",
      "tipo": "text",
      "repeatable": true
    },
    {
      "id": "observaciones",
      "label": "Observaciones",
      "tipo": "textarea"
    }
  ],
  "recursos_visuales_hoja": [
    {
      "id": "ascensores_imagen_1",
      "tipo": "image",
      "file": "ASCENSORES_IMAGEN_1.png",
      "anchor": {
        "row": 2,
        "column": 3
      },
      "width": 373,
      "height": 170,
      "format": "png",
      "rol": "encabezado_pagina",
      "descripcion": "Imagen de encabezado de página de la hoja ASCENSORES."
    },
    {
      "id": "ascensores_imagen_2",
      "tipo": "image",
      "file": "ASCENSORES_IMAGEN_2.png",
      "anchor": {
        "row": 99,
        "column": 3
      },
      "width": 373,
      "height": 170,
      "format": "png",
      "rol": "encabezado_pagina",
      "descripcion": "Imagen de encabezado de página de la hoja ASCENSORES."
    }
  ],
  "imagenes_embebidas": [
    {
      "id": "ascensores_imagen_1",
      "tipo": "image",
      "file": "ASCENSORES_IMAGEN_1.png",
      "anchor": {
        "row": 2,
        "column": 3
      },
      "width": 373,
      "height": 170,
      "format": "png",
      "rol": "encabezado_pagina",
      "descripcion": "Imagen de encabezado de página de la hoja ASCENSORES."
    },
    {
      "id": "ascensores_imagen_2",
      "tipo": "image",
      "file": "ASCENSORES_IMAGEN_2.png",
      "anchor": {
        "row": 99,
        "column": 3
      },
      "width": 373,
      "height": 170,
      "format": "png",
      "rol": "encabezado_pagina",
      "descripcion": "Imagen de encabezado de página de la hoja ASCENSORES."
    }
  ],
  "total_preguntas": 72,
  "secciones": [
    {
      "titulo": "1. Tableros",
      "rango": "1-29",
      "total_preguntas": 29,
      "tipo_respuesta_principal": "radio",
      "opciones_visita_1": [
        "SI",
        "NO",
        "N/A"
      ],
      "opciones_cierre": [
        "SI",
        "NO"
      ],
      "preguntas": [
        {
          "id": "ASC-001",
          "numero": 1,
          "numero_original_excel": 1,
          "seccion": "1. Tableros",
          "norma": "R.27.4.3.d",
          "tipo": "radio",
          "opciones": [
            "SI",
            "NO",
            "N/A"
          ],
          "respuesta": {
            "visita_1": {
              "tipo": "radio",
              "opciones": [
                "SI",
                "NO",
                "N/A"
              ]
            },
            "cierre": {
              "tipo": "radio",
              "opciones": [
                "SI",
                "NO"
              ]
            }
          },
          "pregunta": "El Tablero de Distribucion es fácilmente accesible"
        },
        {
          "id": "ASC-002",
          "numero": 2,
          "numero_original_excel": 2,
          "seccion": "1. Tableros",
          "norma": "R. 10.4.\nN. 110-16",
          "tipo": "radio",
          "opciones": [
            "SI",
            "NO",
            "N/A"
          ],
          "respuesta": {
            "visita_1": {
              "tipo": "radio",
              "opciones": [
                "SI",
                "NO",
                "N/A"
              ]
            },
            "cierre": {
              "tipo": "radio",
              "opciones": [
                "SI",
                "NO"
              ]
            }
          },
          "pregunta": "Se cumple con las distancias mínimas permitidas para el espacio de trabajo. Las puertas abren minimo 90°."
        },
        {
          "id": "ASC-003",
          "numero": 3,
          "numero_original_excel": 3,
          "seccion": "1. Tableros",
          "norma": "R. 20.23.1.4.f",
          "tipo": "radio",
          "opciones": [
            "SI",
            "NO",
            "N/A"
          ],
          "respuesta": {
            "visita_1": {
              "tipo": "radio",
              "opciones": [
                "SI",
                "NO",
                "N/A"
              ]
            },
            "cierre": {
              "tipo": "radio",
              "opciones": [
                "SI",
                "NO"
              ]
            }
          },
          "pregunta": "El tablero tiene logo de riesgo eléctrico e identificación."
        },
        {
          "id": "ASC-004",
          "numero": 4,
          "numero_original_excel": 4,
          "seccion": "1. Tableros",
          "norma": "N. 110-16.f.1",
          "tipo": "radio",
          "opciones": [
            "SI",
            "NO",
            "N/A"
          ],
          "respuesta": {
            "visita_1": {
              "tipo": "radio",
              "opciones": [
                "SI",
                "NO",
                "N/A"
              ]
            },
            "cierre": {
              "tipo": "radio",
              "opciones": [
                "SI",
                "NO"
              ]
            }
          },
          "pregunta": "En paneles de distribucion y centros de control de motores ubicados en interiores se cumple espacio dedicado,en esta zona no se debe ubicar tuberia, ductos o equipos ajenos, se permiten rociadores. Para la instalacion se dispone de espacios iguales al ancho y profundidad del equipo y extendiendose desde el piso hasta una altura de 7.6 m o hasta el techo,"
        },
        {
          "id": "ASC-005",
          "numero": 5,
          "numero_original_excel": 5,
          "seccion": "1. Tableros",
          "norma": "R. 20.23.1.4.a-e",
          "tipo": "radio",
          "opciones": [
            "SI",
            "NO",
            "N/A"
          ],
          "respuesta": {
            "visita_1": {
              "tipo": "radio",
              "opciones": [
                "SI",
                "NO",
                "N/A"
              ]
            },
            "cierre": {
              "tipo": "radio",
              "opciones": [
                "SI",
                "NO"
              ]
            }
          },
          "pregunta": "El tablero tiene adherida de manera clara, permanente y visible placa con características técnicas."
        },
        {
          "id": "ASC-006",
          "numero": 6,
          "numero_original_excel": 6,
          "seccion": "1. Tableros",
          "norma": "R. 20.23.1.4.g,i",
          "tipo": "radio",
          "opciones": [
            "SI",
            "NO",
            "N/A"
          ],
          "respuesta": {
            "visita_1": {
              "tipo": "radio",
              "opciones": [
                "SI",
                "NO",
                "N/A"
              ]
            },
            "cierre": {
              "tipo": "radio",
              "opciones": [
                "SI",
                "NO"
              ]
            }
          },
          "pregunta": "El tablero tiene cuadro para identificar circuitos y diagrama unifilar actualizado."
        },
        {
          "id": "ASC-007",
          "numero": 7,
          "numero_original_excel": 7,
          "seccion": "1. Tableros",
          "norma": "R. 20.5.2. f",
          "tipo": "radio",
          "opciones": [
            "SI",
            "NO",
            "N/A"
          ],
          "respuesta": {
            "visita_1": {
              "tipo": "radio",
              "opciones": [
                "SI",
                "NO",
                "N/A"
              ]
            },
            "cierre": {
              "tipo": "radio",
              "opciones": [
                "SI",
                "NO"
              ]
            }
          },
          "pregunta": "Las aberturas no utilizadas están cerradas eficazmente"
        },
        {
          "id": "ASC-008",
          "numero": 8,
          "numero_original_excel": 8,
          "seccion": "1. Tableros",
          "norma": "N. 373-8",
          "tipo": "radio",
          "opciones": [
            "SI",
            "NO",
            "N/A"
          ],
          "respuesta": {
            "visita_1": {
              "tipo": "radio",
              "opciones": [
                "SI",
                "NO",
                "N/A"
              ]
            },
            "cierre": {
              "tipo": "radio",
              "opciones": [
                "SI",
                "NO"
              ]
            }
          },
          "pregunta": "NO existen empalmes dentro del tablero."
        },
        {
          "id": "ASC-009",
          "numero": 9,
          "numero_original_excel": 9,
          "seccion": "1. Tableros",
          "norma": "R.20.23.4.g",
          "tipo": "radio",
          "opciones": [
            "SI",
            "NO",
            "N/A"
          ],
          "respuesta": {
            "visita_1": {
              "tipo": "radio",
              "opciones": [
                "SI",
                "NO",
                "N/A"
              ]
            },
            "cierre": {
              "tipo": "radio",
              "opciones": [
                "SI",
                "NO"
              ]
            }
          },
          "pregunta": "Los cables no atraviesan barrajes"
        },
        {
          "id": "ASC-010",
          "numero": 10,
          "numero_original_excel": 10,
          "seccion": "1. Tableros",
          "norma": "R. 20.23.1.3.f",
          "tipo": "radio",
          "opciones": [
            "SI",
            "NO",
            "N/A"
          ],
          "respuesta": {
            "visita_1": {
              "tipo": "radio",
              "opciones": [
                "SI",
                "NO",
                "N/A"
              ]
            },
            "cierre": {
              "tipo": "radio",
              "opciones": [
                "SI",
                "NO"
              ]
            }
          },
          "pregunta": "Se cumple el código de colores."
        },
        {
          "id": "ASC-011",
          "numero": 11,
          "numero_original_excel": 11,
          "seccion": "1. Tableros",
          "norma": "R.6.3",
          "tipo": "radio",
          "opciones": [
            "SI",
            "NO",
            "N/A"
          ],
          "respuesta": {
            "visita_1": {
              "tipo": "radio",
              "opciones": [
                "SI",
                "NO",
                "N/A"
              ]
            },
            "cierre": {
              "tipo": "radio",
              "opciones": [
                "SI",
                "NO"
              ]
            }
          },
          "pregunta": "Ningún circuito utiliza el blanco ni el verde para las fases."
        },
        {
          "id": "ASC-012",
          "numero": 12,
          "numero_original_excel": 12,
          "seccion": "1. Tableros",
          "norma": "R.20.2.9.j",
          "tipo": "radio",
          "opciones": [
            "SI",
            "NO",
            "N/A"
          ],
          "respuesta": {
            "visita_1": {
              "tipo": "radio",
              "opciones": [
                "SI",
                "NO",
                "N/A"
              ]
            },
            "cierre": {
              "tipo": "radio",
              "opciones": [
                "SI",
                "NO"
              ]
            }
          },
          "pregunta": "Cables o alambres de Aluminio o Alumino recubierto en cobre se cumple lo siguiente:\n1. Son de la serie AA 8000.-2. Empleo de conectores bimetálicos - 3. Ser instalados y mantenidos por personas calificadas, con la competencia profesional certificada. -4. A toda conexión se le aplica gel retardantes de la oxidación. -5. Sobre el cuerpo del dispositivo o equipo para uso directo con conductores de aluminio, se fija rotulado de advertencia en fondo de color amarillo y letra negra."
        },
        {
          "id": "ASC-013",
          "numero": 13,
          "numero_original_excel": 13,
          "seccion": "1. Tableros",
          "norma": "R. 27.4.3. c.",
          "tipo": "radio",
          "opciones": [
            "SI",
            "NO",
            "N/A"
          ],
          "respuesta": {
            "visita_1": {
              "tipo": "radio",
              "opciones": [
                "SI",
                "NO",
                "N/A"
              ]
            },
            "cierre": {
              "tipo": "radio",
              "opciones": [
                "SI",
                "NO"
              ]
            }
          },
          "pregunta": "La capacidad de corriente del conductor de cada circuito ramal es superior a la capacidad de corriente de la protección asociada. Ver tabla 310-16 NTC 2050."
        },
        {
          "id": "ASC-014",
          "numero": 14,
          "numero_original_excel": 14,
          "seccion": "1. Tableros",
          "norma": "N. 250-95",
          "tipo": "radio",
          "opciones": [
            "SI",
            "NO",
            "N/A"
          ],
          "respuesta": {
            "visita_1": {
              "tipo": "radio",
              "opciones": [
                "SI",
                "NO",
                "N/A"
              ]
            },
            "cierre": {
              "tipo": "radio",
              "opciones": [
                "SI",
                "NO"
              ]
            }
          },
          "pregunta": "Cuando haya conductores en paralelo (sólo para mayores a calibres 1/0 AWG de Cu o Al) en varios conductos o cables, como lo permite el Artículo 310-4, el conductor de puesta a tierra de equipos, cuando exista está instalado en paralelo."
        },
        {
          "id": "ASC-015",
          "numero": 15,
          "numero_original_excel": 15,
          "seccion": "1. Tableros",
          "norma": "R.20.16.2.2.e",
          "tipo": "radio",
          "opciones": [
            "SI",
            "NO",
            "N/A"
          ],
          "respuesta": {
            "visita_1": {
              "tipo": "radio",
              "opciones": [
                "SI",
                "NO",
                "N/A"
              ]
            },
            "cierre": {
              "tipo": "radio",
              "opciones": [
                "SI",
                "NO"
              ]
            }
          },
          "pregunta": "Cada circuito ramal presenta protección contra sobrecorriente."
        },
        {
          "id": "ASC-016",
          "numero": 16,
          "numero_original_excel": 16,
          "seccion": "1. Tableros",
          "norma": "R.27.4.1.e",
          "tipo": "radio",
          "opciones": [
            "SI",
            "NO",
            "N/A"
          ],
          "respuesta": {
            "visita_1": {
              "tipo": "radio",
              "opciones": [
                "SI",
                "NO",
                "N/A"
              ]
            },
            "cierre": {
              "tipo": "radio",
              "opciones": [
                "SI",
                "NO"
              ]
            }
          },
          "pregunta": "Cada circuito dispone de dispositivo de corte automático de la alimentación."
        },
        {
          "id": "ASC-017",
          "numero": 17,
          "numero_original_excel": 17,
          "seccion": "1. Tableros",
          "norma": "R.20.16.2.2.a",
          "tipo": "radio",
          "opciones": [
            "SI",
            "NO",
            "N/A"
          ],
          "respuesta": {
            "visita_1": {
              "tipo": "radio",
              "opciones": [
                "SI",
                "NO",
                "N/A"
              ]
            },
            "cierre": {
              "tipo": "radio",
              "opciones": [
                "SI",
                "NO"
              ]
            }
          },
          "pregunta": "En los interruptores automáticos el circuito alimentador llegue al terminal línea y la salida se conecte a los terminales carga."
        },
        {
          "id": "ASC-018",
          "numero": 18,
          "numero_original_excel": 18,
          "seccion": "1. Tableros",
          "norma": "R.20.16.2.2.b",
          "tipo": "radio",
          "opciones": [
            "SI",
            "NO",
            "N/A"
          ],
          "respuesta": {
            "visita_1": {
              "tipo": "radio",
              "opciones": [
                "SI",
                "NO",
                "N/A"
              ]
            },
            "cierre": {
              "tipo": "radio",
              "opciones": [
                "SI",
                "NO"
              ]
            }
          },
          "pregunta": "Los interruptores automáticos tienen unas especificaciones de corriente y tensión, no menores a los valores nominales de los circuitos que controlan."
        },
        {
          "id": "ASC-019",
          "numero": 19,
          "numero_original_excel": 19,
          "seccion": "1. Tableros",
          "norma": "R. 20.23.1.3. c.",
          "tipo": "radio",
          "opciones": [
            "SI",
            "NO",
            "N/A"
          ],
          "respuesta": {
            "visita_1": {
              "tipo": "radio",
              "opciones": [
                "SI",
                "NO",
                "N/A"
              ]
            },
            "cierre": {
              "tipo": "radio",
              "opciones": [
                "SI",
                "NO"
              ]
            }
          },
          "pregunta": "El tablero cuenta con barrajes de tierra y neutro, con suficientes terminales de salida."
        },
        {
          "id": "ASC-020",
          "numero": 20,
          "numero_original_excel": 20,
          "seccion": "1. Tableros",
          "norma": "R.20.12.2.a",
          "tipo": "radio",
          "opciones": [
            "SI",
            "NO",
            "N/A"
          ],
          "respuesta": {
            "visita_1": {
              "tipo": "radio",
              "opciones": [
                "SI",
                "NO",
                "N/A"
              ]
            },
            "cierre": {
              "tipo": "radio",
              "opciones": [
                "SI",
                "NO"
              ]
            }
          },
          "pregunta": "No se instala dos o más conectores o terminales en la misma bornera o al mismo tornillo."
        },
        {
          "id": "ASC-021",
          "numero": 21,
          "numero_original_excel": 21,
          "seccion": "1. Tableros",
          "norma": "R.20.23.1.2.e",
          "tipo": "radio",
          "opciones": [
            "SI",
            "NO",
            "N/A"
          ],
          "respuesta": {
            "visita_1": {
              "tipo": "radio",
              "opciones": [
                "SI",
                "NO",
                "N/A"
              ]
            },
            "cierre": {
              "tipo": "radio",
              "opciones": [
                "SI",
                "NO"
              ]
            }
          },
          "pregunta": "El tablero se encuentra sólidamente puesto a tierra."
        },
        {
          "id": "ASC-022",
          "numero": 22,
          "numero_original_excel": 22,
          "seccion": "1. Tableros",
          "norma": "R. 15.3.3.d.",
          "tipo": "radio",
          "opciones": [
            "SI",
            "NO",
            "N/A"
          ],
          "respuesta": {
            "visita_1": {
              "tipo": "radio",
              "opciones": [
                "SI",
                "NO",
                "N/A"
              ]
            },
            "cierre": {
              "tipo": "radio",
              "opciones": [
                "SI",
                "NO"
              ]
            }
          },
          "pregunta": "El conductor de puesta a tierra de equipos acompaña los conductores activos durante todo su recorrido y por la misma canalización."
        },
        {
          "id": "ASC-023",
          "numero": 23,
          "numero_original_excel": 23,
          "seccion": "1. Tableros",
          "norma": "R.15.3.3.c",
          "tipo": "radio",
          "opciones": [
            "SI",
            "NO",
            "N/A"
          ],
          "respuesta": {
            "visita_1": {
              "tipo": "radio",
              "opciones": [
                "SI",
                "NO",
                "N/A"
              ]
            },
            "cierre": {
              "tipo": "radio",
              "opciones": [
                "SI",
                "NO"
              ]
            }
          },
          "pregunta": "El Conductor de puesta a tierra de equipos es continuo, sin interruptores o medios de desconexión y cuando se empalmen (es mecánica y eléctricamente seguro con soldadura o conector certificados para tal uso)"
        },
        {
          "id": "ASC-024",
          "numero": 24,
          "numero_original_excel": 24,
          "seccion": "1. Tableros",
          "norma": "R.15.3.3.e",
          "tipo": "radio",
          "opciones": [
            "SI",
            "NO",
            "N/A"
          ],
          "respuesta": {
            "visita_1": {
              "tipo": "radio",
              "opciones": [
                "SI",
                "NO",
                "N/A"
              ]
            },
            "cierre": {
              "tipo": "radio",
              "opciones": [
                "SI",
                "NO"
              ]
            }
          },
          "pregunta": "El Conductor de puesta a tierra de equipos que por disposición de la instalación se requieran aislar, son de color verde, verde con rayas amarillas o identificados con marcas verdes en puntos de inspección y extremos"
        },
        {
          "id": "ASC-025",
          "numero": 25,
          "numero_original_excel": 25,
          "seccion": "1. Tableros",
          "norma": "N. 250-95",
          "tipo": "radio",
          "opciones": [
            "SI",
            "NO",
            "N/A"
          ],
          "respuesta": {
            "visita_1": {
              "tipo": "radio",
              "opciones": [
                "SI",
                "NO",
                "N/A"
              ]
            },
            "cierre": {
              "tipo": "radio",
              "opciones": [
                "SI",
                "NO"
              ]
            }
          },
          "pregunta": "El conductor de tierra de cada circuito ramal cumple el calibre mínimo dado en la tabla 250-95 NTC 2050."
        },
        {
          "id": "ASC-026",
          "numero": 26,
          "numero_original_excel": 26,
          "seccion": "1. Tableros",
          "norma": "N.280-21",
          "tipo": "radio",
          "opciones": [
            "SI",
            "NO",
            "N/A"
          ],
          "respuesta": {
            "visita_1": {
              "tipo": "radio",
              "opciones": [
                "SI",
                "NO",
                "N/A"
              ]
            },
            "cierre": {
              "tipo": "radio",
              "opciones": [
                "SI",
                "NO"
              ]
            }
          },
          "pregunta": "Circuito de menos de 1000 V los conductores de conexión DPS a la red y a tierra no son de calibre menor a 14 AWG en Cu o 12 AWG en Al."
        },
        {
          "id": "ASC-027",
          "numero": 27,
          "numero_original_excel": 27,
          "seccion": "1. Tableros",
          "norma": "N.280-4.a",
          "tipo": "radio",
          "opciones": [
            "SI",
            "NO",
            "N/A"
          ],
          "respuesta": {
            "visita_1": {
              "tipo": "radio",
              "opciones": [
                "SI",
                "NO",
                "N/A"
              ]
            },
            "cierre": {
              "tipo": "radio",
              "opciones": [
                "SI",
                "NO"
              ]
            }
          },
          "pregunta": "Circuito de menos de 1000 V el valor nominal del descargador de sobretensiones es = o mayor que la máxima tensión continua de fase a tierra"
        },
        {
          "id": "ASC-028",
          "numero": 28,
          "numero_original_excel": 28,
          "seccion": "1. Tableros",
          "norma": "R.20.23.4.o",
          "tipo": "radio",
          "opciones": [
            "SI",
            "NO",
            "N/A"
          ],
          "respuesta": {
            "visita_1": {
              "tipo": "radio",
              "opciones": [
                "SI",
                "NO",
                "N/A"
              ]
            },
            "cierre": {
              "tipo": "radio",
              "opciones": [
                "SI",
                "NO"
              ]
            }
          },
          "pregunta": "Realizar las pruebas de aislamiento: Las mediciones se realizan usando un megómetro a una tensión de por lo menos 500 Vcc. El valor de la resistencia de aislamiento no es menor de 1000 Ω/V."
        },
        {
          "id": "ASC-029",
          "numero": 29,
          "numero_original_excel": 29,
          "seccion": "1. Tableros",
          "norma": "R.20.23.4.o",
          "tipo": "radio",
          "opciones": [
            "SI",
            "NO",
            "N/A"
          ],
          "respuesta": {
            "visita_1": {
              "tipo": "radio",
              "opciones": [
                "SI",
                "NO",
                "N/A"
              ]
            },
            "cierre": {
              "tipo": "radio",
              "opciones": [
                "SI",
                "NO"
              ]
            }
          },
          "pregunta": "Se deben realizar las siguientes verificaciones:\n1. Funcionalidad de las rejillas de ventilación, las tapas laterales y las puertas. 2. Identificaciones del tablero y de los conductores de control y potencia. 3. Conexión a tierra de las puertas. 4. Remover el polvo. 5. Medir equipotencialidad entre partes conductoras del tablero. 6. Verificar los torques de las uniones mecánicas, eléctricas y de anclaje. 7. Verificar  los enclavamientos mecánicos de los equipos del tablero. 8. Inspeccionar visualmente de toda la estructura del tablero, especialmente la pintura. 9.Remover todos los objetos extraños (restos de cables, tuercas, tornillos, etc)"
        }
      ]
    },
    {
      "titulo": "2. Ascensor",
      "rango": "30-72",
      "total_preguntas": 43,
      "tipo_respuesta_principal": "radio",
      "opciones_visita_1": [
        "SI",
        "NO",
        "N/A"
      ],
      "opciones_cierre": [
        "SI",
        "NO"
      ],
      "preguntas": [
        {
          "id": "ASC-030",
          "numero": 30,
          "numero_original_excel": 30,
          "seccion": "2. Ascensor",
          "norma": "R. 20.2.9 g.",
          "tipo": "radio",
          "opciones": [
            "SI",
            "NO",
            "N/A"
          ],
          "respuesta": {
            "visita_1": {
              "tipo": "radio",
              "opciones": [
                "SI",
                "NO",
                "N/A"
              ]
            },
            "cierre": {
              "tipo": "radio",
              "opciones": [
                "SI",
                "NO"
              ]
            }
          },
          "pregunta": "En los edificios que utilizan ascensores se usan conductores eléctricos con aislamiento o recubrimiento de muy bajo contenido de halógenos, no mayor a 0,5%, no propagadores de llama y baja emisión de humos opacos."
        },
        {
          "id": "ASC-031",
          "numero": 31,
          "numero_original_excel": 31,
          "seccion": "2. Ascensor",
          "norma": "R. 20.6.2.2 a.",
          "tipo": "radio",
          "opciones": [
            "SI",
            "NO",
            "N/A"
          ],
          "respuesta": {
            "visita_1": {
              "tipo": "radio",
              "opciones": [
                "SI",
                "NO",
                "N/A"
              ]
            },
            "cierre": {
              "tipo": "radio",
              "opciones": [
                "SI",
                "NO"
              ]
            }
          },
          "pregunta": "En los espacios vacíos de los ascensores no se utiliza canaleta no metálica."
        },
        {
          "id": "ASC-032",
          "numero": 32,
          "numero_original_excel": 32,
          "seccion": "2. Ascensor",
          "norma": "N. 620-3.",
          "tipo": "radio",
          "opciones": [
            "SI",
            "NO",
            "N/A"
          ],
          "respuesta": {
            "visita_1": {
              "tipo": "radio",
              "opciones": [
                "SI",
                "NO",
                "N/A"
              ]
            },
            "cierre": {
              "tipo": "radio",
              "opciones": [
                "SI",
                "NO"
              ]
            }
          },
          "pregunta": "La tensión de suministro del ascensor no supera los 300 V entre fases."
        },
        {
          "id": "ASC-033",
          "numero": 33,
          "numero_original_excel": 33,
          "seccion": "2. Ascensor",
          "norma": "N.620-3.a",
          "tipo": "radio",
          "opciones": [
            "SI",
            "NO",
            "N/A"
          ],
          "respuesta": {
            "visita_1": {
              "tipo": "radio",
              "opciones": [
                "SI",
                "NO",
                "N/A"
              ]
            },
            "cierre": {
              "tipo": "radio",
              "opciones": [
                "SI",
                "NO"
              ]
            }
          },
          "pregunta": "Los circuitos ramales para controladores de operación de puertas y motores de puertas y los alimentadores y circuitos ramales para controladores de motores, motores de accionamiento de máquinas, frenos de motores y grupos electrógenos, tiene un nivel de tensión no mayor de 600V entre fases."
        },
        {
          "id": "ASC-034",
          "numero": 34,
          "numero_original_excel": 34,
          "seccion": "2. Ascensor",
          "norma": "N.620-3.c",
          "tipo": "radio",
          "opciones": [
            "SI",
            "NO",
            "N/A"
          ],
          "respuesta": {
            "visita_1": {
              "tipo": "radio",
              "opciones": [
                "SI",
                "NO",
                "N/A"
              ]
            },
            "cierre": {
              "tipo": "radio",
              "opciones": [
                "SI",
                "NO"
              ]
            }
          },
          "pregunta": "Los circuitos ramales para los equipos de calefacción y aire acondicionado ubicados en la cabina del ascensor tienen una tensión de circuito no mayor a 600 V."
        },
        {
          "id": "ASC-035",
          "numero": 35,
          "numero_original_excel": 35,
          "seccion": "2. Ascensor",
          "norma": "N. 620-4.",
          "tipo": "radio",
          "opciones": [
            "SI",
            "NO",
            "N/A"
          ],
          "respuesta": {
            "visita_1": {
              "tipo": "radio",
              "opciones": [
                "SI",
                "NO",
                "N/A"
              ]
            },
            "cierre": {
              "tipo": "radio",
              "opciones": [
                "SI",
                "NO"
              ]
            }
          },
          "pregunta": "Las partes energizadas de los equipos eléctricos que estén en los fosos de los ascensores, en las paradas, sobre las cabinas de los ascensores y montacargas o dentro de ellas, en los fosos o paradas de escaleras o pasillos mecánicos o en los rieles y lugares de los motores de los ascensores y elevadores de sillas de ruedas, se encuentran encerradas para evitar cualquier contacto accidental."
        },
        {
          "id": "ASC-036",
          "numero": 36,
          "numero_original_excel": 36,
          "seccion": "2. Ascensor",
          "norma": "N. 620-5.",
          "tipo": "radio",
          "opciones": [
            "SI",
            "NO",
            "N/A"
          ],
          "respuesta": {
            "visita_1": {
              "tipo": "radio",
              "opciones": [
                "SI",
                "NO",
                "N/A"
              ]
            },
            "cierre": {
              "tipo": "radio",
              "opciones": [
                "SI",
                "NO"
              ]
            }
          },
          "pregunta": "Alrededor de los controladores, medios de desconexión y restantes equipos  se garantizan los espacios de trabajo, Tabla 110-16 NTC 2050."
        },
        {
          "id": "ASC-037",
          "numero": 37,
          "numero_original_excel": 37,
          "seccion": "2. Ascensor",
          "norma": "N. 620-11. a)",
          "tipo": "radio",
          "opciones": [
            "SI",
            "NO",
            "N/A"
          ],
          "respuesta": {
            "visita_1": {
              "tipo": "radio",
              "opciones": [
                "SI",
                "NO",
                "N/A"
              ]
            },
            "cierre": {
              "tipo": "radio",
              "opciones": [
                "SI",
                "NO"
              ]
            }
          },
          "pregunta": "Los conductores que van desde el ducto vertical del foso del ascensor hasta los enclavamientos de las puertas exteriores son retardantes de las llamas y tienen una temperatura de funcionamiento no menor a 200 °C. Los conductores son del tipo SF o equivalente."
        },
        {
          "id": "ASC-038",
          "numero": 38,
          "numero_original_excel": 38,
          "seccion": "2. Ascensor",
          "norma": "N. 620-11. b)",
          "tipo": "radio",
          "opciones": [
            "SI",
            "NO",
            "N/A"
          ],
          "respuesta": {
            "visita_1": {
              "tipo": "radio",
              "opciones": [
                "SI",
                "NO",
                "N/A"
              ]
            },
            "cierre": {
              "tipo": "radio",
              "opciones": [
                "SI",
                "NO"
              ]
            }
          },
          "pregunta": "Los cables móviles que se desplazan con la cabina, utilizados como conexiones flexibles entre la cabina del elevador o montacargas o entre el contrapeso y la canalización, son cables de tipo ascensor."
        },
        {
          "id": "ASC-039",
          "numero": 39,
          "numero_original_excel": 39,
          "seccion": "2. Ascensor",
          "norma": "N. 620-11. c)",
          "tipo": "radio",
          "opciones": [
            "SI",
            "NO",
            "N/A"
          ],
          "respuesta": {
            "visita_1": {
              "tipo": "radio",
              "opciones": [
                "SI",
                "NO",
                "N/A"
              ]
            },
            "cierre": {
              "tipo": "radio",
              "opciones": [
                "SI",
                "NO"
              ]
            }
          },
          "pregunta": "Todos los conductores en canalizaciones son de aislamiento retardante de las llamas."
        },
        {
          "id": "ASC-040",
          "numero": 40,
          "numero_original_excel": 40,
          "seccion": "2. Ascensor",
          "norma": "N. 620-13. a)",
          "tipo": "radio",
          "opciones": [
            "SI",
            "NO",
            "N/A"
          ],
          "respuesta": {
            "visita_1": {
              "tipo": "radio",
              "opciones": [
                "SI",
                "NO",
                "N/A"
              ]
            },
            "cierre": {
              "tipo": "radio",
              "opciones": [
                "SI",
                "NO"
              ]
            }
          },
          "pregunta": "Motor: Los conductores que alimentan a un solo motor tienen una capacidad de corriente no menor al porcentaje de la corriente por placa de características del motor que se establece del Artículo 430-22. (125 %)"
        },
        {
          "id": "ASC-041",
          "numero": 41,
          "numero_original_excel": 41,
          "seccion": "2. Ascensor",
          "norma": "N. 620-13. b)",
          "tipo": "radio",
          "opciones": [
            "SI",
            "NO",
            "N/A"
          ],
          "respuesta": {
            "visita_1": {
              "tipo": "radio",
              "opciones": [
                "SI",
                "NO",
                "N/A"
              ]
            },
            "cierre": {
              "tipo": "radio",
              "opciones": [
                "SI",
                "NO"
              ]
            }
          },
          "pregunta": "Controlador motor: Los conductores que alimentan a un solo controlador de motor tienen una capacidad de corriente no menor a la corriente nominal por placa de características del controlador, más las demás cargas conectadas."
        },
        {
          "id": "ASC-042",
          "numero": 42,
          "numero_original_excel": 42,
          "seccion": "2. Ascensor",
          "norma": "N. 620-13. c)",
          "tipo": "radio",
          "opciones": [
            "SI",
            "NO",
            "N/A"
          ],
          "respuesta": {
            "visita_1": {
              "tipo": "radio",
              "opciones": [
                "SI",
                "NO",
                "N/A"
              ]
            },
            "cierre": {
              "tipo": "radio",
              "opciones": [
                "SI",
                "NO"
              ]
            }
          },
          "pregunta": "Transformador: Los conductores que alimentan a un solo transformador de fuerza tienen una capacidad de corriente no menor a la corriente nominal por placa de características del transformador de fuerza, más todas las demás cargas conectadas."
        },
        {
          "id": "ASC-043",
          "numero": 43,
          "numero_original_excel": 43,
          "seccion": "2. Ascensor",
          "norma": "N. 620-13. d)",
          "tipo": "radio",
          "opciones": [
            "SI",
            "NO",
            "N/A"
          ],
          "respuesta": {
            "visita_1": {
              "tipo": "radio",
              "opciones": [
                "SI",
                "NO",
                "N/A"
              ]
            },
            "cierre": {
              "tipo": "radio",
              "opciones": [
                "SI",
                "NO"
              ]
            }
          },
          "pregunta": "Los conductores que alimentan a más de un motor, controlador de motor o transformador de fuerza, tienen una capacidad de corriente no menor a la suma de las corrientes nominales por placas de características de esos equipos más todas las demás cargas conectadas."
        },
        {
          "id": "ASC-044",
          "numero": 44,
          "numero_original_excel": 44,
          "seccion": "2. Ascensor",
          "norma": "N. 620-21.",
          "tipo": "radio",
          "opciones": [
            "SI",
            "NO",
            "N/A"
          ],
          "respuesta": {
            "visita_1": {
              "tipo": "radio",
              "opciones": [
                "SI",
                "NO",
                "N/A"
              ]
            },
            "cierre": {
              "tipo": "radio",
              "opciones": [
                "SI",
                "NO"
              ]
            }
          },
          "pregunta": "Los conductores y cables de fibra óptica ubicados en los fosos de los ascensores, en las canalizaciones de las escaleras y pasillos mecánicos y en las de los elevadores y ascensores para sillas de ruedas, en los cuartos de máquinas, en o sobre las cabinas y en los cuartos de control, sin incluir los cables móviles conectados a la cabina o al contrapeso y el alambrado del foso del ascensor, están instalados en tubo RMC, tubo IMC, tuberías eléctricas metálicas, tubo rígido no metálico o canalizaciones de cables o son cables de Tipo MC, MI o AC."
        },
        {
          "id": "ASC-045",
          "numero": 45,
          "numero_original_excel": 45,
          "seccion": "2. Ascensor",
          "norma": "N. 620-22. a)",
          "tipo": "radio",
          "opciones": [
            "SI",
            "NO",
            "N/A"
          ],
          "respuesta": {
            "visita_1": {
              "tipo": "radio",
              "opciones": [
                "SI",
                "NO",
                "N/A"
              ]
            },
            "cierre": {
              "tipo": "radio",
              "opciones": [
                "SI",
                "NO"
              ]
            }
          },
          "pregunta": "Las luces, tomacorrientes, fuente auxiliar de alumbrado y ventilación de cada cabina del ascensor son alimentados por un circuito ramal independiente."
        },
        {
          "id": "ASC-046",
          "numero": 46,
          "numero_original_excel": 46,
          "seccion": "2. Ascensor",
          "norma": "N. 620-22. b)",
          "tipo": "radio",
          "opciones": [
            "SI",
            "NO",
            "N/A"
          ],
          "respuesta": {
            "visita_1": {
              "tipo": "radio",
              "opciones": [
                "SI",
                "NO",
                "N/A"
              ]
            },
            "cierre": {
              "tipo": "radio",
              "opciones": [
                "SI",
                "NO"
              ]
            }
          },
          "pregunta": "Los equipos de aire acondicionado y calefacción de cada cabina del ascensor son alimentados por un circuito ramal independiente."
        },
        {
          "id": "ASC-047",
          "numero": 47,
          "numero_original_excel": 47,
          "seccion": "2. Ascensor",
          "norma": "N. 620-23. a)",
          "tipo": "radio",
          "opciones": [
            "SI",
            "NO",
            "N/A"
          ],
          "respuesta": {
            "visita_1": {
              "tipo": "radio",
              "opciones": [
                "SI",
                "NO",
                "N/A"
              ]
            },
            "cierre": {
              "tipo": "radio",
              "opciones": [
                "SI",
                "NO"
              ]
            }
          },
          "pregunta": "Existe un circuito ramal independiente que da el suministro a los aparatos de alumbrado y tomacorrientes del cuarto de motores y el espacio de máquinas."
        },
        {
          "id": "ASC-048",
          "numero": 48,
          "numero_original_excel": 48,
          "seccion": "2. Ascensor",
          "norma": "N. 620-23. b)",
          "tipo": "radio",
          "opciones": [
            "SI",
            "NO",
            "N/A"
          ],
          "respuesta": {
            "visita_1": {
              "tipo": "radio",
              "opciones": [
                "SI",
                "NO",
                "N/A"
              ]
            },
            "cierre": {
              "tipo": "radio",
              "opciones": [
                "SI",
                "NO"
              ]
            }
          },
          "pregunta": "El interruptor del alumbrado para el cuarto de motores esta ubicado a la entrada del mismo, o del espacio de máquinas."
        },
        {
          "id": "ASC-049",
          "numero": 49,
          "numero_original_excel": 49,
          "seccion": "2. Ascensor",
          "norma": "N. 620-23. c)",
          "tipo": "radio",
          "opciones": [
            "SI",
            "NO",
            "N/A"
          ],
          "respuesta": {
            "visita_1": {
              "tipo": "radio",
              "opciones": [
                "SI",
                "NO",
                "N/A"
              ]
            },
            "cierre": {
              "tipo": "radio",
              "opciones": [
                "SI",
                "NO"
              ]
            }
          },
          "pregunta": "En cada cuarto de motores y espacio de máquinas existe como mínimo un tomacorriente dúplex, monofásico a 125 V."
        },
        {
          "id": "ASC-050",
          "numero": 50,
          "numero_original_excel": 50,
          "seccion": "2. Ascensor",
          "norma": "N. 620-24. a)",
          "tipo": "radio",
          "opciones": [
            "SI",
            "NO",
            "N/A"
          ],
          "respuesta": {
            "visita_1": {
              "tipo": "radio",
              "opciones": [
                "SI",
                "NO",
                "N/A"
              ]
            },
            "cierre": {
              "tipo": "radio",
              "opciones": [
                "SI",
                "NO"
              ]
            }
          },
          "pregunta": "Existe un circuito ramal independiente que da suministro a los aparatos de alumbrado y tomacorrientes del pozo del foso del ascensor."
        },
        {
          "id": "ASC-051",
          "numero": 51,
          "numero_original_excel": 51,
          "seccion": "2. Ascensor",
          "norma": "N. 620-24. b)",
          "tipo": "radio",
          "opciones": [
            "SI",
            "NO",
            "N/A"
          ],
          "respuesta": {
            "visita_1": {
              "tipo": "radio",
              "opciones": [
                "SI",
                "NO",
                "N/A"
              ]
            },
            "cierre": {
              "tipo": "radio",
              "opciones": [
                "SI",
                "NO"
              ]
            }
          },
          "pregunta": "El interruptor del alumbrado esta ubicado de modo que sea fácilmente accesible desde la puerta de acceso al pozo."
        },
        {
          "id": "ASC-052",
          "numero": 52,
          "numero_original_excel": 52,
          "seccion": "2. Ascensor",
          "norma": "N. 620-24. c)",
          "tipo": "radio",
          "opciones": [
            "SI",
            "NO",
            "N/A"
          ],
          "respuesta": {
            "visita_1": {
              "tipo": "radio",
              "opciones": [
                "SI",
                "NO",
                "N/A"
              ]
            },
            "cierre": {
              "tipo": "radio",
              "opciones": [
                "SI",
                "NO"
              ]
            }
          },
          "pregunta": "En el pozo del foso del ascensor hay como mínimo un tomacorriente dúplex, monofásico a 125 V."
        },
        {
          "id": "ASC-053",
          "numero": 53,
          "numero_original_excel": 53,
          "seccion": "2. Ascensor",
          "norma": "N. 620-32",
          "tipo": "radio",
          "opciones": [
            "SI",
            "NO",
            "N/A"
          ],
          "respuesta": {
            "visita_1": {
              "tipo": "radio",
              "opciones": [
                "SI",
                "NO",
                "N/A"
              ]
            },
            "cierre": {
              "tipo": "radio",
              "opciones": [
                "SI",
                "NO"
              ]
            }
          },
          "pregunta": "Los tramos verticales de las canalizaciones de alambrado están sujetos a intervalos NO mayores a 4,50 m y NO tienen más de una unión entre dos apoyos."
        },
        {
          "id": "ASC-054",
          "numero": 54,
          "numero_original_excel": 54,
          "seccion": "2. Ascensor",
          "norma": "N. 620-37.a",
          "tipo": "radio",
          "opciones": [
            "SI",
            "NO",
            "N/A"
          ],
          "respuesta": {
            "visita_1": {
              "tipo": "radio",
              "opciones": [
                "SI",
                "NO",
                "N/A"
              ]
            },
            "cierre": {
              "tipo": "radio",
              "opciones": [
                "SI",
                "NO"
              ]
            }
          },
          "pregunta": "Dentro del foso de ascensor o cuarto de máquinas solo existe alambrado, cables y canalizaciones eléctricas utilizadas directamente para el funcionamiento del ascensor o montacargas, incluido el alambrado para señales, para circuitos de comunicación con la cabina, para alumbrado, calefacción, ventilación y aire acondicionado en la cabina, para sistemas de detección de incendios, cuartos de bombas del pozo y los de calefacción, alumbrado y ventilación del propio foso de ascensor."
        },
        {
          "id": "ASC-055",
          "numero": 55,
          "numero_original_excel": 55,
          "seccion": "2. Ascensor",
          "norma": "N. 620-37.b",
          "tipo": "radio",
          "opciones": [
            "SI",
            "NO",
            "N/A"
          ],
          "respuesta": {
            "visita_1": {
              "tipo": "radio",
              "opciones": [
                "SI",
                "NO",
                "N/A"
              ]
            },
            "cierre": {
              "tipo": "radio",
              "opciones": [
                "SI",
                "NO"
              ]
            }
          },
          "pregunta": "Los conductores del sistema de protección contra rayos NO se encuentran instalados dentro del foso del ascensor. NO se utilizan los rieles ni otros equipos existentes en el foso del ascensor como conductores de bajada para puesta a tierra del sistema de protección contra rayos."
        },
        {
          "id": "ASC-056",
          "numero": 56,
          "numero_original_excel": 56,
          "seccion": "2. Ascensor",
          "norma": "N. 620-37.c",
          "tipo": "radio",
          "opciones": [
            "SI",
            "NO",
            "N/A"
          ],
          "respuesta": {
            "visita_1": {
              "tipo": "radio",
              "opciones": [
                "SI",
                "NO",
                "N/A"
              ]
            },
            "cierre": {
              "tipo": "radio",
              "opciones": [
                "SI",
                "NO"
              ]
            }
          },
          "pregunta": "Los alimentadores principales para dar el suministro de fuerza a los ascensores y montacargas están fuera del foso del ascensor."
        },
        {
          "id": "ASC-057",
          "numero": 57,
          "numero_original_excel": 57,
          "seccion": "2. Ascensor",
          "norma": "N. 620-43",
          "tipo": "radio",
          "opciones": [
            "SI",
            "NO",
            "N/A"
          ],
          "respuesta": {
            "visita_1": {
              "tipo": "radio",
              "opciones": [
                "SI",
                "NO",
                "N/A"
              ]
            },
            "cierre": {
              "tipo": "radio",
              "opciones": [
                "SI",
                "NO"
              ]
            }
          },
          "pregunta": "Los soportes de los cables móviles están ubicados de modo que reducen al mínimo la posibilidad de que los cables entren en contacto con las paredes del foso del ascensor o con los equipos instalados en el mismo"
        },
        {
          "id": "ASC-058",
          "numero": 58,
          "numero_original_excel": 58,
          "seccion": "2. Ascensor",
          "norma": "N. 620-51",
          "tipo": "radio",
          "opciones": [
            "SI",
            "NO",
            "N/A"
          ],
          "respuesta": {
            "visita_1": {
              "tipo": "radio",
              "opciones": [
                "SI",
                "NO",
                "N/A"
              ]
            },
            "cierre": {
              "tipo": "radio",
              "opciones": [
                "SI",
                "NO"
              ]
            }
          },
          "pregunta": "Existe solo un medio que desconecta todos los conductores de suministro de fuerza no puestos a tierra de cada unidad."
        },
        {
          "id": "ASC-059",
          "numero": 59,
          "numero_original_excel": 59,
          "seccion": "2. Ascensor",
          "norma": "N. 620-51",
          "tipo": "radio",
          "opciones": [
            "SI",
            "NO",
            "N/A"
          ],
          "respuesta": {
            "visita_1": {
              "tipo": "radio",
              "opciones": [
                "SI",
                "NO",
                "N/A"
              ]
            },
            "cierre": {
              "tipo": "radio",
              "opciones": [
                "SI",
                "NO"
              ]
            }
          },
          "pregunta": "El medio de desconexión de los circuitos de fuerza NO desconecta los circuitos ramales de: \n- Alumbrado, tomacorrientes, ventilación, calefacción y aire acondicionado de las cabinas de los ascensores.\n- Alumbrado y tomacorrientes del cuarto y espacio de máquinas.\n- Alumbrado y tomacorrientes del pozo del foso del ascensor."
        },
        {
          "id": "ASC-060",
          "numero": 60,
          "numero_original_excel": 60,
          "seccion": "2. Ascensor",
          "norma": "N. 620-51.a",
          "tipo": "radio",
          "opciones": [
            "SI",
            "NO",
            "N/A"
          ],
          "respuesta": {
            "visita_1": {
              "tipo": "radio",
              "opciones": [
                "SI",
                "NO",
                "N/A"
              ]
            },
            "cierre": {
              "tipo": "radio",
              "opciones": [
                "SI",
                "NO"
              ]
            }
          },
          "pregunta": "El medio de desconexión es accionable desde el exterior de un encerramiento y que se puede bloquear en posición de abierto."
        },
        {
          "id": "ASC-061",
          "numero": 61,
          "numero_original_excel": 61,
          "seccion": "2. Ascensor",
          "norma": "N. 620-51.b",
          "tipo": "radio",
          "opciones": [
            "SI",
            "NO",
            "N/A"
          ],
          "respuesta": {
            "visita_1": {
              "tipo": "radio",
              "opciones": [
                "SI",
                "NO",
                "N/A"
              ]
            },
            "cierre": {
              "tipo": "radio",
              "opciones": [
                "SI",
                "NO"
              ]
            }
          },
          "pregunta": "El medio de desconexión NO se puede abrir ni cerrar desde cualquier otra parte del predio."
        },
        {
          "id": "ASC-062",
          "numero": 62,
          "numero_original_excel": 62,
          "seccion": "2. Ascensor",
          "norma": "N. 620-51.c",
          "tipo": "radio",
          "opciones": [
            "SI",
            "NO",
            "N/A"
          ],
          "respuesta": {
            "visita_1": {
              "tipo": "radio",
              "opciones": [
                "SI",
                "NO",
                "N/A"
              ]
            },
            "cierre": {
              "tipo": "radio",
              "opciones": [
                "SI",
                "NO"
              ]
            }
          },
          "pregunta": "El medio de desconexión está ubicado donde es fácilmente accesible a personal calificado"
        },
        {
          "id": "ASC-063",
          "numero": 63,
          "numero_original_excel": 63,
          "seccion": "2. Ascensor",
          "norma": "N. 620-51.d",
          "tipo": "radio",
          "opciones": [
            "SI",
            "NO",
            "N/A"
          ],
          "respuesta": {
            "visita_1": {
              "tipo": "radio",
              "opciones": [
                "SI",
                "NO",
                "N/A"
              ]
            },
            "cierre": {
              "tipo": "radio",
              "opciones": [
                "SI",
                "NO"
              ]
            }
          },
          "pregunta": "Si en cuarto de  máquinas hay más de un máquina de accionamiento, los medios de desconexión se encuentran numerados para indicar claramente las máquinas de accionamiento que controlan. Cada medio de desconexión está dotado de una aviso que indique la ubicación del lado del suministro del dispositivo de protección contra sobre corriente"
        },
        {
          "id": "ASC-064",
          "numero": 64,
          "numero_original_excel": 64,
          "seccion": "2. Ascensor",
          "norma": "N. 620-52.a",
          "tipo": "radio",
          "opciones": [
            "SI",
            "NO",
            "N/A"
          ],
          "respuesta": {
            "visita_1": {
              "tipo": "radio",
              "opciones": [
                "SI",
                "NO",
                "N/A"
              ]
            },
            "cierre": {
              "tipo": "radio",
              "opciones": [
                "SI",
                "NO"
              ]
            }
          },
          "pregunta": "Si la alimentación de ascensores con una o varias cabinas se realiza desde mas de una fuente, cada fuente tiene un medio de desconexión."
        },
        {
          "id": "ASC-065",
          "numero": 65,
          "numero_original_excel": 65,
          "seccion": "2. Ascensor",
          "norma": "N. 620-52.b",
          "tipo": "radio",
          "opciones": [
            "SI",
            "NO",
            "N/A"
          ],
          "respuesta": {
            "visita_1": {
              "tipo": "radio",
              "opciones": [
                "SI",
                "NO",
                "N/A"
              ]
            },
            "cierre": {
              "tipo": "radio",
              "opciones": [
                "SI",
                "NO"
              ]
            }
          },
          "pregunta": "Hay instalado sobre o cerca del medio de desconexión un cartel de advertencia en el que se lee (ATENCIÓN- PARTES DE ESTE CONTROLADOR NO QUEDAN DESENERGIZADAS CON ESTE INTERRUPTOR) (WARNING- PAST OF THE CONTROLLER ARE NOT DE-ENERGIZED BI THIS SWITCH), cuando existen varios medios de desconexión y haya partes de los controladores que permanecen energizadas desde fuentes que no estén desconectadas."
        },
        {
          "id": "ASC-066",
          "numero": 66,
          "numero_original_excel": 66,
          "seccion": "2. Ascensor",
          "norma": "N. 620-53",
          "tipo": "radio",
          "opciones": [
            "SI",
            "NO",
            "N/A"
          ],
          "respuesta": {
            "visita_1": {
              "tipo": "radio",
              "opciones": [
                "SI",
                "NO",
                "N/A"
              ]
            },
            "cierre": {
              "tipo": "radio",
              "opciones": [
                "SI",
                "NO"
              ]
            }
          },
          "pregunta": "Existe un medio de desconexión para el circuito de alumbrado, tomacorrientes y ventilación de cada cabina del ascensor. Cada medio de desconexión esta dotado de un aviso que indica la ubicación del lado del suministro del dispositivo de protección contra sobrecorriente."
        },
        {
          "id": "ASC-067",
          "numero": 67,
          "numero_original_excel": 67,
          "seccion": "2. Ascensor",
          "norma": "N. 620-54.",
          "tipo": "radio",
          "opciones": [
            "SI",
            "NO",
            "N/A"
          ],
          "respuesta": {
            "visita_1": {
              "tipo": "radio",
              "opciones": [
                "SI",
                "NO",
                "N/A"
              ]
            },
            "cierre": {
              "tipo": "radio",
              "opciones": [
                "SI",
                "NO"
              ]
            }
          },
          "pregunta": "Los ascensores cuentan con un solo medio que desconecta todos los conductores no puestos a tierra de los circuitos de suministro para calefacción y aire acondicionado de cada cabina."
        },
        {
          "id": "ASC-068",
          "numero": 68,
          "numero_original_excel": 68,
          "seccion": "2. Ascensor",
          "norma": "N. 620-61.b.1",
          "tipo": "radio",
          "opciones": [
            "SI",
            "NO",
            "N/A"
          ],
          "respuesta": {
            "visita_1": {
              "tipo": "radio",
              "opciones": [
                "SI",
                "NO",
                "N/A"
              ]
            },
            "cierre": {
              "tipo": "radio",
              "opciones": [
                "SI",
                "NO"
              ]
            }
          },
          "pregunta": "Los motores que mueven los ascensores y montacargas y los motores de los grupos electrógenos con control de campo del generador, están clasificados como de ciclo intermitente."
        },
        {
          "id": "ASC-069",
          "numero": 69,
          "numero_original_excel": 69,
          "seccion": "2. Ascensor",
          "norma": "N. 620-71.",
          "tipo": "radio",
          "opciones": [
            "SI",
            "NO",
            "N/A"
          ],
          "respuesta": {
            "visita_1": {
              "tipo": "radio",
              "opciones": [
                "SI",
                "NO",
                "N/A"
              ]
            },
            "cierre": {
              "tipo": "radio",
              "opciones": [
                "SI",
                "NO"
              ]
            }
          },
          "pregunta": "Los motores, grupos electrógenos, controladores y medios de desconexión de los ascensores, montacargas, escaleras y pasillos mecánicos, se encuentran instalados en un cuarto o encerramiento para ese propósito."
        },
        {
          "id": "ASC-070",
          "numero": 70,
          "numero_original_excel": 70,
          "seccion": "2. Ascensor",
          "norma": "N. 620-81.",
          "tipo": "radio",
          "opciones": [
            "SI",
            "NO",
            "N/A"
          ],
          "respuesta": {
            "visita_1": {
              "tipo": "radio",
              "opciones": [
                "SI",
                "NO",
                "N/A"
              ]
            },
            "cierre": {
              "tipo": "radio",
              "opciones": [
                "SI",
                "NO"
              ]
            }
          },
          "pregunta": "Las canalizaciones metálicas y los cables de Tipo MC, MI o AC unidos a las cabinas de los ascensores, están conectados equipotencialmente a las partes metálicas puestas a tierra de la cabina con la que hacen contacto."
        },
        {
          "id": "ASC-071",
          "numero": 71,
          "numero_original_excel": 71,
          "seccion": "2. Ascensor",
          "norma": "N. 620-82",
          "tipo": "radio",
          "opciones": [
            "SI",
            "NO",
            "N/A"
          ],
          "respuesta": {
            "visita_1": {
              "tipo": "radio",
              "opciones": [
                "SI",
                "NO",
                "N/A"
              ]
            },
            "cierre": {
              "tipo": "radio",
              "opciones": [
                "SI",
                "NO"
              ]
            }
          },
          "pregunta": "Los ascensores eléctricos, las carcasas de todos los motores, máquinas, controladores y encerramientos metálicos de todos los equipos eléctricos instalados sobre la cabina, dentro de ella o en el foso del ascensor, se encuentran puestos a tierra."
        },
        {
          "id": "ASC-072",
          "numero": 72,
          "numero_original_excel": 72,
          "seccion": "2. Ascensor",
          "norma": "N. 620-85.",
          "tipo": "radio",
          "opciones": [
            "SI",
            "NO",
            "N/A"
          ],
          "respuesta": {
            "visita_1": {
              "tipo": "radio",
              "opciones": [
                "SI",
                "NO",
                "N/A"
              ]
            },
            "cierre": {
              "tipo": "radio",
              "opciones": [
                "SI",
                "NO"
              ]
            }
          },
          "pregunta": "Todos los tomacorrientes monofásicos de 125 V y 15 o 20 A instalados en los espacios de máquinas, cuartos de maquinas, pozos, encima de las cabinas y en las canalizaciones de escaleras y pasillos mecánicos, son del tipo de interruptor de circuito por falla a tierra \"GFCI\"."
        }
      ]
    }
  ],
  "validacion_extraccion": {
    "preguntas_esperadas": 72,
    "preguntas_extraidas": 72,
    "imagenes_extraidas": 2,
    "numeros_faltantes": [],
    "numeros_duplicados": [],
    "preguntas_sin_texto": [],
    "estado": "OK"
  }
};
