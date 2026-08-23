import { View, Text, Pressable, StyleSheet } from 'react-native';
import { MONO, colors } from '../theme';

export interface TabItem {
  key: string;
  label: string;
  live?: boolean; // point vert (moteur actif)
}

/** Barre d'onglets façon touches de fonction : [1]DASH [2]COPY … */
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
    <View style={styles.bar}>
      {items.map((it, i) => {
        const on = it.key === active;
        return (
          <Pressable
            key={it.key}
            onPress={() => onChange(it.key)}
            style={[styles.tab, on && styles.tabOn]}
          >
            <Text style={[styles.num, on && styles.textOn]}>{i + 1}</Text>
            <Text style={[styles.label, on && styles.textOn]}>{it.label}</Text>
            {it.live ? <Text style={styles.dot}>●</Text> : null}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    backgroundColor: colors.bg,
    borderBottomWidth: 1,
    borderColor: colors.border,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 9,
    borderRightWidth: 1,
    borderColor: colors.border,
  },
  tabOn: { backgroundColor: colors.greenDim },
  num: { fontFamily: MONO, color: colors.gray, fontSize: 10 },
  label: { fontFamily: MONO, color: colors.green, fontSize: 12, fontWeight: '700', letterSpacing: 0.5 },
  textOn: { color: colors.bg },
  dot: { color: colors.green, fontSize: 8, marginLeft: 2 },
});
