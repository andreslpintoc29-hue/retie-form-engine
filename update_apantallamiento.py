import json
import re

file_path = 'c:/Users/USUARIO1/OneDrive - Consejo Superior de la Judicatura/Escritorio/EnergyInspection/retie-form-engine/src/schemas/retie/apantallamiento.ts'

with open(file_path, 'r', encoding='utf-8') as f:
    text = f.read()

# Add IDs
new_text = re.sub(
    r'"numero": (\d+),',
    lambda m: f'"id": "APA-{int(m.group(1)):03d}",\n                "numero": {m.group(1)},',
    text
)

# Add recursos_visuales to question 24
target = '"pregunta": "Las terminales de captación o pararrayos cumplen con las dimensiones dadas en la siguiente tabla. Los materiales de las bajantes cumplen con las especificaciones de la siguiente tabla."'
replacement = target + ',\n                "recursos_visuales": [\n                  { "reference_id": "APA-024-tabla-1", "archivo": "tabla_pararrayos_1.png" },\n                  { "reference_id": "APA-024-tabla-2", "archivo": "tabla_pararrayos_2.png" }\n                ]'
new_text = new_text.replace(target, replacement)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(new_text)

print("Done")
