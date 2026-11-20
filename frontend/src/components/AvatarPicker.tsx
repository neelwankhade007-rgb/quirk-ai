import React, { useState, useRef } from "react";
import { uploadImage } from "../services/api";
import { DEFAULT_AVATARS } from "../utils/avatars";
import CharacterAvatar from "./CharacterAvatar";
import { Upload, Image as ImageIcon } from "lucide-react";

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
    <div className="avatar-picker">
      <label className="form-label" style={{ marginBottom: "8px", display: "block" }}>Character Image</label>
      
      {error && <div className="alert alert-error">{error}</div>}

      {mode === "preview" ? (
        <div className="avatar-picker-preview">
          <CharacterAvatar name={name || "?"} imageUrl={imageUrl} size={80} />
          
          <div className="avatar-picker-actions">
            <div className="btn-row">
              <button 
                type="button" 
                className="btn-primary" 
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
              >
                <Upload size={16} />
                {uploading ? "Uploading..." : "Upload Image"}
              </button>
              
              <button 
                type="button" 
                className="btn-secondary" 
                onClick={() => setMode("select_default")}
                disabled={uploading}
              >
                <ImageIcon size={16} />
                Choose Default
              </button>
            </div>
            <p className="form-hint">Upload a custom image or choose from our gallery</p>
            
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
        <div className="default-avatar-grid fade-in">
          <div className="default-avatar-grid-header">
            <span>Select a default avatar:</span>
            <button 
              type="button" 
              className="btn-ghost"
              style={{ padding: "4px 8px" }}
              onClick={() => setMode("preview")}
            >
              Cancel
            </button>
          </div>
          
          <div className="default-avatar-options">
            {DEFAULT_AVATARS.map((avatar) => (
              <button
                key={avatar.id}
                type="button"
                className={`default-avatar-btn ${avatarType === "default" && imageUrl === avatar.url ? "selected" : ""}`}
                onClick={() => {
                  onChange("default", avatar.url);
                  setMode("preview");
                }}
              >
                <CharacterAvatar name={avatar.name} imageUrl={avatar.url} size={52} />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
