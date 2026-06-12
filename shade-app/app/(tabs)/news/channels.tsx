import { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import Feather from "@expo/vector-icons/Feather";
import {
  getChannels,
  addChannel,
  removeChannel,
  Channel,
} from "@/lib/news";
import { ChannelRow } from "@/components/news";

/**
 * Gestion des canaux suivis : ajout par @handle et suppression.
 */
export default function ChannelsScreen() {
  const insets = useSafeAreaInsets();
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(true);
  const [input, setInput] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setChannels(await getChannels());
    } catch {
      setError("Impossible de charger les canaux.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleAdd = async () => {
    const handle = input.trim().replace(/^@/, "");
    if (!handle || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      await addChannel(handle);
      setInput("");
      await load();
    } catch {
      setError("Ajout impossible. Vérifie le @handle.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemove = async (handle: string) => {
    try {
      await removeChannel(handle);
      setChannels((prev) => prev.filter((c) => c.handle !== handle));
    } catch {
      setError("Suppression impossible.");
    }
  };

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
          Mes canaux
        </Text>
        <Text className="mt-xs font-satoshi text-sm text-text-secondary">
          Ajoute les comptes X dont tu veux suivre l'actu.
        </Text>

        {/* Ajout d'un canal */}
        <View className="mt-lg flex-row gap-sm">
          <View className="flex-1 flex-row items-center gap-sm rounded-md bg-cards px-md">
            <Text className="font-satoshi text-base text-text-muted">@</Text>
            <TextInput
              className="flex-1 py-md font-satoshi text-base text-text-primary"
              placeholder="handle (ex. solana)"
              placeholderTextColor="#6B6B6B"
              value={input}
              onChangeText={setInput}
              autoCapitalize="none"
              autoCorrect={false}
              onSubmitEditing={handleAdd}
              returnKeyType="done"
            />
          </View>
          <TouchableOpacity
            className="items-center justify-center rounded-md bg-secondary px-lg"
            activeOpacity={0.8}
            onPress={handleAdd}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Feather name="plus" size={20} color="#FFFFFF" />
            )}
          </TouchableOpacity>
        </View>

        {error ? (
          <Text className="mt-sm font-satoshi text-xs text-invalidation">
            {error}
          </Text>
        ) : null}

        {/* Liste des canaux */}
        <Text className="mb-md mt-xl font-satoshi text-lg font-bold text-text-primary">
          Suivis
        </Text>
        {loading ? (
          <ActivityIndicator size="small" color="#6283FA" />
        ) : channels.length > 0 ? (
          channels.map((c) => (
            <ChannelRow
              key={c.handle}
              channel={c}
              onRemove={() => handleRemove(c.handle)}
            />
          ))
        ) : (
          <Text className="font-satoshi text-sm text-text-muted">
            Aucun canal suivi pour l'instant.
          </Text>
        )}
      </ScrollView>
    </View>
  );
}
