const { withDangerousMod } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

/**
 * Google Play Developer Verification用のトークンファイルをAndroid assetsに追加するConfigプラグイン
 * Google Play ConsoleはAPKのassets/adi-registration.propertiesを確認する
 */
const withGooglePlayVerification = (config, identifier) => {
  return withDangerousMod(config, [
    'android',
    async (config) => {
      const assetsDir = path.join(
        config.modRequest.platformProjectRoot,
        'app',
        'src',
        'main',
        'assets'
      );
      if (!fs.existsSync(assetsDir)) {
        fs.mkdirSync(assetsDir, { recursive: true });
      }
      const filePath = path.join(assetsDir, 'adi-registration.properties');
      fs.writeFileSync(filePath, identifier, 'utf8');
      console.log(`[withGooglePlayVerification] Created ${filePath}`);
      return config;
    },
  ]);
};

module.exports = withGooglePlayVerification;
