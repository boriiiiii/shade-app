import { ReactNode } from 'react';
import {
  View,
  Text,
  Pressable,
  TextInput,
  StyleSheet,
  ViewStyle,
  StyleProp,
} from 'react-native';
import { MONO, colors } from '../theme';

/** Conteneur encadré façon "fieldset" terminal, avec une légende sur le cadre. */
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
    <View style={[styles.panel, style]}>
      <Text style={styles.panelTitle}>▓ {title}</Text>
      {right ? <View style={styles.panelRight}>{right}</View> : null}
      <View style={styles.panelBody}>{children}</View>
    </View>
  );
}

type BtnVariant = 'default' | 'primary' | 'danger' | 'ghost';

/** Bouton [ LABEL ] terminal. Actif = couleurs inversées. */
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
  const base =
    variant === 'danger' ? colors.red : variant === 'primary' ? colors.amber : colors.green;
  const color = variant === 'ghost' ? colors.gray : base;
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
            { color: (active || pressed) && !disabled ? colors.bg : color },
          ]}
        >
          {label}
        </Text>
      )}
    </Pressable>
  );
}

/** Toggle pleine largeur : label à gauche, ● ON / ○ OFF à droite. */
export function TToggle({
  label,
  value,
  onToggle,
  onColor = colors.green,
}: {
  label: string;
  value: boolean;
  onToggle: () => void;
  onColor?: string;
}) {
  return (
    <Pressable onPress={onToggle} style={styles.toggle}>
      <Text style={styles.toggleLabel}>{label}</Text>
      <Text style={[styles.toggleState, { color: value ? onColor : colors.gray }]}>
        {value ? '● ON ' : '○ OFF'}
      </Text>
    </Pressable>
  );
}

/** Sélecteur segmenté : plusieurs options, une seule active. */
export function Segmented({
  options,
  value,
  onChange,
}: {
  options: { label: string; value: string }[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <View style={styles.row}>
      {options.map((o) => (
        <TButton
          key={o.value}
          label={o.label}
          onPress={() => onChange(o.value)}
          active={o.value === value}
          flex
        />
      ))}
    </View>
  );
}

/** Réglage numérique : [ − ]  valeur  [ + ]. */
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
        <TButton label="  −  " onPress={() => onChange(clamp(value - step))} />
        <Text style={styles.stepperValue}>
          {show}
          {unit ? <Text style={styles.unit}> {unit}</Text> : null}
        </Text>
        <TButton label="  +  " onPress={() => onChange(clamp(value + step))} />
      </View>
    </View>
  );
}

/** Champ de saisie terminal avec préfixe ">" et bouton d'action optionnel. */
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
        <Text style={styles.caret}>{'>'}</Text>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          onSubmitEditing={onSubmit}
          placeholder={placeholder}
          placeholderTextColor={colors.gray}
          style={styles.input}
          selectionColor={colors.green}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardAppearance="dark"
        />
      </View>
      {actionLabel && onAction ? <TButton label={actionLabel} onPress={onAction} /> : null}
    </View>
  );
}

/** Ligne clé/valeur monospace. */
export function KV({ k, v, color = colors.white }: { k: string; v: string; color?: string }) {
  return (
    <View style={styles.kv}>
      <Text style={styles.kvKey}>{k}</Text>
      <Text style={[styles.kvVal, { color }]} numberOfLines={1}>
        {v}
      </Text>
    </View>
  );
}

/** Petite "puce" de statistique. */
export function StatChip({ label, value, color = colors.green }: { label: string; value: string | number; color?: string }) {
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
  panel: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.bgPanel,
    paddingTop: 16,
    paddingBottom: 12,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  panelTitle: {
    position: 'absolute',
    top: -8,
    left: 10,
    backgroundColor: colors.bg,
    paddingHorizontal: 5,
    fontFamily: MONO,
    color: colors.greenDim,
    fontSize: 11,
    letterSpacing: 1,
  },
  panelRight: { position: 'absolute', top: -9, right: 10, backgroundColor: colors.bg, paddingHorizontal: 5 },
  panelBody: { gap: 10 },

  btn: {
    borderWidth: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  btnText: { fontFamily: MONO, fontSize: 12.5, fontWeight: '700', letterSpacing: 0.5 },

  toggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  toggleLabel: { fontFamily: MONO, color: colors.white, fontSize: 13, letterSpacing: 0.5 },
  toggleState: { fontFamily: MONO, fontSize: 13, fontWeight: '700' },

  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },

  stepper: { gap: 6 },
  stepperRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  stepperValue: { flex: 1, textAlign: 'center', fontFamily: MONO, color: colors.green, fontSize: 15, fontWeight: '700' },
  unit: { color: colors.gray, fontSize: 12, fontWeight: '400' },
  fieldLabel: { fontFamily: MONO, color: colors.gray, fontSize: 11, letterSpacing: 0.5 },

  inputWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  caret: { fontFamily: MONO, color: colors.amber, fontSize: 13, marginRight: 6 },
  input: { flex: 1, fontFamily: MONO, color: colors.white, fontSize: 13, padding: 0 },

  kv: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  kvKey: { fontFamily: MONO, color: colors.gray, fontSize: 12 },
  kvVal: { fontFamily: MONO, fontSize: 12, flexShrink: 1, marginLeft: 10, textAlign: 'right' },

  chip: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 8,
    alignItems: 'center',
  },
  chipValue: { fontFamily: MONO, fontSize: 16, fontWeight: '700' },
  chipLabel: { fontFamily: MONO, color: colors.gray, fontSize: 9.5, letterSpacing: 0.5, marginTop: 2 },
});
