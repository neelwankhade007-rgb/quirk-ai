import React, { useState, useRef } from "react";
import { uploadImage } from "../services/api";
import { DEFAULT_AVATARS } from "../utils/avatars";
import CharacterAvatar from "./CharacterAvatar";

interface AvatarPickerProps {
  name: string;
  avatarType?: "custom" | "default";
  imageUrl?: string;
  onChange: (type: "custom" | "default", url: string) => void;
}

export default function AvatarPicker({ name, avatarType, imageUrl, onChange }: AvatarPickerProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<"preview" | "select_default">("preview");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setError(null);
    setUploading(true);
    try {
      const data = await uploadImage(file);
      onChange("custom", data.image_url);
      setMode("preview");
    } catch (err: any) {
      setError(err.message || "Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="avatar-picker" style={{ marginBottom: "1.5rem" }}>
      <label className="form-label">Character Image</label>
      
      {error && <div className="alert alert-error" style={{ marginBottom: "0.5rem", padding: "0.5rem" }}>{error}</div>}

      {mode === "preview" ? (
        <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
          <CharacterAvatar name={name || "?"} imageUrl={imageUrl} size={80} />
          
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <button 
                type="button" 
                className="btn-primary" 
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                style={{ padding: "0.4rem 0.8rem", fontSize: "0.9rem" }}
              >
                {uploading ? "Uploading..." : "Upload Image"}
              </button>
              
              <button 
                type="button" 
                className="btn-secondary" 
                onClick={() => setMode("select_default")}
                disabled={uploading}
                style={{ padding: "0.4rem 0.8rem", fontSize: "0.9rem" }}
              >
                Choose Default
              </button>
            </div>
            
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              accept="image/jpeg,image/png,image/webp" 
              style={{ display: "none" }} 
            />
          </div>
        </div>
      ) : (
        <div className="default-avatar-grid">
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
            <span style={{ fontSize: "0.9rem" }}>Select a default avatar:</span>
            <button type="button" onClick={() => setMode("preview")} style={{ background: "none", border: "none", color: "var(--primary-color)", cursor: "pointer" }}>Cancel</button>
          </div>
          
          <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
            {DEFAULT_AVATARS.map((avatar) => (
              <button
                key={avatar.id}
                type="button"
                onClick={() => {
                  onChange("default", avatar.url);
                  setMode("preview");
                }}
                style={{
                  background: "none",
                  border: avatarType === "default" && imageUrl === avatar.url ? "2px solid var(--primary-color)" : "2px solid transparent",
                  borderRadius: "50%",
                  padding: "2px",
                  cursor: "pointer"
                }}
              >
                <img src={avatar.url} alt={avatar.name} style={{ width: "60px", height: "60px", borderRadius: "50%", backgroundColor: "#222" }} />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
