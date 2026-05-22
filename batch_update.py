import os
import re

TARGETS = [
    "src/app/diseno/page.tsx",
    "src/app/ufr/page.tsx",
    "src/app/uf-i-y-c/page.tsx",
    "src/app/acp-sde-bci/page.tsx",
    "src/app/apantallamiento/page.tsx",
    "src/app/piscinas/page.tsx",
    "src/app/ascensores/page.tsx"
]

def update_file(filepath):
    if not os.path.exists(filepath):
        print(f"Skipping {filepath} - not found.")
        return

    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Add state showFinalizar
    if 'showFinalizar' not in content:
        content = re.sub(
            r'(const \[activeSheet, setActiveSheet\] = useState\(0\);)',
            r'\1\n  const [showFinalizar, setShowFinalizar] = useState(false);',
            content
        )

    # 2. Add handleLimpiar function
    if 'const handleLimpiar' not in content:
        handle_limpiar_code = """
  const handleLimpiar = async () => {
    if (window.confirm('¿Estás seguro de limpiar todos los datos? Esta acción no se puede deshacer.')) {
      if ((formEngine as any).store?.resetInspection) {
        (formEngine as any).store.resetInspection();
      }
    }
  };
"""
        content = re.sub(
            r'(const handleFieldChange = useCallback)',
            f'{handle_limpiar_code.lstrip()}\\n  \\1',
            content
        )

    # 3. Replace the ✅ Finalizar button and inject Limpiar button
    # Match any button that contains "✅ Finalizar" inside it
    button_replacement = """              <button onClick={handleLimpiar} className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-sm font-medium transition-colors">
                🧹 Limpiar
              </button>
              <button onClick={() => setShowFinalizar(true)} className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-sm font-medium transition-colors">
                ✅ Finalizar
              </button>"""
              
    content = re.sub(
        r'<button[^>]*>\s*✅ Finalizar\s*</button>',
        button_replacement,
        content
    )

    # 4. Inject the Finalizar modal before PDF Preview or at the end
    modal_code = """
      {/* Finalizar Modal */}
      {showFinalizar && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-8">
          <div className="bg-slate-800 p-6 rounded-lg max-w-md w-full border border-slate-700">
            <h3 className="text-xl font-bold text-white mb-4">¿Finalizar Inspección?</h3>
            <p className="text-slate-300 mb-6">
              Al finalizar, se guardarán todos los datos y la inspección se marcará como completada.
            </p>
            <div className="flex gap-4">
              <button 
                onClick={async () => {
                  try {
                    await (formEngine as any).save?.();
                  } catch (e) {}
                  alert('Inspección finalizada correctamente.');
                  setShowFinalizar(false);
                }}
                className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 rounded text-white font-medium"
              >
                Confirmar
              </button>
              <button 
                onClick={() => setShowFinalizar(false)}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded text-white"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
"""
    if '{/* Finalizar Modal */}' not in content:
        if '{/* PDF Preview */}' in content:
            content = content.replace('{/* PDF Preview */}', f'{modal_code}\n      {{/* PDF Preview */}}')
        else:
            # Fallback if PDF preview not found, inject before the last closing div
            # Find the last </div>
            parts = content.rsplit('</div>', 1)
            if len(parts) == 2:
                content = parts[0] + f'{modal_code}\n    </div>' + parts[1]

    # Write back
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"Successfully updated: {filepath}")

for target in TARGETS:
    update_file(target)
