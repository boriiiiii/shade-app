import { useEffect, useRef, useState, type ReactNode } from 'react';
import {
  View,
  Text,
  Pressable,
  TextInput,
  StyleSheet,
  Animated,
  ViewStyle,
  StyleProp,
} from 'react-native';
import { FONT, FONT_BOLD, colors, radius, spacing, fontSize } from '../theme';
import { DURATION, EASE_OUT, PressableScale, useReducedMotion, useToggleAnim } from './motion';

/**
 * Composants de base, repris de la maquette Figma : cartes gris foncé à rayon
 * 16, accent bleu Shade, plus aucun marqueur ASCII.
 *
 * Les noms et les props sont inchangés par rapport à la version terminal :
 * les écrans qui les consomment n'ont pas à bouger.
 */

/** Carte de contenu, avec un titre au-dessus et un emplacement à droite. */
export function Panel({
  title,
  right,
  children,
  style,
}: {
  title: string;
  right?: ReactNode;
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View style={[styles.panelWrap, style]}>
      <View style={styles.panelHead}>
        <Text style={styles.panelTitle}>{title}</Text>
        {right ? <View>{right}</View> : null}
      </View>
      <View style={styles.panel}>
        <View style={styles.panelBody}>{children}</View>
      </View>
    </View>
  );
}

type BtnVariant = 'default' | 'primary' | 'danger' | 'ghost';

/** Bouton Shade. `active` (ou l'appui) remplit le bouton de sa couleur. */
export function TButton({
  label,
  onPress,
  variant = 'default',
  active = false,
  disabled = false,
  flex,
}: {
  label: string;
  onPress: () => void;
  variant?: BtnVariant;
  active?: boolean;
  disabled?: boolean;
  flex?: boolean;
}) {
  const color =
    variant === 'danger'
      ? colors.down
      : variant === 'ghost'
        ? colors.muted
        : variant === 'primary'
          ? colors.up
          : colors.secondary;
  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      style={({ pressed }) => [
        styles.btn,
        flex ? { flex: 1 } : null,
        { borderColor: color },
        (active || pressed) && !disabled ? { backgroundColor: color } : null,
        disabled ? { opacity: 0.35 } : null,
      ]}
    >
      {({ pressed }) => (
        <Text
          style={[
            styles.btnText,
            { color: (active || pressed) && !disabled ? colors.primary : color },
          ]}
        >
          {label}
        </Text>
      )}
    </Pressable>
  );
}

/**
 * Course du bouton dans son rail : largeur du rail, moins les bordures, moins
 * les marges intérieures, moins le bouton lui-même.
 */
const TRACK_TRAVEL = 44 - 2 * 1 - 2 * 3 - 20;

/** Interrupteur pleine largeur : libellé à gauche, bascule à droite. */
export function TToggle({
  label,
  value,
  onToggle,
  onColor = colors.secondary,
}: {
  label: string;
  value: boolean;
  onToggle: () => void;
  onColor?: string;
}) {
  // Le driver natif ne sait pas interpoler une couleur de fond : on reste en JS,
  // sans conséquence sur un élément de cette taille.
  const anim = useToggleAnim(value, false);

  return (
    <PressableScale onPress={onToggle} style={styles.toggle} scaleTo={0.99}>
      <Text style={styles.toggleLabel}>{label}</Text>
      <Animated.View
        style={[
          styles.track,
          {
            backgroundColor: anim.interpolate({
              inputRange: [0, 1],
              outputRange: [colors.glassFillStrong, onColor],
            }),
          },
        ]}
      >
        <Animated.View
          style={[
            styles.knob,
            {
              transform: [
                {
                  translateX: anim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, TRACK_TRAVEL],
                  }),
                },
              ],
            },
          ]}
        />
      </Animated.View>
    </PressableScale>
  );
}

/** Marge intérieure du rail segmenté, de part et d'autre de la pastille. */
const SEGMENT_PAD = 3;

/**
 * Sélecteur segmenté : plusieurs options, une seule active.
 * La pastille active glisse d'une option à l'autre plutôt que de sauter.
 */
