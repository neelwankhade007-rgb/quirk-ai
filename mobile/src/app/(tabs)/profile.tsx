import React from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAuth } from '../../context/AuthContext';

export default function ProfileScreen() {
  const { user, signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
    router.replace('/login');
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView className="flex-1 px-4">
        <View className="items-center mt-8 mb-8">
          <View className="w-24 h-24 bg-surface rounded-full items-center justify-center mb-4 border-2 border-primary">
            <Feather name="user" size={40} color="#8b5cf6" />
          </View>
          <Text className="text-textPrimary text-2xl font-bold">{user?.username || 'User'}</Text>
          <Text className="text-textSecondary text-base mt-1">{user?.email || 'email@example.com'}</Text>
        </View>

        <View className="bg-surface rounded-2xl overflow-hidden border border-border mb-6">
          <Pressable className="px-4 py-4 border-b border-border flex-row items-center justify-between active:bg-white/5">
            <View className="flex-row items-center">
              <Feather name="settings" size={20} color="#f8fafc" />
              <Text className="text-textPrimary text-base ml-3">Account Settings</Text>
            </View>
            <Feather name="chevron-right" size={20} color="#94a3b8" />
          </Pressable>
          
          <Pressable className="px-4 py-4 border-b border-border flex-row items-center justify-between active:bg-white/5">
            <View className="flex-row items-center">
              <Feather name="shield" size={20} color="#f8fafc" />
              <Text className="text-textPrimary text-base ml-3">Privacy & Security</Text>
            </View>
            <Feather name="chevron-right" size={20} color="#94a3b8" />
          </Pressable>

          <Pressable className="px-4 py-4 flex-row items-center justify-between active:bg-white/5">
            <View className="flex-row items-center">
              <Feather name="bell" size={20} color="#f8fafc" />
              <Text className="text-textPrimary text-base ml-3">Notifications</Text>
            </View>
            <Feather name="chevron-right" size={20} color="#94a3b8" />
          </Pressable>
        </View>

        <Pressable 
          onPress={handleLogout}
          className="bg-red-500/10 border border-red-500/20 py-4 rounded-xl items-center flex-row justify-center active:bg-red-500/20"
        >
          <Feather name="log-out" size={20} color="#ef4444" />
          <Text className="text-red-500 font-bold text-lg ml-2">Log out</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
