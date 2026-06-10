const fs = require('fs');

const files = [
  'app/ayo-ngomong/page.tsx',
  'app/islami/page.tsx',
  'app/kartu-kata/page.tsx',
  'app/pendamping/page.tsx',
  'app/susun-kalimat/page.tsx',
  'app/tebak-gambar/page.tsx',
  'app/tebak-suara/page.tsx',
  'app/suku-kata/page.tsx'
];

files.forEach(file => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    
    // Check if playPop is used
    if (content.includes('playPop')) {
      // Check if playPop is imported
      if (!content.includes('playPop') || !content.match(/import.*playPop.*from/)) {
        // Find the last import
        content = content.replace(/(import .*;\n)(?!import )/, '$1import { playPop } from "@/lib/sounds";\n');
        fs.writeFileSync(file, content);
        console.log('Fixed missing import in', file);
      }
    }
  }
});
