import re

file_path = r"c:\Users\USUARIO1\OneDrive - Consejo Superior de la Judicatura\Escritorio\EnergyInspection\retie-form-engine\src\schemas\retie\acpSdeBci.ts"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# Let's count how many times '\\n' occurs in this file
nl_count = content.count('\\n')
print(f"Found {nl_count} literal '\\n' sequences in acpSdeBci.ts")

# 1. Replace '\\n' with a real newline if any (wait, let's keep it if it's inside a string, but wait, let's see if they are actual literal \\n sequences like ufIyc)
# Let's check first if there are '\n' inside quotes or outside.
# Let's search for keys missing the starting double quote.
# Keys are usually: id, numero, norma, tipo, opciones, respuesta, pregunta, visita_1, cierre, etc.
# They are followed by colon ':'.
# So we can look for:
# \b(id|numero|norma|tipo|opciones|respuesta|pregunta|titulo|rango|total_preguntas|tipo_respuesta_principal|opciones_visita_1|opciones_cierre|preguntas|validacion_extraccion|preguntas_esperadas|preguntas_extraidas|estado)":
# This matches a key that ends with ": but is NOT preceded by " (since \b doesn't require a quote).
# Let's write a regex that matches exactly [whitespace][key]":
keys_to_check = [
    "id", "numero", "norma", "tipo", "opciones", "respuesta", "pregunta",
    "titulo", "rango", "total_preguntas", "tipo_respuesta_principal",
    "opciones_visita_1", "opciones_cierre", "preguntas", "visita_1", "cierre"
]

repaired_content = content
for key in keys_to_check:
    # Match key followed by ": but NOT preceded by "
    # We can match: (?<!")\bkey":
    pattern = rf'(?<!"){key}":'
    matches = re.findall(pattern, repaired_content)
    if matches:
        print(f"Found {len(matches)} occurrences of missing opening quote for key: '{key}'")
        repaired_content = re.sub(pattern, f'"{key}":', repaired_content)

# Let's also check if there are multiline strings with raw newlines
# Using the same multiline string pattern:
string_pattern = re.compile(r'"([^"\\]*(?:\\.[^"\\]*)*)"', re.DOTALL)
str_count = 0
def string_replacer(match):
    global str_count
    s = match.group(0)
    if '\n' in s:
        str_count += 1
        fixed = s.replace('\n', '\\n')
        print(f"Fixed multiline string {str_count}: {repr(s)} -> {repr(fixed)}")
        return fixed
    return s

repaired_content = string_pattern.sub(string_replacer, repaired_content)

# Write the repaired content back
with open(file_path, "w", encoding="utf-8") as f:
    f.write(repaired_content)

print("Scan and repair complete for acpSdeBci.ts.")
