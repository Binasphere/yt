import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Image, StyleSheet, View } from 'react-native';

/**
 * The opening screen.
 *
 * The native splash configured in app.json covers the gap before any
 * JavaScript runs, and then disappears the moment the bundle is ready, which
 * on a warm start is almost immediately. This holds the same image for a beat
 * longer so the app opens on its own mark rather than snapping straight to a
 * PIN pad, and fades out rather than cutting.
 *
 * It is drawn over everything instead of being a route of its own. A splash
 * route has to be navigated away from, which means it participates in the back
 * stack, and an app you can navigate *back* into a splash screen from is an app
 * that looks broken. An overlay has no such history.
 */

const HOLD_MS = 1400;
const FADE_MS = 420;

export function Splash() {
  const [gone, setGone] = useState(false);
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const timer = setTimeout(() => {
      Animated.timing(opacity, {
        toValue: 0,
        duration: FADE_MS,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }).start(() => setGone(true));
    }, HOLD_MS);

    return () => clearTimeout(timer);
  }, [opacity]);

  // Unmounted rather than left at zero opacity: an invisible view over the
  // whole screen still swallows the first tap on the PIN pad.
  if (gone) return null;

  return (
    <Animated.View style={[styles.fill, { opacity }]} pointerEvents="none">
      <View style={styles.centre}>
        <Image
          source={require('../assets/splash.png')}
          style={styles.mark}
          resizeMode="contain"
          accessibilityIgnoresInvertColors
        />
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  fill: {
    ...StyleSheet.absoluteFill,
    zIndex: 100,
    elevation: 100,
    // The image's own background, so the edges of a device it does not exactly
    // fit are the same colour rather than a white or black band.
    backgroundColor: '#D3F8DF',
  },
  centre: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mark: {
    width: '100%',
    height: '100%',
  },
});
