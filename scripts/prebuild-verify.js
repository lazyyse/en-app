#!/usr/bin/env node
/**
 * Google Play Developer Verification用のカスタムprebuildスクリプト
 * - expo prebuild --clean を実行
 * - android/app/src/main/assets/adi-registration.properties を作成
 */
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');

console.log('[prebuild-verify] Running expo prebuild --clean ...');
execSync('npx expo prebuild --clean', { cwd: ROOT, stdio: 'inherit' });

console.log('[prebuild-verify] Creating adi-registration.properties ...');
const assetsDir = path.join(ROOT, 'android', 'app', 'src', 'main', 'assets');
fs.mkdirSync(assetsDir, { recursive: true });
fs.writeFileSync(
  path.join(assetsDir, 'adi-registration.properties'),
  'DBFH0O4DSEHDEAAAAAAAAAAAAA'
);
console.log('[prebuild-verify] Done.');
