import { View, Text, TouchableOpacity } from "react-native";
import { Image } from "expo-image";
import Feather from "@expo/vector-icons/Feather";
import { Channel } from "@/lib/news";

interface ChannelRowProps {
  channel: Channel;
  onRemove: () => void;
}

/**
 * Ligne d'un canal suivi, dans l'écran de gestion.
 * Affiche l'avatar/handle et un bouton de suppression.
 */
export function ChannelRow({ channel, onRemove }: ChannelRowProps) {
  return (
    <View className="mb-sm flex-row items-center gap-sm rounded-md bg-cards p-md">
      {channel.avatar ? (
        <Image
          source={{ uri: channel.avatar }}
          style={{ width: 36, height: 36, borderRadius: 18 }}
          contentFit="cover"
          transition={150}
        />
      ) : (
        <View className="h-9 w-9 items-center justify-center rounded-full bg-padding">
          <Feather name="user" size={16} color="#6B6B6B" />
        </View>
      )}

      <View className="flex-1">
        <Text
          className="font-satoshi text-sm font-bold text-text-primary"
          numberOfLines={1}
        >
          {channel.display_name || `@${channel.handle}`}
        </Text>
        <Text className="font-satoshi text-xs text-text-muted" numberOfLines={1}>
          @{channel.handle}
        </Text>
      </View>

      <TouchableOpacity
        className="h-8 w-8 items-center justify-center rounded-md bg-padding"
        activeOpacity={0.8}
        onPress={onRemove}
      >
        <Feather name="trash-2" size={15} color="#FA7272" />
      </TouchableOpacity>
    </View>
  );
}
