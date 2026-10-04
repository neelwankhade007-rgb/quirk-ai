import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link, router } from 'expo-router';
import { registerUser, loginUser, getCurrentUser } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function RegisterScreen() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { signIn } = useAuth();

  const handleRegister = async () => {
    if (!username || !email || !password) return;

    setError(null);
    setLoading(true);
    try {
      await registerUser({ username, email, password });
      const data = await loginUser({ username, password });
      await signIn(data.access_token, { username });
      const user = await getCurrentUser();
      await signIn(data.access_token, user);
    } catch (err: any) {
      setError(err.message || 'Registration failed');
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
        <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', paddingHorizontal: 32 }}>
          <View className="mb-10 mt-8">
            <Text className="text-primary text-4xl font-bold mb-2">QuirkAI</Text>
            <Text className="text-textPrimary text-2xl font-semibold">Create your account</Text>
            <Text className="text-textSecondary text-base mt-2">Join QuirkAI to create and discover unique virtual characters.</Text>
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
                placeholder="Choose a username"
                placeholderTextColor="#52525b"
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
              />
            </View>

            <View>
              <Text className="text-textSecondary mb-2 font-medium">Email</Text>
              <TextInput
                className="bg-surface text-textPrimary px-4 py-3 rounded-xl border border-border focus:border-primary"
                placeholder="Enter your email"
                placeholderTextColor="#52525b"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View className="mb-4">
              <Text className="text-textSecondary mb-2 font-medium">Password</Text>
              <TextInput
                className="bg-surface text-textPrimary px-4 py-3 rounded-xl border border-border focus:border-primary"
                placeholder="Create a password"
                placeholderTextColor="#52525b"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />
            </View>

            <Pressable 
              onPress={handleRegister}
              disabled={loading}
              className="bg-primary py-4 rounded-xl items-center mt-6 active:opacity-80"
            >
              <Text className="text-white font-bold text-lg">{loading ? 'Creating...' : 'Create account'}</Text>
            </Pressable>
          </View>

          <View className="mt-8 mb-8 flex-row justify-center">
            <Link href="/login" asChild>
              <Pressable className="active:opacity-70">
                <Text className="text-textSecondary">
                  Already have an account? <Text className="text-primary font-bold">Log in</Text>
                </Text>
              </Pressable>
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
