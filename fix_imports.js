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
    
    // Remove the extra import { playPop } from "@/lib/sounds"; if there is already an import of playPop
    const extraImportRegex = /import\s*\{\s*playPop\s*\}\s*from\s*["']@\/lib\/sounds["'];?\n/g;
    const allMatches = [...content.matchAll(extraImportRegex)];
    
    // If there's an import like { playCorrect, playPop } AND { playPop }
    if (content.includes('playPop') && allMatches.length > 0) {
        // Just remove the explicit `import { playPop } from "@/lib/sounds";`
        // if playPop is present in another import from sounds
        if (content.match(/import\s*\{[^}]*playPop[^}]*\}\s*from\s*["']@\/lib\/sounds["']/)) {
            // we remove the purely extra one
            content = content.replace(extraImportRegex, '');
        }
    }
    
    fs.writeFileSync(file, content);
    console.log('Fixed imports in', file);
  }
});
