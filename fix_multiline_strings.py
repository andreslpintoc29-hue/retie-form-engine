import re

file_path = r"c:\Users\USUARIO1\OneDrive - Consejo Superior de la Judicatura\Escritorio\EnergyInspection\retie-form-engine\src\schemas\retie\ufIyc.ts"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# Regex to match double-quoted strings, including across multiple lines.
# It matches starting " and then any non-quote character (or escaped character) up to the ending "
pattern = re.compile(r'"([^"\\]*(?:\\.[^"\\]*)*)"', re.DOTALL)

count = 0
def replacer(match):
    global count
    s = match.group(0)
    if '\n' in s:
        count += 1
        # Escape the raw newlines inside the string literal
        fixed = s.replace('\n', '\\n')
        print(f"Fixed {count}: {repr(s)} -> {repr(fixed)}")
        return fixed
    return s

new_content = pattern.sub(replacer, content)

if count > 0:
    with open(file_path, "w", encoding="utf-8") as f:
        f.write(new_content)
    print(f"Successfully fixed {count} multiline strings.")
else:
    print("No multiline strings found.")
