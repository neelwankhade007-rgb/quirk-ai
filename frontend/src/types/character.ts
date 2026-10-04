export interface Character {
  id: string;
  name: string;
  description: string;
  personality: string;
  greeting: string;
  backstory: string;
  image_url?: string;
  avatar_type?: 'custom' | 'default';
}