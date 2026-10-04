import React from 'react';

interface CharacterAvatarProps {
  name: string;
  imageUrl?: string;
  size?: number;
}

export default function CharacterAvatar({ name, imageUrl, size = 48 }: CharacterAvatarProps) {
  const [imgFailed, setImgFailed] = React.useState(false);
  const initial = name ? name.charAt(0).toUpperCase() : '?';

  const commonStyle: React.CSSProperties = {
    width: size,
    height: size,
    borderRadius: '50%',
    objectFit: 'cover',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#374151',
    color: '#F9FAFB',
    fontSize: size * 0.4,
    fontWeight: 'bold',
    flexShrink: 0,
  };

  if (imageUrl && !imgFailed) {
    return (
      <img 
        src={imageUrl} 
        alt={name} 
        style={commonStyle} 
        onError={() => setImgFailed(true)} 
      />
    );
  }

  return (
    <div style={commonStyle}>
      {initial}
    </div>
  );
}
