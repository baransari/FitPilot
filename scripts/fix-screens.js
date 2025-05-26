#!/usr/bin/env node

/**
 * Ekranlardaki yaygın hataları tespit edip düzeltmeye yardımcı olan script
 * Kullanım: node scripts/fix-screens.js [screen-path]
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const SCREENS_DIR = path.join(__dirname, '../app/screens');

// Yaygın hatalar ve çözümleri
const COMMON_FIXES = [
  {
    pattern: /import\s*{.*}\s*from\s*['"]react-native-paper['"]/g,
    check: (content) => content.includes('react-native-paper'),
    solution: (content, filePath) => {
      // react-native-paper importlarını paperComponents'den almaya düzelt
      return content.replace(
        /import\s*{([^}]*)}\s*from\s*['"]react-native-paper['"]/g,
        "import {$1} from '../utils/paperComponents'"
      );
    },
    description: "React Native Paper importları paperComponents üzerinden yapıldı"
  },
  {
    pattern: /theme\.colors\.([a-zA-Z]+)/g,
    check: (content) => content.includes('theme.colors.'),
    solution: (content, filePath) => {
      // theme.colors erişimini themeAsAny.colors ile değiştir
      if (!content.includes('const themeAsAny = theme as any;')) {
        // useTheme() hook'unu bulamama durumuna karşı kontrol
        if (!content.includes('useTheme()')) {
          if (content.includes('import useTheme from ')) {
            content = content.replace(
              /(const[^{]*{[^}]*}[^=]*=[^;]*;)/,
              '$1\n  const { theme, isDarkMode } = useTheme();\n  const themeAsAny = theme as any;'
            );
          }
        } else {
          content = content.replace(
            /const\s*{\s*([^}]*)\s*}\s*=\s*useTheme\(\);/g,
            'const { $1, theme } = useTheme();\n  const themeAsAny = theme as any;'
          );
        }
      }
      return content.replace(
        /theme\.colors\.([a-zA-Z]+)/g,
        'themeAsAny.colors.$1'
      );
    },
    description: "theme.colors erişimleri themeAsAny.colors ile değiştirildi"
  },
  {
    pattern: /@react-native-community\/datetimepicker/g,
    check: (content) => content.includes('@react-native-community/datetimepicker'),
    solution: (content, filePath) => {
      // DateTimePicker importu varsa, modulü kontrol et
      const packageName = '@react-native-community/datetimepicker';
      try {
        execSync(`npm list ${packageName} --depth=0`);
      } catch (error) {
        console.log(`${packageName} modülü eksik, yükleniyor...`);
        execSync(`npm install --save ${packageName}`, { stdio: 'inherit' });
      }
      return content;
    },
    description: "DateTimePicker modülü kontrolü ve yüklenmesi"
  },
  {
    pattern: /import useTheme from ['"].*['"];/g, 
    check: (content) => content.includes('useTheme') && !content.includes('theme, isDarkMode'),
    solution: (content, filePath) => {
      // useTheme hook'unun kullanımını düzelt
      if (content.includes('useTheme') && !content.includes('const { theme, isDarkMode }')) {
        if (!content.includes('const themeAsAny = theme as any;')) {
          content = content.replace(
            /(import useTheme.*?;.*?const.*?=.*?{)(.*?)(}.*?=.*?useTheme\(\);)/s,
            '$1$2, theme, isDarkMode$3\n  const themeAsAny = theme as any;'
          );
        }
      }
      return content;
    },
    description: "useTheme hook'u düzgün kullanım için eklendi"
  },
  {
    pattern: /import\s*{\s*([^}]*?)\s*}\s*from\s*['"]@react-navigation\/native-stack['"]/g,
    check: (content) => content.includes('@react-navigation/native-stack'),
    solution: (content, filePath) => {
      // @react-navigation/native-stack bağımlılığını kontrol et
      const packageName = '@react-navigation/native-stack';
      try {
        execSync(`npm list ${packageName} --depth=0`);
      } catch (error) {
        console.log(`${packageName} modülü eksik, yükleniyor...`);
        execSync(`npm install --save ${packageName}`, { stdio: 'inherit' });
      }
      return content;
    },
    description: "@react-navigation/native-stack bağımlılığı kontrol edildi"
  },
  {
    pattern: /import\s+{\s*([^}]*?)\s*}\s*from\s*['"]@fortawesome\/react-native-fontawesome['"]/g,
    check: (content) => content.includes('@fortawesome/react-native-fontawesome'),
    solution: (content, filePath) => {
      // FontAwesome bağımlılıklarını kontrol et
      const packages = [
        '@fortawesome/react-native-fontawesome',
        '@fortawesome/fontawesome-svg-core', 
        '@fortawesome/free-solid-svg-icons'
      ];
      
      packages.forEach(packageName => {
        try {
          execSync(`npm list ${packageName} --depth=0`);
        } catch (error) {
          console.log(`${packageName} modülü eksik, yükleniyor...`);
          execSync(`npm install --save ${packageName}`, { stdio: 'inherit' });
        }
      });
      
      return content;
    },
    description: "FontAwesome bağımlılıkları kontrol edildi"
  },
  {
    pattern: /<><\/>/g,
    check: (content) => content.includes('<></>'),
    solution: (content, filePath) => {
      // Boş JSX Fragment (<></>) kullanımlarını düzelt
      
      // View içinde boş fragment kullanımını düzelt
      content = content.replace(
        /(<View[^>]*>)\s*<><\/>\s*(<\/View>)/g,
        '$1$2'
      );
      
      // View içinde boş fragment kullanımını self-closing View'a dönüştür
      content = content.replace(
        /(<View[^>]*>)\s*<><\/>\s*<\/View>/g,
        '$1/>'
      );
      
      return content;
    },
    description: "Boş JSX Fragment kullanımları düzeltildi"
  }
];

// Ekran dosyalarını bulan fonksiyon
function findScreenFiles(directory = SCREENS_DIR) {
  const files = [];
  
  function scanDir(dir) {
    fs.readdirSync(dir).forEach(file => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        scanDir(filePath);
      } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
        files.push(filePath);
      }
    });
  }
  
  scanDir(directory);
  return files;
}

// Tek bir dosyayı düzelt
function fixFile(filePath) {
  console.log(`Dosya düzeltiliyor: ${filePath}`);
  let content = fs.readFileSync(filePath, 'utf-8');
  let fixesMade = [];
  
  COMMON_FIXES.forEach(fix => {
    if (fix.check(content)) {
      const newContent = fix.solution(content, filePath);
      if (newContent !== content) {
        content = newContent;
        fixesMade.push(fix.description);
      }
    }
  });
  
  if (fixesMade.length > 0) {
    fs.writeFileSync(filePath, content);
    console.log(`✅ Düzeltmeler yapıldı (${fixesMade.length}):`);
    fixesMade.forEach(fix => console.log(`  - ${fix}`));
  } else {
    console.log('❌ Bilinen düzeltme bulunamadı');
  }
  
  return fixesMade.length > 0;
}

// Tüm ekranları düzelt
function fixAllScreens() {
  const screens = findScreenFiles();
  console.log(`${screens.length} ekran dosyası bulundu`);
  
  let fixedCount = 0;
  screens.forEach(screen => {
    const fixed = fixFile(screen);
    if (fixed) fixedCount++;
  });
  
  console.log(`\nToplam ${fixedCount}/${screens.length} ekranda düzeltme yapıldı`);
}

// Ana fonksiyon
function main() {
  const targetPath = process.argv[2];
  
  if (targetPath) {
    const absolutePath = path.resolve(process.cwd(), targetPath);
    if (fs.existsSync(absolutePath)) {
      fixFile(absolutePath);
    } else {
      console.error(`Dosya bulunamadı: ${absolutePath}`);
    }
  } else {
    fixAllScreens();
  }
}

main(); 