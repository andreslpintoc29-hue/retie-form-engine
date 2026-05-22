"""
Fix: Add Limpiar button + Finalizar button to module headers.
Targets: diseno, ufr, uf-i-y-c, acp-sde-bci, piscinas
"""
import os

BASE = r'c:\EnergyInspection\retie-form-engine\src\app'

HANDLE_LIMPIAR_LINES = [
    '  const handleLimpiar = async () => {\n',
    "    if (window.confirm('¿Estás seguro de limpiar todos los datos? Esta acción no se puede deshacer.')) {\n",
    '      if ((formEngine as any).store?.resetInspection) {\n',
    '        (formEngine as any).store.resetInspection();\n',
    '      }\n',
    '    }\n',
    '  };\n',
    '\n',
]

def process(filepath, name):
    with open(filepath, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    content = ''.join(lines)

    # Skip if Limpiar button already exists in header
    if 'onClick={handleLimpiar}' in content:
        print(f"SKIP {name}: Ya tiene boton Limpiar")
        return

    # ── STEP 1: Insert handleLimpiar function ──
    if 'const handleLimpiar' not in content:
        inserted = False
        for i, line in enumerate(lines):
            s = line.strip()
            if s.startswith('const RadioBtn') or s.startswith('const handleOpenNCModal') or s.startswith('const handleFieldChange'):
                for j, c in enumerate(HANDLE_LIMPIAR_LINES):
                    lines.insert(i + j, c)
                inserted = True
                print(f"  {name}: handleLimpiar insertado (linea {i+1})")
                break

        if not inserted:
            # Fallback for diseno: insert after handleFinalizar
            for i, line in enumerate(lines):
                if 'const handleFinalizar' in line:
                    depth = 0
                    for j in range(i, min(i + 20, len(lines))):
                        depth += lines[j].count('{') - lines[j].count('}')
                        if depth == 0 and j > i:
                            for k, c in enumerate(HANDLE_LIMPIAR_LINES):
                                lines.insert(j + 1 + k, c)
                            inserted = True
                            print(f"  {name}: handleLimpiar insertado despues de handleFinalizar")
                            break
                    break

        if not inserted:
            print(f"  ERROR {name}: No se pudo insertar handleLimpiar")
            return

    # ── STEP 2: Add buttons to header ──
    if name == 'diseno':
        # Replace the "Guardar" button with Limpiar + Finalizar
        for i, line in enumerate(lines):
            if '\xf0\x9f\x92\xbe Guardar' in line or '💾 Guardar' in line:
                # Walk back to find <button
                start = i
                for j in range(i - 1, max(i - 6, 0), -1):
                    if '<button' in lines[j]:
                        start = j
                        break
                # Walk forward to find </button>
                end = i
                for j in range(i, min(i + 3, len(lines))):
                    if '</button>' in lines[j]:
                        end = j
                        break
                indent = '              '
                lines[start:end + 1] = [
                    indent + '<button onClick={handleLimpiar} className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-xs font-semibold transition-all border border-slate-600">Limpiar</button>\n',
                    indent + '<button onClick={() => setShowFinalizar(true)} className="px-3 py-1.5 bg-green-600 hover:bg-green-700 rounded-lg text-xs font-semibold transition-all shadow-md">\u2705 Finalizar</button>\n',
                ]
                print(f"  {name}: Boton Guardar reemplazado con Limpiar + Finalizar")
                break

    elif name == 'piscinas':
        # Add Limpiar before the existing Finalizar button
        for i, line in enumerate(lines):
            if '\u2705 Finalizar' in line or '✅ Finalizar' in line:
                # Walk back to find the <button opening tag
                for j in range(i, max(i - 10, 0), -1):
                    if '<button' in lines[j]:
                        indent = '              '
                        lines.insert(j, indent + '<button onClick={handleLimpiar} className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm font-medium transition-colors border border-slate-600">Limpiar</button>\n')
                        print(f"  {name}: Boton Limpiar insertado antes de Finalizar")
                        break
                break

    else:
        # ufr, uf-i-y-c, acp-sde-bci: insert after lastSaved line
        for i, line in enumerate(lines):
            if '{lastSaved' in line and '💾' in line:
                indent = '            '
                lines.insert(i + 1, indent + '<button onClick={handleLimpiar} className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded text-xs font-semibold transition-colors border border-slate-600">Limpiar</button>\n')
                lines.insert(i + 2, indent + '<button onClick={() => setShowFinalizar(true)} className="px-3 py-1.5 bg-green-600 hover:bg-green-700 rounded text-xs font-semibold transition-colors">\u2705 Finalizar</button>\n')
                print(f"  {name}: Botones Limpiar + Finalizar insertados en header")
                break

    with open(filepath, 'w', encoding='utf-8') as f:
        f.writelines(lines)
    print(f"OK {name}: Archivo guardado\n")


print("=== Actualizando modulos RETIE ===\n")
for m in ['ufr', 'uf-i-y-c', 'acp-sde-bci', 'diseno', 'piscinas']:
    path = os.path.join(BASE, m, 'page.tsx')
    if os.path.exists(path):
        process(path, m)
    else:
        print(f"ERROR {m}: No encontrado\n")
print("=== Listo ===")
