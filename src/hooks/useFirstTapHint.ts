import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const HINT_KEY = '@en_app:tap_hint_shown';

export function useFirstTapHint() {
  const [showHint, setShowHint] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(HINT_KEY).then((v) => {
      if (!v) setShowHint(true);
    });
  }, []);

  const markShown = () => {
    setShowHint(false);
    AsyncStorage.setItem(HINT_KEY, 'true');
  };

  return [showHint, markShown] as const;
}
