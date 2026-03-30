const fs = require('fs');
const path = require('path');

const replacements = {
  'bg-white\\\\b': 'bg-slate-900',
  'bg-slate-50\\\\b': 'bg-transparent',
  'bg-slate-100\\\\b': 'bg-slate-800',
  'text-slate-900\\\\b': 'text-white',
  'text-slate-800\\\\b': 'text-slate-100',
  'text-slate-700\\\\b': 'text-slate-300',
  'text-slate-600\\\\b': 'text-slate-400',
  'text-slate-500\\\\b': 'text-slate-400',
  'border-slate-200\\\\b': 'border-white/10',
  'border-slate-100\\\\b': 'border-white/5',
  'border-b\\\\b(?! border-white/10)': 'border-b border-white/10',
  'border-t\\\\b(?! border-white/10)': 'border-t border-white/10',
  'bg-blue-50\\\\b': 'bg-blue-900/30',
  'text-blue-700\\\\b': 'text-blue-300',
  'text-blue-600\\\\b': 'text-blue-400',
  'bg-slate-950/40\\\\b': 'bg-black/40 backdrop-blur-md',
  'shadow-sm\\\\b': 'shadow-md shadow-black/20',
  'shadow-md\\\\b': 'shadow-lg shadow-black/30'
};

function processDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      if (file !== 'node_modules' && file !== 'dist' && file !== '.git') {
        processDir(fullPath);
      }
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.html')) {
      let content = fs.readFileSync(fullPath, 'utf-8');
      let changed = false;
      for (const [find, replace] of Object.entries(replacements)) {
        const regex = new RegExp(find, 'g');
        if (regex.test(content)) {
          content = content.replace(regex, replace);
          changed = true;
        }
      }
      if (changed) {
        fs.writeFileSync(fullPath, content);
        console.log('Updated ' + file);
      }
    }
  }
}

processDir(__dirname);
console.log('Dark mode conversion complete.');
