import re
import json

def inspect_ts_file(filepath):
    print(f"--- Inspecting {filepath} ---")
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Let's find sections or titles
    # Since it's a TS export, let's look for titles of sections
    titles = re.findall(r'titulo:\s*[\'"]([^\'"]+)[\'"]', content)
    print(f"Titles found: {len(titles)}")
    for i, t in enumerate(titles):
        print(f"  {i}: {t}")
        
    # Let's see if we can find 'secciones' count
    sections = re.findall(r'secciones:\s*\[', content)
    print(f"Secciones blocks: {len(sections)}")

inspect_ts_file('src/schemas/retie/producto.ts')
inspect_ts_file('src/schemas/retie/rSpt.ts')
