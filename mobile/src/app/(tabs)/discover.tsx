import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TextInput, ScrollView, Pressable, RefreshControl, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { fetchCharacters } from '../../services/api';
import CharacterAvatar from '../../components/CharacterAvatar';

export default function DiscoverScreen() {
  const [search, setSearch] = useState('');
  const [characters, setCharacters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadCharacters = async () => {
    try {
      const data = await fetchCharacters();
      setCharacters(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadCharacters();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadCharacters();
  }, []);

  const filteredCharacters = characters.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    c.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="px-4 pt-4 pb-2">
        <Text className="text-primary text-3xl font-bold mb-4">Discover</Text>
        
        {/* Search */}
        <View className="flex-row items-center bg-surface px-4 py-3 rounded-2xl mb-4 border border-border">
          <Feather name="search" size={20} color="#94a3b8" />
          <TextInput
            className="flex-1 ml-3 text-textPrimary text-base"
            placeholder="Search characters..."
            placeholderTextColor="#52525b"
            value={search}
            onChangeText={setSearch}
          />
        </View>

      </View>

      {/* Grid */}
      {loading && !refreshing ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#A855F7" />
        </View>
      ) : (
      <ScrollView 
        className="flex-1 px-4" 
        contentContainerStyle={{ paddingBottom: 24 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#A855F7" />
        }
      >
        <View className="flex-row flex-wrap justify-between">
          {filteredCharacters.map(character => (
            <Pressable
              key={character.id}
              className="w-[48%] mb-4 bg-surface rounded-2xl overflow-hidden border border-border active:opacity-80"
              onPress={() => router.push(`/character/${character.id}` as any)}
            >
              <View className="w-full h-40">
                <CharacterAvatar name={character.name} imageUrl={character.image_url} size={150} />
              </View>
              <View className="p-3">
                <Text className="text-textPrimary font-bold text-lg">{character.name}</Text>
                <Text className="text-textSecondary text-sm mt-1" numberOfLines={2}>
                  {character.description}
                </Text>
                <View className="flex-row flex-wrap mt-2 gap-1">
                  {character.personality.split(',').slice(0, 2).map((tag: string, idx: number) => (
                    <View key={idx} className="bg-background px-2 py-1 rounded-md border border-border">
                      <Text className="text-xs text-textSecondary">{tag.trim()}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </Pressable>
          ))}
        </View>
        
        {filteredCharacters.length === 0 && (
          <View className="items-center justify-center mt-12">
            <Feather name="inbox" size={48} color="#52525b" />
            <Text className="text-textSecondary mt-4">No characters found</Text>
          </View>
        )}
      </ScrollView>
      )}
    </SafeAreaView>
  );
}
