import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, Pressable, RefreshControl, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { fetchMyCharacters } from '../../services/api';
import CharacterAvatar from '../../components/CharacterAvatar';

export default function MyCharactersScreen() {
  const [characters, setCharacters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadCharacters = async () => {
    try {
      const data = await fetchMyCharacters();
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
  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="px-4 pt-4 pb-2 flex-row justify-between items-center">
        <Text className="text-primary text-3xl font-bold">My Characters</Text>
      </View>

      {loading && !refreshing ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#A855F7" />
        </View>
      ) : characters.length === 0 ? (
        <View className="flex-1 items-center justify-center px-8">
          <View className="w-24 h-24 bg-surface rounded-full items-center justify-center mb-6">
            <Feather name="users" size={40} color="#8b5cf6" />
          </View>
          <Text className="text-textPrimary text-xl font-bold text-center mb-2">
            You haven't created any characters yet.
          </Text>
          <Text className="text-textSecondary text-center mb-8">
            Bring your imagination to life by creating your first unique AI companion.
          </Text>
          
          <Pressable 
            className="bg-primary px-6 py-4 rounded-xl flex-row items-center active:opacity-80"
            onPress={() => router.push('/create-character')}
          >
            <Feather name="plus" size={20} color="white" className="mr-2" />
            <Text className="text-white font-bold text-base ml-2">Create your first character</Text>
          </Pressable>
        </View>
      ) : (
        <ScrollView 
          className="flex-1 px-4 mt-4"
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#A855F7" />
          }
        >
          {characters.map(char => (
             <Pressable 
                key={char.id} 
                className="bg-surface rounded-2xl p-4 mb-4 flex-row items-center border border-border"
                onPress={() => router.push(`/character/${char.id}` as any)}
             >
                <CharacterAvatar name={char.name} imageUrl={char.image_url} size={64} />
                <View className="flex-1 ml-4">
                  <Text className="text-textPrimary font-bold text-lg">{char.name}</Text>
                  <Text className="text-textSecondary" numberOfLines={1}>{char.description}</Text>
                </View>
                <View className="p-2">
                  <Feather name="chevron-right" size={20} color="#94a3b8" />
                </View>
             </Pressable>
          ))}
        </ScrollView>
      )}

      {/* Floating Action Button */}
      {!loading && characters.length > 0 && (
        <Pressable 
          className="absolute bottom-6 right-6 w-14 h-14 bg-primary rounded-full items-center justify-center shadow-lg active:opacity-80"
          onPress={() => router.push('/create-character')}
        >
          <Feather name="plus" size={24} color="white" />
        </Pressable>
      )}
    </SafeAreaView>
  );
}
