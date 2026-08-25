import type { ComponentType } from 'react';
import { View, Pressable, StyleSheet, Animated } from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';
import { BlurView } from 'expo-blur';
import { colors, radius, spacing } from '../theme';
import { useToggleAnim } from './motion';

export interface TabItem {
  key: string;
  /** Sert de libellé d'accessibilité : la maquette n'affiche que l'icône. */
  label: string;
  /** Pastille d'activité (moteur en marche, ordres en attente). */
  live?: boolean;
  icon: ComponentType<{ size?: number; color?: string }>;
}

const ICON_SIZE = 28;
const PILL_HEIGHT = 60;

/**
 * Hauteur totale occupée par la barre. La barre flottant au-dessus du contenu,
 * les écrans doivent réserver cette hauteur en bas de leur zone défilante pour
 * que rien ne finisse caché dessous.
 */
export const TAB_BAR_HEIGHT = PILL_HEIGHT + spacing.xs;

/**
 * Un onglet. Extrait en composant pour que chaque onglet porte sa propre
 * animation d'état — les hooks ne peuvent pas vivre dans une boucle.
 */
function Tab({
  item,
  active,
  onPress,
}: {
  item: TabItem;
  active: boolean;
  onPress: () => void;
}) {
  const anim = useToggleAnim(active);
  const Icon = item.icon;

  return (
    <Pressable
      onPress={onPress}
      style={styles.tab}
      accessibilityRole="tab"
      accessibilityState={{ selected: active }}
      accessibilityLabel={item.label}
    >
      {/* Halo bleu sous l'icône active — l'ellipse 44 px de la maquette */}
      <Animated.View
        style={[
          styles.glow,
          {
            opacity: anim.interpolate({ inputRange: [0, 1], outputRange: [0, 0.18] }),
            transform: [
              { scale: anim.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1] }) },
            ],
          },
        ]}
      />
      <Animated.View
        style={{
          transform: [
            { scale: anim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.08] }) },
          ],
        }}
      >
        <Icon size={ICON_SIZE} color={active ? colors.secondary : colors.accent} />
      </Animated.View>
      {item.live ? <View style={styles.dot} /> : null}
    </Pressable>
  );
}

/**
 * Barre de navigation flottante, reprise de la frame « Navbar » (104:452) de
 * la maquette : capsule de 60 pt de haut, rayon 40, dégradé vertical de
 * rgba(42,42,42,.9) vers rgba(0,0,0,.9), et halo bleu sous l'onglet actif.
 *
 * Le contrat du composant est inchangé côté navigation (items / active /
 * onChange) : seule la présentation évolue, et `icon` vient s'y ajouter.
 */
export function TabBar({
  items,
  active,
  onChange,
}: {
  items: TabItem[];
  active: string;
  onChange: (key: string) => void;
}) {
  return (
    <View style={styles.wrap} pointerEvents="box-none">
      <View style={styles.pill}>
        {/*
          Flou d'arrière-plan. La maquette Figma n'en contient pas — c'est un
          ajout assumé pour obtenir l'effet de verre demandé.
          Sur Android le flou réel exige `experimentalBlurMethod` ; sans lui,
          expo-blur retombe sur un simple voile semi-transparent.
        */}
        <BlurView
          intensity={18}
          tint="dark"
          experimentalBlurMethod="dimezisBlurView"
          style={StyleSheet.absoluteFill}
        />

        {/*
          Dégradé par-dessus le flou, rendu en SVG. Volontairement moins opaque
          que les 0,9 du Figma : à 0,9 le flou serait entièrement masqué.
        */}
        <Svg style={StyleSheet.absoluteFill} width="100%" height="100%">
          <Defs>
            <LinearGradient id="navGradient" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor="#2a2a2a" stopOpacity="0.55" />
              <Stop offset="1" stopColor="#000000" stopOpacity="0.75" />
            </LinearGradient>
          </Defs>
          <Rect
            x="0"
            y="0"
            width="100%"
            height="100%"
            rx={radius.xxl}
            fill="url(#navGradient)"
          />
        </Svg>

        {items.map((it) => (
          <Tab
            key={it.key}
            item={it}
            active={it.key === active}
            onPress={() => onChange(it.key)}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    // La maquette place la capsule en position absolue (`absolute bottom-[20px]`)
    // : le contenu défile DERRIÈRE elle, et c'est ce passage sous un fond à 90 %
    // qui produit l'effet de verre. En flux normal, l'alpha ne servirait à rien.
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 10,
    // `SafeAreaView` réserve déjà l'indicateur d'accueil : un retrait minimal
    // suffit pour ne pas coller au bord.
    paddingBottom: spacing.xs,
    backgroundColor: 'transparent',
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    height: PILL_HEIGHT,
    borderRadius: radius.xxl,
    overflow: 'hidden',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'stretch',
  },
  glow: {
    position: 'absolute',
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.secondary,
  },
  dot: {
    position: 'absolute',
    top: 12,
    right: '28%',
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.up,
  },
});
