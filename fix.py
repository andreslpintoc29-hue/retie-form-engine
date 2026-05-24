import re

file_path = r'c:\EnergyInspection\retie-form-engine\src\app\expediente\page.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

def repl(m):
    return m.group(0).replace('text-white', 'text-black')

content = re.sub(r'<(input|select|textarea)[^>]+>', repl, content)

btn_clear = """
            <button
              onClick={async () => {
                if (window.confirm('¿Está seguro de limpiar este formulario? Esta acción borrará el progreso actual de este módulo.')) {
                  const emptyOrganismo = { razonSocial: '', nit: '', codigoOnac: '', normaAcreditacion: '', alcance: '', logo: '', contacto: '' };
                  const emptyInspector = { nombre: '', matricula: '', cargo: '', firma: '', competencia: '' };
                  const emptyDeclaraciones = { disenoCumple: '', disenoFirmante: '', disenoMatricula: '', disenoFecha: '', disenoAdjunto: '', construccionCumple: '', construccionFirmante: '', construccionMatricula: '', construccionFecha: '', construccionAdjunto: '', operacionCumple: '', operacionFirmante: '', operacionMatricula: '', operacionFecha: '', operacionAdjunto: '' };
                  const emptyDictamen = { tipo: '', numero: '', resultado: '', fecha: '', copiasControl: '' };
                  const emptyAlcance = { tipoInstalacion: '', tipoProyecto: '', especiales: [] };
                  setOrganismo(emptyOrganismo);
                  setInspector(emptyInspector);
                  setDeclaraciones(emptyDeclaraciones);
                  setDictamen(emptyDictamen);
                  setAlcanceRetie(emptyAlcance);
                  setNoConformidades([]);
                  setEvidencias([]);
                  setAdjuntos([]);
                  await offlineEngine.saveExpediente(inspectionId, {
                    organismo: emptyOrganismo,
                    inspector: emptyInspector,
                    declaraciones: emptyDeclaraciones,
                    dictamen: emptyDictamen,
                    noConformidades: [],
                    evidencias: [],
                    adjuntos: [],
                    alcanceRetie: emptyAlcance,
                    moduleStatus: moduleStatus
                  });
                }
              }}
              className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold transition-all shadow-md shadow-red-500/20"
            >
              🗑️ Limpiar formulario
            </button>"""

content = content.replace('📄 Generar Dictamen PDF\n            </button>', '📄 Generar Dictamen PDF\n            </button>\n' + btn_clear)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

file_path_spt = r'c:\EnergyInspection\retie-form-engine\src\app\r-spt\page.tsx'
with open(file_path_spt, 'r', encoding='utf-8') as f:
    content_spt = f.read()

btn_spt_clear = """
              <button
                onClick={async () => {
                  if (window.confirm('¿Está seguro de limpiar este formulario? Esta acción borrará el progreso actual.')) {
                    try {
                      await offlineEngine.saveDraft({ id: inspectionId, inspectionId: inspectionId, schemaId: SCHEMA.id, answers: {}, lastModified: Date.now() });
                      window.location.reload();
                    } catch(e) {
                      console.error(e);
                    }
                  }
                }}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-sm font-medium transition-colors text-white flex items-center gap-2"
              >
                🗑️ Limpiar formulario
              </button>"""

content_spt = content_spt.replace('✅ Finalizar\n              </button>', '✅ Finalizar\n              </button>\n' + btn_spt_clear)

with open(file_path_spt, 'w', encoding='utf-8') as f:
    f.write(content_spt)

print("Modifications applied successfully.")
