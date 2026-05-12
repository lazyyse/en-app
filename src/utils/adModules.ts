import Constants from 'expo-constants';

export const IS_EXPO_GO = Constants.appOwnership === 'expo';

// Expo Go では import 時点でネイティブモジュールが呼ばれクラッシュするため
// require() で条件付きロードする
let BannerAd: any = null;
let BannerAdSize: any = null;
let InterstitialAd: any = null;
let AdEventType: any = null;

if (!IS_EXPO_GO) {
  const ads = require('react-native-google-mobile-ads');
  BannerAd = ads.BannerAd;
  BannerAdSize = ads.BannerAdSize;
  InterstitialAd = ads.InterstitialAd;
  AdEventType = ads.AdEventType;
}

export { BannerAd, BannerAdSize, InterstitialAd, AdEventType };
