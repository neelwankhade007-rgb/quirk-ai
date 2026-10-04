import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, ScrollView, Pressable, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useLocalSearchParams, router } from 'expo-router';
import { fetchCharacterById, getConversationByCharacterId, getMessages, sendMessage as apiSendMessage } from '../../services/api';
import CharacterAvatar from '../../components/CharacterAvatar';

export default function ChatScreen() {
  const { id } = useLocalSearchParams();
  const characterId = id as string;

  const [character, setCharacter] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    const loadChat = async () => {
      try {
        setLoading(true);
        const charData = await fetchCharacterById(characterId);
        setCharacter(charData);

        const convData = await getConversationByCharacterId(characterId);
        if (convData) {
          const msgs = await getMessages(convData.id);
          setMessages(msgs);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (characterId) loadChat();
  }, [characterId]);

  const sendMessage = async () => {
    if (!inputText.trim() || isTyping) return;

    const userMsg = {
      id: Date.now().toString() + '_local',
      sender: 'user',
      content: inputText.trim()
    };
    
    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    try {
      const response = await apiSendMessage(characterId, userMsg.content);
      
      // We don't overwrite the user msg id, but we add AI response
      const aiMsg = {
        id: response.ai_message_id,
        sender: 'character',
        content: response.ai_response
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      console.error(err);
      // Fallback/error handle
    } finally {
      setIsTyping(false);
    }
  };

  const insertAction = () => {
    setInputText(prev => prev + '** **');
  };

  const renderMessageText = (text: string = '') => {
    // Basic parser for **action** and *bold* text
    const parts = text.split(/(\*\*.*?\*\*|\*.*?\*)/g);
    return parts.map((part, index) => {
      const isAction = part.startsWith('**') && part.endsWith('**') && part.length >= 4;
      const isBold = part.startsWith('*') && part.endsWith('*') && !isAction && part.length >= 2;

      if (isAction) {
        const actionText = part.slice(2, -2);
        return (
          <Text key={index} className="italic text-textSecondary">
            {actionText}
          </Text>
        );
      }
      if (isBold) {
        const boldText = part.slice(1, -1);
        return (
          <Text key={index} className="font-bold">
            {boldText}
          </Text>
        );
      }
      return <Text key={index}>{part}</Text>;
    });
  };

  if (loading || !character) {
    return (
      <SafeAreaView className="flex-1 bg-background justify-center items-center">
        <ActivityIndicator size="large" color="#A855F7" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      {/* Header */}
      <View className="flex-row items-center px-4 py-3 border-b border-border bg-surface">
        <Pressable onPress={() => router.back()} className="mr-3 p-1">
          <Feather name="arrow-left" size={24} color="#f8fafc" />
        </Pressable>
        <View className="mr-3">
          <CharacterAvatar name={character.name} imageUrl={character.image_url} size={40} />
        </View>
        <View className="flex-1">
          <Text className="text-textPrimary font-bold text-base">{character.name}</Text>
          <View className="flex-row items-center">
            <Text className="text-xs text-primary font-medium mr-2">GPT-OSS 120B</Text>
            {isTyping && <Text className="text-xs text-textSecondary italic">typing...</Text>}
          </View>
        </View>
        <Pressable className="p-1">
          <Feather name="more-vertical" size={24} color="#f8fafc" />
        </Pressable>
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1"
      >
        <ScrollView 
          className="flex-1 px-4 pt-4"
          ref={scrollViewRef}
          onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
        >
          {messages.length === 0 ? (
            <View className="items-center justify-center py-12">
              <View className="mb-4">
                <CharacterAvatar name={character.name} imageUrl={character.image_url} size={96} />
              </View>
              <Text className="text-textPrimary text-xl font-bold mb-2">{character.name}</Text>
              <Text className="text-textSecondary text-center mb-4 px-8">{character.description}</Text>
              <View className="bg-surface p-4 rounded-xl border border-border mt-4 w-full">
                <Text className="text-textPrimary italic">"{character.greeting}"</Text>
              </View>
            </View>
          ) : (
            messages.map((msg, index) => {
              const isUser = msg.sender === 'user';
              const showAvatar = !isUser && (index === 0 || messages[index - 1].sender === 'user');

              return (
                <View 
                  key={msg.id || index} 
                  className={`flex-row mb-4 ${isUser ? 'justify-end' : 'justify-start'}`}
                >
                  {!isUser && (
                    <View className="w-8 mr-2">
                      {showAvatar && (
                        <CharacterAvatar name={character.name} imageUrl={character.image_url} size={32} />
                      )}
                    </View>
                  )}
                  <View 
                    className={`max-w-[80%] px-4 py-3 rounded-2xl ${
                      isUser ? 'bg-primary rounded-tr-sm' : 'bg-surface border border-border rounded-tl-sm'
                    }`}
                  >
                    <Text className={`text-base ${isUser ? 'text-white' : 'text-textPrimary'} leading-6`}>
                      {renderMessageText(msg.content || msg.text)}
                    </Text>
                  </View>
                </View>
              );
            })
          )}
          {isTyping && (
             <View className="flex-row mb-4 justify-start items-center">
                <View className="w-8 mr-2" />
                <View className="bg-surface border border-border px-4 py-3 rounded-2xl rounded-tl-sm">
                  <Text className="text-textSecondary italic">is typing...</Text>
                </View>
             </View>
          )}
        </ScrollView>

        {/* Composer */}
        <View className="p-3 border-t border-border bg-surface flex-row items-end">
          <Pressable 
            onPress={insertAction}
            className="p-3 mb-1 bg-background rounded-full mr-2 items-center justify-center"
          >
            <Feather name="edit-2" size={18} color="#94a3b8" />
          </Pressable>
          <View className="flex-1 bg-background border border-border rounded-2xl min-h-[48px] max-h-32 justify-center px-4 py-2">
            <TextInput
              className="text-textPrimary text-base max-h-24"
              placeholder="Type a message..."
              placeholderTextColor="#52525b"
              multiline
              value={inputText}
              onChangeText={setInputText}
              editable={!isTyping}
            />
          </View>
          <Pressable 
            onPress={sendMessage}
            disabled={isTyping || !inputText.trim()}
            className={`p-3 mb-1 ml-2 rounded-full items-center justify-center ${
              inputText.trim() && !isTyping ? 'bg-primary' : 'bg-background border border-border'
            }`}
          >
            <Feather 
              name="send" 
              size={18} 
              color={inputText.trim() && !isTyping ? 'white' : '#52525b'} 
            />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
