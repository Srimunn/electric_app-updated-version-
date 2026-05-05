const fs = require('fs');
const path = require('path');

const files = [
  'settings.tsx',
  'selection.tsx',
  'safety.tsx',
  'register.tsx',
  'profile.tsx',
  'payment_success.tsx',
  'payment.tsx',
  'parking.tsx',
  'modal.tsx',
  'map.tsx',
  'login.tsx',
  'index.tsx',
  'hub.tsx',
  'home.tsx',
  'history.tsx',
  'details.tsx',
  'completed.tsx',
  'charging_start.tsx'
];

const appDir = path.join('c:', 'Users', 'itsme', 'OneDrive', 'Documents', 'electric app', 'app');

files.forEach(file => {
  const filePath = path.join(appDir, file);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Check if SafeAreaView is imported from react-native
    const rnImportMatch = content.match(/import\s*{([^}]*SafeAreaView[^}]*)}\s*from\s*'react-native'/);
    
    if (rnImportMatch) {
      console.log(`Fixing ${file}...`);
      
      // 1. Remove SafeAreaView from react-native import
      let rnImports = rnImportMatch[1].split(',').map(i => i.trim());
      rnImports = rnImports.filter(i => i !== 'SafeAreaView');
      
      if (rnImports.length > 0) {
        content = content.replace(rnImportMatch[0], `import { ${rnImports.join(', ')} } from 'react-native'`);
      } else {
        content = content.replace(rnImportMatch[0], '');
      }
      
      // 2. Add SafeAreaView from react-native-safe-area-context
      // Check if it already has an import from react-native-safe-area-context
      const contextImportMatch = content.match(/import\s*{([^}]*)}\s*from\s*'react-native-safe-area-context'/);
      if (contextImportMatch) {
        let contextImports = contextImportMatch[1].split(',').map(i => i.trim());
        if (!contextImports.includes('SafeAreaView')) {
          contextImports.push('SafeAreaView');
          content = content.replace(contextImportMatch[0], `import { ${contextImports.join(', ')} } from 'react-native-safe-area-context'`);
        }
      } else {
        // Insert it after the imports
        content = `import { SafeAreaView } from 'react-native-safe-area-context';\n` + content;
      }
      
      fs.writeFileSync(filePath, content);
    }
  }
});

console.log('Done!');
