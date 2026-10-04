import React, { useState } from 'react';
import { View, Text, Pressable, ScrollView, Alert, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import CharacterAvatar from './CharacterAvatar';
import { DEFAULT_AVATARS, API_URL } from '../data/avatars';
import { uploadImage as apiUploadImage } from '../services/api';

interface AvatarPickerProps {
  name: string;
  avatarType?: 'custom' | 'default';
  imageUrl?: string;
  onChange: (type: 'custom' | 'default', url: string) => void;
}

export default function AvatarPicker({ name, avatarType, imageUrl, onChange }: AvatarPickerProps) {
  const [mode, setMode] = useState<'preview' | 'select_default'>('preview');
  const [uploading, setUploading] = useState(false);

  const handlePickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissionResult.granted === false) {
      Alert.alert("Permission to access camera roll is required!");
      return;
    }

    const pickerResult = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (pickerResult.canceled) {
      return;
    }

    const asset = pickerResult.assets[0];
    uploadImage(asset.uri, asset.fileName || 'upload.jpg', asset.mimeType || 'image/jpeg');
  };

  const uploadImage = async (uri: string, name: string, type: string) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', {
        uri: Platform.OS === 'ios' ? uri.replace('file://', '') : uri,
        name: name,
        type: type,
      } as any);

      const data = await apiUploadImage(formData);
      onChange('custom', data.image_url);
    } catch (error) {
      Alert.alert('Upload Error', 'Failed to upload image.');
      console.error(error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <View className="mb-4">
      <Text className="text-textSecondary mb-2 font-medium">Character Image</Text>
      
      {mode === 'preview' ? (
        <View className="flex-row items-center">
          <CharacterAvatar name={name || '?'} imageUrl={imageUrl} size={80} />
          <View className="ml-4 flex-1">
            <Pressable 
              onPress={handlePickImage}
              disabled={uploading}
              className="bg-primary py-2 px-4 rounded-lg mb-2 items-center"
            >
              <Text className="text-white font-medium">{uploading ? 'Uploading...' : 'Choose from device'}</Text>
            </Pressable>
            <Pressable 
              onPress={() => setMode('select_default')}
              disabled={uploading}
              className="border border-border py-2 px-4 rounded-lg items-center"
            >
              <Text className="text-textPrimary font-medium">Or choose a default</Text>
            </Pressable>
          </View>
        </View>
      ) : (
        <View>
          <View className="flex-row justify-between mb-2">
            <Text className="text-textSecondary">Select a default avatar:</Text>
            <Pressable onPress={() => setMode('preview')}>
              <Text className="text-primary font-medium">Cancel</Text>
            </Pressable>
          </View>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="py-2">
            {DEFAULT_AVATARS.map((avatar) => {
              const isSelected = avatarType === 'default' && imageUrl === avatar.url;
              return (
                <Pressable
                  key={avatar.id}
                  onPress={() => {
                    onChange('default', avatar.url);
                    setMode('preview');
                  }}
                  style={{
                    borderWidth: 2,
                    borderColor: isSelected ? '#A855F7' : 'transparent',
                    borderRadius: 34,
                    padding: 2,
                    marginRight: 10
                  }}
                >
                  <CharacterAvatar name={avatar.name} imageUrl={avatar.url} size={60} />
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      )}
    </View>
  );
}
