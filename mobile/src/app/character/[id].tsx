import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useLocalSearchParams, router } from 'expo-router';
import { fetchCharacterById } from '../../services/api';
import CharacterAvatar from '../../components/CharacterAvatar';

export default function CharacterProfileScreen() {
  const { id } = useLocalSearchParams();
  const [character, setCharacter] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCharacter = async () => {
      try {
        const data = await fetchCharacterById(id as string);
        setCharacter(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (id) loadCharacter();
  }, [id]);

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-background justify-center items-center">
        <ActivityIndicator size="large" color="#A855F7" />
      </SafeAreaView>
    );
  }

  if (!character) {
    return (
      <SafeAreaView className="flex-1 bg-background justify-center items-center">
        <Text className="text-textSecondary">Character not found</Text>
        <Pressable onPress={() => router.back()} className="mt-4 p-2 bg-surface rounded-lg">
          <Text className="text-primary font-bold">Go Back</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Header Image */}
        <View className="relative">
          <View className="w-full h-80 overflow-hidden">
            <CharacterAvatar name={character.name} imageUrl={character.image_url} size={400} />
          </View>
          <View className="absolute top-12 left-4 bg-background/50 rounded-full p-2">
            <Pressable onPress={() => router.back()} className="active:opacity-80">
              <Feather name="arrow-left" size={24} color="#f8fafc" />
            </Pressable>
          </View>
          <View className="absolute top-12 right-4 bg-background/50 rounded-full p-2">
            <Pressable className="active:opacity-80">
              <Feather name="more-vertical" size={24} color="#f8fafc" />
            </Pressable>
          </View>
          <View className="absolute inset-0 bg-black/40" />
          <View className="absolute bottom-4 left-4 right-4">
            <Text className="text-white text-4xl font-bold">{character.name}</Text>
            <Text className="text-gray-300 text-lg">{character.description}</Text>
          </View>
        </View>

        <View className="p-4">
          <View className="flex-row flex-wrap mb-6 gap-2">
            {character.personality.split(',').map((tag: string, idx: number) => (
              <View key={idx} className="bg-surface px-3 py-1.5 rounded-lg border border-border">
                <Text className="text-sm text-textSecondary">{tag.trim()}</Text>
              </View>
            ))}
          </View>

          <View className="mb-6">
            <Text className="text-textPrimary text-xl font-bold mb-2">About</Text>
            <Text className="text-textSecondary leading-6">{character.backstory}</Text>
          </View>
        </View>
      </ScrollView>

      <View className="absolute bottom-0 left-0 right-0 p-4 border-t border-border bg-background">
        <Pressable 
          className="bg-primary py-4 rounded-xl items-center active:opacity-80 flex-row justify-center"
          onPress={() => router.push(`/chat/${character.id}` as any)}
        >
          <Feather name="message-circle" size={20} color="white" className="mr-2" />
          <Text className="text-white font-bold text-lg ml-2">Start Chat</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
