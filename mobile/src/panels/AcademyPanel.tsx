import { useMemo, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  TextInput,
  StyleSheet,
  Dimensions,
  Animated,
  type NativeSyntheticEvent,
  type NativeScrollEvent,
} from 'react-native';
import { CATEGORIES, getCategory } from '../academy/categories';
import { GLOSSARY, GLOSSARY_THEMES } from '../academy/glossary';
import { LESSONS, getLesson, getLessonsByCategory } from '../academy/lessons';
import { toChapters } from '../academy/chapters';
import type { GlossaryThemeId } from '../academy/types';
import { FONT, FONT_BOLD, FONT_REGULAR, colors, radius, spacing, fontSize } from '../theme';
import { LessonBlockView, LevelBadge, Disclaimer } from '../components/LessonBlocks';
import { FadeIn, PressableScale, useToggleAnim } from '../components/motion';

/** Largeur utile : l'écran moins les marges latérales appliquées par App.tsx. */
const PAGE_WIDTH = Dimensions.get('window').width - spacing.screen * 2;

type View_ =
  | { name: 'home' }
  | { name: 'category'; categoryId: string }
  | { name: 'lesson'; lessonId: string }
  | { name: 'glossary' };

/**
 * Point de pagination d'un chapitre. La largeur ne peut pas passer par le
 * driver natif : l'animation reste en JS, ce qui est sans incidence sur un
 * élément de cette taille.
 */
function Dot({ active }: { active: boolean }) {
  const anim = useToggleAnim(active, false);
  return (
    <Animated.View
      style={[
        styles.dot,
        {
          width: anim.interpolate({ inputRange: [0, 1], outputRange: [6, 18] }),
          backgroundColor: anim.interpolate({
            inputRange: [0, 1],
            outputRange: [colors.accent, colors.text],
          }),
        },
      ]}
    />
  );
}

/** Bouton de retour, repris de la maquette (chevron seul en haut à gauche). */
function BackButton({ onPress }: { onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      hitSlop={12}
      style={styles.back}
      accessibilityRole="button"
      accessibilityLabel="Retour"
    >
      <Text style={styles.backChevron}>‹</Text>
    </Pressable>
  );
}

/** Accueil : accès au glossaire, liste des parcours, puis console de test. */
function Home({
  go,
  onOpenConsole,
}: {
  go: (v: View_) => void;
  onOpenConsole: () => void;
}) {
  return (
    <>
      <Text style={styles.title}>Academy</Text>
      <Text style={styles.subtitle}>
        Comprends la crypto, les marchés et leur écosystème, à ton rythme.
      </Text>

      <PressableScale style={styles.glossaryCard} onPress={() => go({ name: 'glossary' })}>
        <View style={styles.glossaryText}>
          <Text style={styles.cardTitle}>Glossaire</Text>
          <Text style={styles.cardSub}>Le vocabulaire crypto expliqué simplement.</Text>
        </View>
        <Text style={styles.chevron}>›</Text>
      </PressableScale>

      <Text style={styles.sectionLabel}>Parcours</Text>
      {CATEGORIES.map((c) => {
        const count = getLessonsByCategory(c.id).length;
        return (
          <PressableScale
            key={c.id}
            style={styles.categoryCard}
            onPress={() => go({ name: 'category', categoryId: c.id })}
          >
            <View style={[styles.categoryDot, { backgroundColor: c.accentColor }]} />
            <View style={styles.glossaryText}>
              <Text style={styles.cardTitle}>{c.title}</Text>
              <Text style={styles.cardSub}>{c.description}</Text>
              <Text style={styles.count}>
                {count} leçon{count > 1 ? 's' : ''}
              </Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </PressableScale>
        );
      })}

      <Disclaimer />

      {/* Outil de développement : volontairement discret, en toute fin d'écran. */}
      <PressableScale
        style={styles.consoleButton}
        onPress={onOpenConsole}
        accessibilityRole="button"
        accessibilityLabel="Ouvrir la console de test"
      >
        <Text style={styles.consoleLabel}>Console de test</Text>
        <Text style={styles.chevron}>›</Text>
      </PressableScale>
    </>
  );
}

