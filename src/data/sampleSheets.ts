import { FormSheet } from '@/types/schema';

export const sampleSheets: FormSheet[] = [
  {
    nombre: "IN",
    codigo: "F-GI-01",
    titulo: "INFORMACIÓN GENERAL",
    type: "informacion",
    secciones: [
      {
        titulo: "Datos del Proyecto",
        type: "section",
        fields: [
          {
            id: 1,
            label: "Código del Servicio",
            type: "text",
            validation: { required: true }
          },
          {
            id: 2,
            label: "Fecha de Inspección",
            type: "date",
            validation: { required: true }
          },
          {
            id: 3,
            label: "Número de Dictamen",
            type: "text"
          },
          {
            id: 4,
            label: "Proyecto",
            type: "text",
            validation: { required: true }
          },
          {
            id: 5,
            label: "Dirección",
            type: "text",
            validation: { required: true }
          },
          {
            id: 6,
            label: "Constructor",
            type: "text"
          },
          {
            id: 7,
            label: "Matrícula Profesional",
            type: "text"
          }
        ]
      },
      {
        titulo: "Usos Finales",
        type: "section",
        fields: [
          {
            id: 8,
            label: "Seleccione los usos finales aplicables",
            type: "checkbox",
            options: [
              { label: "Uso Residencial", value: "residencial" },
              { label: "Industrial y Comercial", value: "industrial" },
              { label: "Alta Concentración", value: "alta_concentracion" },
              { label: "Ascensores", value: "ascensores" },
              { label: "Piscinas", value: "piscinas" },
              { label: "Distribución", value: "distribucion" },
              { label: "Subestación", value: "subestacion" }
            ],
            validation: { required: true }
          }
        ]
      },
      {
        titulo: "Equipos de Medición",
        type: "section",
        fields: [
          {
            id: 9,
            label: "Equipo de Resistencia de Puesta a Tierra",
            type: "text",
            placeholder: "Número de serie"
          },
          {
            id: 10,
            label: "Equipo de Resistencia de Aislamiento",
            type: "text",
            placeholder: "Número de serie"
          },
          {
            id: 11,
            label: "Equipo de Iluminancia",
            type: "text",
            placeholder: "Número de serie"
          }
        ]
      },
      {
        titulo: "Medida de Resistencia de Puesta a Tierra",
        type: "section",
        fields: [
          {
            id: 12,
            label: "Mediciones de Puesta a Tierra",
            type: "dynamic-table",
            columns: [
              { label: "Punto de Medición", field: "punto", type: "text" },
              { label: "Distancia d (m)", field: "distancia", type: "decimal" },
              { label: "Veces", field: "veces", type: "number" },
              { label: "R (Ω)", field: "resistencia", type: "decimal" },
              { label: "Cumple", field: "cumple", type: "select", options: [
                { label: "SI", value: "SI" },
                { label: "NO", value: "NO" }
              ]}
            ],
            validation: { required: false }
          }
        ]
      },
      {
        titulo: "Medida de Resistencia de Aislamiento",
        type: "section",
        fields: [
          {
            id: 13,
            label: "Mediciones de Aislamiento",
            type: "dynamic-table",
            columns: [
              { label: "Circuito", field: "circuito", type: "text" },
              { label: "Fases", field: "fases", type: "select", options: [
                { label: "1", value: "1" },
                { label: "3", value: "3" }
              ]},
              { label: "L1-T (MΩ)", field: "l1t", type: "number" },
              { label: "L2-T (MΩ)", field: "l2t", type: "number" },
              { label: "L3-T (MΩ)", field: "l3t", type: "number" },
              { label: "Cumple", field: "cumple", type: "select", options: [
                { label: "SI", value: "SI" },
                { label: "NO", value: "NO" }
              ]}
            ],
            validation: { required: false }
          }
        ]
      },
      {
        titulo: "Medida de Iluminancia",
        type: "section",
        fields: [
          {
            id: 14,
            label: "Mediciones de Iluminancia",
            type: "dynamic-table",
            columns: [
              { label: "Ubicación", field: "ubicacion", type: "text" },
              { label: "Medición 1 (lux)", field: "med1", type: "decimal" },
              { label: "Medición 2 (lux)", field: "med2", type: "decimal" },
              { label: "Medición 3 (lux)", field: "med3", type: "decimal" },
              { label: "Promedio", field: "promedio", type: "decimal" },
              { label: "Cumple", field: "cumple", type: "select", options: [
                { label: "SI", value: "SI" },
                { label: "NO", value: "NO" }
              ]}
            ],
            validation: { required: false }
          }
        ]
      }
    ]
  },
  {
    nombre: "PISCINAS",
    codigo: "F-GI-07",
    titulo: "INSTALACIONES ELÉCTRICAS EN PISCINAS",
    type: "checklist",
    secciones: [
      {
        titulo: "TABLEROS",
        type: "section",
        fields: [
          { id: 1, label: "R.27.4.3.d El Tablero de Distribución es fácilmente accesible", type: "radio", options: [{ label: "SI", value: "SI" }, { label: "NO", value: "NO" }, { label: "N/A", value: "N/A" }], validation: { required: true } },
          { id: 2, label: "R. 10.4. N. 110-16 Se cumple con las distancias mínimas permitidas para el espacio de trabajo. Las puertas abren mínimo 90°", type: "radio", options: [{ label: "SI", value: "SI" }, { label: "NO", value: "NO" }, { label: "N/A", value: "N/A" }], validation: { required: true } },
          { id: 3, label: "R. 20.23.1.4.f El tablero tiene logo de riesgo eléctrico e identificación", type: "radio", options: [{ label: "SI", value: "SI" }, { label: "NO", value: "NO" }, { label: "N/A", value: "N/A" }], validation: { required: true } },
          { id: 4, label: "N. 110-16.f.1 En paneles de distribución y centros de control de motores ubicados en interiores se cumple espacio dedicado", type: "radio", options: [{ label: "SI", value: "SI" }, { label: "NO", value: "NO" }, { label: "N/A", value: "N/A" }], validation: { required: true } },
          { id: 5, label: "R. 20.23.1.4.a-e El tablero tiene adherida de manera clara, permanente y visible placa con características técnicas", type: "radio", options: [{ label: "SI", value: "SI" }, { label: "NO", value: "NO" }, { label: "N/A", value: "N/A" }], validation: { required: true } },
          { id: 6, label: "R. 20.23.1.4.g,i El tablero tiene cuadro para identificar circuitos y diagrama unifilar actualizado", type: "radio", options: [{ label: "SI", value: "SI" }, { label: "NO", value: "NO" }, { label: "N/A", value: "N/A" }], validation: { required: true } },
          { id: 7, label: "R. 20.5.2. f Las aberturas no utilizadas están cerradas eficazmente", type: "radio", options: [{ label: "SI", value: "SI" }, { label: "NO", value: "NO" }, { label: "N/A", value: "N/A" }], validation: { required: true } },
          { id: 8, label: "N. 373-8 NO existen empalmes dentro del tablero", type: "radio", options: [{ label: "SI", value: "SI" }, { label: "NO", value: "NO" }, { label: "N/A", value: "N/A" }], validation: { required: true } },
          { id: 9, label: "R.20.23.4.g Los cables no atraviesan barrajes", type: "radio", options: [{ label: "SI", value: "SI" }, { label: "NO", value: "NO" }, { label: "N/A", value: "N/A" }], validation: { required: true } },
          { id: 10, label: "R. 20.23.1.3.f Se cumple el código de colores", type: "radio", options: [{ label: "SI", value: "SI" }, { label: "NO", value: "NO" }, { label: "N/A", value: "N/A" }], validation: { required: true } },
          { id: 11, label: "R.6.3 Ningún circuito utiliza el blanco ni el verde para las fases", type: "radio", options: [{ label: "SI", value: "SI" }, { label: "NO", value: "NO" }, { label: "N/A", value: "N/A" }], validation: { required: true } },
          { id: 12, label: "R.20.2.9.j Conductores de aluminio cumplen requisitos", type: "radio", options: [{ label: "SI", value: "SI" }, { label: "NO", value: "NO" }, { label: "N/A", value: "N/A" }], validation: { required: true } },
          { id: 13, label: "R. 27.4.3.c La capacidad de corriente del conductor es superior a la protección", type: "radio", options: [{ label: "SI", value: "SI" }, { label: "NO", value: "NO" }, { label: "N/A", value: "N/A" }], validation: { required: true } },
          { id: 14, label: "N. 250-95 Conductores de puesta a tierra en paralelo", type: "radio", options: [{ label: "SI", value: "SI" }, { label: "NO", value: "NO" }, { label: "N/A", value: "N/A" }], validation: { required: true } },
          { id: 15, label: "R.20.16.2.2.e Cada circuito ramal presenta protección contra sobrecorriente", type: "radio", options: [{ label: "SI", value: "SI" }, { label: "NO", value: "NO" }, { label: "N/A", value: "N/A" }], validation: { required: true } },
          { id: 16, label: "R.27.4.1.e Cada circuito dispone de dispositivo de corte automático", type: "radio", options: [{ label: "SI", value: "SI" }, { label: "NO", value: "NO" }, { label: "N/A", value: "N/A" }], validation: { required: true } },
          { id: 17, label: "R.20.16.2.2.a Conexión correcta de interruptores automáticos", type: "radio", options: [{ label: "SI", value: "SI" }, { label: "NO", value: "NO" }, { label: "N/A", value: "N/A" }], validation: { required: true } },
          { id: 18, label: "R.20.16.2.2.b Especificaciones de interruptores automáticos correctas", type: "radio", options: [{ label: "SI", value: "SI" }, { label: "NO", value: "NO" }, { label: "N/A", value: "N/A" }], validation: { required: true } },
          { id: 19, label: "R. 20.23.1.3.c El tablero cuenta con barrajes de tierra y neutro", type: "radio", options: [{ label: "SI", value: "SI" }, { label: "NO", value: "NO" }, { label: "N/A", value: "N/A" }], validation: { required: true } },
          { id: 20, label: "R.20.12.2.a No se instala dos o más conectores en la misma bornera", type: "radio", options: [{ label: "SI", value: "SI" }, { label: "NO", value: "NO" }, { label: "N/A", value: "N/A" }], validation: { required: true } },
          { id: 21, label: "R.20.23.1.2.e El tablero se encuentra sólidamente puesto a tierra", type: "radio", options: [{ label: "SI", value: "SI" }, { label: "NO", value: "NO" }, { label: "N/A", value: "N/A" }], validation: { required: true } },
          { id: 22, label: "R. 15.3.3.d Conductor de puesta a tierra acompaña los conductores activos", type: "radio", options: [{ label: "SI", value: "SI" }, { label: "NO", value: "NO" }, { label: "N/A", value: "N/A" }], validation: { required: true } },
          { id: 23, label: "R.15.3.3.c Conductor de puesta a tierra es continuo sin interruptores", type: "radio", options: [{ label: "SI", value: "SI" }, { label: "NO", value: "NO" }, { label: "N/A", value: "N/A" }], validation: { required: true } },
          { id: 24, label: "R.15.3.3.e Conductor de puesta a tierra tiene color correcto", type: "radio", options: [{ label: "SI", value: "SI" }, { label: "NO", value: "NO" }, { label: "N/A", value: "N/A" }], validation: { required: true } },
          { id: 25, label: "N. 250-95 Conductor de tierra cumple calibre mínimo", type: "radio", options: [{ label: "SI", value: "SI" }, { label: "NO", value: "NO" }, { label: "N/A", value: "N/A" }], validation: { required: true } },
          { id: 26, label: "N.280-21 Conductores de DPS con calibre correcto", type: "radio", options: [{ label: "SI", value: "SI" }, { label: "NO", value: "NO" }, { label: "N/A", value: "N/A" }], validation: { required: true } },
          { id: 27, label: "N.280-4.a Valor nominal del DPS correcto", type: "radio", options: [{ label: "SI", value: "SI" }, { label: "NO", value: "NO" }, { label: "N/A", value: "N/A" }], validation: { required: true } },
          { id: 28, label: "R.20.23.4.o Pruebas de aislamiento realizadas", type: "radio", options: [{ label: "SI", value: "SI" }, { label: "NO", value: "NO" }, { label: "N/A", value: "N/A" }], validation: { required: true } },
          { id: 29, label: "R.20.23.4.o Verificaciones del tablero realizadas", type: "radio", options: [{ label: "SI", value: "SI" }, { label: "NO", value: "NO" }, { label: "N/A", value: "N/A" }], validation: { required: true } }
        ]
      },
      {
        titulo: "REQUISITOS GENERALES / INSTALACIÓN",
        type: "section",
        fields: [
          { id: 30, label: "R. 28.3.9 b. Instalaciones de alumbrado con transformador de aislamiento", type: "radio", options: [{ label: "SI", value: "SI" }, { label: "NO", value: "NO" }, { label: "N/A", value: "N/A" }], validation: { required: true } },
          { id: 31, label: "R. 28.3.9 b. Instalación con interruptor diferencial de falla a tierra", type: "radio", options: [{ label: "SI", value: "SI" }, { label: "NO", value: "NO" }, { label: "N/A", value: "N/A" }], validation: { required: true } },
          { id: 32, label: "R.17.1.c Luminarias de emergencia funcionan 60 minutos", type: "radio", options: [{ label: "SI", value: "SI" }, { label: "NO", value: "NO" }, { label: "N/A", value: "N/A" }], validation: { required: true } },
          { id: 33, label: "N. 680-5. c) Conductores de lado de carga instalados separadamente", type: "radio", options: [{ label: "SI", value: "SI" }, { label: "NO", value: "NO" }, { label: "N/A", value: "N/A" }], validation: { required: true } },
          { id: 34, label: "N. 680.6. a) 1) Tomacorrientes a mínimo 3m de la piscina", type: "radio", options: [{ label: "SI", value: "SI" }, { label: "NO", value: "NO" }, { label: "N/A", value: "N/A" }], validation: { required: true } },
          { id: 35, label: "N. 680.6. a) 2) Tomacorriente entre 3m y 6m en viviendas", type: "radio", options: [{ label: "SI", value: "SI" }, { label: "NO", value: "NO" }, { label: "N/A", value: "N/A" }], validation: { required: true } },
          { id: 36, label: "N. 680.6. a) 3) Tomacorientes protegidos por interruptor de falla a tierra", type: "radio", options: [{ label: "SI", value: "SI" }, { label: "NO", value: "NO" }, { label: "N/A", value: "N/A" }], validation: { required: true } },
          { id: 37, label: "N. 680.6. b) 1) NO hay salidas de alumbrado sobre la piscina", type: "radio", options: [{ label: "SI", value: "SI" }, { label: "NO", value: "NO" }, { label: "N/A", value: "N/A" }], validation: { required: true } },
          { id: 38, label: "N. 680.6. b) 2) Alumbrado entre 1.5m y 3m con protección GFCI", type: "radio", options: [{ label: "SI", value: "SI" }, { label: "NO", value: "NO" }, { label: "N/A", value: "N/A" }], validation: { required: true } },
          { id: 39, label: "N. 680.6. b) 3) Alumbrado a menos de 4.8m con clavija polarizada", type: "radio", options: [{ label: "SI", value: "SI" }, { label: "NO", value: "NO" }, { label: "N/A", value: "N/A" }], validation: { required: true } },
          { id: 40, label: "N. 680.6. c) Interruptores a mínimo 1.5m de la piscina", type: "radio", options: [{ label: "SI", value: "SI" }, { label: "NO", value: "NO" }, { label: "N/A", value: "N/A" }], validation: { required: true } },
          { id: 41, label: "N. 680.9 Calentadores de agua con protección correcta", type: "radio", options: [{ label: "SI", value: "SI" }, { label: "NO", value: "NO" }, { label: "N/A", value: "N/A" }], validation: { required: true } },
          { id: 42, label: "N. 680.10 NO existe alambrado subterráneo bajo la piscina", type: "radio", options: [{ label: "SI", value: "SI" }, { label: "NO", value: "NO" }, { label: "N/A", value: "N/A" }], validation: { required: true } },
          { id: 43, label: "N. 680.11 Cuartos de equipos con drenaje adecuado", type: "radio", options: [{ label: "SI", value: "SI" }, { label: "NO", value: "NO" }, { label: "N/A", value: "N/A" }], validation: { required: true } },
          { id: 44, label: "N. 680.12 Medios de desconexión accesibles y a la vista", type: "radio", options: [{ label: "SI", value: "SI" }, { label: "NO", value: "NO" }, { label: "N/A", value: "N/A" }], validation: { required: true } }
        ]
      },
      {
        titulo: "ALUMBRADO BAJO EL AGUA, CAJAS, EQUIPOTENCIALIDAD Y PUESTA A TIERRA",
        type: "section",
        fields: [
          { id: 45, label: "a) - 1) Aparatos de alumbrado aprobados y con GFCI", type: "radio", options: [{ label: "SI", value: "SI" }, { label: "NO", value: "NO" }, { label: "N/A", value: "N/A" }], validation: { required: true } },
          { id: 46, label: "a) - 2) NO hay alumbrado a más de 150V", type: "radio", options: [{ label: "SI", value: "SI" }, { label: "NO", value: "NO" }, { label: "N/A", value: "N/A" }], validation: { required: true } },
          { id: 47, label: "a) - 3) Alumbrado a mínimo 0.5m bajo el nivel del agua", type: "radio", options: [{ label: "SI", value: "SI" }, { label: "NO", value: "NO" }, { label: "N/A", value: "N/A" }], validation: { required: true } },
          { id: 48, label: "a) - 3) Lentes de alumbrado hacia arriba protegidos", type: "radio", options: [{ label: "SI", value: "SI" }, { label: "NO", value: "NO" }, { label: "N/A", value: "N/A" }], validation: { required: true } },
          { id: 49, label: "a) - 4) Aparatos sumergibles protegidos contra sobrecalentamiento", type: "radio", options: [{ label: "SI", value: "SI" }, { label: "NO", value: "NO" }, { label: "N/A", value: "N/A" }], validation: { required: true } },
          { id: 50, label: "b) - 1) Nicho mojado: Cascos moldeados con entradas para conduit", type: "radio", options: [{ label: "SI", value: "SI" }, { label: "NO", value: "NO" }, { label: "N/A", value: "N/A" }], validation: { required: true } },
          { id: 51, label: "b) - 1) Nicho mojado: Instalación en tubo RMC, IMC o no metálico", type: "radio", options: [{ label: "SI", value: "SI" }, { label: "NO", value: "NO" }, { label: "N/A", value: "N/A" }], validation: { required: true } },
          { id: 52, label: "b) - 1) Nicho mojado: Conductor 8 AWG en tubo no metálico", type: "radio", options: [{ label: "SI", value: "SI" }, { label: "NO", value: "NO" }, { label: "N/A", value: "N/A" }], validation: { required: true } },
          { id: 53, label: "b) - 1) Nicho mojado: Partes metálicas de bronce o resistentes a corrosión", type: "radio", options: [{ label: "SI", value: "SI" }, { label: "NO", value: "NO" }, { label: "N/A", value: "N/A" }], validation: { required: true } },
          { id: 54, label: "b) - 2) Nicho mojado: Conductores cubiertos con masilla", type: "radio", options: [{ label: "SI", value: "SI" }, { label: "NO", value: "NO" }, { label: "N/A", value: "N/A" }], validation: { required: true } },
          { id: 55, label: "b) - 3) Nicho mojado: Conexión equipotencial y requiere herramienta", type: "radio", options: [{ label: "SI", value: "SI" }, { label: "NO", value: "NO" }, { label: "N/A", value: "N/A" }], validation: { required: true } },
          { id: 56, label: "c) - 1) Nicho seco: Medio para drenar agua", type: "radio", options: [{ label: "SI", value: "SI" }, { label: "NO", value: "NO" }, { label: "N/A", value: "N/A" }], validation: { required: true } },
          { id: 57, label: "c) - 2) Nicho seco: Medio para conectar conductor de puesta a tierra", type: "radio", options: [{ label: "SI", value: "SI" }, { label: "NO", value: "NO" }, { label: "N/A", value: "N/A" }], validation: { required: true } },
          { id: 58, label: "c) Nicho seco: Instalación en tubo RMC, IMC o rígido no metálico", type: "radio", options: [{ label: "SI", value: "SI" }, { label: "NO", value: "NO" }, { label: "N/A", value: "N/A" }], validation: { required: true } },
          { id: 59, label: "d) Sin nicho: Aparatos certificados para este uso", type: "radio", options: [{ label: "SI", value: "SI" }, { label: "NO", value: "NO" }, { label: "N/A", value: "N/A" }], validation: { required: true } },
          { id: 60, label: "a) - 1) Caja de unión con entradas o acoples certificados", type: "radio", options: [{ label: "SI", value: "SI" }, { label: "NO", value: "NO" }, { label: "N/A", value: "N/A" }], validation: { required: true } },
          { id: 61, label: "a) - 2) Caja de unión de material resistente a corrosión", type: "radio", options: [{ label: "SI", value: "SI" }, { label: "NO", value: "NO" }, { label: "N/A", value: "N/A" }], validation: { required: true } },
          { id: 62, label: "a) - 3) Continuidad eléctrica en tubos metálicos", type: "radio", options: [{ label: "SI", value: "SI" }, { label: "NO", value: "NO" }, { label: "N/A", value: "N/A" }], validation: { required: true } },
          { id: 63, label: "a) - 4) Caja de unión ubicada a más de 10cm del suelo", type: "radio", options: [{ label: "SI", value: "SI" }, { label: "NO", value: "NO" }, { label: "N/A", value: "N/A" }], validation: { required: true } },
          { id: 64, label: "c) NO hay cajas de unión sobre el borde de la piscina", type: "radio", options: [{ label: "SI", value: "SI" }, { label: "NO", value: "NO" }, { label: "N/A", value: "N/A" }], validation: { required: true } },
          { id: 65, label: "d) Cajas de unión sin nicho tienen terminales de tierra extras", type: "radio", options: [{ label: "SI", value: "SI" }, { label: "NO", value: "NO" }, { label: "N/A", value: "N/A" }], validation: { required: true } },
          { id: 66, label: "a) Partes metálicas de la piscina equipotencializadas", type: "radio", options: [{ label: "SI", value: "SI" }, { label: "NO", value: "NO" }, { label: "N/A", value: "N/A" }], validation: { required: true } },
          { id: 67, label: "b) Conexión a rejilla común con conductor 8 AWG", type: "radio", options: [{ label: "SI", value: "SI" }, { label: "NO", value: "NO" }, { label: "N/A", value: "N/A" }], validation: { required: true } },
          { id: 68, label: "c) Calentadores de más de 50A solo partes designadas equipotenciales", type: "radio", options: [{ label: "SI", value: "SI" }, { label: "NO", value: "NO" }, { label: "N/A", value: "N/A" }], validation: { required: true } },
          { id: 69, label: "N. 680.23 Equipos sonoros bajo agua identificados para ese uso", type: "radio", options: [{ label: "SI", value: "SI" }, { label: "NO", value: "NO" }, { label: "N/A", value: "N/A" }], validation: { required: true } },
          { id: 70, label: "N. 680-24 Equipos puestos a tierra según norma", type: "radio", options: [{ label: "SI", value: "SI" }, { label: "NO", value: "NO" }, { label: "N/A", value: "N/A" }], validation: { required: true } },
          { id: 71, label: "N. 680-25. b) 1) Conductor de puesta a tierra mínimo 12 AWG", type: "radio", options: [{ label: "SI", value: "SI" }, { label: "NO", value: "NO" }, { label: "N/A", value: "N/A" }], validation: { required: true } },
          { id: 72, label: "N. 680-25. b) 2) Cajas de unión conectadas a tierra del tablero", type: "radio", options: [{ label: "SI", value: "SI" }, { label: "NO", value: "NO" }, { label: "N/A", value: "N/A" }], validation: { required: true } },
          { id: 73, label: "N. 680-25. b) 2) Conductor de puesta a tierra sin uniones ni empalmes", type: "radio", options: [{ label: "SI", value: "SI" }, { label: "NO", value: "NO" }, { label: "N/A", value: "N/A" }], validation: { required: true } },
          { id: 74, label: "N. 680-25. c) Motores de piscina puestos a tierra con conductor 12 AWG", type: "radio", options: [{ label: "SI", value: "SI" }, { label: "NO", value: "NO" }, { label: "N/A", value: "N/A" }], validation: { required: true } },
          { id: 75, label: "N. 680-25. d) Tableros de distribución puestos a tierra", type: "radio", options: [{ label: "SI", value: "SI" }, { label: "NO", value: "NO" }, { label: "N/A", value: "N/A" }], validation: { required: true } }
        ]
      },
      {
        titulo: "CONDUCTORES AÉREOS",
        type: "section",
        fields: [
          { id: 76, label: "Conductores aéreos NO pasan encima de la piscina", type: "radio", options: [{ label: "SI", value: "SI" }, { label: "NO", value: "NO" }, { label: "N/A", value: "N/A" }], validation: { required: true } },
          { id: 77, label: "Excepción 1) Separaciones según Figura 680-8", type: "radio", options: [{ label: "SI", value: "SI" }, { label: "NO", value: "NO" }, { label: "N/A", value: "N/A" }], validation: { required: true } }
        ]
      }
    ]
  }
];

export default sampleSheets;