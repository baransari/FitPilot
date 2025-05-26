#!/usr/bin/env node

/**
 * Eksik paketleri otomatik olarak tespit edip yükleyen yardımcı script
 * Kullanım: node scripts/install-missing-packages.js
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Potansiyel olarak gerekli paketler
const POTENTIAL_PACKAGES = [
  '@react-native-community/datetimepicker',
  '@react-native-async-storage/async-storage',
  '@react-navigation/native',
  '@react-navigation/native-stack',
  '@react-navigation/bottom-tabs',
  '@fortawesome/fontawesome-svg-core',
  '@fortawesome/free-solid-svg-icons',
  '@fortawesome/react-native-fontawesome',
  '@reduxjs/toolkit',
  'react-redux',
  'redux-persist',
  'axios',
  'uuid'
];

// Projenin dosyalarını tarayıp import ifadelerini bulan fonksiyon
function findImportsInProject(rootDir, extensions = ['.ts', '.tsx', '.js', '.jsx']) {
  console.log('Dosyaları tarıyorum...');
  const imports = new Set();
  
  function scanDir(dirPath) {
    const files = fs.readdirSync(dirPath);
    
    for (const file of files) {
      const filePath = path.join(dirPath, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory() && file !== 'node_modules' && !file.startsWith('.')) {
        scanDir(filePath);
      } else if (stat.isFile() && extensions.some(ext => file.endsWith(ext))) {
        try {
          const content = fs.readFileSync(filePath, 'utf8');
          const importMatches = content.matchAll(/import.*?from\s+['"]([^'"./][^'"]*)['"]/g);
          
          for (const match of importMatches) {
            const packageName = match[1].split('/')[0];
            if (packageName.startsWith('@')) {
              // Scoped package
              const scopedPackage = match[1].split('/').slice(0, 2).join('/');
              imports.add(scopedPackage);
            } else {
              imports.add(packageName);
            }
          }
        } catch (err) {
          console.error(`Dosya okunurken hata: ${filePath}`, err);
        }
      }
    }
  }
  
  scanDir(rootDir);
  return Array.from(imports);
}

// Paket kurulu mu değil mi kontrol eden fonksiyon
function isPackageInstalled(packageName) {
  try {
    const output = execSync(`npm list ${packageName} --depth=0`).toString();
    return !output.includes('(empty)') && !output.includes('missing');
  } catch (error) {
    return false;
  }
}

// Eksik paketleri yükleyen fonksiyon
function installMissingPackages(packages) {
  for (const pkg of packages) {
    if (!isPackageInstalled(pkg)) {
      console.log(`${pkg} paketi eksik, yükleniyor...`);
      try {
        execSync(`npm install --save ${pkg}`, { stdio: 'inherit' });
        console.log(`${pkg} başarıyla yüklendi.`);
      } catch (error) {
        console.error(`${pkg} yüklenirken hata oluştu:`, error.message);
      }
    } else {
      console.log(`${pkg} zaten yüklü.`);
    }
  }
}

// Script başlangıç
console.log('Eksik paketleri tespit etme ve yükleme scripti başlatılıyor...');

// Proje kök dizinini bul
const projectRoot = path.resolve(__dirname, '..');
console.log(`Proje dizini: ${projectRoot}`);

// App klasöründeki import'ları bul
const appDir = path.join(projectRoot, 'app');
if (!fs.existsSync(appDir)) {
  console.error('App klasörü bulunamadı!');
  process.exit(1);
}

// İmport ifadelerini bul
const imports = findImportsInProject(appDir);
console.log('Bulunan importlar:', imports);

// Potansiyel paketler arasından kullanılanları filtrele
const packagesToCheck = POTENTIAL_PACKAGES.filter(pkg => 
  imports.some(imp => imp === pkg || imp.startsWith(`${pkg}/`))
);

console.log('Kontrol edilecek paketler:', packagesToCheck);

// Eksik paketleri yükle
installMissingPackages(packagesToCheck);

console.log('İşlem tamamlandı!'); 