/** Liste des leçons d'un parcours. */
function Category({ categoryId, go }: { categoryId: string; go: (v: View_) => void }) {
  const category = getCategory(categoryId);
  const lessons = getLessonsByCategory(categoryId);
  return (
    <>
      <BackButton onPress={() => go({ name: 'home' })} />
      <Text style={styles.title}>{category?.title ?? 'Parcours'}</Text>
      {category?.description ? <Text style={styles.subtitle}>{category.description}</Text> : null}

      {lessons.map((l) => (
        <PressableScale
          key={l.id}
          style={styles.lessonCard}
          onPress={() => go({ name: 'lesson', lessonId: l.id })}
        >
          <Text style={styles.cardTitle}>{l.title}</Text>
          <Text style={styles.cardSub}>{l.summary}</Text>
          <View style={styles.lessonMeta}>
            <LevelBadge level={l.level} />
            <Text style={styles.count}>{l.readingMinutes} min</Text>
          </View>
        </PressableScale>
      ))}
    </>
  );
}

/**
 * Lecteur d'une leçon : en-tête puis chapitres faits défiler horizontalement,
 * avec les points de pagination de la maquette.
 */
function LessonView({ lessonId, go }: { lessonId: string; go: (v: View_) => void }) {
  const lesson = getLesson(lessonId);
  const chapters = useMemo(() => (lesson ? toChapters(lesson) : []), [lesson]);
  const [page, setPage] = useState(0);

  if (!lesson) {
    return (
      <>
        <BackButton onPress={() => go({ name: 'home' })} />
        <Text style={styles.cardSub}>Leçon introuvable.</Text>
      </>
    );
  }

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const i = Math.round(e.nativeEvent.contentOffset.x / PAGE_WIDTH);
    if (i !== page) setPage(i);
  };

  return (
    <>
      <BackButton onPress={() => go({ name: 'category', categoryId: lesson.categoryId })} />

      <View style={styles.lessonHero}>
        <Text style={styles.lessonTitle}>{lesson.title}</Text>
        <Text style={styles.lessonSummary}>{lesson.summary}</Text>
        <View style={styles.lessonMeta}>
          <LevelBadge level={lesson.level} />
          <Text style={styles.count}>{lesson.readingMinutes} min de lecture</Text>
        </View>
      </View>

      <View style={styles.dots}>
        {chapters.map((_, i) => (
          <Dot key={i} active={i === page} />
        ))}
      </View>

      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        style={{ width: PAGE_WIDTH }}
      >
        {chapters.map((ch, i) => (
          <View key={i} style={styles.chapter}>
            <Text style={styles.chapterLabel}>
              Chapitre {i + 1} sur {chapters.length}
            </Text>
            <Text style={styles.chapterTitle}>{ch.title}</Text>
            {ch.blocks.map((b, j) => (
              <LessonBlockView key={j} block={b} />
            ))}
          </View>
        ))}
      </ScrollView>

      <Disclaimer />
    </>
  );
}

