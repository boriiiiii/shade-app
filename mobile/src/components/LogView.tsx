import { FlatList, Text, StyleSheet, View } from 'react-native';
import { useMemo } from 'react';
import { MONO, colors, levelColor, levelTag } from '../theme';
import type { LogEntry } from '../types';

function hhmmss(ts: number): string {
  const d = new Date(ts);
  const p = (n: number) => String(n).padStart(2, '0');
  return `${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
}

function Line({ item }: { item: LogEntry }) {
  const color = levelColor[item.level];
  return (
    <View style={styles.line}>
      <Text style={styles.time}>{hhmmss(item.ts)}</Text>
      <Text style={[styles.tag, { color }]}>{levelTag[item.level]}</Text>
      <Text selectable style={[styles.msg, { color }]}>
        <Text style={styles.src}>{item.source}</Text> {item.message}
      </Text>
    </View>
  );
}

/** Flux de logs défilant (inversé → collé au bas, façon console live). */
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
  list: { flex: 1, backgroundColor: colors.bg },
  content: { paddingHorizontal: 10, paddingVertical: 8 },
  line: { flexDirection: 'row', alignItems: 'flex-start', marginVertical: 1 },
  time: { fontFamily: MONO, color: colors.gray, fontSize: 11, marginRight: 6 },
  tag: { fontFamily: MONO, fontSize: 11, width: 22, marginRight: 6 },
  msg: { fontFamily: MONO, fontSize: 12.5, flex: 1, lineHeight: 17 },
  src: { color: colors.greenDim },
});
