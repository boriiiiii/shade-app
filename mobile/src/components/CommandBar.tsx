import { useRef, useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet } from 'react-native';
import { FONT, FONT_BOLD, colors, radius, spacing, fontSize } from '../theme';

/**
 * Barre de saisie de commande.
 *
 * Le comportement est identique à la version terminal (même `onSubmit`, même
 * validation) ; seule la présentation passe à la charte Shade : champ arrondi
 * sur fond sombre et bouton d'envoi, sans prompt ni curseur clignotant.
 */
export function CommandBar({ onSubmit }: { onSubmit: (cmd: string) => void }) {
  const [value, setValue] = useState('');
  const ref = useRef<TextInput>(null);

  const submit = () => {
    const v = value.trim();
    if (!v) return;
    onSubmit(v);
    setValue('');
  };

  const empty = value.trim() === '';

  return (
    <View style={styles.wrap}>
      <Pressable style={styles.field} onPress={() => ref.current?.focus()}>
        <TextInput
          ref={ref}
          value={value}
          onChangeText={setValue}
          onSubmitEditing={submit}
          placeholder="Tape une commande — help"
          placeholderTextColor={colors.muted}
          style={styles.input}
          selectionColor={colors.secondary}
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="off"
          keyboardAppearance="dark"
          returnKeyType="send"
          submitBehavior="submit"
          autoFocus
        />
      </Pressable>
      <Pressable
        onPress={submit}
        disabled={empty}
        style={({ pressed }) => [
          styles.send,
          empty ? styles.sendOff : null,
          pressed && !empty ? styles.sendPressed : null,
        ]}
      >
        <Text style={[styles.sendText, empty ? { color: colors.muted } : null]}>Envoyer</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.screen,
    paddingVertical: spacing.md,
  },
  field: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: colors.glassFill,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.lg,
    paddingVertical: 10,
  },
  input: { fontFamily: FONT, color: colors.text, fontSize: fontSize.sm, padding: 0 },
  send: {
    backgroundColor: colors.secondary,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.lg,
    paddingVertical: 11,
  },
  sendOff: { backgroundColor: colors.surface },
  sendPressed: { opacity: 0.8 },
  sendText: {
    fontFamily: FONT_BOLD,
    color: colors.text,
    fontSize: fontSize.xs,
  },
});
