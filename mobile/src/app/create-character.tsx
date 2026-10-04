import React, { useState } from 'react';
import { View, Text, TextInput, ScrollView, Pressable, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import AvatarPicker from '../components/AvatarPicker';
import { createCharacter } from '../services/api';

export default function CreateCharacterScreen() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [personality, setPersonality] = useState('');
  const [greeting, setGreeting] = useState('');
  const [backstory, setBackstory] = useState('');
  const [avatarType, setAvatarType] = useState<'custom' | 'default' | undefined>(undefined);
  const [imageUrl, setImageUrl] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreate = async () => {
    if (!name || !description || !personality || !greeting || !backstory) {
      setError("Please fill out all fields.");
      return;
    }

    setError(null);
    setLoading(true);
    try {
      await createCharacter({
        name,
        description,
        personality,
        greeting,
        backstory,
        image_url: imageUrl || undefined,
        avatar_type: avatarType,
      });
      router.back();
    } catch (err: any) {
      setError(err.message || 'Failed to create character');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView className="flex-1 px-4 pt-4" contentContainerStyle={{ paddingBottom: 100 }}>
          <View className="mb-6">
            <Text className="text-textSecondary text-base">Bring your character to life with details below.</Text>
          </View>

          {error && (
            <View className="bg-red-500/20 border border-red-500/50 p-3 rounded-lg mb-4">
              <Text className="text-red-500">{error}</Text>
            </View>
          )}

          <AvatarPicker 
            name={name}
            avatarType={avatarType}
            imageUrl={imageUrl}
            onChange={(type, url) => {
              setAvatarType(type);
              setImageUrl(url);
            }}
          />

          <View className="space-y-4">
            <View>
              <Text className="text-textSecondary mb-2 font-medium">Character Name</Text>
              <TextInput
                className="bg-surface text-textPrimary px-4 py-3 rounded-xl border border-border focus:border-primary"
                placeholder="e.g. Neon, Eldorin"
                placeholderTextColor="#52525b"
                value={name}
                onChangeText={setName}
              />
            </View>

            <View>
              <Text className="text-textSecondary mb-2 font-medium">Short Description</Text>
              <TextInput
                className="bg-surface text-textPrimary px-4 py-3 rounded-xl border border-border focus:border-primary"
                placeholder="e.g. Cyberpunk street runner"
                placeholderTextColor="#52525b"
                value={description}
                onChangeText={setDescription}
              />
            </View>

            <View>
              <Text className="text-textSecondary mb-2 font-medium">Personality</Text>
              <TextInput
                className="bg-surface text-textPrimary px-4 py-3 rounded-xl border border-border focus:border-primary h-24"
                placeholder="Describe their traits, quirks, and mannerisms..."
                placeholderTextColor="#52525b"
                value={personality}
                onChangeText={setPersonality}
                multiline
                textAlignVertical="top"
              />
            </View>

            <View>
              <Text className="text-textSecondary mb-2 font-medium">Greeting</Text>
              <TextInput
                className="bg-surface text-textPrimary px-4 py-3 rounded-xl border border-border focus:border-primary h-24"
                placeholder="What is the first thing they say?"
                placeholderTextColor="#52525b"
                value={greeting}
                onChangeText={setGreeting}
                multiline
                textAlignVertical="top"
              />
            </View>

            <View className="mb-4">
              <Text className="text-textSecondary mb-2 font-medium">Backstory</Text>
              <TextInput
                className="bg-surface text-textPrimary px-4 py-3 rounded-xl border border-border focus:border-primary h-32"
                placeholder="The character's history and background..."
                placeholderTextColor="#52525b"
                value={backstory}
                onChangeText={setBackstory}
                multiline
                textAlignVertical="top"
              />
            </View>
          </View>
        </ScrollView>

        {/* Bottom Actions */}
        <View className="p-4 border-t border-border bg-background flex-row">
          <Pressable 
            onPress={() => router.back()}
            className="flex-1 py-4 items-center mr-2 rounded-xl border border-border bg-surface active:opacity-80"
          >
            <Text className="text-textPrimary font-bold text-lg">Cancel</Text>
          </Pressable>
          <Pressable 
            onPress={handleCreate}
            disabled={loading}
            className="flex-1 py-4 items-center ml-2 rounded-xl bg-primary active:opacity-80"
          >
            <Text className="text-white font-bold text-lg">{loading ? 'Creating...' : 'Create'}</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
