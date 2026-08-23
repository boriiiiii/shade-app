import { useRef, useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet } from 'react-native';
import { MONO, colors } from '../theme';
import { Cursor } from './Cursor';

/** Ligne de commande façon shell : prompt + saisie + curseur clignotant au repos. */
export function CommandBar({ onSubmit }: { onSubmit: (cmd: string) => void }) {
  const [value, setValue] = useState('');
  const [focused, setFocused] = useState(false);
  const ref = useRef<TextInput>(null);

  const submit = () => {
    const v = value.trim();
    if (!v) return;
    onSubmit(v);
    setValue('');
  };

  return (
    <Pressable style={styles.wrap} onPress={() => ref.current?.focus()}>
      <Text style={styles.prompt}>shade</Text>
      <Text style={styles.dollar}> $ </Text>
      <View style={styles.inputRow}>
        <TextInput
          ref={ref}
          value={value}
          onChangeText={setValue}
          onSubmitEditing={submit}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder="type a command — help"
          placeholderTextColor={colors.gray}
          style={styles.input}
          selectionColor={colors.green}
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="off"
          keyboardAppearance="dark"
          returnKeyType="send"
          submitBehavior="submit"
          autoFocus
        />
        {value === '' && !focused ? <Cursor /> : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bgPanel,
    borderTopWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  prompt: { fontFamily: MONO, color: colors.green, fontSize: 14, fontWeight: '700' },
  dollar: { fontFamily: MONO, color: colors.amber, fontSize: 14, fontWeight: '700' },
  inputRow: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  input: { flex: 1, fontFamily: MONO, color: colors.white, fontSize: 14, padding: 0 },
});
