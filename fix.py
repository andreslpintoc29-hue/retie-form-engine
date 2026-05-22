import os
import re

TARGETS = [
    "src/app/diseno/page.tsx",
    "src/app/ufr/page.tsx",
    "src/app/uf-i-y-c/page.tsx",
    "src/app/acp-sde-bci/page.tsx"
]

for filepath in TARGETS:
    if os.path.exists(filepath):
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        if 'setShowFinalizar' not in content[:content.find('const handleLimpiar')]:
            # Injecting state declaration
            content = re.sub(
                r'(const \[lastSaved, setLastSaved\] = useState<string \| null>\(null\);)',
                r'\1\n  const [showFinalizar, setShowFinalizar] = useState(false);',
                content
            )
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"Fixed {filepath}")
