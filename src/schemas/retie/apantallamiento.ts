import { RETIEMasterSchema } from '../masterSchema';

export const RETIE_APANTALLAMIENTO_SCHEMA: RETIEMasterSchema = {
  hoja: "APANTALLAMIENTO",
  titulo: "LISTA DE CHEQUEO APANTALLAMIENTO",
  proceso: "GESTION DE INSPECCION",
  codigo: "F-GI-08",
  version: "1",
  fecha_formato: "20/01/2018",
  instruccion_excel: "Colocar  X o ü según la evaluación a cada uno de los ítems",
  tipo_principal: "radio",
  opciones_principales: ["SI", "NO", "N/A"],
  respuesta_por_defecto: {
    visita_1: { tipo: "radio", opciones: ["SI", "NO", "N/A"] },
    cierre: { tipo: "radio", opciones: ["SI", "NO"] }
  },
  campos_contexto: [
    { id: "codigo_servicio", label: "Código servicio", tipo: "text" },
    { id: "fecha_inspeccion", label: "Fecha de la inspección", tipo: "date" },
    { id: "fecha_cierre_no_conformidades", label: "Fecha de cierre no conformidades", tipo: "text" },
    { id: "observaciones", label: "Observaciones", tipo: "textarea" }
  ],
  total_preguntas: 24,
  secciones: [
    {
      titulo: "1. Requisitos generales",
      rango: "1-24",
      total_preguntas: 24,
      tipo_respuesta_principal: "radio",
      opciones_visita_1: ["SI", "NO", "N/A"],
      opciones_cierre: ["SI", "NO"],
      preguntas: [
        {
                "id": "APA-001",
                "numero": 1,
                "norma": "R 16.1",
                "pregunta": "Las instalacion inspeccionada cuentan con análisis de protección contra rayos."
        },
        {
                "id": "APA-002",
                "numero": 2,
                "norma": "R 16.1",
                "pregunta": "Las instalaciones de uso final con alta concentración de personas cuentan con una análisis de protección contra rayos."
        },
        {
                "id": "APA-003",
                "numero": 3,
                "norma": "R 16.1",
                "pregunta": "Si es una edificación aislada o es de una altura que sobresale de las demás cuenta con análisis de protección contra rayos."
        },
        {
                "id": "APA-004",
                "numero": 4,
                "norma": "R 16.2",
                "pregunta": "El diseño e implementación, se realizó aplicando metodologías reconocidas por normas técnicas internacionales como la IEC 62305-3, de reconocimiento internacional o la NTC 4552, las cuales se basan en el método electrogeométrico"
        },
        {
                "id": "APA-005",
                "numero": 5,
                "norma": "R 16.3.1",
                "pregunta": "Si en la instalación existen elementos metálicos (antenas de televisión, chimeneas, torres de comunicación, etc.) expuestas al impacto del rayo son tratados como terminales de captación."
        },
        {
                "id": "APA-006",
                "numero": 6,
                "norma": "R 31.2.",
                "pregunta": "Los terminales de captación NO son de materiales radiactivos."
        },
        {
                "id": "APA-007",
                "numero": 7,
                "norma": "R 16.3.2 a",
                "pregunta": "Existen bajantes, garantizando varios caminos en paralelo para la corriente. Existe equipotencializacion con las diferentes estructuras conductoras."
        },
        {
                "id": "APA-008",
                "numero": 8,
                "norma": "R 16.3.2 b",
                "pregunta": "En estructuras con paredes combustibles y en áreas con peligro de explosión se utilizan bajantes aisladas"
        },
        {
                "id": "APA-009",
                "numero": 9,
                "norma": "R 16.3.2 c",
                "pregunta": "La interconexión de bajantes se realiza en la parte superior de la edificación."
        },
        {
                "id": "APA-010",
                "numero": 10,
                "norma": "R 16.3.2 e",
                "pregunta": "Se cumple con las distancias entre conductores bajantes y entre anillos bajantes."
        },
        {
                "id": "APA-011",
                "numero": 11,
                "norma": "R 16.3.2 g",
                "pregunta": "Se encuentran instaladas como mínimo dos bajantes y están ubicadas en el perímetro y en las esquinas opuestas de la estructura o edificación."
        },
        {
                "id": "APA-012",
                "numero": 12,
                "norma": "R 16.3.2 h",
                "pregunta": "Cada una de las bajantes termina en una puesta a tierra."
        },
        {
                "id": "APA-013",
                "numero": 13,
                "norma": "R 16.3.2 i",
                "pregunta": "Las bajantes se encuentran instaladas de tal manera que son una continuación directa de los conductores del sistema de captación."
        },
        {
                "id": "APA-014",
                "numero": 14,
                "norma": "R 16.3.2 j",
                "pregunta": "Los conductores bajantes están instalados de manera rectilínea y vertical ."
        },
        {
                "id": "APA-015",
                "numero": 15,
                "norma": "R 16.3.2 j",
                "pregunta": "En los conductores bajantes NO se forman bucles ni se hacen curvas de mas de 20 cm de radio."
        },
        {
                "id": "APA-016",
                "numero": 16,
                "norma": "R 16.3.2 k",
                "pregunta": "Las bajantes NO se encuentran instaladas en canales de drenaje de agua."
        },
        {
                "id": "APA-017",
                "numero": 17,
                "norma": "R 16.3.2 m",
                "pregunta": "Los marcos o elementos de la fachada si son utilizados como bajantes, son perfiles o rieles metálicos y cumplen los requisitos de conductores bajantes."
        },
        {
                "id": "APA-018",
                "numero": 18,
                "norma": "R 16.3.2 n",
                "pregunta": "La puesta a tierra de protección contra rayos esta interconectada con las otras puestas a tierra de la edificación."
        },
        {
                "id": "APA-019",
                "numero": 19,
                "norma": "N 250.86",
                "pregunta": "Para la puesta a tierra de sistema eléctricos y equipos NO se utiliza la puesta a tierra de pararrayos. Pero si van interconectadas las puestas a tierra de los diferentes sistemas"
        },
        {
                "id": "APA-020",
                "numero": 20,
                "norma": "N 620-37",
                "pregunta": "Los conductores del sistema de protección contra rayos NO se encuentran instalados dentro del foso del ascensor. NO se utilizan los rieles ni otros equipos existentes en el foso del ascensor como conductores de bajada para puesta a tierra del sistema de protección contra rayos."
        },
        {
                "id": "APA-021",
                "numero": 21,
                "norma": "R 16.3.3",
                "pregunta": "La puesta a tierra de protección contra rayos, cumplió con los requisitos que le apliquen del articulo 15°"
        },
        {
                "id": "APA-022",
                "numero": 22,
                "norma": "N.250-83",
                "pregunta": "electrodos fabricados  Cuando se use más de un electrodo para la instalación de puesta a tierra, ninguno de ellos (incluidos los que se utilicen como barras de pararrayos) está a menos de 1,80m de cualquier otro electrodo o sistema de puesta a tierra."
        },
        {
                "id": "APA-023",
                "numero": 23,
                "norma": "N.250-46",
                "pregunta": "Los conductos, encerramientos, estructuras y otras partes metálicas de equipos eléctricos no portadores de corriente, se mantienen alejados como mínimo a 1,80 m de los conductores de las bajantes de los pararrayos; cuando la distancia a los conductores de las bajantes sea menor a 1,80 m, se conectan equipotencialmente a dichas bajantes."
        },
        {
                "id": "APA-024",
                "numero": 24,
                "norma": "R 16.3.1",
                "pregunta": "Las terminales de captación o pararrayos cumplen con las dimensiones dadas en la siguiente tabla. Los materiales de las bajantes cumplen con las especificaciones de la siguiente tabla.",
                "recursos_visuales": [
                  { "reference_id": "APA-024-tabla-1", "archivo": "tabla_pararrayos_1.png" },
                  { "reference_id": "APA-024-tabla-2", "archivo": "tabla_pararrayos_2.png" }
                ]
        }
]
    },
    {
      titulo: "2. Observaciones",
      rango: "",
      total_preguntas: 0,
      tipo_respuesta_principal: "textarea",
      opciones_visita_1: [],
      opciones_cierre: [],
      preguntas: []
    }
  ],
  validacion_extraccion: {
    preguntas_esperadas: 24,
    preguntas_extraidas: 24,
    numeros_faltantes: [],
    numeros_duplicados: [],
    preguntas_sin_texto: [],
    estado: "OK"
  }
};

export default RETIE_APANTALLAMIENTO_SCHEMA;