/** Glossaire cherchable et filtrable par thème. */
function Glossary({ go }: { go: (v: View_) => void }) {
  const [query, setQuery] = useState('');
  const [theme, setTheme] = useState<GlossaryThemeId | 'all'>('all');

  const terms = useMemo(() => {
    const q = query.trim().toLowerCase();
    return GLOSSARY.filter((t) => {
      const okTheme = theme === 'all' || t.theme === theme;
      const okQuery =
        q === '' || t.term.toLowerCase().includes(q) || t.definition.toLowerCase().includes(q);
      return okTheme && okQuery;
    }).sort((a, b) => a.term.localeCompare(b.term, 'fr'));
  }, [query, theme]);

  return (
    <>
      <BackButton onPress={() => go({ name: 'home' })} />
      <Text style={styles.title}>Glossaire</Text>
      <Text style={styles.subtitle}>Le vocabulaire crypto expliqué simplement.</Text>

      <View style={styles.search}>
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Rechercher un terme…"
          placeholderTextColor={colors.muted}
          style={styles.searchInput}
          selectionColor={colors.secondary}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardAppearance="dark"
        />
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filters}
        keyboardShouldPersistTaps="handled"
      >
        {[{ id: 'all' as const, label: 'Tous' }, ...GLOSSARY_THEMES].map((t) => {
          const on = theme === t.id;
          return (
            <Pressable
              key={t.id}
              onPress={() => setTheme(t.id as GlossaryThemeId | 'all')}
              style={[styles.chip, on && styles.chipOn]}
            >
              <Text style={[styles.chipText, on && styles.chipTextOn]}>{t.label}</Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <Text style={styles.count}>
        {terms.length} terme{terms.length > 1 ? 's' : ''}
      </Text>

      {terms.map((t) => (
        <View key={t.term} style={styles.termCard}>
          <Text style={styles.cardTitle}>{t.term}</Text>
          <Text style={styles.cardSub}>{t.definition}</Text>
        </View>
      ))}
    </>
  );
}

/**
 * Section Academy : parcours, leçons en chapitres et glossaire.
 *
 * La navigation interne est gérée en état local — le MVP n'embarque pas de
 * routeur, et cette section est le seul endroit qui en aurait besoin.
 */
export function AcademyPanel({ onOpenConsole }: { onOpenConsole: () => void }) {
  const [view, setView] = useState<View_>({ name: 'home' });

  // Clé de transition : change à chaque écran, y compris entre deux leçons.
  const key =
    view.name === 'category'
      ? `category:${view.categoryId}`
      : view.name === 'lesson'
        ? `lesson:${view.lessonId}`
        : view.name;

  return (
    <FadeIn trigger={key}>
      {view.name === 'category' ? (
        <Category categoryId={view.categoryId} go={setView} />
      ) : view.name === 'lesson' ? (
        <LessonView lessonId={view.lessonId} go={setView} />
      ) : view.name === 'glossary' ? (
        <Glossary go={setView} />
      ) : (
        <Home go={setView} onOpenConsole={onOpenConsole} />
      )}
    </FadeIn>
  );
}

/** Nombre total de leçons — affiché sur l'accueil de l'app. */
export const LESSON_COUNT = LESSONS.length;

const styles = StyleSheet.create({
  title: { fontFamily: FONT_BOLD, color: colors.text, fontSize: 26 },
  subtitle: {
    fontFamily: FONT_REGULAR,
    color: colors.textSecond,
    fontSize: fontSize.sm,
    lineHeight: 20,
    marginTop: spacing.xs,
    marginBottom: spacing.lg,
  },
  sectionLabel: {
    fontFamily: FONT_BOLD,
    color: colors.text,
    fontSize: fontSize.base,
    marginTop: spacing.sm,
    marginBottom: spacing.md,
  },

  back: { marginBottom: spacing.md, width: 32 },
  backChevron: { fontFamily: FONT, color: colors.text, fontSize: 30, lineHeight: 32 },

  glossaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    gap: spacing.md,
  },
  glossaryText: { flex: 1 },
  categoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    gap: spacing.md,
  },
  categoryDot: { width: 10, height: 10, borderRadius: 5 },
  cardTitle: { fontFamily: FONT_BOLD, color: colors.text, fontSize: fontSize.base },
  cardSub: {
    fontFamily: FONT_REGULAR,
    color: colors.textSecond,
    fontSize: fontSize.xs,
    lineHeight: 19,
    marginTop: 2,
  },
  count: { fontFamily: FONT, color: colors.muted, fontSize: 11, marginTop: spacing.sm },
  chevron: { fontFamily: FONT, color: colors.muted, fontSize: 22 },

  lessonCard: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  lessonMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.md,
  },

  lessonHero: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.xl,
    marginBottom: spacing.lg,
  },
  lessonTitle: { fontFamily: FONT_BOLD, color: colors.text, fontSize: 30, lineHeight: 36 },
  lessonSummary: {
    fontFamily: FONT_REGULAR,
    color: colors.up,
    fontSize: fontSize.xs,
    lineHeight: 18,
    marginTop: spacing.sm,
  },

  chapter: {
    // Les pages d'un défilement horizontal s'alignent sur la plus haute : pas
    // de hauteur fixe, et surtout pas de ScrollView vertical à l'intérieur —
    // il capterait le geste horizontal et empêcherait de changer de chapitre.
    width: PAGE_WIDTH,
    paddingRight: spacing.lg,
  },
  chapterLabel: {
    fontFamily: FONT,
    color: colors.muted,
    fontSize: 11,
    marginBottom: spacing.xs,
  },
  chapterTitle: {
    fontFamily: FONT_BOLD,
    color: colors.text,
    fontSize: fontSize.lg,
    lineHeight: 24,
    marginBottom: spacing.md,
  },

  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  dot: { height: 6, borderRadius: 3 },

  search: {
    backgroundColor: colors.glassFill,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.lg,
    paddingVertical: 10,
  },
  searchInput: { fontFamily: FONT, color: colors.text, fontSize: fontSize.sm, padding: 0 },
  filters: { marginTop: spacing.md, marginBottom: spacing.sm },
  chip: {
    borderRadius: radius.pill,
    backgroundColor: colors.glassFill,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    paddingHorizontal: spacing.lg,
    paddingVertical: 8,
    marginRight: spacing.sm,
  },
  chipOn: { backgroundColor: colors.secondary },
  chipText: { fontFamily: FONT, color: colors.textSecond, fontSize: fontSize.xs },
  chipTextOn: { fontFamily: FONT_BOLD, color: colors.text },

  consoleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.glassFill,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    marginTop: spacing.lg,
  },
  consoleLabel: { fontFamily: FONT, color: colors.muted, fontSize: fontSize.xs },

  termCard: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
});
