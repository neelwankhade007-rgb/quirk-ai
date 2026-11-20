import { Link } from "react-router-dom";
import type { Character } from "../types/character";
import { useState } from "react";

interface CharacterCardProps {
  character: Character;
}

const hashString = (str: string) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return hash;
};

// Generates a restrained, subtle background for the fallback image
const getFallbackBackground = (str: string) => {
  const hash = Math.abs(hashString(str));
  const hue = hash % 360;
  return `linear-gradient(135deg, hsl(${hue}, 15%, 18%), hsl(${(hue + 20) % 360}, 20%, 12%))`;
};

function CharacterCard({ character }: CharacterCardProps) {
  const [imgFailed, setImgFailed] = useState(false);
  const initial = character.name ? character.name.charAt(0).toUpperCase() : '?';
  
  // Intercept backend default SVGs
  const isDefaultAvatar = character.image_url && character.image_url.includes('/defaults/');
  const defaultAvatarId = isDefaultAvatar ? character.image_url?.split('/').pop()?.replace('.svg', '').replace('default-', '') : null;
  
  const shouldRenderFallback = !character.image_url || imgFailed || isDefaultAvatar;
  const fallbackBg = getFallbackBackground(defaultAvatarId || character.name || 'default');

  // Format personality into a subtle string like "Calm · Witty · Observant"
  const formatPersonality = (text: string) => {
    if (!text) return null;
    const parts = text.split(/[,.]/).map(p => p.trim()).filter(p => p.length > 0 && p.length < 15);
    if (parts.length > 0) {
      return parts.slice(0, 3).join(' · ');
    }
    return text.length > 30 ? text.substring(0, 30) + '...' : text;
  };

  const formattedPersonality = character.personality ? formatPersonality(character.personality) : null;

  return (
    <Link
      to={`/characters/${character.id}`}
      style={{ textDecoration: "none", display: "block" }}
      className="group"
    >
      <article className="flex flex-col w-full bg-[var(--bg-surface)] rounded-xl overflow-hidden border border-[var(--border-subtle)] transition-all duration-200 ease-out hover:-translate-y-1 hover:shadow-lg hover:border-[var(--border-default)]">
        
        {/* Top Image Area */}
        <div className="w-full aspect-[4/3] bg-[var(--bg-elevated)] relative overflow-hidden shrink-0 border-b border-[var(--border-subtle)]">
          {!shouldRenderFallback ? (
            <img 
              src={character.image_url} 
              alt={character.name} 
              className="w-full h-full object-cover transition-transform duration-300 ease-out group-hover:scale-[1.03]"
              onError={() => setImgFailed(true)} 
            />
          ) : (
            <div 
              className="w-full h-full flex items-center justify-center relative transition-transform duration-300 ease-out group-hover:scale-[1.03]"
              style={{ background: fallbackBg }}
            >
              <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '16px 16px' }}></div>
              <span className="text-4xl font-medium text-white/20 select-none">
                {initial}
              </span>
            </div>
          )}
        </div>
        
        {/* Content Area */}
        <div className="flex flex-col p-4">
          <h2 className="text-base font-semibold text-[var(--text-primary)] mb-1.5 truncate">
            {character.name}
          </h2>
          
          {/* Fixed height for description guarantees consistent card heights naturally */}
          <div className="h-[2.75rem] mb-3">
            <p className="text-sm text-[var(--text-secondary)] line-clamp-2 leading-snug">
              {character.description || "No description provided."}
            </p>
          </div>
          
          <div className="pt-3 border-t border-[var(--border-subtle)]">
            {formattedPersonality ? (
              <span className="text-xs text-[var(--text-tertiary)] font-medium block truncate">
                {formattedPersonality}
              </span>
            ) : (
              <span className="text-xs text-transparent select-none block">
                -
              </span>
            )}
          </div>
        </div>
        
      </article>
    </Link>
  );
}

export default CharacterCard;
