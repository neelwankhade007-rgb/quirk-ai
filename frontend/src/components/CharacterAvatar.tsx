import { useState } from 'react';

interface CharacterAvatarProps {
  name: string;
  imageUrl?: string;
  className?: string;
  size?: number;
}

const hashString = (str: string) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return hash;
};

// Generates a soft, tasteful background color based on name
const getBackground = (str: string) => {
  const hash = Math.abs(hashString(str));
  const hue = hash % 360;
  return `hsl(${hue}, 40%, 40%)`;
};

export default function CharacterAvatar({ name, imageUrl, className = "", size }: CharacterAvatarProps) {
  const [imgFailed, setImgFailed] = useState(false);
  const initial = name ? name.charAt(0).toUpperCase() : '?';

  const inlineStyle = size ? { width: size, height: size } : {};
  
  // Intercept backend default SVGs
  const isDefaultAvatar = imageUrl && imageUrl.includes('/defaults/');
  
  const shouldRenderFallback = !imageUrl || imgFailed || isDefaultAvatar;

  if (!shouldRenderFallback) {
    return (
      <div className={`avatar ${className}`} style={inlineStyle}>
        <img 
          src={imageUrl} 
          alt={name} 
          onError={() => setImgFailed(true)} 
        />
      </div>
    );
  }

  // Clean, standard avatar fallback
  const background = getBackground(name || 'default');

  return (
    <div 
      className={`avatar ${className}`} 
      style={{ ...inlineStyle, background, position: 'relative', overflow: 'hidden' }}
    >
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        width: '100%',
        height: '100%',
        color: 'rgba(255,255,255,0.95)',
      }}>
        <div style={{ 
          fontSize: size ? size * 0.45 : '1rem', 
          fontWeight: 500, 
        }}>
          {initial}
        </div>
      </div>
    </div>
  );
}
