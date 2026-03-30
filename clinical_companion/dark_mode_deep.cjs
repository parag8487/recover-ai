const fs = require('fs');
const path = require('path');

const replacements = {
  'bg-white\\\\b': 'bg-transparent',
  'bg-slate-50\\\\b': 'bg-transparent',
  'bg-slate-100\\\\b': 'bg-white/5',
  'bg-slate-200\\\\b': 'bg-white/10',
  'text-slate-900\\\\b': 'text-white',
  'text-slate-800\\\\b': 'text-slate-100',
  'text-slate-700\\\\b': 'text-gray-300',
  'text-slate-600\\\\b': 'text-gray-400',
  'text-slate-500\\\\b': 'text-gray-400',
  'border-slate-200\\\\b': 'border-white/10',
  'border-slate-100\\\\b': 'border-white/5',
  'bg-blue-50\\\\b': 'bg-blue-900/30',
  'bg-blue-100\\\\b': 'bg-blue-900/40',
  'text-blue-700\\\\b': 'text-blue-300',
  'text-blue-600\\\\b': 'text-blue-400',
  'text-blue-900\\\\b': 'text-blue-200',
  'bg-emerald-50\\\\b': 'bg-emerald-900/30',
  'text-emerald-700\\\\b': 'text-emerald-300',
  'bg-amber-50\\\\b': 'bg-amber-900/30',
  'border-amber-200\\\\b': 'border-amber-900/50',
  'text-amber-900\\\\b': 'text-amber-200',
  'border-emerald-100\\\\b': 'border-emerald-900/50',
  'bg-white/90\\\\b': 'bg-black/40',
  'bg-white/80\\\\b': 'bg-black/60',
  'bg-slate-900/40\\\\b': 'bg-black/60',
  'bg-gradient-to-b from-blue-50 to-white\\\\b': 'bg-transparent',
  'bg-gradient-to-br from-blue-50 via-white to-slate-50\\\\b': 'bg-transparent',
  'bg-slate-900\\\\b': 'bg-transparent'
};

function processDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      if (file !== 'node_modules' && file !== 'dist' && file !== '.git') {
        processDir(fullPath);
      }
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.html') || fullPath.endsWith('.jsx')) {
      let content = fs.readFileSync(fullPath, 'utf-8');
      let changed = false;
      for (const [find, replace] of Object.entries(replacements)) {
        const regex = new RegExp(find, 'g');
        if (regex.test(content)) {
          content = content.replace(regex, replace);
          changed = true;
        }
      }
      
      // specifically hunt down white backgrounds
      if (content.includes('bg-white ')) {
        content = content.replace(/bg-white /g, 'bg-transparent ');
        changed = true;
      }
      if (content.includes('bg-white"')) {
        content = content.replace(/bg-white"/g, 'bg-transparent"');
        changed = true;
      }
      
      if (changed) {
        fs.writeFileSync(fullPath, content);
        console.log('Updated ' + file);
      }
    }
  }
}

processDir(__dirname);
console.log('Deep dark mode conversion complete.');
