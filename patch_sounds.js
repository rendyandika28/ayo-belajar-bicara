const fs = require('fs');
const glob = require('glob');

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
    let changed = false;

    // Make sure playPop is imported
    if (!content.includes('import { playPop') && !content.includes('playPop } from "@/lib/sounds"')) {
      // Find the last import
      content = content.replace(/(import .*;\n)(?!import )/, '$1import { playPop } from "@/lib/sounds";\n');
      changed = true;
    } else if (content.includes('import { playCorrect') && !content.includes('playPop')) {
      content = content.replace('import { playCorrect', 'import { playCorrect, playPop');
      changed = true;
    } else if (content.includes('import { playWrong') && !content.includes('playPop')) {
      content = content.replace('import { playWrong', 'import { playWrong, playPop');
      changed = true;
    } else if (content.includes('import { playApplause') && !content.includes('playPop')) {
      content = content.replace('import { playApplause', 'import { playApplause, playPop');
      changed = true;
    }

    // Add onClick={playPop} to the motion.button inside Link href="/"
    const linkRegex = /(<Link[^>]*href="\/"[^>]*>\s*<motion\.button[^>]*aria-label="Kembali[^>]*)(>)/g;
    if (linkRegex.test(content)) {
      content = content.replace(linkRegex, (match, p1, p2) => {
        if (!p1.includes('onClick')) {
          changed = true;
          return p1 + '\n            onClick={playPop}' + p2;
        }
        return match;
      });
    }

    if (changed) {
      fs.writeFileSync(file, content);
      console.log('Patched', file);
    }
  }
});
