import { Platform } from 'react-native';

// ─── テスト用ID（Googleが提供する公式テストID）────────────────────────────
const TEST_IDS = {
  banner: Platform.select({
    android: 'ca-app-pub-3940256099942544/6300978111',
    ios:     'ca-app-pub-3940256099942544/2934735716',
    default: 'ca-app-pub-3940256099942544/6300978111',
  })!,
  interstitial: Platform.select({
    android: 'ca-app-pub-3940256099942544/1033173712',
    ios:     'ca-app-pub-3940256099942544/4411468910',
    default: 'ca-app-pub-3940256099942544/1033173712',
  })!,
};

// ─── 本番用ID ─────────────────────────────────────────────────────────────
// AdMobコンソール（https://admob.google.com）でアプリを登録後、
// 下記を実際の広告ユニットIDに書き換えてください。
// app.json の androidAppId / iosAppId も同様に本番IDへ変更してください。
const PROD_IDS = {
  banner: Platform.select({
    android: 'ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX', // TODO: 本番バナーID(Android)
    ios:     'ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX', // TODO: 本番バナーID(iOS)
    default: '',
  })!,
  interstitial: Platform.select({
    android: 'ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX', // TODO: 本番インタースティシャルID(Android)
    ios:     'ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX', // TODO: 本番インタースティシャルID(iOS)
    default: '',
  })!,
};

// 開発中はテストID、本番ビルドでは本番IDを自動使用
export const BANNER_AD_UNIT_ID       = __DEV__ ? TEST_IDS.banner       : PROD_IDS.banner;
export const INTERSTITIAL_AD_UNIT_ID = __DEV__ ? TEST_IDS.interstitial : PROD_IDS.interstitial;
