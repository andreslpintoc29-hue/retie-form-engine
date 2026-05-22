import { RETIEMasterSchema } from '../masterSchema';

export const RETIE_PISCINAS_SCHEMA: RETIEMasterSchema = {
  "hoja": "Piscinas",
  "titulo": "LISTA DE CHEQUEO PISCINAS",
  "proceso": "GESTION DE INSPECCION",
  "codigo": "F-GI-10",
  "version": "2",
  "fecha_formato": "09/30/2020",
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
      "id": "piscinas_imagen_1",
      "tipo": "image",
      "file": "PISCINAS_IMAGEN_1.png",
      "anchor": { "row": 2, "column": 3 },
      "width": 373,
      "height": 170,
      "format": "png",
      "rol": "encabezado_pagina",
      "descripcion": "Imagen de encabezado de página de la hoja PISCINAS."
    },
    {
      "id": "piscinas_imagen_2",
      "tipo": "image",
      "file": "PISCINAS_IMAGEN_2.png",
      "anchor": { "row": 99, "column": 3 },
      "width": 373,
      "height": 170,
      "format": "png",
      "rol": "encabezado_pagina",
      "descripcion": "Imagen de encabezado de página de la hoja PISCINAS."
    },
    {
      "id": "piscinas_imagen_3",
      "tipo": "image",
      "file": "PISCINAS_IMAGEN_3.png",
      "anchor": { "row": 202, "column": 3 },
      "width": 373,
      "height": 170,
      "format": "png",
      "rol": "encabezado_pagina",
      "descripcion": "Imagen de encabezado de página de la hoja PISCINAS."
    }
  ],
  "imagenes_embebidas": [
    {
      "id": "piscinas_imagen_1",
      "tipo": "image",
      "file": "PISCINAS_IMAGEN_1.png",
      "anchor": { "row": 2, "column": 3 },
      "width": 373,
      "height": 170,
      "format": "png",
      "rol": "encabezado_pagina",
      "descripcion": "Imagen de encabezado de página de la hoja PISCINAS."
    },
    {
      "id": "piscinas_imagen_2",
      "tipo": "image",
      "file": "PISCINAS_IMAGEN_2.png",
      "anchor": { "row": 99, "column": 3 },
      "width": 373,
      "height": 170,
      "format": "png",
      "rol": "encabezado_pagina",
      "descripcion": "Imagen de encabezado de página de la hoja PISCINAS."
    },
    {
      "id": "piscinas_imagen_3",
      "tipo": "image",
      "file": "PISCINAS_IMAGEN_3.png",
      "anchor": { "row": 202, "column": 3 },
      "width": 373,
      "height": 170,
      "format": "png",
      "rol": "encabezado_pagina",
      "descripcion": "Imagen de encabezado de página de la hoja PISCINAS."
    },
    {
      "id": "piscinas_imagen_4",
      "tipo": "image",
      "file": "PISCINAS_IMAGEN_4.png",
      "anchor": { "row": 188, "column": 3 },
      "width": 388,
      "height": 90,
      "format": "png",
      "rol": "recurso_visual_pregunta_42",
      "descripcion": "Imagen/tabla ubicada en la zona de la pregunta 42 sobre alambrado subterráneo/distancias."
    },
    {
      "id": "piscinas_imagen_5",
      "tipo": "image",
      "file": "PISCINAS_IMAGEN_5.png",
      "anchor": { "row": 270, "column": 3 },
      "width": 510,
      "height": 272,
      "format": "png",
      "rol": "recurso_visual_pregunta_77",
      "descripcion": "Imagen/figura ubicada debajo de la sección Separación de conductores aéreos, asociada a la pregunta 77."
    },
    {
      "id": "piscinas_imagen_6",
      "tipo": "image",
      "file": "PISCINAS_IMAGEN_6.png",
      "anchor": { "row": 286, "column": 3 },
      "width": 402,
      "height": 232,
      "format": "png",
      "rol": "recurso_visual_pregunta_77",
      "descripcion": "Imagen/figura ubicada debajo de la sección Separación de conductores aéreos, asociada a la pregunta 77."
    }
  ],
  "total_preguntas": 77,
  "secciones": [
    {
      "titulo": "1. Tableros",
      "rango": "1-29",
      "total_preguntas": 29,
      "tipo_respuesta_principal": "radio",
      "opciones_visita_1": ["SI", "NO", "N/A"],
      "opciones_cierre": ["SI", "NO"],
      "preguntas": [
        {
          "id": "PIS-001", "numero": 1, "numero_original_excel": 1, "seccion": "1. Tableros", "norma": "R.27.4.3.d", "tipo": "radio", "opciones": ["SI", "NO", "N/A"], "respuesta": { "visita_1": { "tipo": "radio", "opciones": ["SI", "NO", "N/A"] }, "cierre": { "tipo": "radio", "opciones": ["SI", "NO"] } }, "pregunta": "El Tablero de Distribucion es fácilmente accesible"
        },
        {
          "id": "PIS-002", "numero": 2, "numero_original_excel": 2, "seccion": "1. Tableros", "norma": "R. 10.4.\nN. 110-16", "tipo": "radio", "opciones": ["SI", "NO", "N/A"], "respuesta": { "visita_1": { "tipo": "radio", "opciones": ["SI", "NO", "N/A"] }, "cierre": { "tipo": "radio", "opciones": ["SI", "NO"] } }, "pregunta": "Se cumple con las distancias mínimas permitidas para el espacio de trabajo. Las puertas abren minimo 90°."
        },
        {
          "id": "PIS-003", "numero": 3, "numero_original_excel": 3, "seccion": "1. Tableros", "norma": "R. 20.23.1.4.f", "tipo": "radio", "opciones": ["SI", "NO", "N/A"], "respuesta": { "visita_1": { "tipo": "radio", "opciones": ["SI", "NO", "N/A"] }, "cierre": { "tipo": "radio", "opciones": ["SI", "NO"] } }, "pregunta": "El tablero tiene logo de riesgo eléctrico e identificación."
        },
        {
          "id": "PIS-004", "numero": 4, "numero_original_excel": 4, "seccion": "1. Tableros", "norma": "N. 110-16.f.1", "tipo": "radio", "opciones": ["SI", "NO", "N/A"], "respuesta": { "visita_1": { "tipo": "radio", "opciones": ["SI", "NO", "N/A"] }, "cierre": { "tipo": "radio", "opciones": ["SI", "NO"] } }, "pregunta": "En paneles de distribucion y centros de control de motores ubicados en interiores se cumple espacio dedicado,en esta zona no se debe ubicar tuberia, ductos o equipos ajenos, se permiten rociadores. Para la instalacion se dispone de espacios iguales al ancho y profundidad del equipo y extendiendose desde el piso hasta una altura de 7.6 m o hasta el techo,"
        },
        {
          "id": "PIS-005", "numero": 5, "numero_original_excel": 5, "seccion": "1. Tableros", "norma": "R. 20.23.1.4.a-e", "tipo": "radio", "opciones": ["SI", "NO", "N/A"], "respuesta": { "visita_1": { "tipo": "radio", "opciones": ["SI", "NO", "N/A"] }, "cierre": { "tipo": "radio", "opciones": ["SI", "NO"] } }, "pregunta": "El tablero tiene adherida de manera clara, permanente y visible placa con características técnicas."
        },
        {
          "id": "PIS-006", "numero": 6, "numero_original_excel": 6, "seccion": "1. Tableros", "norma": "R. 20.23.1.4.g,i", "tipo": "radio", "opciones": ["SI", "NO", "N/A"], "respuesta": { "visita_1": { "tipo": "radio", "opciones": ["SI", "NO", "N/A"] }, "cierre": { "tipo": "radio", "opciones": ["SI", "NO"] } }, "pregunta": "El tablero tiene cuadro para identificar circuitos y diagrama unifilar actualizado."
        },
        {
          "id": "PIS-007", "numero": 7, "numero_original_excel": 7, "seccion": "1. Tableros", "norma": "R. 20.5.2. f", "tipo": "radio", "opciones": ["SI", "NO", "N/A"], "respuesta": { "visita_1": { "tipo": "radio", "opciones": ["SI", "NO", "N/A"] }, "cierre": { "tipo": "radio", "opciones": ["SI", "NO"] } }, "pregunta": "Las aberturas no utilizadas están cerradas eficazmente"
        },
        {
          "id": "PIS-008", "numero": 8, "numero_original_excel": 8, "seccion": "1. Tableros", "norma": "N. 373-8", "tipo": "radio", "opciones": ["SI", "NO", "N/A"], "respuesta": { "visita_1": { "tipo": "radio", "opciones": ["SI", "NO", "N/A"] }, "cierre": { "tipo": "radio", "opciones": ["SI", "NO"] } }, "pregunta": "NO existen empalmes dentro del tablero."
        },
        {
          "id": "PIS-009", "numero": 9, "numero_original_excel": 9, "seccion": "1. Tableros", "norma": "R.20.23.4.g", "tipo": "radio", "opciones": ["SI", "NO", "N/A"], "respuesta": { "visita_1": { "tipo": "radio", "opciones": ["SI", "NO", "N/A"] }, "cierre": { "tipo": "radio", "opciones": ["SI", "NO"] } }, "pregunta": "Los cables no atraviesan barrajes"
        },
        {
          "id": "PIS-010", "numero": 10, "numero_original_excel": 10, "seccion": "1. Tableros", "norma": "R. 20.23.1.3.f", "tipo": "radio", "opciones": ["SI", "NO", "N/A"], "respuesta": { "visita_1": { "tipo": "radio", "opciones": ["SI", "NO", "N/A"] }, "cierre": { "tipo": "radio", "opciones": ["SI", "NO"] } }, "pregunta": "Se cumple el código de colores."
        },
        {
          "id": "PIS-011", "numero": 11, "numero_original_excel": 11, "seccion": "1. Tableros", "norma": "R.6.3", "tipo": "radio", "opciones": ["SI", "NO", "N/A"], "respuesta": { "visita_1": { "tipo": "radio", "opciones": ["SI", "NO", "N/A"] }, "cierre": { "tipo": "radio", "opciones": ["SI", "NO"] } }, "pregunta": "Ningún circuito utiliza el blanco ni el verde para las fases."
        },
        {
          "id": "PIS-012", "numero": 12, "numero_original_excel": 12, "seccion": "1. Tableros", "norma": "R.20.2.9.j", "tipo": "radio", "opciones": ["SI", "NO", "N/A"], "respuesta": { "visita_1": { "tipo": "radio", "opciones": ["SI", "NO", "N/A"] }, "cierre": { "tipo": "radio", "opciones": ["SI", "NO"] } }, "pregunta": "Cables o alambres de Aluminio o Alumino recubierto en cobre se cumple lo siguiente:\n1. Son de la serie AA 8000.-2. Empleo de conectores bimetálicos - 3. Ser instalados y mantenidos por personas calificadas, con la competencia profesional certificada. -4. A toda conexión se le aplica gel retardantes de la oxidación. -5. Sobre el cuerpo del dispositivo o equipo para uso directo con conductores de aluminio, se fija rotulado de advertencia en fondo de color amarillo y letra negra."
        },
        {
          "id": "PIS-013", "numero": 13, "numero_original_excel": 13, "seccion": "1. Tableros", "norma": "R. 27.4.3. c.", "tipo": "radio", "opciones": ["SI", "NO", "N/A"], "respuesta": { "visita_1": { "tipo": "radio", "opciones": ["SI", "NO", "N/A"] }, "cierre": { "tipo": "radio", "opciones": ["SI", "NO"] } }, "pregunta": "La capacidad de corriente del conductor de cada circuito ramal es superior a la capacidad de corriente de la protección asociada. Ver tabla 310-16 NTC 2050."
        },
        {
          "id": "PIS-014", "numero": 14, "numero_original_excel": 14, "seccion": "1. Tableros", "norma": "N. 250-95", "tipo": "radio", "opciones": ["SI", "NO", "N/A"], "respuesta": { "visita_1": { "tipo": "radio", "opciones": ["SI", "NO", "N/A"] }, "cierre": { "tipo": "radio", "opciones": ["SI", "NO"] } }, "pregunta": "Cuando haya conductores en paralelo (sólo para mayores a calibres 1/0 AWG de Cu o Al) en varios conductos o cables, como lo permite el Artículo 310-4, el conductor de puesta a tierra de equipos, cuando exista está instalado en paralelo."
        },
        {
          "id": "PIS-015", "numero": 15, "numero_original_excel": 15, "seccion": "1. Tableros", "norma": "R.20.16.2.2.e", "tipo": "radio", "opciones": ["SI", "NO", "N/A"], "respuesta": { "visita_1": { "tipo": "radio", "opciones": ["SI", "NO", "N/A"] }, "cierre": { "tipo": "radio", "opciones": ["SI", "NO"] } }, "pregunta": "Cada circuito ramal presenta protección contra sobrecorriente."
        },
        {
          "id": "PIS-016", "numero": 16, "numero_original_excel": 16, "seccion": "1. Tableros", "norma": "R.27.4.1.e", "tipo": "radio", "opciones": ["SI", "NO", "N/A"], "respuesta": { "visita_1": { "tipo": "radio", "opciones": ["SI", "NO", "N/A"] }, "cierre": { "tipo": "radio", "opciones": ["SI", "NO"] } }, "pregunta": "Cada circuito dispone de dispositivo de corte automático de la alimentación."
        },
        {
          "id": "PIS-017", "numero": 17, "numero_original_excel": 17, "seccion": "1. Tableros", "norma": "R.20.16.2.2.a", "tipo": "radio", "opciones": ["SI", "NO", "N/A"], "respuesta": { "visita_1": { "tipo": "radio", "opciones": ["SI", "NO", "N/A"] }, "cierre": { "tipo": "radio", "opciones": ["SI", "NO"] } }, "pregunta": "En los interruptores automáticos el circuito alimentador llegue al terminal línea y la salida se conecte a los terminales carga."
        },
        {
          "id": "PIS-018", "numero": 18, "numero_original_excel": 18, "seccion": "1. Tableros", "norma": "R.20.16.2.2.b", "tipo": "radio", "opciones": ["SI", "NO", "N/A"], "respuesta": { "visita_1": { "tipo": "radio", "opciones": ["SI", "NO", "N/A"] }, "cierre": { "tipo": "radio", "opciones": ["SI", "NO"] } }, "pregunta": "Los interruptores automáticos tienen unas especificaciones de corriente y tensión, no menores a los valores nominales de los circuitos que controlan."
        },
        {
          "id": "PIS-019", "numero": 19, "numero_original_excel": 19, "seccion": "1. Tableros", "norma": "R. 20.23.1.3. c.", "tipo": "radio", "opciones": ["SI", "NO", "N/A"], "respuesta": { "visita_1": { "tipo": "radio", "opciones": ["SI", "NO", "N/A"] }, "cierre": { "tipo": "radio", "opciones": ["SI", "NO"] } }, "pregunta": "El tablero cuenta con barrajes de tierra y neutro, con suficientes terminales de salida."
        },
        {
          "id": "PIS-020", "numero": 20, "numero_original_excel": 20, "seccion": "1. Tableros", "norma": "R.20.12.2.a", "tipo": "radio", "opciones": ["SI", "NO", "N/A"], "respuesta": { "visita_1": { "tipo": "radio", "opciones": ["SI", "NO", "N/A"] }, "cierre": { "tipo": "radio", "opciones": ["SI", "NO"] } }, "pregunta": "No se instala dos o más conectores o terminales en la misma bornera o al mismo tornillo."
        },
        {
          "id": "PIS-021", "numero": 21, "numero_original_excel": 21, "seccion": "1. Tableros", "norma": "R.20.23.1.2.e", "tipo": "radio", "opciones": ["SI", "NO", "N/A"], "respuesta": { "visita_1": { "tipo": "radio", "opciones": ["SI", "NO", "N/A"] }, "cierre": { "tipo": "radio", "opciones": ["SI", "NO"] } }, "pregunta": "El tablero se encuentra sólidamente puesto a tierra."
        },
        {
          "id": "PIS-022", "numero": 22, "numero_original_excel": 22, "seccion": "1. Tableros", "norma": "R. 15.3.3.d.", "tipo": "radio", "opciones": ["SI", "NO", "N/A"], "respuesta": { "visita_1": { "tipo": "radio", "opciones": ["SI", "NO", "N/A"] }, "cierre": { "tipo": "radio", "opciones": ["SI", "NO"] } }, "pregunta": "El conductor de puesta a tierra de equipos acompaña los conductores activos durante todo su recorrido y por la misma canalización."
        },
        {
          "id": "PIS-023", "numero": 23, "numero_original_excel": 23, "seccion": "1. Tableros", "norma": "R.15.3.3.c", "tipo": "radio", "opciones": ["SI", "NO", "N/A"], "respuesta": { "visita_1": { "tipo": "radio", "opciones": ["SI", "NO", "N/A"] }, "cierre": { "tipo": "radio", "opciones": ["SI", "NO"] } }, "pregunta": "El Conductor de puesta a tierra de equipos es continuo, sin interruptores o medios de desconexión y cuando se empalmen (es mecánica y eléctricamente seguro con soldadura o conector certificados para tal uso)"
        },
        {
          "id": "PIS-024", "numero": 24, "numero_original_excel": 24, "seccion": "1. Tableros", "norma": "R.15.3.3.e", "tipo": "radio", "opciones": ["SI", "NO", "N/A"], "respuesta": { "visita_1": { "tipo": "radio", "opciones": ["SI", "NO", "N/A"] }, "cierre": { "tipo": "radio", "opciones": ["SI", "NO"] } }, "pregunta": "El Conductor de puesta a tierra de equipos que por disposición de la instalación se requieran aislar, son de color verde, verde con rayas amarillas o identificados con marcas verdes en puntos de inspección y extremos"
        },
        {
          "id": "PIS-025", "numero": 25, "numero_original_excel": 25, "seccion": "1. Tableros", "norma": "N. 250-95", "tipo": "radio", "opciones": ["SI", "NO", "N/A"], "respuesta": { "visita_1": { "tipo": "radio", "opciones": ["SI", "NO", "N/A"] }, "cierre": { "tipo": "radio", "opciones": ["SI", "NO"] } }, "pregunta": "El conductor de tierra de cada circuito ramal cumple el calibre mínimo dado en la tabla 250-95 NTC 2050."
        },
        {
          "id": "PIS-026", "numero": 26, "numero_original_excel": 26, "seccion": "1. Tableros", "norma": "N.280-21", "tipo": "radio", "opciones": ["SI", "NO", "N/A"], "respuesta": { "visita_1": { "tipo": "radio", "opciones": ["SI", "NO", "N/A"] }, "cierre": { "tipo": "radio", "opciones": ["SI", "NO"] } }, "pregunta": "Circuito de menos de 1000 V los conductores de conexión DPS a la red y a tierra no son de calibre menor a 14 AWG en Cu o 12 AWG en Al."
        },
        {
          "id": "PIS-027", "numero": 27, "numero_original_excel": 27, "seccion": "1. Tableros", "norma": "N.280-4.a", "tipo": "radio", "opciones": ["SI", "NO", "N/A"], "respuesta": { "visita_1": { "tipo": "radio", "opciones": ["SI", "NO", "N/A"] }, "cierre": { "tipo": "radio", "opciones": ["SI", "NO"] } }, "pregunta": "Circuito de menos de 1000 V el valor nominal del descargador de sobretensiones es = o mayor que la máxima tensión continua de fase a tierra"
        },
        {
          "id": "PIS-028", "numero": 28, "numero_original_excel": 28, "seccion": "1. Tableros", "norma": "R.20.23.4.o", "tipo": "radio", "opciones": ["SI", "NO", "N/A"], "respuesta": { "visita_1": { "tipo": "radio", "opciones": ["SI", "NO", "N/A"] }, "cierre": { "tipo": "radio", "opciones": ["SI", "NO"] } }, "pregunta": "Realizar las pruebas de aislamiento: Las mediciones se realizan usando un megómetro a una tensión de por lo menos 500 Vcc. El valor de la resistencia de aislamiento no es menor de 1000 Ω/V."
        },
        {
          "id": "PIS-029", "numero": 29, "numero_original_excel": 29, "seccion": "1. Tableros", "norma": "R.20.23.4.o", "tipo": "radio", "opciones": ["SI", "NO", "N/A"], "respuesta": { "visita_1": { "tipo": "radio", "opciones": ["SI", "NO", "N/A"] }, "cierre": { "tipo": "radio", "opciones": ["SI", "NO"] } }, "pregunta": "Se deben realizar las siguientes verificaciones:\n1. Funcionalidad de las rejillas de ventilación, las tapas laterales y las puertas. 2. Identificaciones del tablero y de los conductores de control y potencia. 3. Conexión a tierra de las puertas. 4. Remover el polvo. 5. Medir equipotencialidad entre partes conductoras del tablero. 6. Verificar los torques de las uniones mecánicas, eléctricas y de anclaje. 7. Verificar  los enclavamientos mecánicos de los equipos del tablero. 8. Inspeccionar visualmente de toda la estructura del tablero, especialmente la pintura. 9.Remover todos los objetos extraños (restos de cables, tuercas, tornillos, etc)"
        }
      ]
    },
    {
      "titulo": "2. Requisitos Generales",
      "rango": "30-44",
      "total_preguntas": 15,
      "tipo_respuesta_principal": "radio",
      "opciones_visita_1": ["SI", "NO", "N/A"],
      "opciones_cierre": ["SI", "NO"],
      "preguntas": [
        {
          "id": "PIS-030", "numero": 30, "numero_original_excel": 30, "seccion": "2. Requisitos Generales", "norma": "R. 28.3.9 b.", "tipo": "radio", "opciones": ["SI", "NO", "N/A"], "respuesta": { "visita_1": { "tipo": "radio", "opciones": ["SI", "NO", "N/A"] }, "cierre": { "tipo": "radio", "opciones": ["SI", "NO"] } }, "pregunta": "Las instalaciones de alumbrado dentro de la piscina, son alimentadas desde un transformador de aislamiento de 12 V de salida no puesto a tierra y con pantalla electrostática entre los devanados, y su primario debe trabajar a una tensión menor o igual a 150 V. El transformador esta certificado para este uso particular e identificado para su uso"
        },
        {
          "id": "PIS-031", "numero": 31, "numero_original_excel": 31, "seccion": "2. Requisitos Generales", "norma": "R. 28.3.9 b.", "tipo": "radio", "opciones": ["SI", "NO", "N/A"], "respuesta": { "visita_1": { "tipo": "radio", "opciones": ["SI", "NO", "N/A"] }, "cierre": { "tipo": "radio", "opciones": ["SI", "NO"] } }, "pregunta": "Si no se utiliza transformador, la instalación eléctrica de la piscina se alimenta directamente desde un ramal protegido por un interruptor diferencial de falla a tierra para luminarias que operan a más de 15 V pero no más de 150 V."
        },
        {
          "id": "PIS-032", "numero": 32, "numero_original_excel": 32, "seccion": "2. Requisitos Generales", "norma": "R.17.1.c", "tipo": "radio", "opciones": ["SI", "NO", "N/A"], "respuesta": { "visita_1": { "tipo": "radio", "opciones": ["SI", "NO", "N/A"] }, "cierre": { "tipo": "radio", "opciones": ["SI", "NO"] } }, "pregunta": "Se verifica funcionamiento de las luminarias de emergencia por un periodo minimo de 60 minutos despues de que se interrumpa el servicio electrico normal"
        },
        {
          "id": "PIS-033", "numero": 33, "numero_original_excel": 33, "seccion": "2. Requisitos Generales", "norma": "N. 680-5. c)", "tipo": "radio", "opciones": ["SI", "NO", "N/A"], "respuesta": { "visita_1": { "tipo": "radio", "opciones": ["SI", "NO", "N/A"] }, "cierre": { "tipo": "radio", "opciones": ["SI", "NO"] } }, "pregunta": "Los conductores del lado de la carga de los interruptores de circuito por falla a tierra o de los transformadores, no se instalaron en canalizaciones, cajas o encerramientos con otros conductores."
        },
        {
          "id": "PIS-034", "numero": 34, "numero_original_excel": 34, "seccion": "2. Requisitos Generales", "norma": "N. 680.6. a) 1)", "tipo": "radio", "opciones": ["SI", "NO", "N/A"], "respuesta": { "visita_1": { "tipo": "radio", "opciones": ["SI", "NO", "N/A"] }, "cierre": { "tipo": "radio", "opciones": ["SI", "NO"] } }, "pregunta": "Los tomacorrientes están ubicados a mínimo 3 m de las paredes interiores de la piscina o fuente. Excepción: Si el anterior requisito no se cumple, es decir existen uno o varios tomacorrientes instalados entre 1,5 m y 3,0 m de las paredes interiores de la piscina o fuente, son sencillos, del tipo de seguridad, con polo a tierra y protegidos mediante un interruptor de circuito por falla a tierra."
        },
        {
          "id": "PIS-035", "numero": 35, "numero_original_excel": 35, "seccion": "2. Requisitos Generales", "norma": "N. 680.6. a) 2)", "tipo": "radio", "opciones": ["SI", "NO", "N/A"], "respuesta": { "visita_1": { "tipo": "radio", "opciones": ["SI", "NO", "N/A"] }, "cierre": { "tipo": "radio", "opciones": ["SI", "NO"] } }, "pregunta": "Si hay una piscina permanente en una vivienda, existe por lo menos un tomacorriente de 125 V ubicado a minino 3 m, pero no mas de 6 m de la pared interior de la piscina y a no mas de 2 m de altura sobre el nivel del suelo o de la plataforma de acceso a la piscina."
        },
        {
          "id": "PIS-036", "numero": 36, "numero_original_excel": 36, "seccion": "2. Requisitos Generales", "norma": "N. 680.6. a) 3)", "tipo": "radio", "opciones": ["SI", "NO", "N/A"], "respuesta": { "visita_1": { "tipo": "radio", "opciones": ["SI", "NO", "N/A"] }, "cierre": { "tipo": "radio", "opciones": ["SI", "NO"] } }, "pregunta": "Los tomacorrientes de 125 V ubicados a menos de 6 m de las paredes interiores de la piscina o fuente están protegidos por un interruptor de circuito por falla a tierra."
        },
        {
          "id": "PIS-037", "numero": 37, "numero_original_excel": 37, "seccion": "2. Requisitos Generales", "norma": "N. 680.6. b) 1)", "tipo": "radio", "opciones": ["SI", "NO", "N/A"], "respuesta": { "visita_1": { "tipo": "radio", "opciones": ["SI", "NO", "N/A"] }, "cierre": { "tipo": "radio", "opciones": ["SI", "NO"] } }, "pregunta": "Sobre la piscina o sobre el área que se extiende a 1,5 m en horizontal desde las paredes interiores la piscina, NO hay salidas de alumbrado ni ventiladores de techo. Excepción 1: Las salidas y aparatos de alumbrado instalados y ubicados a menos de 1,5 m en horizontal desde las paredes interiores de la piscina, se encuentran a no menos de 1,5 m sobre el nivel máximo de la superficie del agua, rígidamente sujetos a la estructura existente y protegidos mediante un interruptor de circuito por falla a tierra. Excepción 2: Si hay piscinas cubiertas no se aplican los límites del Artículo 680-6.b).1) si se cumplen las condiciones siguientes: \n1) todos los aparatos son de tipo completamente cerrado\n2) hay instalado un interruptor de circuito por falla a tierra en el circuito ramal que alimenta los aparatos de alumbrado o ventiladores de techo\n3) la distancia entre la parte inferior del aparato de alumbrado o del ventilador y el nivel máximo de la superficie del agua no es menor a 2,3 m."
        },
        {
          "id": "PIS-038", "numero": 38, "numero_original_excel": 38, "seccion": "2. Requisitos Generales", "norma": "N. 680.6. b) 2)", "tipo": "radio", "opciones": ["SI", "NO", "N/A"], "respuesta": { "visita_1": { "tipo": "radio", "opciones": ["SI", "NO", "N/A"] }, "cierre": { "tipo": "radio", "opciones": ["SI", "NO"] } }, "pregunta": "Las salidas y aparatos de alumbrado instalados en la zona ubicada entre 1,5 m y 3 m en horizontal desde las paredes interiores de la piscina están protegidos mediante un interruptor de circuito por falla a tierra."
        },
        {
          "id": "PIS-039", "numero": 39, "numero_original_excel": 39, "seccion": "2. Requisitos Generales", "norma": "N. 680.6. b) 3)", "tipo": "radio", "opciones": ["SI", "NO", "N/A"], "respuesta": { "visita_1": { "tipo": "radio", "opciones": ["SI", "NO", "N/A"] }, "cierre": { "tipo": "radio", "opciones": ["SI", "NO"] } }, "pregunta": "Las salidas para alumbrado, aparatos de alumbrado y ventiladores de techo instalados a menos de 4,8 m de cualquier punto de la superficie del agua, medidos en sentido radial, están conectados con clavija con polo a tierra y cordón de no más 0,9 m de largo e incluir conductor de tierra de cobre de sección no menor a 12 AWG."
        },
        {
          "id": "PIS-040", "numero": 40, "numero_original_excel": 40, "seccion": "2. Requisitos Generales", "norma": "N. 680.6. c)", "tipo": "radio", "opciones": ["SI", "NO", "N/A"], "respuesta": { "visita_1": { "tipo": "radio", "opciones": ["SI", "NO", "N/A"] }, "cierre": { "tipo": "radio", "opciones": ["SI", "NO"] } }, "pregunta": "Los interruptores están ubicados como mínimo a una distancia horizontal de 1,5 m de las paredes interiores de la piscina."
        },
        {
          "id": "PIS-041", "numero": 41, "numero_original_excel": 41, "seccion": "2. Requisitos Generales", "norma": "N. 680.9.", "tipo": "radio", "opciones": ["SI", "NO", "N/A"], "respuesta": { "visita_1": { "tipo": "radio", "opciones": ["SI", "NO", "N/A"] }, "cierre": { "tipo": "radio", "opciones": ["SI", "NO"] } }, "pregunta": "Los calentadores de agua tienen sus elementos radiantes divididos en cargas que no pasen de 48 A y están protegidos a no mas de 60 A. La capacidad de corriente de los conductores del circuito ramal y la corriente nominal o de ajuste de los dispositivos de protección contra sobrecorriente no son menores al 125% de la carga total nominal que aparece en la placa de características"
        },
        {
          "id": "PIS-042", "numero": 42, "numero_original_excel": 42, "seccion": "2. Requisitos Generales", "norma": "N. 680.10.", "tipo": "radio", "opciones": ["SI", "NO", "N/A"], "respuesta": { "visita_1": { "tipo": "radio", "opciones": ["SI", "NO", "N/A"] }, "cierre": { "tipo": "radio", "opciones": ["SI", "NO"] } }, "pregunta": "NO existe alambrado subterráneo bajo la piscina ni dentro de un área que va hasta 1,52 m en horizontal de las paredes interiores de la piscina. Excepción 2: Cuando la falta de espacio no permita instalar el alambrado a más de 1,50 m de las paredes de la piscina, se permite instalarlos en tubo de metal rígido, tubo metálico intermedio o en un sistema de canalización no metálico. Todos los tubos metálicos son resistentes a la corrosión y adecuados para su instalación en ese lugar. La distancia mínima de enterramiento es la siguiente:", "recursos_visuales": [ { "id": "piscinas_imagen_4", "tipo": "image", "file": "PISCINAS_IMAGEN_4.png", "anchor": { "row": 188, "column": 3 }, "width": 388, "height": 90, "format": "png", "rol": "recurso_visual_pregunta_42", "descripcion": "Imagen/tabla ubicada en la zona de la pregunta 42 sobre alambrado subterráneo/distancias." } ], "nota_interfaz": "Mostrar la imagen/tabla asociada justo debajo de la pregunta 42."
        },
        {
          "id": "PIS-043", "numero": 43, "numero_original_excel": 43, "seccion": "2. Requisitos Generales", "norma": "N. 680.11.", "tipo": "radio", "opciones": ["SI", "NO", "N/A"], "respuesta": { "visita_1": { "tipo": "radio", "opciones": ["SI", "NO", "N/A"] }, "cierre": { "tipo": "radio", "opciones": ["SI", "NO"] } }, "pregunta": "Los cuartos o pozos de equipos eléctricos cuentan con un drenaje adecuado que impida la acumulación de agua durante el funcionamiento normal o mantenimiento de los filtros."
        },
        {
          "id": "PIS-044", "numero": 44, "numero_original_excel": 44, "seccion": "2. Requisitos Generales", "norma": "N. 680.12.", "tipo": "radio", "opciones": ["SI", "NO", "N/A"], "respuesta": { "visita_1": { "tipo": "radio", "opciones": ["SI", "NO", "N/A"] }, "cierre": { "tipo": "radio", "opciones": ["SI", "NO"] } }, "pregunta": "Los medios de desconexión son accesibles, están ubicados a la vista de los equipos de la piscina y a una distancia mínima de 1,5 m en horizontal desde las paredes inferiores de la piscina."
        }
      ]
    },
    {
      "titulo": "3. Aparatos de alumbrado bajo el agua. NTC 680.20.",
      "rango": "45-59",
      "total_preguntas": 15,
      "tipo_respuesta_principal": "radio",
      "opciones_visita_1": ["SI", "NO", "N/A"],
      "opciones_cierre": ["SI", "NO"],
      "preguntas": [
        {
          "id": "PIS-045", "numero": 45, "numero_original_excel": 45, "seccion": "3. Aparatos de alumbrado bajo el agua. NTC 680.20.", "norma": "a) - 1)", "tipo": "radio", "opciones": ["SI", "NO", "N/A"], "respuesta": { "visita_1": { "tipo": "radio", "opciones": ["SI", "NO", "N/A"] }, "cierre": { "tipo": "radio", "opciones": ["SI", "NO"] } }, "pregunta": "Los aparatos de alumbrado bajo el agua están aprobados para esta aplicación y están conectados a un circuito ramal con interruptor de circuito por falla a tierra."
        },
        {
          "id": "PIS-046", "numero": 46, "numero_original_excel": 46, "seccion": "3. Aparatos de alumbrado bajo el agua. NTC 680.20.", "norma": "a) - 2)", "tipo": "radio", "opciones": ["SI", "NO", "N/A"], "respuesta": { "visita_1": { "tipo": "radio", "opciones": ["SI", "NO", "N/A"] }, "cierre": { "tipo": "radio", "opciones": ["SI", "NO"] } }, "pregunta": "NO existen aparatos de alumbrado conectados a circuitos de mas de 150 V entre conductores."
        },
        {
          "id": "PIS-047", "numero": 47, "numero_original_excel": 47, "seccion": "3. Aparatos de alumbrado bajo el agua. NTC 680.20.", "norma": "a) - 3)", "tipo": "radio", "opciones": ["SI", "NO", "N/A"], "respuesta": { "visita_1": { "tipo": "radio", "opciones": ["SI", "NO", "N/A"] }, "cierre": { "tipo": "radio", "opciones": ["SI", "NO"] } }, "pregunta": "Los aparatos de alumbrado montados en las paredes de la piscina están instalados de modo que la parte superior del lente quede como minimo a 0,5 m por debajo del nivel normal del agua de la piscina. Excepción: Se permiten aparatos de alumbrado identificados para usarlos a profundidades no menores a 10 cm por debajo del nivel normal de agua de la piscina."
        },
        {
          "id": "PIS-048", "numero": 48, "numero_original_excel": 48, "seccion": "3. Aparatos de alumbrado bajo el agua. NTC 680.20.", "norma": "a) - 3)", "tipo": "radio", "opciones": ["SI", "NO", "N/A"], "respuesta": { "visita_1": { "tipo": "radio", "opciones": ["SI", "NO", "N/A"] }, "cierre": { "tipo": "radio", "opciones": ["SI", "NO"] } }, "pregunta": "Los aparatos de alumbrado instalados mirando hacia arriba, la lente esta debidamente resguardada para evitar cualquier contacto con las personas."
        },
        {
          "id": "PIS-049", "numero": 49, "numero_original_excel": 49, "seccion": "3. Aparatos de alumbrado bajo el agua. NTC 680.20.", "norma": "a) - 4)", "tipo": "radio", "opciones": ["SI", "NO", "N/A"], "respuesta": { "visita_1": { "tipo": "radio", "opciones": ["SI", "NO", "N/A"] }, "cierre": { "tipo": "radio", "opciones": ["SI", "NO"] } }, "pregunta": "Los aparatos que solo funcionan con seguridad sumergidos, se encuentran protegidos contra sobrecalentamiento cuando no están sumergidos."
        },
        {
          "id": "PIS-050", "numero": 50, "numero_original_excel": 50, "seccion": "3. Aparatos de alumbrado bajo el agua. NTC 680.20.", "norma": "b) - 1)", "tipo": "radio", "opciones": ["SI", "NO", "N/A"], "respuesta": { "visita_1": { "tipo": "radio", "opciones": ["SI", "NO", "N/A"] }, "cierre": { "tipo": "radio", "opciones": ["SI", "NO"] } }, "pregunta": "Nicho mojado. Se instalan cascos moldeados que tienen entradas para los tubos conduit."
        },
        {
          "id": "PIS-051", "numero": 51, "numero_original_excel": 51, "seccion": "3. Aparatos de alumbrado bajo el agua. NTC 680.20.", "norma": "b) - 1)", "tipo": "radio", "opciones": ["SI", "NO", "N/A"], "respuesta": { "visita_1": { "tipo": "radio", "opciones": ["SI", "NO", "N/A"] }, "cierre": { "tipo": "radio", "opciones": ["SI", "NO"] } }, "pregunta": "Nicho mojado. La instalación desde el casco moldeado hasta una caja u otro encerramiento se hace en tubo RMC, tubo IMC, tubo no metálico flexible y hermético a los líquidos o tubo no metálico rígido."
        },
        {
          "id": "PIS-052", "numero": 52, "numero_original_excel": 52, "seccion": "3. Aparatos de alumbrado bajo el agua. NTC 680.20.", "norma": "b) - 1)", "tipo": "radio", "opciones": ["SI", "NO", "N/A"], "respuesta": { "visita_1": { "tipo": "radio", "opciones": ["SI", "NO", "N/A"] }, "cierre": { "tipo": "radio", "opciones": ["SI", "NO"] } }, "pregunta": "Nicho mojado. Si se utiliza tubo no metálico, en los tubos se instala un conductor aislado de cobre 8 AWG."
        },
        {
          "id": "PIS-053", "numero": 53, "numero_original_excel": 53, "seccion": "3. Aparatos de alumbrado bajo el agua. NTC 680.20.", "norma": "b) - 1)", "tipo": "radio", "opciones": ["SI", "NO", "N/A"], "respuesta": { "visita_1": { "tipo": "radio", "opciones": ["SI", "NO", "N/A"] }, "cierre": { "tipo": "radio", "opciones": ["SI", "NO"] } }, "pregunta": "Nicho mojado. Las partes metálicas del aparato y del casco que estén en contacto con el agua de la piscina son de bronce u otro metal resistente a la corrosión."
        },
        {
          "id": "PIS-054", "numero": 54, "numero_original_excel": 54, "seccion": "3. Aparatos de alumbrado bajo el agua. NTC 680.20.", "norma": "b) - 2)", "tipo": "radio", "opciones": ["SI", "NO", "N/A"], "respuesta": { "visita_1": { "tipo": "radio", "opciones": ["SI", "NO", "N/A"] }, "cierre": { "tipo": "radio", "opciones": ["SI", "NO"] } }, "pregunta": "Nicho mojado. Los conductores de alimentación o de puesta a tierra que llegan al aparato de alumbrado, se cubren con una masilla que evite la entrada de agua en el aparato a través de los conductores."
        },
        {
          "id": "PIS-055", "numero": 55, "numero_original_excel": 55, "seccion": "3. Aparatos de alumbrado bajo el agua. NTC 680.20.", "norma": "b) - 3)", "tipo": "radio", "opciones": ["SI", "NO", "N/A"], "respuesta": { "visita_1": { "tipo": "radio", "opciones": ["SI", "NO", "N/A"] }, "cierre": { "tipo": "radio", "opciones": ["SI", "NO"] } }, "pregunta": "Nicho mojado. El aparato de alumbrado se encuentra conectado equipotencialmente al casco moldeado, y se asegura que sea necesario el uso de una herramienta para separar el aparato de alumbrado del casco moldeado."
        },
        {
          "id": "PIS-056", "numero": 56, "numero_original_excel": 56, "seccion": "3. Aparatos de alumbrado bajo el agua. NTC 680.20.", "norma": "c) - 1)", "tipo": "radio", "opciones": ["SI", "NO", "N/A"], "respuesta": { "visita_1": { "tipo": "radio", "opciones": ["SI", "NO", "N/A"] }, "cierre": { "tipo": "radio", "opciones": ["SI", "NO"] } }, "pregunta": "Nicho seco. El aparato de alumbrado tiene un medio para drenar el agua."
        },
        {
          "id": "PIS-057", "numero": 57, "numero_original_excel": 57, "seccion": "3. Aparatos de alumbrado bajo el agua. NTC 680.20.", "norma": "c) - 2)", "tipo": "radio", "opciones": ["SI", "NO", "N/A"], "respuesta": { "visita_1": { "tipo": "radio", "opciones": ["SI", "NO", "N/A"] }, "cierre": { "tipo": "radio", "opciones": ["SI", "NO"] } }, "pregunta": "Nicho seco. El aparato de alumbrado tiene un medio para conectar un conductor de puesta a tierra por cada entrada de tubo conduit."
        },
        {
          "id": "PIS-058", "numero": 58, "numero_original_excel": 58, "seccion": "3. Aparatos de alumbrado bajo el agua. NTC 680.20.", "norma": "c)", "tipo": "radio", "opciones": ["SI", "NO", "N/A"], "respuesta": { "visita_1": { "tipo": "radio", "opciones": ["SI", "NO", "N/A"] }, "cierre": { "tipo": "radio", "opciones": ["SI", "NO"] } }, "pregunta": "Nicho seco. Desde el aparato de alumbrado hasta el panel de distribución o equipo de acometida, la instalación se hace en tubo RMC, tubo IMC o tubo rígido no metálico."
        },
        {
          "id": "PIS-059", "numero": 59, "numero_original_excel": 59, "seccion": "3. Aparatos de alumbrado bajo el agua. NTC 680.20.", "norma": "d)", "tipo": "radio", "opciones": ["SI", "NO", "N/A"], "respuesta": { "visita_1": { "tipo": "radio", "opciones": ["SI", "NO", "N/A"] }, "cierre": { "tipo": "radio", "opciones": ["SI", "NO"] } }, "pregunta": "Sin nicho. Los aparatos de alumbrado están certificados para este uso."
        }
      ]
    },
    {
      "titulo": "4. Cajas de unión y encerramiento para transformadores o interruptores de circuito por falla a tierra. NTC 680-21 (Aparato de alumbrado sin nicho)",
      "rango": "60-65",
      "total_preguntas": 6,
      "tipo_respuesta_principal": "radio",
      "opciones_visita_1": ["SI", "NO", "N/A"],
      "opciones_cierre": ["SI", "NO"],
      "preguntas": [
        {
          "id": "PIS-060", "numero": 60, "numero_original_excel": 60, "seccion": "4. Cajas de unión y encerramiento para transformadores o interruptores de circuito por falla a tierra. NTC 680-21 (Aparato de alumbrado sin nicho)", "norma": "a) - 1)", "tipo": "radio", "opciones": ["SI", "NO", "N/A"], "respuesta": { "visita_1": { "tipo": "radio", "opciones": ["SI", "NO", "N/A"] }, "cierre": { "tipo": "radio", "opciones": ["SI", "NO"] } }, "pregunta": "La caja de unión esta equipada con entradas o acoples roscados o con acople no metálico certificado para este fin."
        },
        {
          "id": "PIS-061", "numero": 61, "numero_original_excel": 61, "seccion": "4. Cajas de unión y encerramiento para transformadores o interruptores de circuito por falla a tierra. NTC 680-21 (Aparato de alumbrado sin nicho)", "norma": "a) - 2)", "tipo": "radio", "opciones": ["SI", "NO", "N/A"], "respuesta": { "visita_1": { "tipo": "radio", "opciones": ["SI", "NO", "N/A"] }, "cierre": { "tipo": "radio", "opciones": ["SI", "NO"] } }, "pregunta": "La caja de unión es de cobre, bronce, plástico adecuado u otro material aprobado resistente a la corrosión."
        },
        {
          "id": "PIS-062", "numero": 62, "numero_original_excel": 62, "seccion": "4. Cajas de unión y encerramiento para transformadores o interruptores de circuito por falla a tierra. NTC 680-21 (Aparato de alumbrado sin nicho)", "norma": "a) - 3)", "tipo": "radio", "opciones": ["SI", "NO", "N/A"], "respuesta": { "visita_1": { "tipo": "radio", "opciones": ["SI", "NO", "N/A"] }, "cierre": { "tipo": "radio", "opciones": ["SI", "NO"] } }, "pregunta": "Se ofrece continuidad eléctrica en todos los tubos metálicos y los terminales de puesta a tierra."
        },
        {
          "id": "PIS-063", "numero": 63, "numero_original_excel": 63, "seccion": "4. Cajas de unión y encerramiento para transformadores o interruptores de circuito por falla a tierra. NTC 680-21 (Aparato de alumbrado sin nicho)", "norma": "a) - 4)", "tipo": "radio", "opciones": ["SI", "NO", "N/A"], "respuesta": { "visita_1": { "tipo": "radio", "opciones": ["SI", "NO", "N/A"] }, "cierre": { "tipo": "radio", "opciones": ["SI", "NO"] } }, "pregunta": "La caja de unión esta ubicada a no menos de 10 cm sobre el nivel del suelo o el borde de la piscina, o a una distancia no menor a 20 cm sobre le nivel máximo de la superficie del agua de la piscina, y a no menos de 1,2 m de la pared interior de la piscina, a menos que este separada de ella por una valla solida, pared u otra barrera permanente."
        },
        {
          "id": "PIS-064", "numero": 64, "numero_original_excel": 64, "seccion": "4. Cajas de unión y encerramiento para transformadores o interruptores de circuito por falla a tierra. NTC 680-21 (Aparato de alumbrado sin nicho)", "norma": "c)", "tipo": "radio", "opciones": ["SI", "NO", "N/A"], "respuesta": { "visita_1": { "tipo": "radio", "opciones": ["SI", "NO", "N/A"] }, "cierre": { "tipo": "radio", "opciones": ["SI", "NO"] } }, "pregunta": "Sobre el nivel del borde acabado que rodea la piscina NO hay cajas de unión ni encerramientos a menos que tengan una protección adicional."
        },
        {
          "id": "PIS-065", "numero": 65, "numero_original_excel": 65, "seccion": "4. Cajas de unión y encerramiento para transformadores o interruptores de circuito por falla a tierra. NTC 680-21 (Aparato de alumbrado sin nicho)", "norma": "d)", "tipo": "radio", "opciones": ["SI", "NO", "N/A"], "respuesta": { "visita_1": { "tipo": "radio", "opciones": ["SI", "NO", "N/A"] }, "cierre": { "tipo": "radio", "opciones": ["SI", "NO"] } }, "pregunta": "Las cajas de unión, carcasas de los transformadores y encerramientos de los interruptores de circuito por falla a tierra que están conectados a un tubo y van directamente a  un aparato de alumbrado sin nicho tienen terminales de puesta a tierra como mínimo uno mas que el numero de entradas de tubos."
        }
      ]
    },
    {
      "titulo": "5. Conexión equipotencial. NTC 680-22",
      "rango": "66-69",
      "total_preguntas": 4,
      "tipo_respuesta_principal": "radio",
      "opciones_visita_1": ["SI", "NO", "N/A"],
      "opciones_cierre": ["SI", "NO"],
      "preguntas": [
        {
          "id": "PIS-066", "numero": 66, "numero_original_excel": 66, "seccion": "5. Conexión equipotencial. NTC 680-22", "norma": "a)", "tipo": "radio", "opciones": ["SI", "NO", "N/A"], "respuesta": { "visita_1": { "tipo": "radio", "opciones": ["SI", "NO", "N/A"] }, "cierre": { "tipo": "radio", "opciones": ["SI", "NO"] } }, "pregunta": "Las siguientes parte de la piscina se encuentran equipotencializadas: \n1) Todas las partes metálicas de la estructura de la piscina, incluso los refuerzos metálicos, caballetes y borde.\n2) Todos los cascos moldeados y abrazaderas de montaje de los aparatos sin nicho\n3) Todos los herrajes metálicos de la estructura de la piscina o unidas a ella.\n4) Las partes metálicas de los equipos eléctricos del sistema de circulación del agua de las piscina, incluidos los motores de las bombas\n5) Las partes metálicas de los equipos asociados con la tapa de la piscina, incluidos los motores.\n6) Los recubrimientos metálicos de los cables y canalizaciones, las tuberías metálicas y todas las partes metálicas que estén a menos de 1,5 m en horizontal desde las paredes interiores de la piscina y a menos de 3,6 m sobre el nivel máximo de la superficie del agua o de cualquier puesto, torre o plataforma de observación."
        },
        {
          "id": "PIS-067", "numero": 67, "numero_original_excel": 67, "seccion": "5. Conexión equipotencial. NTC 680-22", "norma": "b)", "tipo": "radio", "opciones": ["SI", "NO", "N/A"], "respuesta": { "visita_1": { "tipo": "radio", "opciones": ["SI", "NO", "N/A"] }, "cierre": { "tipo": "radio", "opciones": ["SI", "NO"] } }, "pregunta": "Todas las partes enunciadas en el ítem anterior se encuentran conectadas a una rejilla común de conexión equipotencial mediante un conductor de cobre solido de calibre no menor a 8 AWG."
        },
        {
          "id": "PIS-068", "numero": 68, "numero_original_excel": 68, "seccion": "5. Conexión equipotencial. NTC 680-22", "norma": "c)", "tipo": "radio", "opciones": ["SI", "NO", "N/A"], "respuesta": { "visita_1": { "tipo": "radio", "opciones": ["SI", "NO", "N/A"] }, "cierre": { "tipo": "radio", "opciones": ["SI", "NO"] } }, "pregunta": "Los calentadores de agua de mas de 50 A, solo están conectadas equipotencialmente las partes designadas para ello."
        },
        {
          "id": "PIS-069", "numero": 69, "numero_original_excel": 69, "seccion": "5. Conexión equipotencial. NTC 680-22", "norma": "N. 680.23.", "tipo": "radio", "opciones": ["SI", "NO", "N/A"], "respuesta": { "visita_1": { "tipo": "radio", "opciones": ["SI", "NO", "N/A"] }, "cierre": { "tipo": "radio", "opciones": ["SI", "NO"] } }, "pregunta": "Los equipos sonoros instalados bajo el agua están identificados para ese uso."
        }
      ]
    },
    {
      "titulo": "6. Puesta a tierra. NTC 680-24 - NTC 680-25.",
      "rango": "70-74",
      "total_preguntas": 6,
      "tipo_respuesta_principal": "radio",
      "opciones_visita_1": ["SI", "NO", "N/A"],
      "opciones_cierre": ["SI", "NO"],
      "preguntas": [
        {
          "id": "PIS-070", "numero": 70, "numero_original_excel": 70, "seccion": "6. Puesta a tierra. NTC 680-24 - NTC 680-25.", "norma": "N. 680-24.", "tipo": "radio", "opciones": ["SI", "NO", "N/A"], "respuesta": { "visita_1": { "tipo": "radio", "opciones": ["SI", "NO", "N/A"] }, "cierre": { "tipo": "radio", "opciones": ["SI", "NO"] } }, "pregunta": "Los siguiente equipos están puestos a tierra: \n1) Los aparatos de alumbrado bajo el agua de nicho mojado y sin nicho.\n2) Los aparatos de alumbrado bajo el agua de nicho seco\n3) Todos los equipos eléctricos ubicados a menos de 1,5 m de la pared interior de la piscina\n4) Todos los equipos eléctricos del sistema de recirculación de agua de la piscina\n5) Las cajas de unión\n6) Las carcasas de los transformadores\n7) Los interruptores de circuito por falla a tierra.\n8) Los tableros de distribución que no formen parte de la acometida y que correspondan a cualquier equipo eléctrico de la piscina."
        },
        {
          "id": "PIS-071", "numero": 71, "numero_original_excel": 71, "seccion": "6. Puesta a tierra. NTC 680-24 - NTC 680-25.", "norma": "N. 680-25. b) 1)", "tipo": "radio", "opciones": ["SI", "NO", "N/A"], "respuesta": { "visita_1": { "tipo": "radio", "opciones": ["SI", "NO", "N/A"] }, "cierre": { "tipo": "radio", "opciones": ["SI", "NO"] } }, "pregunta": "Los aparatos de alumbrado de nicho mojado, de nicho seco o sin nicho se encuentran conectados a tierra con un conductor de calibre no menor a 12 AWG, el conductor es de cobre y aislado. Se instala con los conductores del circuito y en tubería RMC, IMC o tubo rígido no metálico."
        },
        {
          "id": "PIS-072", "numero": 72, "numero_original_excel": 72, "seccion": "6. Puesta a tierra. NTC 680-24 - NTC 680-25.", "norma": "N. 680-25. b) 2)", "tipo": "radio", "opciones": ["SI", "NO", "N/A"], "respuesta": { "visita_1": { "tipo": "radio", "opciones": ["SI", "NO", "N/A"] }, "cierre": { "tipo": "radio", "opciones": ["SI", "NO"] } }, "pregunta": "La caja de unión, carcasa del transformador u otro encerramiento del circuito de suministro de los aparatos de alumbrado están puestos a tierra en el terminal de tierra del tablero de distribución."
        },
        {
          "id": "PIS-073", "numero": 73, "numero_original_excel": 73, "seccion": "6. Puesta a tierra. NTC 680-24 - NTC 680-25.", "norma": "N. 680-25. b) 2)", "tipo": "radio", "opciones": ["SI", "NO", "N/A"], "respuesta": { "visita_1": { "tipo": "radio", "opciones": ["SI", "NO", "N/A"] }, "cierre": { "tipo": "radio", "opciones": ["SI", "NO"] } }, "pregunta": "El conductor de puesta a tierra de equipos no tiene uniones ni empalmes."
        },
        {
          "id": "PIS-074", "numero": 74, "numero_original_excel": 74, "seccion": "6. Puesta a tierra. NTC 680-24 - NTC 680-25.", "norma": "N. 680-25. c)", "tipo": "radio", "opciones": ["SI", "NO", "N/A"], "respuesta": { "visita_1": { "tipo": "radio", "opciones": ["SI", "NO", "N/A"] }, "cierre": { "tipo": "radio", "opciones": ["SI", "NO"] } }, "pregunta": "Los motores que tienen que ver con la piscina están puestos a tierra, el calibre del conductor de tierra no es menor a 12 AWG, se encuentra instalado con los conductores del circuito y en tubo RMC, IMC, tubo rígido no metálico o un cable de Tipo MC y es de cobre aislado."
        },
        {
          "id": "PIS-074_DUP2", "numero": 75, "numero_original_excel": 74, "seccion": "6. Puesta a tierra. NTC 680-24 - NTC 680-25.", "norma": "N. 680-25. d)", "tipo": "radio", "opciones": ["SI", "NO", "N/A"], "respuesta": { "visita_1": { "tipo": "radio", "opciones": ["SI", "NO", "N/A"] }, "cierre": { "tipo": "radio", "opciones": ["SI", "NO"] } }, "pregunta": "Los tableros de distribución que no hacen parte de la acometida están puestos a tierra entre su terminal de puesta a tierra y el terminal de puesta a tierra del equipo de acometida, el conductor no es de calibre menor a 12 AWG, es aislado y estar instalado con los conductores del circuito de suministro en tubo RMC, IMC o tubo rígido no metálico."
        }
      ]
    },
    {
      "titulo": "7. Separación de conductores aéreos. NTC 680-8.",
      "rango": "76-77",
      "total_preguntas": 2,
      "tipo_respuesta_principal": "radio",
      "opciones_visita_1": ["SI", "NO", "N/A"],
      "opciones_cierre": ["SI", "NO"],
      "preguntas": [
        {
          "id": "PIS-076", "numero": 76, "numero_original_excel": 76, "seccion": "7. Separación de conductores aéreos. NTC 680-8.", "norma": "", "tipo": "radio", "opciones": ["SI", "NO", "N/A"], "respuesta": { "visita_1": { "tipo": "radio", "opciones": ["SI", "NO", "N/A"] }, "cierre": { "tipo": "radio", "opciones": ["SI", "NO"] } }, "pregunta": "Los conductores aéreos de la acometida, alambrado aéreo descubierto NO pasa encima de:\n- La piscina y el área que se extiende hasta 3 m en horizontal a partir de las paredes interiores de la piscina.\n- Estructuras de trampolines\n- Los puestos, torres o plataformas de observación"
        },
        {
          "id": "PIS-077", "numero": 77, "numero_original_excel": 77, "seccion": "7. Separación de conductores aéreos. NTC 680-8.", "norma": "Excepción 1)", "tipo": "radio", "opciones": ["SI", "NO", "N/A"], "respuesta": { "visita_1": { "tipo": "radio", "opciones": ["SI", "NO", "N/A"] }, "cierre": { "tipo": "radio", "opciones": ["SI", "NO"] } }, "pregunta": "Se permite que las estructuras mencionadas en los anteriores apartados 1), 2) y 3) estén instaladas bajo líneas de suministro o acometidas aéreas cuando en dichas instalaciones se dejen las separaciones indicadas en la Figura 680-8.", "recursos_visuales": [ { "id": "piscinas_imagen_5", "tipo": "image", "file": "PISCINAS_IMAGEN_5.png", "anchor": { "row": 270, "column": 3 }, "width": 510, "height": 272, "format": "png", "rol": "recurso_visual_pregunta_77", "descripcion": "Imagen/figura ubicada debajo de la sección Separación de conductores aéreos, asociada a la pregunta 77." }, { "id": "piscinas_imagen_6", "tipo": "image", "file": "PISCINAS_IMAGEN_6.png", "anchor": { "row": 286, "column": 3 }, "width": 402, "height": 232, "format": "png", "rol": "recurso_visual_pregunta_77", "descripcion": "Imagen/figura ubicada debajo de la sección Separación de conductores aéreos, asociada a la pregunta 77." } ], "nota_interfaz": "Mostrar las figuras asociadas justo debajo de la pregunta 77."
        }
      ]
    }
  ],
  "validacion_extraccion": {
    "preguntas_esperadas": 77,
    "preguntas_extraidas": 77,
    "estado": "OK"
  }
};

export default RETIE_PISCINAS_SCHEMA;