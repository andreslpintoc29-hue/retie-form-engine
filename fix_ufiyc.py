import os

file_path = r"c:\Users\USUARIO1\OneDrive - Consejo Superior de la Judicatura\Escritorio\EnergyInspection\retie-form-engine\src\schemas\retie\ufIyc.ts"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# Let's count how many times '\\n' occurs in the file
count = content.count('\\n')
print(f"Found {count} literal '\\n' sequences.")

# Replace '\\n' with a real newline
new_content = content.replace('\\n', '\n')

with open(file_path, "w", encoding="utf-8") as f:
    f.write(new_content)

print("Replacement complete.")
