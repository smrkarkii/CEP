export type PostType = "text" | "image";

export interface Post {
  id: string;
  author: string;
  authorId: string;
  wallet?: string;
  title: string;
  content: string;
  timestamp: string;
  file_type: PostType;
  likes: number;
  imageUrl?: string;
}
