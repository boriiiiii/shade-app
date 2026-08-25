import { View, Text, StyleSheet } from 'react-native';
import type { LessonBlock, CalloutVariant, Level } from '../academy/types';
import { FONT, FONT_BOLD, FONT_REGULAR, colors, radius, spacing, fontSize } from '../theme';

/** Icône textuelle, libellé et couleur de chaque variante d'encadré. */
const VARIANT: Record<CalloutVariant, { label: string; color: string }> = {
  info: { label: 'Bon à savoir', color: colors.secondary },
  warning: { label: 'Attention', color: colors.mainShape },
  key: { label: 'À retenir', color: colors.up },
};

const LEVEL: Record<Level, { label: string; color: string }> = {
  debutant: { label: 'Débutant', color: colors.up },
  intermediaire: { label: 'Intermédiaire', color: colors.secondary },
  avance: { label: 'Avancé', color: colors.mainShape },
};

/** Pastille de niveau d'une leçon. */
export function LevelBadge({ level }: { level: Level }) {
  const { label, color } = LEVEL[level];
  return (
    <View style={[styles.badge, { backgroundColor: `${color}26` }]}>
      <Text style={[styles.badgeText, { color }]}>{label}</Text>
    </View>
  );
}

/** Encadré mis en avant au sein d'une leçon. */
function Callout({ variant, text }: { variant: CalloutVariant; text: string }) {
  const { label, color } = VARIANT[variant];
  return (
    <View style={[styles.callout, { backgroundColor: `${color}1A`, borderLeftColor: color }]}>
      <Text style={[styles.calloutLabel, { color }]}>{label.toUpperCase()}</Text>
      <Text style={styles.calloutText}>{text}</Text>
    </View>
  );
}

/**
 * Rend un bloc de contenu de leçon selon son type.
 * Ajouter un type de bloc revient à ajouter un `case` ici.
 */
export function LessonBlockView({ block }: { block: LessonBlock }) {
  switch (block.type) {
    case 'paragraph':
      return <Text style={styles.paragraph}>{block.text}</Text>;

    case 'heading':
      // Les titres délimitent les chapitres et sont rendus par l'en-tête de
      // chapitre : les afficher ici les ferait apparaître deux fois.
      return null;

    case 'callout':
      return <Callout variant={block.variant} text={block.text} />;

    case 'list':
      return (
        <View style={styles.list}>
          {block.items.map((item, i) => (
            <View key={i} style={styles.listItem}>
              <View style={styles.bullet} />
              <Text style={styles.listText}>{item}</Text>
            </View>
          ))}
        </View>
      );

    default:
      return null;
  }
}

/** Bandeau rappelant que le contenu n'est pas un conseil financier. */
export function Disclaimer() {
  return (
    <View style={styles.disclaimer}>
      <Text style={styles.disclaimerText}>
        Contenu strictement éducatif. Ces informations ne constituent pas un conseil financier,
        fiscal ou d&apos;investissement. Toute décision relève de votre seule responsabilité.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  paragraph: {
    fontFamily: FONT_REGULAR,
    color: colors.textSecond,
    fontSize: fontSize.sm,
    lineHeight: 22,
    marginBottom: spacing.md,
  },
  list: { marginBottom: spacing.md, gap: spacing.sm },
  listItem: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md },
  bullet: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.secondary,
    marginTop: 8,
  },
  listText: {
    flex: 1,
    fontFamily: FONT_REGULAR,
    color: colors.textSecond,
    fontSize: fontSize.sm,
    lineHeight: 22,
  },
  callout: {
    borderRadius: radius.md,
    borderLeftWidth: 3,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  calloutLabel: { fontFamily: FONT_BOLD, fontSize: 10, letterSpacing: 0.6, marginBottom: 4 },
  calloutText: {
    fontFamily: FONT_REGULAR,
    color: colors.text,
    fontSize: fontSize.xs,
    lineHeight: 20,
  },
  badge: {
    alignSelf: 'flex-start',
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
  },
  badgeText: { fontFamily: FONT, fontSize: 11 },
  disclaimer: {
    backgroundColor: colors.glassFill,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    borderRadius: radius.md,
    padding: spacing.lg,
    marginTop: spacing.lg,
  },
  disclaimerText: {
    fontFamily: FONT_REGULAR,
    color: colors.textSecond,
    fontSize: 11,
    lineHeight: 17,
  },
});
