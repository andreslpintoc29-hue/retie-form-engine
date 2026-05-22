# RETIE Form Engine 🚀

Motor dinámico de formularios para inspecciones RETIE basadas en JSON.

## Características

- ✅ Renderizado dinámico desde JSON
- ✅ Soporte para todos los tipos de campos (text, number, date, radio, checkbox, select, dynamic-table, etc.)
- ✅ Validación de campos en tiempo real
- ✅ Persistencia en Firebase (Firestore)
- ✅ Sistema de cumplimiento RETIE con cálculo de porcentaje
- ✅ Exportación a PDF
- ✅ Diseño responsive (móvil y desktop)
- ✅ Navegación por secciones
- ✅ Agregar/eliminar filas en tablas dinámicas
- ✅ Escalable para cualquier hoja de Excel

## Estructura del Proyecto

```
retie-form-engine/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── globals.css         # Estilos globales
│   │   ├── layout.tsx          # Layout principal
│   │   └── page.tsx            # Página principal
│   ├── components/
│   │   ├── fields/
│   │   │   ├── FieldRenderer.tsx      # Renderizador de campos
│   │   │   └── DynamicTable.tsx       # Tabla dinámica
│   │   ├── DynamicForm.tsx    # Formulario dinámico
│   │   └── SheetNavigator.tsx # Navegador de hojas
│   ├── data/
│   │   └── sampleSheets.ts    # Datos de ejemplo
│   ├── lib/
│   │   └── firebase.ts        # Configuración Firebase
│   ├── store/
│   │   └── useInspectionStore.ts # Estado con Zustand
│   ├── types/
│   │   └── schema.ts          # Tipos TypeScript
│   └── utils/
│       ├── validation.ts      # Utilidades de validación
│       └── exportPDF.ts       # Exportación a PDF
├── package.json
├── tsconfig.json
├── tailwind.config.js
├── next.config.js
└── .env.example
```

## Tipos de Campos Soportados

| Tipo | Descripción |
|------|-------------|
| `text` | Input de texto simple |
| `textarea` | Área de texto multilínea |
| `number` | Input numérico entero |
| `decimal` | Input numérico con decimales |
| `date` | Selector de fecha |
| `checkbox` | Casillas de verificación múltiples |
| `radio` | Botones de opción única |
| `select` | Lista desplegable |
| `dynamic-table` | Tabla editable con filas dinámicas |
| `group-fields` | Grupo de campos relacionados |
| `section-title` | Título de sección |

## Ejemplo de Estructura JSON

```json
{
  "nombre": "PISCINAS",
  "codigo": "F-GI-07",
  "titulo": "INSTALACIONES ELÉCTRICAS EN PISCINAS",
  "type": "checklist",
  "secciones": [
    {
      "titulo": "TABLEROS",
      "type": "section",
      "fields": [
        {
          "id": 1,
          "label": "El Tablero de Distribución es fácilmente accesible",
          "type": "radio",
          "options": [
            { "label": "SI", "value": "SI" },
            { "label": "NO", "value": "NO" },
            { "label": "N/A", "value": "N/A" }
          ],
          "validation": { "required": true }
        }
      ]
    }
  ]
}
```

## Instalación

1. **Clonar el repositorio**

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno**
   ```bash
   cp .env.example .env.local
   # Edita .env.local con tus credenciales de Firebase
   ```

4. **Iniciar el servidor de desarrollo**
   ```bash
   npm run dev
   ```

5. **Abrir en el navegador**
   ```
   http://localhost:3000
   ```

## Configuración de Firebase

1. Crea un proyecto en [Firebase Console](https://console.firebase.google.com)
2. Habilita **Firestore Database**
3. Habilita **Authentication** (Email/Password)
4. Copia las credenciales a `.env.local`

## Uso

1. **Login**: Usa la contraseña `ryf2026`
2. **Nueva Inspección**: Completa los datos del proyecto
3. **Seleccionar Módulos**: Elige las hojas a inspeccionar
4. **Responder Preguntas**: Navega por las secciones
5. **Exportar**: Genera el PDF de la inspección

## Validaciones

Las validaciones se definen en el JSON:

```json
{
  "validation": {
    "required": true,
    "min": 0,
    "max": 100,
    "minLength": 5,
    "maxLength": 100,
    "pattern": "^[A-Z]+$",
    "message": "Mensaje de error personalizado"
  }
}
```

## Calculo de Cumplimiento

El sistema calcula automáticamente el porcentaje de cumplimiento:

- **Conformes**: Respuestas "SI"
- **No Conformes**: Respuestas "NO"
- **No Aplica**: Respuestas "N/A"

Fórmula: `(Conformes / (Total - No Aplica)) * 100`

## Contribuir

1. Fork del repositorio
2. Crear una rama (`git checkout -b feature/nueva-funcionalidad`)
3. Commit de cambios (`git commit -am 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Crear un Pull Request

## Licencia

MIT © R&F ENERGY INSPECTION SAS