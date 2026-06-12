import { useMemo, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import Feather from "@expo/vector-icons/Feather";
import { GLOSSARY, GLOSSARY_THEMES } from "@/content/education/glossary";
import { GlossaryThemeId } from "@/content/education/types";
import { FilterChip } from "@/components/education";

/** Valeur du filtre : un thème précis ou "all" pour tout afficher. */
type ThemeFilter = GlossaryThemeId | "all";

/**
 * Glossaire cherchable et filtrable par thème.
 */
export default function GlossaryScreen() {
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState("");
  const [theme, setTheme] = useState<ThemeFilter>("all");

  // Filtrage (thème + recherche) puis tri alphabétique.
  // Recalculé uniquement quand la requête ou le thème change.
  const terms = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return GLOSSARY.filter((t) => {
      const matchesTheme = theme === "all" || t.theme === theme;
      const matchesQuery =
        normalized === "" ||
        t.term.toLowerCase().includes(normalized) ||
        t.definition.toLowerCase().includes(normalized);
      return matchesTheme && matchesQuery;
    }).sort((a, b) => a.term.localeCompare(b.term, "fr"));
  }, [query, theme]);

  return (
    <View className="flex-1 bg-primary">
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + 16,
          paddingHorizontal: 21,
          paddingBottom: 32,
        }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Bouton retour */}
        <TouchableOpacity
          className="mb-lg h-10 w-10 items-center justify-center rounded-md bg-cards"
          activeOpacity={0.8}
          onPress={() => router.back()}
        >
          <Feather name="chevron-left" size={22} color="#FFFFFF" />
        </TouchableOpacity>

        <Text className="font-satoshi text-2xl font-bold text-text-primary">
          Glossaire
        </Text>
        <Text className="mt-xs font-satoshi text-sm text-text-secondary">
          Le vocabulaire crypto expliqué simplement.
        </Text>

        {/* Barre de recherche */}
        <View className="mt-lg flex-row items-center gap-sm rounded-md bg-cards px-md">
          <Feather name="search" size={16} color="#6B6B6B" />
          <TextInput
            className="flex-1 py-md font-satoshi text-base text-text-primary"
            placeholder="Rechercher un terme…"
            placeholderTextColor="#6B6B6B"
            value={query}
            onChangeText={setQuery}
            autoCapitalize="none"
            autoCorrect={false}
          />
          {query.length > 0 ? (
            <TouchableOpacity onPress={() => setQuery("")} activeOpacity={0.8}>
              <Feather name="x" size={16} color="#6B6B6B" />
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Filtres par thème */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="mt-md"
          contentContainerStyle={{ paddingRight: 21 }}
          keyboardShouldPersistTaps="handled"
        >
          <FilterChip
            label="Tous"
            active={theme === "all"}
            onPress={() => setTheme("all")}
          />
          {GLOSSARY_THEMES.map((t) => (
            <FilterChip
              key={t.id}
              label={t.label}
              active={theme === t.id}
              onPress={() => setTheme(t.id)}
            />
          ))}
        </ScrollView>

        {/* Compteur de résultats */}
        <Text className="mb-md mt-md font-satoshi text-xs text-text-muted">
          {terms.length} terme{terms.length > 1 ? "s" : ""}
        </Text>

        {/* Résultats */}
        {terms.length > 0 ? (
          terms.map((t) => (
            <View key={t.term} className="mb-md rounded-lg bg-cards p-lg">
              <Text className="font-satoshi text-base font-bold text-text-primary">
                {t.term}
              </Text>
              <Text className="mt-xs font-satoshi text-sm leading-6 text-text-secondary">
                {t.definition}
              </Text>
            </View>
          ))
        ) : (
          <Text className="mt-md font-satoshi text-sm text-text-muted">
            Aucun terme ne correspond à ta recherche.
          </Text>
        )}
      </ScrollView>
    </View>
  );
}
