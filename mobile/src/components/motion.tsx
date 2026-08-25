import { useEffect, useRef, useState, type ReactNode } from 'react';
import {
  AccessibilityInfo,
  Animated,
  Easing,
  Pressable,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

/**
 * Briques d'animation de l'app.
 *
 * La maquette Figma ne contient aucune animation — elle enchaîne des frames
 * statiques reliées par un prototype, et Figma n'expose pas les transitions de
 * navigation d'un prototype. Ces mouvements sont donc écrits pour Shade, pas
 * repris du fichier : ils restent volontairement sobres et courts.
 *
 * Tout est piloté par le driver natif (opacité et transformations uniquement),
 * sauf la largeur des points de pagination, qui ne peut pas l'être.
 */

/** Durées, en millisecondes. */
export const DURATION = {
  /** Apparition d'un écran ou d'un bloc. */
  enter: 220,
  /** Retour d'appui : doit être quasi instantané. */
  press: 110,
  /** Changement d'état d'un indicateur. */
  state: 200,
};

/** Courbe standard : démarre vite, ralentit à l'arrivée. */
export const EASE_OUT = Easing.bezier(0.22, 1, 0.36, 1);

/**
 * Indique si l'utilisateur a demandé de réduire les animations dans les
 * réglages système. Toutes les animations d'ici doivent la respecter.
 */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    let alive = true;
    AccessibilityInfo.isReduceMotionEnabled().then((v) => {
      if (alive) setReduced(v);
    });
    const sub = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduced);
    return () => {
      alive = false;
      sub?.remove();
    };
  }, []);

  return reduced;
}

/**
 * Fait apparaître son contenu en fondu, avec une légère remontée.
 *
 * Changer `trigger` rejoue l'animation : c'est ce qui donne sa transition au
 * changement d'onglet ou d'écran interne.
 */
export function FadeIn({
  children,
  trigger,
  delay = 0,
  style,
}: {
  children: ReactNode;
  /** Rejoue l'animation quand cette valeur change. */
  trigger?: string | number;
  delay?: number;
  style?: StyleProp<ViewStyle>;
}) {
  const reduced = useReducedMotion();
  const progress = useRef(new Animated.Value(reduced ? 1 : 0)).current;

  useEffect(() => {
    if (reduced) {
      progress.setValue(1);
      return;
    }
    progress.setValue(0);
    const anim = Animated.timing(progress, {
      toValue: 1,
      duration: DURATION.enter,
      delay,
      easing: EASE_OUT,
      useNativeDriver: true,
    });
    anim.start();
    return () => anim.stop();
  }, [trigger, reduced, delay, progress]);

  return (
    <Animated.View
      style={[
        style,
        {
          opacity: progress,
          transform: [
            { translateY: progress.interpolate({ inputRange: [0, 1], outputRange: [8, 0] }) },
          ],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
}

/**
 * Pressable qui se rétracte légèrement à l'appui.
 * Remplace un `activeOpacity` : plus discret et plus physique.
 */
export function PressableScale({
  children,
  style,
  scaleTo = 0.97,
  ...rest
}: PressableProps & {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  /** Échelle atteinte pendant l'appui. */
  scaleTo?: number;
}) {
  const reduced = useReducedMotion();
  const scale = useRef(new Animated.Value(1)).current;

  const to = (v: number) =>
    Animated.timing(scale, {
      toValue: v,
      duration: DURATION.press,
      easing: EASE_OUT,
      useNativeDriver: true,
    }).start();

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <Pressable
        {...rest}
        style={style}
        onPressIn={(e) => {
          if (!reduced) to(scaleTo);
          rest.onPressIn?.(e);
        }}
        onPressOut={(e) => {
          if (!reduced) to(1);
          rest.onPressOut?.(e);
        }}
      >
        {children}
      </Pressable>
    </Animated.View>
  );
}

/**
 * Anime une valeur booléenne vers 0 ou 1.
 * Sert aux états actif/inactif (halo d'onglet, point de pagination).
 */
export function useToggleAnim(active: boolean, useNative = true) {
  const reduced = useReducedMotion();
  const value = useRef(new Animated.Value(active ? 1 : 0)).current;

  useEffect(() => {
    if (reduced) {
      value.setValue(active ? 1 : 0);
      return;
    }
    const anim = Animated.timing(value, {
      toValue: active ? 1 : 0,
      duration: DURATION.state,
      easing: EASE_OUT,
      useNativeDriver: useNative,
    });
    anim.start();
    return () => anim.stop();
  }, [active, reduced, useNative, value]);

  return value;
}
