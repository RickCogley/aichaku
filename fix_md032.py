import re
import os

def fix_md032_in_file(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    
    modified = False
    result_lines = []
    
    for i, line in enumerate(lines):
        if re.match(r'^(\s*)[-*+]\s', line) or re.match(r'^(\s*)\d+\.\s', line):
            if i > 0 and lines[i-1].strip() != '':
                result_lines.append('\n')
                modified = True
        
        result_lines.append(line)
    
    if modified:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.writelines(result_lines)
        print(f"Fixed MD032 errors in {file_path}")
    
    return modified

for root, dirs, files in os.walk('docs'):
    for file in files:
        if file.endswith('.md'):
            file_path = os.path.join(root, file)
            fix_md032_in_file(file_path)