export function Segmented({
  options,
  value,
  onChange,
}: {
  options: { label: string; value: string }[];
  value: string;
  onChange: (v: string) => void;
}) {
  const reduced = useReducedMotion();
  const [width, setWidth] = useState(0);
  const index = Math.max(
    0,
    options.findIndex((o) => o.value === value),
  );
  const anim = useRef(new Animated.Value(index)).current;

  useEffect(() => {
    if (reduced) {
      anim.setValue(index);
      return;
    }
    const a = Animated.timing(anim, {
      toValue: index,
      duration: DURATION.state,
      easing: EASE_OUT,
      useNativeDriver: true,
    });
    a.start();
    return () => a.stop();
  }, [index, reduced, anim]);

  const segmentWidth = width > 0 ? (width - SEGMENT_PAD * 2) / options.length : 0;

  return (
    <View
      style={styles.segmented}
      onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
    >
      {/* Interpoler exige au moins deux points d'entrée. */}
      {segmentWidth > 0 && options.length > 1 ? (
        <Animated.View
          style={[
            styles.segmentIndicator,
            {
              width: segmentWidth,
              transform: [
                {
                  translateX: anim.interpolate({
                    inputRange: options.map((_, i) => i),
                    outputRange: options.map((_, i) => i * segmentWidth),
                  }),
                },
              ],
            },
          ]}
        />
      ) : null}

      {options.map((o) => {
        const on = o.value === value;
        return (
          <Pressable
            key={o.value}
            onPress={() => onChange(o.value)}
            style={styles.segment}
            accessibilityRole="tab"
            accessibilityState={{ selected: on }}
          >
            <Text style={[styles.segmentText, on && styles.segmentTextOn]}>{o.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

/** Réglage numérique : moins, valeur, plus. */
export function Stepper({
  label,
  value,
  unit,
  step,
  min = 0,
  max = Number.MAX_SAFE_INTEGER,
  format,
  onChange,
}: {
  label: string;
  value: number;
  unit?: string;
  step: number;
  min?: number;
  max?: number;
  format?: (v: number) => string;
  onChange: (v: number) => void;
}) {
  const clamp = (v: number) => Math.min(max, Math.max(min, Math.round(v * 1e6) / 1e6));
  const show = format ? format(value) : String(value);
  return (
    <View style={styles.stepper}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={styles.stepperRow}>
        <TButton label="−" onPress={() => onChange(clamp(value - step))} />
        <Text style={styles.stepperValue}>
          {show}
          {unit ? <Text style={styles.unit}> {unit}</Text> : null}
        </Text>
        <TButton label="+" onPress={() => onChange(clamp(value + step))} />
      </View>
    </View>
  );
}

/** Champ de saisie, avec bouton d'action optionnel. */
export function TInput({
  value,
  onChangeText,
  placeholder,
  onSubmit,
  actionLabel,
  onAction,
}: {
  value: string;
  onChangeText: (t: string) => void;
  placeholder?: string;
  onSubmit?: () => void;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <View style={styles.row}>
      <View style={styles.inputWrap}>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          onSubmitEditing={onSubmit}
          placeholder={placeholder}
          placeholderTextColor={colors.muted}
          style={styles.input}
          selectionColor={colors.secondary}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardAppearance="dark"
        />
      </View>
      {actionLabel && onAction ? <TButton label={actionLabel} onPress={onAction} /> : null}
    </View>
  );
}

/** Ligne clé/valeur. */
export function KV({ k, v, color = colors.text }: { k: string; v: string; color?: string }) {
  return (
    <View style={styles.kv}>
      <Text style={styles.kvKey}>{k}</Text>
      <Text style={[styles.kvVal, { color }]} numberOfLines={1}>
        {v}
      </Text>
    </View>
  );
}

/** Tuile de statistique. */
export function StatChip({
  label,
  value,
  color = colors.text,
}: {
  label: string;
  value: string | number;
  color?: string;
}) {
  return (
    <View style={styles.chip}>
      <Text style={[styles.chipValue, { color }]}>{value}</Text>
      <Text style={styles.chipLabel}>{label}</Text>
    </View>
  );
}

export const Row = ({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) => (
  <View style={[styles.row, style]}>{children}</View>
);

const styles = StyleSheet.create({
  panelWrap: { marginBottom: spacing.lg },
  panelHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  panelTitle: {
    fontFamily: FONT_BOLD,
    color: colors.text,
    fontSize: fontSize.base,
  },
  panel: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  panelBody: { gap: spacing.md },

  btn: {
    borderWidth: 1,
    paddingVertical: 10,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    // Verre teinté : voile clair sous un liseré de la couleur de variante.
    backgroundColor: colors.glassFill,
  },
  btnText: { fontFamily: FONT_BOLD, fontSize: 13 },

  toggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.glassFill,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  toggleLabel: { fontFamily: FONT, color: colors.text, fontSize: fontSize.sm },
  track: {
    width: 44,
    height: 26,
    borderRadius: radius.pill,
    padding: 3,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  knob: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.text,
    alignSelf: 'flex-start',
  },

  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },

  segmented: {
    flexDirection: 'row',
    backgroundColor: colors.glassFill,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    borderRadius: radius.pill,
    padding: SEGMENT_PAD,
  },
  segmentIndicator: {
    position: 'absolute',
    left: SEGMENT_PAD,
    top: SEGMENT_PAD,
    bottom: SEGMENT_PAD,
    backgroundColor: colors.secondary,
    borderRadius: radius.pill,
  },
  segment: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 9,
    borderRadius: radius.pill,
  },
  segmentText: { fontFamily: FONT, color: colors.textSecond, fontSize: 13 },
  segmentTextOn: { fontFamily: FONT_BOLD, color: colors.text },

  stepper: { gap: spacing.sm },
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  stepperValue: {
    flex: 1,
    textAlign: 'center',
    fontFamily: FONT_BOLD,
    color: colors.text,
    fontSize: fontSize.lg,
  },
  unit: { color: colors.textSecond, fontSize: fontSize.xs, fontWeight: '400' },
  fieldLabel: { fontFamily: FONT, color: colors.textSecond, fontSize: fontSize.xs },

  inputWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.glassFill,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: 10,
  },
  input: { flex: 1, fontFamily: FONT, color: colors.text, fontSize: fontSize.sm, padding: 0 },

  kv: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  kvKey: { fontFamily: FONT, color: colors.textSecond, fontSize: fontSize.xs },
  kvVal: {
    fontFamily: FONT,
    fontSize: fontSize.xs,
    flexShrink: 1,
    marginLeft: spacing.md,
    textAlign: 'right',
  },

  chip: {
    flex: 1,
    backgroundColor: colors.glassFill,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  chipValue: { fontFamily: FONT_BOLD, fontSize: fontSize.lg },
  chipLabel: { fontFamily: FONT, color: colors.textSecond, fontSize: 11, marginTop: 2 },
});
