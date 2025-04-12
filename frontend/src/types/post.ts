export type PostType = 'text' | 'image' | 'video';

export interface Post {
  id: string;
  author: string;
  authorId: string;
  wallet?: string;
  title: string;
  content: string;
  timestamp: string;
  type: PostType;
  likes: number;
  imageUrl?: string;
}
