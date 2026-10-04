import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link, router } from 'expo-router';
import { loginUser, getCurrentUser } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function LoginScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { signIn } = useAuth();

  const handleLogin = async () => {
    if (!username || !password) return;
    
    setError(null);
    setLoading(true);
    try {
      const data = await loginUser({ username, password });
      await signIn(data.access_token, { username });
      const user = await getCurrentUser();
      await signIn(data.access_token, user);
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1 justify-center px-8"
      >
        <View className="mb-12">
          <Text className="text-primary text-4xl font-bold mb-2">QuirkAI</Text>
          <Text className="text-textPrimary text-2xl font-semibold">Welcome back</Text>
          <Text className="text-textSecondary text-base mt-2">Log in to continue chatting with your unique virtual characters.</Text>
        </View>

        {error && (
          <View className="bg-red-500/20 border border-red-500/50 p-3 rounded-lg mb-4">
            <Text className="text-red-500">{error}</Text>
          </View>
        )}

        <View className="space-y-4">
          <View>
            <Text className="text-textSecondary mb-2 font-medium">Username</Text>
            <TextInput
              className="bg-surface text-textPrimary px-4 py-3 rounded-xl border border-border focus:border-primary"
              placeholder="Enter your username"
              placeholderTextColor="#52525b"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
            />
          </View>

          <View className="mb-4">
            <Text className="text-textSecondary mb-2 font-medium">Password</Text>
            <TextInput
              className="bg-surface text-textPrimary px-4 py-3 rounded-xl border border-border focus:border-primary"
              placeholder="Enter your password"
              placeholderTextColor="#52525b"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
          </View>

          <Pressable 
            onPress={handleLogin}
            disabled={loading}
            className="bg-primary py-4 rounded-xl items-center mt-6 active:opacity-80"
          >
            <Text className="text-white font-bold text-lg">{loading ? 'Logging in...' : 'Log in'}</Text>
          </Pressable>
        </View>

        <View className="mt-8 flex-row justify-center">
          <Link href="/register" asChild>
            <Pressable className="active:opacity-70">
              <Text className="text-textSecondary">
                Don't have an account? <Text className="text-primary font-bold">Create one</Text>
              </Text>
            </Pressable>
          </Link>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
