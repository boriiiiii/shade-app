import { FlatList, Text, StyleSheet, View } from 'react-native';
import { useMemo } from 'react';
import { FONT, FONT_BOLD, colors, levelColor, levelTag, spacing, fontSize } from '../theme';
import type { LogEntry } from '../types';

function hhmmss(ts: number): string {
  const d = new Date(ts);
  const p = (n: number) => String(n).padStart(2, '0');
  return `${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
}

function Line({ item }: { item: LogEntry }) {
  const color = levelColor[item.level];
  const tag = levelTag[item.level];
  return (
    <View style={styles.line}>
      <Text style={styles.time}>{hhmmss(item.ts)}</Text>
      <View style={[styles.marker, { backgroundColor: color }]} />
      <Text selectable style={styles.msg}>
        <Text style={styles.src}>{item.source}</Text>
        {tag ? <Text style={[styles.tag, { color }]}> {tag}</Text> : null}
        <Text style={{ color }}> {item.message}</Text>
      </Text>
    </View>
  );
}

/** Flux de logs défilant, le plus récent collé en bas. */
export function LogView({ logs }: { logs: LogEntry[] }) {
  // inverted : index 0 = bas de l'écran → data en ordre "plus récent d'abord".
  const data = useMemo(() => [...logs].reverse(), [logs]);
  return (
    <FlatList
      style={styles.list}
      contentContainerStyle={styles.content}
      data={data}
      inverted
      keyExtractor={(i) => i.id}
      renderItem={Line}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    />
  );
}

const styles = StyleSheet.create({
  list: { flex: 1, backgroundColor: colors.primary },
  content: { paddingHorizontal: spacing.screen, paddingVertical: spacing.sm },
  line: { flexDirection: 'row', alignItems: 'flex-start', marginVertical: 2 },
  time: { fontFamily: FONT, color: colors.muted, fontSize: 11, marginRight: spacing.sm },
  marker: {
    width: 3,
    alignSelf: 'stretch',
    borderRadius: 2,
    marginRight: spacing.sm,
    minHeight: 14,
  },
  tag: { fontFamily: FONT_BOLD, fontSize: fontSize.xs },
  msg: { fontFamily: FONT, fontSize: fontSize.xs, flex: 1, lineHeight: 18 },
  src: { color: colors.textSecond },
});
