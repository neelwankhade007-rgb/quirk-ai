import React from 'react';
import { View, Text, Image } from 'react-native';

interface CharacterAvatarProps {
  name: string;
  imageUrl?: string;
  size?: number;
}

export default function CharacterAvatar({ name, imageUrl, size = 48 }: CharacterAvatarProps) {
  const [imgFailed, setImgFailed] = React.useState(false);
  const initial = name ? name.charAt(0).toUpperCase() : '?';

  if (imageUrl && !imgFailed) {
    return (
      <Image 
        source={{ uri: imageUrl }} 
        style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: '#374151' }}
        onError={() => setImgFailed(true)}
      />
    );
  }

  return (
    <View style={{ 
      width: size, 
      height: size, 
      borderRadius: size / 2, 
      backgroundColor: '#374151',
      justifyContent: 'center',
      alignItems: 'center'
    }}>
      <Text style={{ color: '#F9FAFB', fontSize: size * 0.4, fontWeight: 'bold' }}>
        {initial}
      </Text>
    </View>
  );
}
